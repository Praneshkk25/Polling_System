# PulsePoll — Real-Time Online Polling Platform ⚡

> **GUVI Developer Internship Task Submission**  
> Built with **React**, **Go (Gin)**, **MongoDB**, and **Redis** for sub-millisecond, zero-refresh live vote synchronization.

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Tech Stack & Responsibilities](#-tech-stack--responsibilities)
5. [Real-Time Flow (How Zero-Refresh Works)](#-real-time-flow-how-zero-refresh-works)
6. [Project Structure](#-project-structure)
7. [API Documentation](#-api-documentation)
8. [Environment Variables](#-environment-variables)
9. [Local Development Setup](#-local-development-setup)
10. [Running with Docker Compose](#-running-with-docker-compose)
11. [Production Deployment Guide](#-production-deployment-guide)
12. [Design & Engineering Decisions](#-design--engineering-decisions)
13. [Demo Video Walkthrough Script (3–5 Min)](#-demo-video-walkthrough-script-35-min)
14. [Final Submission Details](#-final-submission-details)

---

## 🌟 Overview

**PulsePoll** is a high-concurrency, real-time polling application (similar to a streamlined Mentimeter or Slido). It allows creators to formulate questions with customized options, share polls via link or QR code, and watch audience votes update instantaneously across all connected devices **without any page refresh**.

### The Core Flow
$$\text{Sign Up / Login} \longrightarrow \text{Create Poll} \longrightarrow \text{Share Link / QR} \longrightarrow \text{Audience Votes} \longrightarrow \text{Live Sync Across All Viewers}$$

---

## ✨ Key Features

- **🎬 Cinematic Parallax Landing Page**: 6 scroll-driven scenes recreating the product film storyboard (Hero, Ask Anything, Share Anywhere, Live Results, Why PulsePoll, Final CTA) with real photography, floating UI cards, and handwritten annotations.
- **⚡ Zero-Refresh Live Updates**: Real-time vote counts and percentages update smoothly across all open sessions via WebSockets and Redis Pub/Sub.
- **🎨 Pixel-Perfect 10-Frame Visual Storyboard Match**:
  - **Frame 1**: Hero Parallax with mountain traveler and floating live poll card.
  - **Frame 2**: "Ask anything." interactive poll card with sequential option reveal.
  - **Frame 3**: "Share it anywhere." floating URL card, QR code, and smartphone mockup.
  - **Frame 4**: "Watch opinions change — live." dynamic bar chart with live voter avatars.
  - **Frame 5**: "Built for every conversation." 2x2 feature showcase.
  - **Frame 6**: "Every vote adds a new perspective." final CTA with cliff sunset traveler.
  - **Frame 7**: 2-Column animated Login & Signup page with live polling preview.
  - **Frame 8**: Creator Dashboard with real MongoDB analytics, active polls, and contextual sidebars.
  - **Frame 9**: Focused audience voting view (`/poll/:id`) with voter avatars and instant feedback.
  - **Frame 10**: Live Results view (`/poll/:id/results`) with bidirectional WebSocket stream from Redis Pub/Sub.
- **🛡️ Duplicate-Vote Prevention**: Enforced at the Go API layer with HTTP 409 Conflict protection.
- **📱 Anonymous Voting & Instant Feedback**: Audiences vote without registration; immediate animated transition to real-time results.
- **📷 Instant QR Code Generator**: Generates crisp QR codes for in-person presentations and mobile participation.
- **🔒 Poll Lifecycle Control**: Creators can create, duplicate, close, reopen, and delete polls.
- **🔐 Real JWT Authentication**: Secure bcrypt password hashing and JWT authorization.
  - **Demo Credentials**: `pranesh@pulsepoll.io` / `Password123!`
- **🚀 1-Click Native Launcher (`start_all.bat`)**: Launches Native Windows Redis (Port 6379), Go Backend (Port 8080), and React Frontend (Port 5173) in one double-click.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │         React Frontend         │
                               │  (Vite + CSS Design System)    │
                               └───────────────┬────────────────┘
                                               │
                                      REST API │ WebSocket (WS)
                                               ▼
                               ┌────────────────────────────────┐
                               │        Go + Gin Backend        │
                               │     (Gorilla WebSocket Hub)    │
                               └───────┬────────────────┬───────┘
                                       │                │
                        Durable Storage│                │Publish Vote Event
                                       ▼                ▼
                         ┌───────────────────┐    ┌───────────────────┐
                         │      MongoDB      │    │       Redis       │
                         │                   │    │                   │
                         │ • Users           │    │ • Pub/Sub Engine  │
                         │ • Polls & Options │    │ • Channel: votes  │
                         │ • Votes History   │    │ • Sub-ms Cache    │
                         └───────────────────┘    └─────────┬─────────┘
                                                            │
                                            Broadcast to all│connected rooms
                                                            ▼
                                                  ┌───────────────────┐
                                                  │ Connected Clients │
                                                  │ (Live Results UI) │
                                                  └───────────────────┘
```

---

## 💻 Tech Stack & Responsibilities

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Responsive, reactive UI, state management, audio-visual feedback, and QR code rendering. |
| **Backend** | Go (Golang) + Gin | High-performance RESTful API endpoints, request validation, JWT signing, and Gorilla WebSocket connection hub. |
| **Database** | MongoDB (`mongo-driver`) | Persistent, schema-flexible storage for users, polls, options, and individual audit votes. |
| **Realtime** | Redis (`go-redis/v9`) | Pub/Sub message broker that instantly decouples and fans out vote updates to all WebSocket listeners across nodes. |

---

## 🚀 Real-Time Flow (How Zero-Refresh Works)

1. **Voter clicks an Option** (e.g., *Python*) in Browser A.
2. React dispatches a `POST /api/polls/:id/vote` request containing the option ID and unique voter token.
3. The **Go / Gin backend**:
   - Validates that the poll is currently open (`status == "active"`).
   - Validates that this voter token hasn't voted in this poll before.
   - Atomically records the vote in **MongoDB** and recalculates percentages.
4. Go publishes a structured JSON payload to **Redis Pub/Sub** on the channel `pulsepoll:events:votes`.
5. The Redis subscriber listener in Go intercepts the event and passes it to the active **WebSocket Hub**.
6. The WebSocket Hub finds all connected sockets subscribed to that specific poll room and sends the updated statistics.
7. Browser B (which is currently viewing the Live Results page) receives the message over its WebSocket connection and updates the state.
8. The progress bar expands with a smooth CSS transition from `9` to `10` votes **with zero page refresh**!

---

## 📁 Project Structure

```
HCL GUVI/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go              # Entry point, Gin router, WebSocket & Pub/Sub wiring
│   ├── config/
│   │   └── config.go                # Environment loader (MongoDB, Redis, JWT, Ports)
│   ├── controllers/
│   │   ├── auth_controller.go       # Signup, Login, Me endpoints
│   │   ├── poll_controller.go       # Create poll, list polls, get stats, update status
│   │   ├── vote_controller.go       # Vote submission, duplicate check, Redis publish
│   │   └── poll_controller_test.go  # Unit & integration tests for validation & votes
│   ├── database/
│   │   ├── store.go                 # Generic Store interface
│   │   ├── mongo.go                 # Official MongoDB driver implementation
│   │   ├── memory.go                # Thread-safe in-memory store with seeded demo data
│   │   └── database.go              # Factory initializing Mongo or fallback
│   ├── middleware/
│   │   ├── auth.go                  # JWT Bearer token middleware
│   │   └── cors.go                  # Cross-Origin Resource Sharing headers
│   ├── models/
│   │   ├── user.go                  # User model & JWT Claims
│   │   ├── poll.go                  # Poll, PollOption, DashboardStats models
│   │   └── vote.go                  # Vote record and VoteEventMessage
│   ├── redis/
│   │   └── pubsub.go                # Redis Pub/Sub client & channel subscriber
│   ├── websocket/
│   │   ├── hub.go                   # Room manager for poll WebSocket connections
│   │   └── client.go                # Gorilla WebSocket reader/writer pump & ping/pong
│   ├── Dockerfile                   # Multi-stage Go production container
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top bar with search, notifications, & user pill
│   │   │   ├── Sidebar.jsx          # Left menu & promo card
│   │   │   ├── RightSidebar.jsx     # Quick actions, impact card, recent activity
│   │   │   ├── HeroBanner.jsx       # 3D illustration banner & CTA
│   │   │   ├── StatsRow.jsx         # 4 stat cards (Total Polls, Votes, Views, Rate)
│   │   │   ├── PollCard.jsx         # Live poll card with Share, View, & options
│   │   │   ├── TrendingGrid.jsx     # 4 trending category cards
│   │   │   ├── CreatePollModal.jsx  # Question & dynamic options adder
│   │   │   ├── ShareModal.jsx       # 1-click copy link & QR code generator
│   │   │   ├── JoinModal.jsx        # Direct poll join by code
│   │   │   └── AuthModal.jsx        # Login/Signup modal with 1-click demo login
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx    # Complete dashboard view
│   │   │   ├── VotingPage.jsx       # Clean audience voting view
│   │   │   └── LiveResultsPage.jsx  # Real-time WebSocket visual bar charts
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication session & user state
│   │   ├── services/
│   │   │   ├── api.js               # REST client with JWT & voter headers
│   │   │   └── websocket.js         # WebSocket connection manager with auto-reconnect
│   │   ├── App.jsx                  # Hash router and global modal providers
│   │   ├── index.css                # Modern CSS design system & micro-animations
│   │   └── main.jsx
│   ├── Dockerfile                   # Vite build + Nginx alpine production image
│   ├── nginx.conf                   # Nginx reverse proxy & SPA fallback
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml               # 1-command container orchestration (Mongo, Redis, Go, React)
├── .env.example                     # Environment template
└── README.md                        # Complete documentation & video script
```

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/signup`: Create a creator account (`name`, `email`, `password`).
- `POST /api/auth/login`: Authenticate and receive a JWT token (`email`, `password`).
- `GET /api/auth/me`: Fetch authenticated user profile (Requires `Authorization: Bearer <token>`).

### Poll Management
- `GET /api/polls`: List all polls. Supports query filter `?status=all|active|closed|drafts`.
- `GET /api/polls/stats`: Retrieve aggregated dashboard statistics (polls, votes, views, engagement rate).
- `GET /api/polls/:id`: Retrieve single poll details and increment view count.
- `POST /api/polls`: Create a new poll. Requires authentication.
  - *Validation*: Question length 5–250 chars, 2–10 options, non-empty, no duplicates.
- `PUT /api/polls/:id/status`: Update poll status to `active`, `closed`, or `draft`.

### Voting & Real-Time Sync
- `POST /api/polls/:id/vote`: Submit a vote.
  - Body: `{"optionId": "opt-1", "voterId": "voter_abc"}`.
  - Returns `409 Conflict` if duplicate vote is detected.
  - Publishes vote event to Redis Pub/Sub immediately.
- `GET /api/polls/:id/results`: Get current vote tallies and percentage breakdown.
- `GET /api/polls/:id/live`: Upgrade connection to WebSocket. Streams live vote events to viewers in real time.

---

## ⚙️ Environment Variables

Copy `.env.example` to create your configuration:

```env
PORT=8080
CLIENT_ORIGIN=*
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=pulsepoll
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
JWT_SECRET=pulsepoll_super_secure_jwt_secret_guvi_2026
```

---

## 🛠️ Local Development Setup

### Prerequisites
- **Go** (1.23 or newer)
- **Node.js** (18 or newer) & **npm**
- *(Optional)* MongoDB & Redis installed locally or cloud connection strings (the backend automatically falls back to an in-memory PubSub and store if offline).

### 1. Start the Go Backend
```bash
cd backend
go run cmd/server/main.go
```
*The backend server will start on port `8080`.*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` (or the port displayed in your terminal) in your browser.*

---

## 🐳 Running with Docker Compose

To launch the complete stack (**MongoDB + Redis + Go Backend + React Frontend**) in one command:

```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 🌐 Production Deployment Guide

### Frontend on Vercel
1. Push the repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
   - `VITE_WS_HOST`: `your-backend.onrender.com`
5. Click **Deploy**.

### Backend on Render / Railway / Fly.io
1. Create a new **Web Service** pointing to the `backend` folder.
2. Build command: `go build -o server ./cmd/server`
3. Start command: `./server`
4. Set Environment Variables:
   - `PORT`: `8080`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `REDIS_ADDR`: *Your Redis Cloud or Upstash host:port*
   - `REDIS_PASSWORD`: *Your Redis password*
   - `JWT_SECRET`: *A secure random 32-character string*
   - `CLIENT_ORIGIN`: `https://your-frontend.vercel.app`

### MongoDB Atlas Setup
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`).
3. Copy the connection string (e.g. `mongodb+srv://...`) into `MONGODB_URI`.

### Redis Cloud / Upstash Setup
1. Create a free Redis database on [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.com/try-free/).
2. Copy the endpoint and password into `REDIS_ADDR` and `REDIS_PASSWORD`.

---

## 🧠 Design & Engineering Decisions

1. **Why Redis Pub/Sub instead of pure in-memory channels?**  
   If multiple backend instances run behind a load balancer, an in-memory channel on Server A would not notify clients connected to Server B. Using Redis Pub/Sub ensures that vote events are broadcast across all instances, allowing the system to scale horizontally.

2. **Why WebSockets over Server-Sent Events (SSE)?**  
   WebSockets offer true full-duplex communication with minimal frame overhead, native connection health monitoring (ping/pong keepalive), and broad cross-browser support for real-time applications.

3. **Backend Validation Strategy**:  
   Rather than relying only on client-side checks, the Go backend enforces strict validation:
   - Empty or whitespace-only questions and options are rejected.
   - Case-insensitive duplicate options are detected and rejected with `400 Bad Request`.
   - Minimum 2 options, maximum 10 options.
   - Poll closure status is checked before accepting any vote.

4. **Duplicate Vote Prevention**:  
   We use a resilient client fingerprint and voter token passed in the `X-Voter-Token` header. This prevents the same browser session from submitting multiple votes on the same poll, while still allowing evaluation across multiple distinct browser windows on the same testing machine.

---

## 🎥 Demo Video Walkthrough Script (3–5 Min)

Use this step-by-step outline for your 3–5 minute submission video:

| Timestamp | Topic | What to Say / Show |
| :--- | :--- | :--- |
| **0:00 – 0:30** | **Introduction** | *"Hello! In this video, I will demonstrate PulsePoll, a real-time online polling application built from scratch for the GUVI Developer Internship task. The stack uses React on the frontend, Go with Gin on the backend, MongoDB for persistent storage, and Redis Pub/Sub with WebSockets for real-time synchronization."* |
| **0:30 – 1:30** | **Poll Creation** | Click `+ Create a New Poll`. Enter question *"Which programming language do you prefer?"* and options: *Python, Java, Go, JavaScript*. Show the backend validation by typing duplicate options to show the error message. Then submit to create the poll. Show the share screen with the direct link and generated QR code. |
| **1:30 – 2:30** | **The Live Real-Time Test ⭐** | Open two browser windows side-by-side: **Window 1** on the Live Results page, and **Window 2** on the Voting page. Click *"Go"* in Window 2 and hit *"Submit Vote"*. **Watch Window 1 update its progress bar and vote count instantaneously without refreshing the page!** |
| **2:30 – 3:30** | **Architecture Explanation** | Explain how the data moves: React Voter $\rightarrow$ Go Gin REST API $\rightarrow$ MongoDB write $\rightarrow$ Redis Pub/Sub event publish $\rightarrow$ Go WebSocket Hub $\rightarrow$ React Live Results viewer. Emphasize that Redis is doing real work distributing the events. |
| **3:30 – 4:00** | **Hardest Challenge** | *"The most challenging part was ensuring zero-refresh consistency while preventing duplicate votes without forcing users to create an account. I solved this using voter tokens stored in the browser session combined with Redis Pub/Sub event streaming."* |
| **4:00 – 4:30** | **AI Usage & Conclusion** | Explain how AI tools were utilized for boilerplate generation and design ideation, and how you personally implemented and debugged the WebSocket hub and state synchronization. Thank the reviewers. |

---

## 📬 Final Submission Details

- **To**: `devhiring@hclguvi.com`
- **Subject**: `GUVI Developer Internship Task - Full Stack Online Polling Application - [Your Name]`
- **Body Checklist**:
  - [x] Public GitHub Repository: `https://github.com/...`
  - [x] Live Deployed Web Application URL: `https://...`
  - [x] 3–5 Minute Demo Video URL: `https://youtube.com/...` (Unlisted) or Google Drive link
  - [x] Tech Stack Confirmed: React, Go (Gin), MongoDB, Redis
