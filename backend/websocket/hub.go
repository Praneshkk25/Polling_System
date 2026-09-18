package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"livepoll-backend/models"
)

type Hub struct {
	mu         sync.RWMutex
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *models.VoteEventMessage
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *models.VoteEventMessage, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, exists := h.rooms[client.pollID]; !exists {
				h.rooms[client.pollID] = make(map[*Client]bool)
			}
			h.rooms[client.pollID][client] = true
			h.mu.Unlock()
			log.Printf("[WebSocket] Client joined room for poll: %s (Total viewers: %d)", client.pollID, len(h.rooms[client.pollID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, exists := h.rooms[client.pollID]; exists {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.rooms, client.pollID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WebSocket] Client left room for poll: %s", client.pollID)

		case event := <-h.broadcast:
			h.mu.RLock()
			clients, exists := h.rooms[event.PollID]
			if exists {
				msgBytes, err := json.Marshal(event)
				if err == nil {
					for client := range clients {
						select {
						case client.send <- msgBytes:
						default:
							close(client.send)
							delete(clients, client)
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) BroadcastVoteEvent(pollID string, event *models.VoteEventMessage) {
	h.broadcast <- event
}
