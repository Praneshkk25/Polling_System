package database

import (
	"errors"
	"strings"
	"sync"
	"time"

	"livepoll-backend/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type MemoryStore struct {
	mu         sync.RWMutex
	users      map[string]*models.User
	usersByEmail map[string]*models.User
	polls      map[string]*models.Poll
	votes      []*models.Vote
	activities []*models.Activity
}

func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		users:        make(map[string]*models.User),
		usersByEmail: make(map[string]*models.User),
		polls:        make(map[string]*models.Poll),
		votes:        make([]*models.Vote, 0),
		activities:   make([]*models.Activity, 0),
	}
	store.seedInitialData()
	return store
}

func (m *MemoryStore) seedInitialData() {
	hashedPass, _ := bcrypt.GenerateFromPassword([]byte("Password123!"), bcrypt.DefaultCost)
	demoUser := &models.User{
		ID:        "user-pranesh-1",
		Name:      "Pranesh",
		Email:     "pranesh@pulsepoll.io",
		Password:  string(hashedPass),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	m.users[demoUser.ID] = demoUser
	m.usersByEmail[demoUser.Email] = demoUser

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
			IsMock:      true,
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
			IsMock:      true,
			TotalVotes:  500,
			TotalViews:  1800,
			CreatedAt:   time.Now().Add(-36 * time.Hour),
			UpdatedAt:   time.Now(),
		},
	}

	for _, p := range demoPolls {
		m.polls[p.ID] = p
	}
}

func (m *MemoryStore) CreateUser(user *models.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	m.users[user.ID] = user
	m.usersByEmail[strings.ToLower(user.Email)] = user
	return nil
}

func (m *MemoryStore) GetUserByEmail(email string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	user, ok := m.usersByEmail[strings.ToLower(email)]
	if !ok {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *MemoryStore) GetUserByID(id string) (*models.User, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	user, ok := m.users[id]
	if !ok {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *MemoryStore) UpdateUserProfile(userID, name string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	user, ok := m.users[userID]
	if !ok {
		return errors.New("user not found")
	}
	user.Name = strings.TrimSpace(name)
	user.UpdatedAt = time.Now()
	return nil
}

func (m *MemoryStore) UpdateUserPassword(userID, hashedPassword string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	user, ok := m.users[userID]
	if !ok {
		return errors.New("user not found")
	}
	user.Password = hashedPassword
	user.UpdatedAt = time.Now()
	return nil
}

func (m *MemoryStore) GetUserStats(userID string) (totalPolls, totalVotes, totalViews int64, err error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, p := range m.polls {
		if p.CreatedBy == userID {
			totalPolls++
			totalVotes += p.TotalVotes
			totalViews += p.TotalViews
		}
	}
	return totalPolls, totalVotes, totalViews, nil
}

func (m *MemoryStore) CreatePoll(poll *models.Poll) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if poll.ID == "" {
		poll.ID = "poll-" + uuid.New().String()[:8]
	}
	now := time.Now()
	poll.CreatedAt = now
	poll.UpdatedAt = now
	m.polls[poll.ID] = poll
	return nil
}

func (m *MemoryStore) GetPollByID(id string) (*models.Poll, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	poll, ok := m.polls[id]
	if !ok {
		return nil, errors.New("poll not found")
	}
	return poll, nil
}

func (m *MemoryStore) ListPolls(status, category, search, userID string, excludeMock bool) ([]*models.Poll, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []*models.Poll
	for _, p := range m.polls {
		if status != "" && status != "all" && p.Status != status {
			continue
		}
		if category != "" && category != "All" && p.Category != category {
			continue
		}
		if userID != "" && p.CreatedBy != userID {
			continue
		}
		if excludeMock && (p.IsMock || p.CreatedBy == "user-pranesh-1") && (userID == "" || userID != "user-pranesh-1") {
			continue
		}
		if search != "" && !strings.Contains(strings.ToLower(p.Question), strings.ToLower(search)) {
			continue
		}
		result = append(result, p)
	}
	if result == nil {
		result = []*models.Poll{}
	}
	return result, nil
}

func (m *MemoryStore) ListPublicPolls(category, search, sort string, limit int, excludeMock bool) ([]*models.Poll, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var result []*models.Poll
	for _, p := range m.polls {
		if p.Visibility == "private" {
			continue
		}
		if excludeMock && (p.IsMock || p.CreatedBy == "user-pranesh-1") {
			continue
		}
		if category != "" && category != "All" && p.Category != category {
			continue
		}
		if search != "" && !strings.Contains(strings.ToLower(p.Question), strings.ToLower(search)) {
			continue
		}
		result = append(result, p)
	}
	if result == nil {
		result = []*models.Poll{}
	}
	return result, nil
}

func (m *MemoryStore) UpdatePoll(poll *models.Poll) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	p, ok := m.polls[poll.ID]
	if !ok {
		return errors.New("poll not found")
	}
	p.Question = poll.Question
	p.Category = poll.Category
	p.ImageURL = poll.ImageURL
	p.Visibility = poll.Visibility
	p.UpdatedAt = time.Now()
	return nil
}

func (m *MemoryStore) UpdatePollStatus(id, status string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	p, ok := m.polls[id]
	if !ok {
		return errors.New("poll not found")
	}
	p.Status = status
	p.UpdatedAt = time.Now()
	return nil
}

func (m *MemoryStore) DeletePoll(id, userID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.polls, id)
	return nil
}

func (m *MemoryStore) DuplicatePoll(id, userID, newCreatorName string) (*models.Poll, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	orig, ok := m.polls[id]
	if !ok {
		return nil, errors.New("poll not found")
	}

	newPoll := &models.Poll{
		ID:          "poll-" + uuid.New().String()[:8],
		Question:    orig.Question + " (Copy)",
		Options:     orig.Options,
		Category:    orig.Category,
		ImageURL:    orig.ImageURL,
		CreatedBy:   userID,
		CreatorName: newCreatorName,
		Status:      "active",
		Visibility:  orig.Visibility,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.polls[newPoll.ID] = newPoll
	return newPoll, nil
}

func (m *MemoryStore) IncrementPollViews(id string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if p, ok := m.polls[id]; ok {
		p.TotalViews++
	}
	return nil
}

func (m *MemoryStore) HasVoted(pollID, voterID, voterIP string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, v := range m.votes {
		if v.PollID == pollID && v.VoterID == voterID {
			return true, nil
		}
	}
	return false, nil
}

func (m *MemoryStore) RecordVote(vote *models.Vote) (*models.Poll, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	poll, ok := m.polls[vote.PollID]
	if !ok {
		return nil, errors.New("poll not found")
	}
	if poll.Status == "closed" {
		return nil, errors.New("this poll is closed and no longer accepting votes")
	}

	found := false
	var totalVotes int64 = 0
	for i := range poll.Options {
		if poll.Options[i].ID == vote.OptionID {
			poll.Options[i].VotesCount++
			found = true
		}
		totalVotes += poll.Options[i].VotesCount
	}

	if !found {
		return nil, errors.New("invalid option selected")
	}

	poll.TotalVotes = totalVotes
	for i := range poll.Options {
		poll.Options[i].Percentage = (float64(poll.Options[i].VotesCount) / float64(totalVotes)) * 100.0
	}
	poll.UpdatedAt = time.Now()

	m.votes = append(m.votes, vote)
	return poll, nil
}

func (m *MemoryStore) GetDashboardStats(userID string) (*models.DashboardStats, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if userID != "" && userID != "user-pranesh-1" {
		var totalPolls int64 = 0
		var totalVotes int64 = 0
		var totalViews int64 = 0
		for _, p := range m.polls {
			if p.CreatedBy == userID && !p.IsMock {
				totalPolls++
				totalVotes += p.TotalVotes
				totalViews += p.TotalViews
			}
		}
		engagementRate := 0.0
		if totalViews > 0 {
			engagementRate = (float64(totalVotes) / float64(totalViews)) * 100.0
			if engagementRate > 100.0 {
				engagementRate = 100.0
			}
		}
		return &models.DashboardStats{
			TotalPolls:     totalPolls,
			TotalVotes:     totalVotes,
			TotalViews:     totalViews,
			EngagementRate: engagementRate,
		}, nil
	}

	var totalViews int64 = 0
	for _, p := range m.polls {
		totalViews += p.TotalViews
	}

	totalVotes := int64(len(m.votes))
	engagementRate := 94.2
	if totalViews > 0 {
		engagementRate = (float64(totalVotes) / float64(totalViews)) * 100.0
	}

	return &models.DashboardStats{
		TotalPolls:     int64(len(m.polls)),
		TotalVotes:     totalVotes,
		TotalViews:     totalViews,
		EngagementRate: engagementRate,
	}, nil
}

func (m *MemoryStore) GetAnalytics(userID string) (*models.AnalyticsResponse, error) {
	stats, _ := m.GetDashboardStats(userID)

	if userID != "" && userID != "user-pranesh-1" {
		m.mu.RLock()
		defer m.mu.RUnlock()

		catMap := make(map[string]int64)
		var userPolls []*models.Poll
		for _, p := range m.polls {
			if p.CreatedBy == userID && !p.IsMock {
				cat := p.Category
				if cat == "" {
					cat = "General"
				}
				catMap[cat] += p.TotalVotes
				userPolls = append(userPolls, p)
			}
		}

		colors := map[string]string{
			"Technology":    "#6366F1",
			"Lifestyle":     "#10B981",
			"Environment":   "#F59E0B",
			"Entertainment": "#EC4899",
			"General":       "#8B5CF6",
		}

		var categoryStats []models.CategoryBreakdown
		for cat, count := range catMap {
			pct := 0.0
			if stats.TotalVotes > 0 {
				pct = (float64(count) / float64(stats.TotalVotes)) * 100.0
			}
			color := colors[cat]
			if color == "" {
				color = "#6366F1"
			}
			categoryStats = append(categoryStats, models.CategoryBreakdown{
				Category:   cat,
				Count:      count,
				Percentage: pct,
				Color:      color,
			})
		}
		if categoryStats == nil {
			categoryStats = []models.CategoryBreakdown{}
		}

		var topPolls []models.TopPollItem
		for _, p := range userPolls {
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
		if topPolls == nil {
			topPolls = []models.TopPollItem{}
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

	return &models.AnalyticsResponse{
		TotalPolls:     stats.TotalPolls,
		TotalVotes:     stats.TotalVotes,
		TotalViews:     stats.TotalViews,
		EngagementRate: stats.EngagementRate,
		CategoryStats: []models.CategoryBreakdown{
			{Category: "Technology", Count: 482, Percentage: 50.0, Color: "#6366F1"},
			{Category: "Lifestyle", Count: 980, Percentage: 35.0, Color: "#10B981"},
		},
		TopPolls:         []models.TopPollItem{},
		RecentVotesCount: stats.TotalVotes,
	}, nil
}

func (m *MemoryStore) RecordActivity(activity *models.Activity) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.activities = append([]*models.Activity{activity}, m.activities...)
	return nil
}

func (m *MemoryStore) GetRecentActivities(limit int, userID string) ([]*models.Activity, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var filtered []*models.Activity
	for _, a := range m.activities {
		if userID != "" && userID != "user-pranesh-1" {
			if a.UserID != userID || a.IsMock {
				continue
			}
		}
		filtered = append(filtered, a)
		if len(filtered) >= limit {
			break
		}
	}
	if filtered == nil {
		filtered = []*models.Activity{}
	}
	return filtered, nil
}
