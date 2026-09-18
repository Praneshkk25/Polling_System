package models

import (
	"time"
)

type Vote struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	PollID    string    `json:"pollId" bson:"pollId"`
	OptionID  string    `json:"optionId" bson:"optionId"`
	VoterID   string    `json:"voterId" bson:"voterId"`
	VoterIP   string    `json:"voterIp" bson:"voterIp"`
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
}

type CastVoteInput struct {
	OptionID string `json:"optionId" binding:"required"`
	VoterID  string `json:"voterId" binding:"required"`
}

type VoteEventMessage struct {
	Type       string       `json:"type"` // "VOTE_UPDATE"
	PollID     string       `json:"pollId"`
	TotalVotes int64        `json:"totalVotes"`
	Options    []PollOption `json:"options"`
	UpdatedAt  time.Time    `json:"updatedAt"`
}
