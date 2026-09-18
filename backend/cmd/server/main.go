package main

import (
	"log"
	"net/http"

	"livepoll-backend/config"
	"livepoll-backend/controllers"
	"livepoll-backend/database"
	"livepoll-backend/middleware"
	"livepoll-backend/models"
	"livepoll-backend/redis"
	"livepoll-backend/websocket"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	log.Println("==================================================")
	log.Println("   Starting PulsePoll Real-time Polling Engine   ")
	log.Println("==================================================")

	// 1. Initialize persistent storage (MongoDB Atlas)
	store := database.InitDatabase(cfg)

	// 2. Initialize Redis Pub/Sub engine (Online Cloud or Local)
	pubsubService := redis.InitPubSub(cfg)
	defer pubsubService.Close()

	// 3. Initialize WebSocket Hub
	hub := websocket.NewHub()
	go hub.Run()

	// 4. Connect Redis Pub/Sub directly to WebSocket Hub for zero-refresh broadcasts
	pubsubService.Subscribe(func(pollID string, event *models.VoteEventMessage) {
		log.Printf("[Realtime Flow] Redis Pub/Sub received vote for poll %s -> Broadcasting to connected WebSockets", pollID)
		hub.BroadcastVoteEvent(pollID, event)
	})

	// 5. Initialize Controllers
	authController := controllers.NewAuthController(store, cfg)
	pollController := controllers.NewPollController(store)
	voteController := controllers.NewVoteController(store, pubsubService)

	// 6. Setup Gin Router
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// Root Welcome Route
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":  "PulsePoll Real-time Engine is Online & Healthy!",
			"version":  "1.0.0",
			"status":   "healthy",
			"health":   "/health",
			"api_docs": "/api",
			"realtime": "Redis Pub/Sub (Upstash) + WebSockets",
		})
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"service":  "PulsePoll Backend (Go + Gin)",
			"storage":  "MongoDB Atlas (Persistent Data)",
			"realtime": "Redis Pub/Sub + WebSockets",
		})
	})

	api := r.Group("/api")
	{
		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authController.Signup)
			auth.POST("/login", authController.Login)
			auth.POST("/logout", authController.Logout)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authController.Me)
			auth.PUT("/profile", middleware.AuthMiddleware(cfg), authController.UpdateProfile)
			auth.PUT("/password", middleware.AuthMiddleware(cfg), authController.ChangePassword)
		}

		// Public Discovery Endpoints (For Audience & Landing Page)
		public := api.Group("/public")
		{
			public.GET("/polls", pollController.ListPublicPolls)
			public.GET("/polls/:id", pollController.GetPoll)
		}

		// Dashboard & Analytics Endpoints
		api.GET("/dashboard/stats", pollController.GetStats)
		api.GET("/dashboard/activity", pollController.GetActivity)
		api.GET("/analytics", pollController.GetAnalytics)

		// Poll Routes
		polls := api.Group("/polls")
		{
			// Public / Audience endpoints
			polls.GET("", pollController.ListPolls)
			polls.GET("/stats", pollController.GetStats)
			polls.GET("/:id", pollController.GetPoll)
			polls.GET("/:id/results", voteController.GetResults)

			// Real-time voting endpoint
			polls.POST("/:id/vote", voteController.CastVote)

			// Real-time WebSocket live connection
			polls.GET("/:id/live", func(c *gin.Context) {
				pollID := c.Param("id")
				websocket.ServeWs(hub, c.Writer, c.Request, pollID)
			})

			// Protected creator management endpoints
			protected := polls.Group("")
			protected.Use(middleware.AuthMiddleware(cfg))
			{
				protected.POST("", pollController.CreatePoll)
				protected.PUT("/:id", pollController.UpdatePoll)
				protected.DELETE("/:id", pollController.DeletePoll)
				protected.POST("/:id/close", pollController.ClosePoll)
				protected.PUT("/:id/status", pollController.UpdateStatus)
				protected.POST("/:id/duplicate", pollController.DuplicatePoll)
			}
		}
	}

	log.Printf("[Server] PulsePoll API listening on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to run: %v", err)
	}
}
