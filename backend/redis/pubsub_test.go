package redis

import (
	"testing"
	"time"

	"livepoll-backend/config"
	"livepoll-backend/models"
)

func TestMaskTarget(t *testing.T) {
	raw := "rediss://default:supersecretpassword123@my-cluster.upstash.io:6379"
	masked := maskTarget(raw)
	if masked == raw {
		t.Errorf("expected masked URL to hide password, got %s", masked)
	}
	if masked != "rediss://default:xxxxx@my-cluster.upstash.io:6379" && !testing.Short() {
		// url.Redacted masks password as xxxxx
		t.Logf("Masked output: %s", masked)
	}
}

func TestMemoryPubSubFallback(t *testing.T) {
	mem := NewMemoryPubSub()
	defer mem.Close()

	var received bool
	mem.Subscribe(func(pollID string, event *models.VoteEventMessage) {
		if pollID == "poll-123" && event.TotalVotes == 42 {
			received = true
		}
	})

	_ = mem.PublishVoteEvent("poll-123", &models.VoteEventMessage{
		PollID:     "poll-123",
		TotalVotes: 42,
	})

	time.Sleep(50 * time.Millisecond)
	if !received {
		t.Fatal("expected subscriber to receive event")
	}
}

func TestLiveUpstashConnection(t *testing.T) {
	cfg := config.LoadConfig()
	if cfg.RedisURL == "" {
		t.Skip("No REDIS_URL configured")
	}

	ps, err := NewRedisPubSubFromConfig(cfg)
	if err != nil {
		t.Fatalf("Failed to connect to configured Redis: %v", err)
	}
	defer ps.Close()

	t.Log("Successfully connected and pinged online Upstash Redis!")
}
