package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	MongoURI     string
	DBName       string
	RedisURL     string
	RedisAddr    string
	RedisPass    string
	RedisUser    string
	RedisTLS     bool
	JWTSecret    string
	ClientOrigin string
}

func LoadConfig() *Config {
	// Attempt to load .env from current directory, parent, or workspace root
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		dbName = "pulsepoll"
	}

	// 1. Check for full Redis URL (e.g., Upstash rediss:// or Redis Cloud redis://)
	redisURL := strings.TrimSpace(os.Getenv("REDIS_URL"))
	if redisURL == "" {
		redisURL = strings.TrimSpace(os.Getenv("REDIS_URI"))
	}

	// 2. Host and Port
	redisAddr := strings.TrimSpace(os.Getenv("REDIS_ADDR"))
	// If user pasted the full URL into REDIS_ADDR, handle it automatically
	if redisURL == "" && (strings.HasPrefix(redisAddr, "redis://") || strings.HasPrefix(redisAddr, "rediss://")) {
		redisURL = redisAddr
		redisAddr = ""
	}

	if redisURL == "" && redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	// 3. Password / Auth Key
	redisPass := strings.TrimSpace(os.Getenv("REDIS_PASSWORD"))
	if redisPass == "" {
		redisPass = strings.TrimSpace(os.Getenv("REDIS_PASS"))
	}
	if redisPass == "" {
		redisPass = strings.TrimSpace(os.Getenv("REDIS_KEY"))
	}

	// 4. Username (optional, default: "default" for Redis 6+ / Upstash)
	redisUser := strings.TrimSpace(os.Getenv("REDIS_USERNAME"))
	if redisUser == "" {
		redisUser = strings.TrimSpace(os.Getenv("REDIS_USER"))
	}

	// 5. TLS detection (automatic for rediss://, Upstash, port 6380, or manual flag)
	redisTLS := false
	if strings.EqualFold(os.Getenv("REDIS_TLS"), "true") ||
		strings.Contains(redisAddr, "upstash.io") ||
		strings.HasSuffix(redisAddr, ":6380") ||
		strings.HasPrefix(redisURL, "rediss://") {
		redisTLS = true
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "pulsepoll_super_secure_jwt_secret_guvi_2026"
	}

	clientOrigin := os.Getenv("CLIENT_ORIGIN")
	if clientOrigin == "" {
		clientOrigin = "*"
	}

	return &Config{
		Port:         port,
		MongoURI:     mongoURI,
		DBName:       dbName,
		RedisURL:     redisURL,
		RedisAddr:    redisAddr,
		RedisPass:    redisPass,
		RedisUser:    redisUser,
		RedisTLS:     redisTLS,
		JWTSecret:    jwtSecret,
		ClientOrigin: clientOrigin,
	}
}
