package models

import (
	"time"
)

type PollOption struct {
	ID         string  `json:"id" bson:"id"`
	Text       string  `json:"text" bson:"text"`
	VotesCount int64   `json:"votesCount" bson:"votesCount"`
	Percentage float64 `json:"percentage" bson:"percentage"`
}

type Poll struct {
	ID                 string       `json:"id" bson:"_id,omitempty"`
	Question           string       `json:"question" bson:"question"`
	Options            []PollOption `json:"options" bson:"options"`
	Category           string       `json:"category" bson:"category"`
	ImageURL           string       `json:"imageUrl" bson:"imageUrl"`
	CreatedBy          string       `json:"createdBy" bson:"createdBy"`
	CreatorName        string       `json:"creatorName" bson:"creatorName"`
	Status             string       `json:"status" bson:"status"` // "active", "closed", "draft"
	Visibility         string       `json:"visibility" bson:"visibility"` // "public", "private"
	AllowMultipleVotes bool         `json:"allowMultipleVotes" bson:"allowMultipleVotes"`
	RequireLogin       bool         `json:"requireLogin" bson:"requireLogin"`
	AutoClosePoll      bool         `json:"autoClosePoll" bson:"autoClosePoll"`
	ExpiresAt          *time.Time   `json:"expiresAt,omitempty" bson:"expiresAt,omitempty"`
	TotalVotes         int64        `json:"totalVotes" bson:"totalVotes"`
	TotalViews         int64        `json:"totalViews" bson:"totalViews"`
	IsMock             bool         `json:"isMock,omitempty" bson:"isMock,omitempty"`
	CreatedAt          time.Time    `json:"createdAt" bson:"createdAt"`
	UpdatedAt          time.Time    `json:"updatedAt" bson:"updatedAt"`
}

type CreatePollInput struct {
	Question           string   `json:"question" binding:"required,min=5,max=250"`
	Options            []string `json:"options" binding:"required,min=2,max=10"`
	Category           string   `json:"category"`
	ImageURL           string   `json:"imageUrl"`
	Visibility         string   `json:"visibility"`
	AllowMultipleVotes bool     `json:"allowMultipleVotes"`
	RequireLogin       bool     `json:"requireLogin"`
	AutoClosePoll      bool     `json:"autoClosePoll"`
}

type UpdatePollInput struct {
	Question   string `json:"question" binding:"required,min=5,max=250"`
	Category   string `json:"category"`
	ImageURL   string `json:"imageUrl"`
	Visibility string `json:"visibility"`
}

type UpdatePollStatusInput struct {
	Status string `json:"status" binding:"required,oneof=active closed draft"`
}

type PollResultsResponse struct {
	Poll       *Poll        `json:"poll"`
	TotalVotes int64        `json:"totalVotes"`
	TopOption  *PollOption  `json:"topOption,omitempty"`
	Breakdown  []PollOption `json:"breakdown"`
}

type DashboardStats struct {
	TotalPolls     int64   `json:"totalPolls"`
	TotalVotes     int64   `json:"totalVotes"`
	TotalViews     int64   `json:"totalViews"`
	EngagementRate float64 `json:"engagementRate"`
}

type CategoryBreakdown struct {
	Category   string  `json:"category"`
	Count      int64   `json:"count"`
	Percentage float64 `json:"percentage"`
	Color      string  `json:"color"`
}

type TopPollItem struct {
	ID            string  `json:"id"`
	Question      string  `json:"question"`
	Category      string  `json:"category"`
	TotalVotes    int64   `json:"totalVotes"`
	TotalViews    int64   `json:"totalViews"`
	TopOptionText string  `json:"topOptionText"`
	TopOptionPct  float64 `json:"topOptionPct"`
}

type AnalyticsResponse struct {
	TotalPolls       int64               `json:"totalPolls"`
	TotalVotes       int64               `json:"totalVotes"`
	TotalViews       int64               `json:"totalViews"`
	EngagementRate   float64             `json:"engagementRate"`
	CategoryStats    []CategoryBreakdown `json:"categoryStats"`
	TopPolls         []TopPollItem       `json:"topPolls"`
	RecentVotesCount int64               `json:"recentVotesCount"`
}

type Activity struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	UserID      string    `json:"userId" bson:"userId"`
	PollID      string    `json:"pollId" bson:"pollId"`
	PollTitle   string    `json:"pollTitle" bson:"pollTitle"`
	Type        string    `json:"type" bson:"type"` // "vote", "create", "close", "duplicate"
	Description string    `json:"description" bson:"description"`
	IsMock      bool      `json:"isMock,omitempty" bson:"isMock,omitempty"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
}
