package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"livepoll-backend/database"
	"livepoll-backend/models"
	"livepoll-backend/redis"

	"github.com/gin-gonic/gin"
)

func setupTestRouter() (*gin.Engine, database.Store, redis.PubSubService) {
	gin.SetMode(gin.TestMode)
	store := database.NewMemoryStore()
	pubsub := redis.NewMemoryPubSub()
	pollCtrl := NewPollController(store)
	voteCtrl := NewVoteController(store, pubsub)

	r := gin.New()
	r.GET("/api/polls", pollCtrl.ListPolls)
	r.GET("/api/polls/:id", pollCtrl.GetPoll)
	r.POST("/api/polls", func(c *gin.Context) {
		c.Set("userId", "test-user-id")
		c.Set("userName", "Tester")
		pollCtrl.CreatePoll(c)
	})
	r.POST("/api/polls/:id/vote", voteCtrl.CastVote)

	return r, store, pubsub
}

func TestCreatePollValidation(t *testing.T) {
	r, _, _ := setupTestRouter()

	// 1. Test short question failure
	invalidInput := models.CreatePollInput{
		Question: "Hi?", // < 5 chars
		Options:  []string{"Option A", "Option B"},
	}
	body, _ := json.Marshal(invalidInput)
	req, _ := http.NewRequest("POST", "/api/polls", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400 for short question, got %d", w.Code)
	}

	// 2. Test duplicate option failure
	duplicateInput := models.CreatePollInput{
		Question: "Which frontend framework do you use?",
		Options:  []string{"React", "react", "Vue"}, // Duplicate React
	}
	body, _ = json.Marshal(duplicateInput)
	req, _ = http.NewRequest("POST", "/api/polls", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400 for duplicate options, got %d", w.Code)
	}

	// 3. Test valid poll creation
	validInput := models.CreatePollInput{
		Question: "Which database do you prefer?",
		Options:  []string{"MongoDB", "PostgreSQL", "Redis"},
		Category: "Technology",
	}
	body, _ = json.Marshal(validInput)
	req, _ = http.NewRequest("POST", "/api/polls", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("Expected status 201 for valid poll, got %d", w.Code)
	}
}

func TestCastVoteAndDuplicatePrevention(t *testing.T) {
	r, store, _ := setupTestRouter()

	// Fetch seeded poll
	polls, _ := store.ListPolls("active", "", "", "")
	if len(polls) == 0 {
		t.Fatal("Expected seeded polls to exist")
	}
	targetPoll := polls[0]
	optionID := targetPoll.Options[0].ID

	// 1. Cast first vote
	voteInput := models.CastVoteInput{
		OptionID: optionID,
		VoterID:  "unique-voter-abc-123",
	}
	body, _ := json.Marshal(voteInput)
	req, _ := http.NewRequest("POST", "/api/polls/"+targetPoll.ID+"/vote", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for first vote, got %d: %s", w.Code, w.Body.String())
	}

	// 2. Cast second vote with same voterID -> Should be rejected with 409 Conflict
	reqDup, _ := http.NewRequest("POST", "/api/polls/"+targetPoll.ID+"/vote", bytes.NewBuffer(body))
	reqDup.Header.Set("Content-Type", "application/json")
	wDup := httptest.NewRecorder()
	r.ServeHTTP(wDup, reqDup)

	if wDup.Code != http.StatusConflict {
		t.Fatalf("Expected 409 Conflict for duplicate vote, got %d: %s", wDup.Code, wDup.Body.String())
	}
}
