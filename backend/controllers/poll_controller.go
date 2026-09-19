package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"livepoll-backend/database"
	"livepoll-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PollController struct {
	store database.Store
}

func NewPollController(store database.Store) *PollController {
	return &PollController{store: store}
}

func (pc *PollController) CreatePoll(c *gin.Context) {
	userID, _ := c.Get("userId")
	userName, _ := c.Get("userName")

	var input models.CreatePollInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation error: " + err.Error()})
		return
	}

	question := strings.TrimSpace(input.Question)
	if len(question) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Question must be at least 5 characters long"})
		return
	}
	if len(question) > 250 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Question must not exceed 250 characters"})
		return
	}

	if len(input.Options) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll must have at least 2 options"})
		return
	}
	if len(input.Options) > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll can have at most 10 options"})
		return
	}

	seen := make(map[string]bool)
	var pollOptions []models.PollOption
	for idx, optText := range input.Options {
		trimmed := strings.TrimSpace(optText)
		if trimmed == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Option #%d cannot be empty", idx+1)})
			return
		}
		lower := strings.ToLower(trimmed)
		if seen[lower] {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Duplicate option detected: '%s'", trimmed)})
			return
		}
		seen[lower] = true

		pollOptions = append(pollOptions, models.PollOption{
			ID:         fmt.Sprintf("opt-%d-%s", idx+1, uuid.New().String()[:5]),
			Text:       trimmed,
			VotesCount: 0,
			Percentage: 0,
		})
	}

	category := input.Category
	if category == "" {
		category = "General"
	}

	imageURL := input.ImageURL
	if imageURL == "" {
		imageURL = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
	}

	visibility := input.Visibility
	if visibility == "" {
		visibility = "public"
	}

	creatorIDStr := "user-pranesh-1"
	if userID != nil && userID.(string) != "" {
		creatorIDStr = userID.(string)
	}

	creatorNameStr := "Pranesh"
	if userName != nil && userName.(string) != "" {
		creatorNameStr = userName.(string)
	}

	poll := &models.Poll{
		ID:                 "poll-" + uuid.New().String()[:8],
		Question:           question,
		Options:            pollOptions,
		Category:           category,
		ImageURL:           imageURL,
		CreatedBy:          creatorIDStr,
		CreatorName:        creatorNameStr,
		Status:             "active",
		Visibility:         visibility,
		AllowMultipleVotes: input.AllowMultipleVotes,
		RequireLogin:       input.RequireLogin,
		AutoClosePoll:      input.AutoClosePoll,
		TotalVotes:         0,
		TotalViews:         0,
	}

	if err := pc.store.CreatePoll(poll); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save poll: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, poll)
}

func (pc *PollController) ListPolls(c *gin.Context) {
	status := c.Query("status")
	category := c.Query("category")
	search := c.Query("search")
	userFilter := c.Query("userId")

	userID, _ := c.Get("userId")
	if userFilter == "" && userID != nil && userID.(string) != "" {
		userFilter = userID.(string)
	}

	excludeMock := c.Query("excludeMock") == "true"
	if userFilter != "" && userFilter != "user-pranesh-1" {
		excludeMock = true
	}

	polls, err := pc.store.ListPolls(status, category, search, userFilter, excludeMock)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list polls"})
		return
	}
	if polls == nil {
		polls = []*models.Poll{}
	}
	c.JSON(http.StatusOK, polls)
}

func (pc *PollController) ListPublicPolls(c *gin.Context) {
	category := c.Query("category")
	search := c.Query("search")
	sort := c.Query("sort") // "trending", "most_votes", "newest"
	excludeMock := c.Query("excludeMock") == "true"

	userID, _ := c.Get("userId")
	if userID != nil && userID.(string) != "" && userID.(string) != "user-pranesh-1" {
		excludeMock = true
	}
	if qUserID := c.Query("userId"); qUserID != "" && qUserID != "user-pranesh-1" {
		excludeMock = true
	}

	polls, err := pc.store.ListPublicPolls(category, search, sort, 20, excludeMock)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list public polls"})
		return
	}
	if polls == nil {
		polls = []*models.Poll{}
	}
	c.JSON(http.StatusOK, polls)
}

func (pc *PollController) GetPoll(c *gin.Context) {
	id := c.Param("id")
	poll, err := pc.store.GetPollByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	// Increment view count asynchronously
	go func(pollID string) {
		_ = pc.store.IncrementPollViews(pollID)
	}(id)

	c.JSON(http.StatusOK, poll)
}

func (pc *PollController) UpdatePoll(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userId")

	existing, err := pc.store.GetPollByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	if userID != nil && existing.CreatedBy != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to edit this poll"})
		return
	}

	var input models.UpdatePollInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	existing.Question = strings.TrimSpace(input.Question)
	if input.Category != "" {
		existing.Category = input.Category
	}
	if input.ImageURL != "" {
		existing.ImageURL = input.ImageURL
	}
	if input.Visibility != "" {
		existing.Visibility = input.Visibility
	}

	if err := pc.store.UpdatePoll(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update poll"})
		return
	}

	c.JSON(http.StatusOK, existing)
}

func (pc *PollController) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var input models.UpdatePollStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pc.store.UpdatePollStatus(id, input.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poll status updated successfully", "status": input.Status})
}

func (pc *PollController) ClosePoll(c *gin.Context) {
	id := c.Param("id")
	if err := pc.store.UpdatePollStatus(id, "closed"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Poll closed successfully", "status": "closed"})
}

func (pc *PollController) DeletePoll(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userId")
	userIdStr := ""
	if userID != nil {
		userIdStr = userID.(string)
	}

	if err := pc.store.DeletePoll(id, userIdStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poll deleted successfully"})
}

func (pc *PollController) DuplicatePoll(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userId")
	userName, _ := c.Get("userName")

	userIdStr := "user-pranesh-1"
	if userID != nil {
		userIdStr = userID.(string)
	}
	userNameStr := "Pranesh"
	if userName != nil {
		userNameStr = userName.(string)
	}

	duplicated, err := pc.store.DuplicatePoll(id, userIdStr, userNameStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to duplicate poll: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, duplicated)
}

func (pc *PollController) GetStats(c *gin.Context) {
	userID, _ := c.Get("userId")
	userIdStr := ""
	if userID != nil && userID.(string) != "" {
		userIdStr = userID.(string)
	}
	if qUserID := c.Query("userId"); qUserID != "" {
		userIdStr = qUserID
	}

	stats, err := pc.store.GetDashboardStats(userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve dashboard stats"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (pc *PollController) GetAnalytics(c *gin.Context) {
	userID, _ := c.Get("userId")
	userIdStr := ""
	if userID != nil && userID.(string) != "" {
		userIdStr = userID.(string)
	}
	if qUserID := c.Query("userId"); qUserID != "" {
		userIdStr = qUserID
	}

	analytics, err := pc.store.GetAnalytics(userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve analytics: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, analytics)
}

func (pc *PollController) GetActivity(c *gin.Context) {
	userID, _ := c.Get("userId")
	userIdStr := ""
	if userID != nil && userID.(string) != "" {
		userIdStr = userID.(string)
	}
	if qUserID := c.Query("userId"); qUserID != "" {
		userIdStr = qUserID
	}

	activities, err := pc.store.GetRecentActivities(10, userIdStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load recent activities"})
		return
	}
	c.JSON(http.StatusOK, activities)
}
