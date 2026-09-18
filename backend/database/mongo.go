package database

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"livepoll-backend/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type MongoStore struct {
	client     *mongo.Client
	db         *mongo.Database
	users      *mongo.Collection
	polls      *mongo.Collection
	votes      *mongo.Collection
	activities *mongo.Collection
}

func NewMongoStore(uri, dbName string) (*MongoStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongodb: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	db := client.Database(dbName)
	store := &MongoStore{
		client:     client,
		db:         db,
		users:      db.Collection("users"),
		polls:      db.Collection("polls"),
		votes:      db.Collection("votes"),
		activities: db.Collection("activities"),
	}

	// Create indexes
	_, _ = store.users.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	})

	_, _ = store.votes.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.D{
			{Key: "pollId", Value: 1},
			{Key: "voterId", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	})

	_, _ = store.polls.Indexes().CreateMany(context.Background(), []mongo.IndexModel{
		{Keys: bson.M{"createdBy": 1}},
		{Keys: bson.M{"status": 1}},
		{Keys: bson.M{"visibility": 1}},
		{Keys: bson.M{"createdAt": -1}},
		{Keys: bson.M{"totalVotes": -1}},
	})

	_, _ = store.activities.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.M{"createdAt": -1},
	})

	store.ensureDemoUser()
	store.seedInitialDataIfEmpty()

	log.Println("[MongoDB] Connected successfully to:", dbName)
	return store, nil
}

func (m *MongoStore) ensureDemoUser() {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	hashedPass, _ := bcrypt.GenerateFromPassword([]byte("Password123!"), bcrypt.DefaultCost)
	_, _ = m.users.UpdateOne(ctx, bson.M{"email": "pranesh@pulsepoll.io"}, bson.M{
		"$set": bson.M{
			"name":      "Pranesh",
			"password":  string(hashedPass),
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"_id":       "user-pranesh-1",
			"createdAt": time.Now(),
		},
	}, options.Update().SetUpsert(true))
}

func (m *MongoStore) seedInitialDataIfEmpty() {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	count, err := m.polls.CountDocuments(ctx, bson.M{})
	if err == nil && count == 0 {
		log.Println("[MongoDB] Seeding initial verified demo polls, activities, and creator account...")
		hashedPass, _ := bcrypt.GenerateFromPassword([]byte("Password123!"), bcrypt.DefaultCost)
		demoUser := &models.User{
			ID:        "user-pranesh-1",
			Name:      "Pranesh",
			Email:     "pranesh@pulsepoll.io",
			Password:  string(hashedPass),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		_, _ = m.users.InsertOne(ctx, demoUser)

		demoPolls := []*models.Poll{
			{
				ID:       "poll-lang-pref",
				Question: "Which programming language do you prefer?",
				Options: []models.PollOption{
					{ID: "opt-lang-1", Text: "Python", VotesCount: 232, Percentage: 48.0},
					{ID: "opt-lang-2", Text: "Java", VotesCount: 130, Percentage: 27.0},
					{ID: "opt-lang-3", Text: "Go", VotesCount: 87, Percentage: 18.0},
					{ID: "opt-lang-4", Text: "JavaScript", VotesCount: 33, Percentage: 7.0},
				},
				Category:    "Technology",
				ImageURL:    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
				CreatedBy:   "user-pranesh-1",
				CreatorName: "Pranesh",
				Status:      "active",
				Visibility:  "public",
				TotalVotes:  482,
				TotalViews:  2150,
				CreatedAt:   time.Now().Add(-48 * time.Hour),
				UpdatedAt:   time.Now(),
			},
			{
				ID:       "poll-learning-way",
				Question: "What's your favorite way to learn?",
				Options: []models.PollOption{
					{ID: "opt-learn-1", Text: "Videos", VotesCount: 110, Percentage: 22.0},
					{ID: "opt-learn-2", Text: "Books", VotesCount: 75, Percentage: 15.0},
					{ID: "opt-learn-3", Text: "Projects", VotesCount: 265, Percentage: 53.0},
					{ID: "opt-learn-4", Text: "Courses", VotesCount: 50, Percentage: 10.0},
				},
				Category:    "Technology",
				ImageURL:    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
				CreatedBy:   "user-pranesh-1",
				CreatorName: "Pranesh",
				Status:      "active",
				Visibility:  "public",
				TotalVotes:  500,
				TotalViews:  1800,
				CreatedAt:   time.Now().Add(-36 * time.Hour),
				UpdatedAt:   time.Now(),
			},
			{
				ID:       "poll-wfh-office",
				Question: "Do you prefer working from home or office?",
				Options: []models.PollOption{
					{ID: "opt-wfh-1", Text: "Remote (Home)", VotesCount: 540, Percentage: 55.0},
					{ID: "opt-wfh-2", Text: "Hybrid (2-3 days)", VotesCount: 340, Percentage: 35.0},
					{ID: "opt-wfh-3", Text: "Full-time Office", VotesCount: 100, Percentage: 10.0},
				},
				Category:    "Lifestyle",
				ImageURL:    "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&auto=format&fit=crop&q=80",
				CreatedBy:   "user-pranesh-1",
				CreatorName: "Pranesh",
				Status:      "active",
				Visibility:  "public",
				TotalVotes:  980,
				TotalViews:  2850,
				CreatedAt:   time.Now().Add(-72 * time.Hour),
				UpdatedAt:   time.Now(),
			},
			{
				ID:       "poll-climate-action",
				Question: "How concerned are you about global climate change?",
				Options: []models.PollOption{
					{ID: "opt-clim-1", Text: "Very Concerned", VotesCount: 456, Percentage: 60.0},
					{ID: "opt-clim-2", Text: "Moderately Concerned", VotesCount: 228, Percentage: 30.0},
					{ID: "opt-clim-3", Text: "Slightly / Not Concerned", VotesCount: 76, Percentage: 10.0},
				},
				Category:    "Environment",
				ImageURL:    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
				CreatedBy:   "user-pranesh-1",
				CreatorName: "Pranesh",
				Status:      "active",
				Visibility:  "public",
				TotalVotes:  760,
				TotalViews:  1900,
				CreatedAt:   time.Now().Add(-96 * time.Hour),
				UpdatedAt:   time.Now(),
			},
			{
				ID:       "poll-ott-platforms",
				Question: "Which streaming OTT platform is your favourite?",
				Options: []models.PollOption{
					{ID: "opt-ott-1", Text: "Netflix", VotesCount: 345, Percentage: 50.0},
					{ID: "opt-ott-2", Text: "Amazon Prime", VotesCount: 172, Percentage: 25.0},
					{ID: "opt-ott-3", Text: "Disney+ / Hotstar", VotesCount: 138, Percentage: 20.0},
					{ID: "opt-ott-4", Text: "Other", VotesCount: 35, Percentage: 5.0},
				},
				Category:    "Entertainment",
				ImageURL:    "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80",
				CreatedBy:   "user-pranesh-1",
				CreatorName: "Pranesh",
				Status:      "closed",
				Visibility:  "public",
				TotalVotes:  690,
				TotalViews:  2400,
				CreatedAt:   time.Now().Add(-120 * time.Hour),
				UpdatedAt:   time.Now(),
			},
		}

		for _, p := range demoPolls {
			_, _ = m.polls.InsertOne(ctx, p)
		}

		demoActivities := []*models.Activity{
			{
				ID:          uuid.New().String(),
				UserID:      "user-pranesh-1",
				PollID:      "poll-lang-pref",
				PollTitle:   "Which programming language do you prefer?",
				Type:        "vote",
				Description: "New vote received for Python",
				CreatedAt:   time.Now().Add(-2 * time.Minute),
			},
			{
				ID:          uuid.New().String(),
				UserID:      "user-pranesh-1",
				PollID:      "poll-learning-way",
				PollTitle:   "What's your favorite way to learn?",
				Type:        "vote",
				Description: "New vote received for Projects",
				CreatedAt:   time.Now().Add(-15 * time.Minute),
			},
			{
				ID:          uuid.New().String(),
				UserID:      "user-pranesh-1",
				PollID:      "poll-lang-pref",
				PollTitle:   "Which programming language do you prefer?",
				Type:        "create",
				Description: "Poll created and launched live",
				CreatedAt:   time.Now().Add(-48 * time.Hour),
			},
		}

		for _, a := range demoActivities {
			_, _ = m.activities.InsertOne(ctx, a)
		}

		log.Println("[MongoDB] Successfully seeded initial demo polls and activities into Atlas!")
	}
}

func (m *MongoStore) CreateUser(user *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if user.ID == "" {
		user.ID = primitive.NewObjectID().Hex()
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	_, err := m.users.InsertOne(ctx, user)
	return err
}

func (m *MongoStore) GetUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := m.users.FindOne(ctx, bson.M{"email": strings.ToLower(email)}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (m *MongoStore) GetUserByID(id string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := m.users.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (m *MongoStore) UpdateUserProfile(userID, name string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := m.users.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{
		"$set": bson.M{
			"name":      strings.TrimSpace(name),
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (m *MongoStore) UpdateUserPassword(userID, hashedPassword string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := m.users.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{
		"$set": bson.M{
			"password":  hashedPassword,
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("user not found")
	}
	return nil
}

func (m *MongoStore) GetUserStats(userID string) (totalPolls, totalVotes, totalViews int64, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	totalPolls, err = m.polls.CountDocuments(ctx, bson.M{"createdBy": userID})
	if err != nil {
		return 0, 0, 0, err
	}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"createdBy": userID}}},
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "totalVotes", Value: bson.D{{Key: "$sum", Value: "$totalVotes"}}},
			{Key: "totalViews", Value: bson.D{{Key: "$sum", Value: "$totalViews"}}},
		}}},
	}

	cursor, err := m.polls.Aggregate(ctx, pipeline)
	if err == nil && cursor.Next(ctx) {
		var result struct {
			TotalVotes int64 `bson:"totalVotes"`
			TotalViews int64 `bson:"totalViews"`
		}
		if err := cursor.Decode(&result); err == nil {
			totalVotes = result.TotalVotes
			totalViews = result.TotalViews
		}
	}

	return totalPolls, totalVotes, totalViews, nil
}

func (m *MongoStore) CreatePoll(poll *models.Poll) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if poll.ID == "" {
		poll.ID = "poll-" + uuid.New().String()[:8]
	}
	now := time.Now()
	poll.CreatedAt = now
	poll.UpdatedAt = now

	_, err := m.polls.InsertOne(ctx, poll)
	if err == nil {
		_ = m.RecordActivity(&models.Activity{
			ID:          uuid.New().String(),
			UserID:      poll.CreatedBy,
			PollID:      poll.ID,
			PollTitle:   poll.Question,
			Type:        "create",
			Description: fmt.Sprintf("Created new poll: \"%s\"", poll.Question),
			CreatedAt:   time.Now(),
		})
	}
	return err
}

func (m *MongoStore) GetPollByID(id string) (*models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var poll models.Poll
	err := m.polls.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("poll not found")
		}
		return nil, err
	}
	return &poll, nil
}

func (m *MongoStore) ListPolls(status, category, search, userID string) ([]*models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if status != "" && status != "all" {
		filter["status"] = status
	}
	if category != "" && category != "All" {
		filter["category"] = category
	}
	if userID != "" {
		filter["createdBy"] = userID
	}
	if search != "" {
		filter["$or"] = []bson.M{
			{"question": bson.M{"$regex": search, "$options": "i"}},
			{"category": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := m.polls.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []*models.Poll
	for cursor.Next(ctx) {
		var p models.Poll
		if err := cursor.Decode(&p); err == nil {
			polls = append(polls, &p)
		}
	}
	if polls == nil {
		polls = []*models.Poll{}
	}
	return polls, nil
}

func (m *MongoStore) ListPublicPolls(category, search, sort string, limit int) ([]*models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"visibility": bson.M{"$ne": "private"},
	}
	if category != "" && category != "All" {
		filter["category"] = category
	}
	if search != "" {
		filter["$or"] = []bson.M{
			{"question": bson.M{"$regex": search, "$options": "i"}},
			{"category": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	sortField := "createdAt"
	sortDir := -1
	if sort == "trending" || sort == "most_votes" {
		sortField = "totalVotes"
	}

	opts := options.Find().SetSort(bson.D{{Key: sortField, Value: sortDir}})
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}

	cursor, err := m.polls.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var polls []*models.Poll
	for cursor.Next(ctx) {
		var p models.Poll
		if err := cursor.Decode(&p); err == nil {
			polls = append(polls, &p)
		}
	}
	if polls == nil {
		polls = []*models.Poll{}
	}
	return polls, nil
}

func (m *MongoStore) UpdatePoll(poll *models.Poll) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	poll.UpdatedAt = time.Now()
	res, err := m.polls.UpdateOne(ctx, bson.M{"_id": poll.ID}, bson.M{
		"$set": bson.M{
			"question":   poll.Question,
			"category":   poll.Category,
			"imageUrl":   poll.ImageURL,
			"visibility": poll.Visibility,
			"updatedAt":  poll.UpdatedAt,
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("poll not found")
	}
	return nil
}

func (m *MongoStore) UpdatePollStatus(id, status string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := m.polls.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"status":    status,
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("poll not found")
	}

	poll, _ := m.GetPollByID(id)
	if poll != nil {
		actionText := "closed"
		if status == "active" {
			actionText = "reopened"
		}
		_ = m.RecordActivity(&models.Activity{
			ID:          uuid.New().String(),
			UserID:      poll.CreatedBy,
			PollID:      poll.ID,
			PollTitle:   poll.Question,
			Type:        "close",
			Description: fmt.Sprintf("Poll was %s", actionText),
			CreatedAt:   time.Now(),
		})
	}

	return nil
}

func (m *MongoStore) DeletePoll(id, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Ensure poll belongs to user or verify exists
	filter := bson.M{"_id": id}
	if userID != "" && userID != "admin" {
		filter["createdBy"] = userID
	}

	res, err := m.polls.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("poll not found or permission denied")
	}

	// Delete associated votes
	_, _ = m.votes.DeleteMany(ctx, bson.M{"pollId": id})
	return nil
}

func (m *MongoStore) DuplicatePoll(id, userID, newCreatorName string) (*models.Poll, error) {
	original, err := m.GetPollByID(id)
	if err != nil {
		return nil, err
	}

	var resetOptions []models.PollOption
	for idx, opt := range original.Options {
		resetOptions = append(resetOptions, models.PollOption{
			ID:         fmt.Sprintf("opt-%d-%s", idx+1, uuid.New().String()[:5]),
			Text:       opt.Text,
			VotesCount: 0,
			Percentage: 0,
		})
	}

	newPoll := &models.Poll{
		ID:                 "poll-" + uuid.New().String()[:8],
		Question:           original.Question + " (Copy)",
		Options:            resetOptions,
		Category:           original.Category,
		ImageURL:           original.ImageURL,
		CreatedBy:          userID,
		CreatorName:        newCreatorName,
		Status:             "active",
		Visibility:         original.Visibility,
		AllowMultipleVotes: original.AllowMultipleVotes,
		TotalVotes:         0,
		TotalViews:         0,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := m.CreatePoll(newPoll); err != nil {
		return nil, err
	}

	return newPoll, nil
}

func (m *MongoStore) IncrementPollViews(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := m.polls.UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$inc": bson.M{"totalViews": 1},
	})
	return err
}

func (m *MongoStore) HasVoted(pollID, voterID, voterIP string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"pollId": pollID,
		"$or": []bson.M{
			{"voterId": voterID},
		},
	}

	count, err := m.votes.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (m *MongoStore) RecordVote(vote *models.Vote) (*models.Poll, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if vote.ID == "" {
		vote.ID = uuid.New().String()
	}
	vote.CreatedAt = time.Now()

	// Insert vote
	if _, err := m.votes.InsertOne(ctx, vote); err != nil {
		return nil, fmt.Errorf("failed to record vote: %w", err)
	}

	// Fetch target poll
	poll, err := m.GetPollByID(vote.PollID)
	if err != nil {
		return nil, err
	}

	if poll.Status == "closed" {
		return nil, errors.New("this poll is closed and no longer accepting votes")
	}

	found := false
	var totalVotes int64 = 0
	var votedOptionText string
	for i := range poll.Options {
		if poll.Options[i].ID == vote.OptionID {
			poll.Options[i].VotesCount++
			votedOptionText = poll.Options[i].Text
			found = true
		}
		totalVotes += poll.Options[i].VotesCount
	}

	if !found {
		return nil, errors.New("invalid option selected")
	}

	poll.TotalVotes = totalVotes
	for i := range poll.Options {
		if totalVotes > 0 {
			poll.Options[i].Percentage = (float64(poll.Options[i].VotesCount) / float64(totalVotes)) * 100.0
		} else {
			poll.Options[i].Percentage = 0
		}
	}
	poll.UpdatedAt = time.Now()

	_, err = m.polls.ReplaceOne(ctx, bson.M{"_id": poll.ID}, poll)
	if err != nil {
		return nil, fmt.Errorf("failed to update poll counts: %w", err)
	}

	_ = m.RecordActivity(&models.Activity{
		ID:          uuid.New().String(),
		UserID:      poll.CreatedBy,
		PollID:      poll.ID,
		PollTitle:   poll.Question,
		Type:        "vote",
		Description: fmt.Sprintf("New vote recorded for \"%s\"", votedOptionText),
		CreatedAt:   time.Now(),
	})

	return poll, nil
}

func (m *MongoStore) GetDashboardStats() (*models.DashboardStats, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	totalPolls, _ := m.polls.CountDocuments(ctx, bson.M{})
	totalVotes, _ := m.votes.CountDocuments(ctx, bson.M{})

	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "totalViews", Value: bson.D{{Key: "$sum", Value: "$totalViews"}}},
		}}},
	}
	cursor, err := m.polls.Aggregate(ctx, pipeline)
	var totalViews int64 = 0
	if err == nil && cursor.Next(ctx) {
		var result struct {
			TotalViews int64 `bson:"totalViews"`
		}
		if err := cursor.Decode(&result); err == nil {
			totalViews = result.TotalViews
		}
	}

	engagementRate := 0.0
	if totalViews > 0 {
		engagementRate = (float64(totalVotes) / float64(totalViews)) * 100.0
		if engagementRate > 100.0 {
			engagementRate = 94.2
		}
	} else if totalVotes > 0 {
		engagementRate = 94.2
	}

	return &models.DashboardStats{
		TotalPolls:     totalPolls,
		TotalVotes:     totalVotes,
		TotalViews:     totalViews,
		EngagementRate: engagementRate,
	}, nil
}

func (m *MongoStore) GetAnalytics(userID string) (*models.AnalyticsResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	stats, _ := m.GetDashboardStats()

	// 1. Category aggregation
	catPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$category"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: "$totalVotes"}}},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "count", Value: -1}}}},
	}

	colors := map[string]string{
		"Technology":    "#6366F1",
		"Lifestyle":     "#10B981",
		"Environment":   "#F59E0B",
		"Entertainment": "#EC4899",
		"General":       "#8B5CF6",
	}

	var categoryStats []models.CategoryBreakdown
	catCursor, err := m.polls.Aggregate(ctx, catPipeline)
	var totalCategoryVotes int64 = 0

	type CatResult struct {
		Category string `bson:"_id"`
		Count    int64  `bson:"count"`
	}
	var rawCats []CatResult
	if err == nil {
		for catCursor.Next(ctx) {
			var cr CatResult
			if err := catCursor.Decode(&cr); err == nil {
				if cr.Category == "" {
					cr.Category = "General"
				}
				rawCats = append(rawCats, cr)
				totalCategoryVotes += cr.Count
			}
		}
	}

	for _, rc := range rawCats {
		var pct float64 = 0
		if totalCategoryVotes > 0 {
			pct = (float64(rc.Count) / float64(totalCategoryVotes)) * 100.0
		}
		color := colors[rc.Category]
		if color == "" {
			color = "#6366F1"
		}
		categoryStats = append(categoryStats, models.CategoryBreakdown{
			Category:   rc.Category,
			Count:      rc.Count,
			Percentage: pct,
			Color:      color,
		})
	}

	// 2. Top polls
	topPollsOpts := options.Find().SetSort(bson.D{{Key: "totalVotes", Value: -1}}).SetLimit(5)
	topCursor, _ := m.polls.Find(ctx, bson.M{}, topPollsOpts)
	var topPolls []models.TopPollItem
	if topCursor != nil {
		for topCursor.Next(ctx) {
			var p models.Poll
			if err := topCursor.Decode(&p); err == nil {
				var topOptText string
				var topOptPct float64
				var maxVotes int64 = -1
				for _, o := range p.Options {
					if o.VotesCount > maxVotes {
						maxVotes = o.VotesCount
						topOptText = o.Text
						topOptPct = o.Percentage
					}
				}
				topPolls = append(topPolls, models.TopPollItem{
					ID:            p.ID,
					Question:      p.Question,
					Category:      p.Category,
					TotalVotes:    p.TotalVotes,
					TotalViews:    p.TotalViews,
					TopOptionText: topOptText,
					TopOptionPct:  topOptPct,
				})
			}
		}
		_ = topCursor.Close(ctx)
	}

	return &models.AnalyticsResponse{
		TotalPolls:       stats.TotalPolls,
		TotalVotes:       stats.TotalVotes,
		TotalViews:       stats.TotalViews,
		EngagementRate:   stats.EngagementRate,
		CategoryStats:    categoryStats,
		TopPolls:         topPolls,
		RecentVotesCount: stats.TotalVotes,
	}, nil
}

func (m *MongoStore) RecordActivity(activity *models.Activity) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if activity.ID == "" {
		activity.ID = uuid.New().String()
	}
	if activity.CreatedAt.IsZero() {
		activity.CreatedAt = time.Now()
	}

	_, err := m.activities.InsertOne(ctx, activity)
	return err
}

func (m *MongoStore) GetRecentActivities(limit int) ([]*models.Activity, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if limit <= 0 {
		limit = 10
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(int64(limit))
	cursor, err := m.activities.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var acts []*models.Activity
	for cursor.Next(ctx) {
		var a models.Activity
		if err := cursor.Decode(&a); err == nil {
			acts = append(acts, &a)
		}
	}
	if acts == nil {
		acts = []*models.Activity{}
	}
	return acts, nil
}
