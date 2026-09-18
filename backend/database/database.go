package database

import (
	"log"

	"livepoll-backend/config"
)

func InitDatabase(cfg *config.Config) Store {
	// Attempt MongoDB connection
	mongoStore, err := NewMongoStore(cfg.MongoURI, cfg.DBName)
	if err == nil {
		log.Println("[Database] Successfully connected to MongoDB database:", cfg.DBName)
		return mongoStore
	}

	log.Printf("[Database] Notice: Could not connect to MongoDB at %s (%v). Using thread-safe in-memory store with seeded demo polls.", cfg.MongoURI, err)
	return NewMemoryStore()
}
