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
	r.GET("/api/public/polls", pollCtrl.ListPublicPolls)
	r.GET("/api/dashboard/stats", pollCtrl.GetStats)
	r.GET("/api/dashboard/activity", pollCtrl.GetActivity)
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
	polls, _ := store.ListPolls("active", "", "", "", false)
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

func TestMockDataIsolationForNewUsers(t *testing.T) {
	r, _, _ := setupTestRouter()

	// 1. New user querying their polls -> must be empty (0 mock polls)
	reqNewUser, _ := http.NewRequest("GET", "/api/polls?userId=new-user-xyz", nil)
	wNewUser := httptest.NewRecorder()
	r.ServeHTTP(wNewUser, reqNewUser)
	if wNewUser.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d", wNewUser.Code)
	}
	var newPolls []models.Poll
	_ = json.Unmarshal(wNewUser.Body.Bytes(), &newPolls)
	if len(newPolls) != 0 {
		t.Fatalf("Expected 0 polls for new user, got %d", len(newPolls))
	}

	// 2. Demo user querying their polls -> should receive seeded demo polls
	reqDemoUser, _ := http.NewRequest("GET", "/api/polls?userId=user-pranesh-1", nil)
	wDemoUser := httptest.NewRecorder()
	r.ServeHTTP(wDemoUser, reqDemoUser)
	if wDemoUser.Code != http.StatusOK {
		t.Fatalf("Expected 200, got %d", wDemoUser.Code)
	}
	var demoPolls []models.Poll
	_ = json.Unmarshal(wDemoUser.Body.Bytes(), &demoPolls)
	if len(demoPolls) == 0 {
		t.Fatalf("Expected seeded demo polls for demo user, got 0")
	}

	// 3. New user stats -> must be 0s
	reqStats, _ := http.NewRequest("GET", "/api/dashboard/stats?userId=new-user-xyz", nil)
	wStats := httptest.NewRecorder()
	r.ServeHTTP(wStats, reqStats)
	var stats models.DashboardStats
	_ = json.Unmarshal(wStats.Body.Bytes(), &stats)
	if stats.TotalPolls != 0 || stats.TotalVotes != 0 {
		t.Fatalf("Expected 0 total polls and 0 total votes for new user, got polls=%d votes=%d", stats.TotalPolls, stats.TotalVotes)
	}

	// 4. Public polls with excludeMock=true -> should NOT contain demo polls
	reqPub, _ := http.NewRequest("GET", "/api/public/polls?excludeMock=true", nil)
	wPub := httptest.NewRecorder()
	r.ServeHTTP(wPub, reqPub)
	var pubPolls []models.Poll
	_ = json.Unmarshal(wPub.Body.Bytes(), &pubPolls)
	for _, p := range pubPolls {
		if p.CreatedBy == "user-pranesh-1" || p.IsMock {
			t.Fatalf("Expected no mock/demo polls in public feed when excludeMock=true, found: %s", p.Question)
		}
	}
}

