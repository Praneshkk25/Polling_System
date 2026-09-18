package redis

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/url"
	"strings"
	"sync"
	"time"

	"livepoll-backend/config"
	"livepoll-backend/models"

	goredis "github.com/redis/go-redis/v9"
)

type PubSubService interface {
	PublishVoteEvent(pollID string, event *models.VoteEventMessage) error
	Subscribe(handler func(pollID string, event *models.VoteEventMessage))
	Close()
}

// Redis implementation
type RedisPubSub struct {
	client *goredis.Client
	pubsub *goredis.PubSub
	stopCh chan struct{}
}

// maskTarget redacts passwords/tokens in connection strings for safe logging
func maskTarget(raw string) string {
	if strings.Contains(raw, "://") {
		u, err := url.Parse(raw)
		if err == nil {
			return u.Redacted()
		}
	}
	return raw
}

// NewRedisPubSub connects using host:port and password (backwards-compatible)
func NewRedisPubSub(addr, password string) (*RedisPubSub, error) {
	cfg := &config.Config{
		RedisAddr: addr,
		RedisPass: password,
	}
	return NewRedisPubSubFromConfig(cfg)
}

// NewRedisPubSubFromConfig creates a Redis client supporting online Redis URLs (rediss://), TLS, and auth
func NewRedisPubSubFromConfig(cfg *config.Config) (*RedisPubSub, error) {
	var opt *goredis.Options
	var targetDesc string

	if cfg.RedisURL != "" {
		parsedOpt, err := goredis.ParseURL(cfg.RedisURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
		}
		opt = parsedOpt
		targetDesc = maskTarget(cfg.RedisURL)

		// Ensure SNI is set for TLS connections
		if opt.TLSConfig != nil && opt.TLSConfig.ServerName == "" {
			if u, err := url.Parse(cfg.RedisURL); err == nil {
				opt.TLSConfig.ServerName = u.Hostname()
			}
		}
	} else {
		opt = &goredis.Options{
			Addr:         cfg.RedisAddr,
			Username:     cfg.RedisUser,
			Password:     cfg.RedisPass,
			DB:           0,
			DialTimeout:  5 * time.Second,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 5 * time.Second,
			MaxRetries:   3,
		}
		targetDesc = cfg.RedisAddr

		if cfg.RedisTLS {
			host, _, err := net.SplitHostPort(cfg.RedisAddr)
			if err != nil || host == "" {
				host = cfg.RedisAddr
			}
			opt.TLSConfig = &tls.Config{
				ServerName: host,
				MinVersion: tls.VersionTLS12,
			}
		}
	}

	// Cloud-friendly timeouts
	if opt.DialTimeout == 0 {
		opt.DialTimeout = 5 * time.Second
	}
	if opt.ReadTimeout == 0 {
		opt.ReadTimeout = 5 * time.Second
	}
	if opt.WriteTimeout == 0 {
		opt.WriteTimeout = 5 * time.Second
	}
	if opt.MaxRetries == 0 {
		opt.MaxRetries = 3
	}

	client := goredis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("redis ping failed (%s): %w", targetDesc, err)
	}

	log.Printf("[Redis] Successfully connected to Redis instance at: %s", targetDesc)
	return &RedisPubSub{
		client: client,
		stopCh: make(chan struct{}),
	}, nil
}

func (r *RedisPubSub) PublishVoteEvent(pollID string, event *models.VoteEventMessage) error {
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}

	channel := "pulsepoll:events:votes"
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	// Also cache latest poll counts in Redis string/hash for sub-millisecond retrieval
	cacheKey := fmt.Sprintf("pulsepoll:cache:%s", pollID)
	_ = r.client.Set(ctx, cacheKey, string(data), 24*time.Hour).Err()

	return r.client.Publish(ctx, channel, string(data)).Err()
}

func (r *RedisPubSub) Subscribe(handler func(pollID string, event *models.VoteEventMessage)) {
	channel := "pulsepoll:events:votes"
	r.pubsub = r.client.Subscribe(context.Background(), channel)

	go func() {
		ch := r.pubsub.Channel()
		for {
			select {
			case <-r.stopCh:
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				var event models.VoteEventMessage
				if err := json.Unmarshal([]byte(msg.Payload), &event); err == nil {
					handler(event.PollID, &event)
				}
			}
		}
	}()
}

func (r *RedisPubSub) Close() {
	close(r.stopCh)
	if r.pubsub != nil {
		_ = r.pubsub.Close()
	}
	if r.client != nil {
		_ = r.client.Close()
	}
}

// Memory fallback PubSub
type MemoryPubSub struct {
	mu       sync.RWMutex
	handlers []func(pollID string, event *models.VoteEventMessage)
}

func NewMemoryPubSub() *MemoryPubSub {
	return &MemoryPubSub{
		handlers: make([]func(pollID string, event *models.VoteEventMessage), 0),
	}
}

func (m *MemoryPubSub) PublishVoteEvent(pollID string, event *models.VoteEventMessage) error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, handler := range m.handlers {
		go handler(pollID, event)
	}
	return nil
}

func (m *MemoryPubSub) Subscribe(handler func(pollID string, event *models.VoteEventMessage)) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.handlers = append(m.handlers, handler)
}

func (m *MemoryPubSub) Close() {}

func InitPubSub(cfg *config.Config) PubSubService {
	// If online Redis URL or custom address is provided, attempt connection
	ps, err := NewRedisPubSubFromConfig(cfg)
	if err == nil {
		return ps
	}

	// Try explicit IPv4 loopback on Windows if defaulting to localhost:6379
	if cfg.RedisURL == "" && cfg.RedisAddr == "localhost:6379" {
		cfgIPv4 := *cfg
		cfgIPv4.RedisAddr = "127.0.0.1:6379"
		ps4, err4 := NewRedisPubSubFromConfig(&cfgIPv4)
		if err4 == nil {
			return ps4
		}
	}

	target := cfg.RedisURL
	if target == "" {
		target = cfg.RedisAddr
	}
	log.Printf("[Redis] Notice: Could not connect to Redis at %s (%v). Using fast in-memory PubSub fallback for instant synchronization.", maskTarget(target), err)
	return NewMemoryPubSub()
}
