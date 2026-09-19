package database

import (
	"livepoll-backend/models"
)

type Store interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id string) (*models.User, error)
	UpdateUserProfile(userID, name string) error
	UpdateUserPassword(userID, hashedPassword string) error
	GetUserStats(userID string) (totalPolls, totalVotes, totalViews int64, err error)

	CreatePoll(poll *models.Poll) error
	GetPollByID(id string) (*models.Poll, error)
	ListPolls(status, category, search, userID string, excludeMock bool) ([]*models.Poll, error)
	ListPublicPolls(category, search, sort string, limit int, excludeMock bool) ([]*models.Poll, error)
	UpdatePoll(poll *models.Poll) error
	UpdatePollStatus(id, status string) error
	DeletePoll(id, userID string) error
	DuplicatePoll(id, userID, newCreatorName string) (*models.Poll, error)
	IncrementPollViews(id string) error

	HasVoted(pollID, voterID, voterIP string) (bool, error)
	RecordVote(vote *models.Vote) (*models.Poll, error)
	GetDashboardStats(userID string) (*models.DashboardStats, error)
	GetAnalytics(userID string) (*models.AnalyticsResponse, error)

	RecordActivity(activity *models.Activity) error
	GetRecentActivities(limit int, userID string) ([]*models.Activity, error)
}
