package controllers

import (
	"log"
	"net/http"
	"time"

	"livepoll-backend/database"
	"livepoll-backend/models"
	"livepoll-backend/redis"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type VoteController struct {
	store  database.Store
	pubsub redis.PubSubService
}

func NewVoteController(store database.Store, pubsub redis.PubSubService) *VoteController {
	return &VoteController{
		store:  store,
		pubsub: pubsub,
	}
}

func (vc *VoteController) CastVote(c *gin.Context) {
	pollID := c.Param("id")

	var input models.CastVoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vote request: " + err.Error()})
		return
	}

	// Extract voter ID and voter IP for duplicate vote prevention
	voterID := input.VoterID
	if voterID == "" {
		voterID = c.GetHeader("X-Voter-Token")
	}
	if voterID == "" {
		voterID = uuid.New().String()
	}

	clientIP := c.ClientIP()

	// Check if voter already cast a vote on this poll
	hasVoted, err := vc.store.HasVoted(pollID, voterID, clientIP)
	if err == nil && hasVoted {
		c.JSON(http.StatusConflict, gin.H{
			"error": "You have already voted in this poll. Multiple votes are not permitted.",
		})
		return
	}

	vote := &models.Vote{
		ID:        uuid.New().String(),
		PollID:    pollID,
		OptionID:  input.OptionID,
		VoterID:   voterID,
		VoterIP:   clientIP,
		CreatedAt: time.Now(),
	}

	// Record vote in persistent storage
	updatedPoll, err := vc.store.RecordVote(vote)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Construct real-time broadcast event
	eventMsg := &models.VoteEventMessage{
		Type:       "VOTE_UPDATE",
		PollID:     updatedPoll.ID,
		TotalVotes: updatedPoll.TotalVotes,
		Options:    updatedPoll.Options,
		UpdatedAt:  time.Now(),
	}

	// Publish to Redis Pub/Sub so all connected backend nodes and WebSockets push to viewers instantly
	if err := vc.pubsub.PublishVoteEvent(pollID, eventMsg); err != nil {
		log.Printf("[Redis] Warning: Failed to publish vote event to Redis: %v", err)
	} else {
		log.Printf("[Redis] Successfully published vote event for poll %s (Total votes: %d)", pollID, updatedPoll.TotalVotes)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote recorded successfully",
		"poll":    updatedPoll,
		"voterId": voterID,
	})
}

func (vc *VoteController) GetResults(c *gin.Context) {
	pollID := c.Param("id")

	poll, err := vc.store.GetPollByID(pollID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	var topOption *models.PollOption
	var maxVotes int64 = -1
	for _, opt := range poll.Options {
		if opt.VotesCount > maxVotes {
			maxVotes = opt.VotesCount
			optCopy := opt
			topOption = &optCopy
		}
	}

	c.JSON(http.StatusOK, models.PollResultsResponse{
		Poll:       poll,
		TotalVotes: poll.TotalVotes,
		TopOption:  topOption,
		Breakdown:  poll.Options,
	})
}
