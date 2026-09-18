// PulsePoll WebSocket Client for Zero-Refresh Live Updates

export function connectPollWebSocket(pollId, onVoteEvent, onStatusChange) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WS_HOST || 'localhost:8080';
  const url = `${wsProtocol}//${host}/api/polls/${pollId}/live`;

  let ws = null;
  let isClosed = false;
  let reconnectTimeout = null;

  function connect() {
    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        if (onStatusChange) onStatusChange('connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'VOTE_UPDATE' && onVoteEvent) {
            onVoteEvent(data);
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        if (onStatusChange) onStatusChange('error');
      };

      ws.onclose = () => {
        if (onStatusChange) onStatusChange('disconnected');
        if (!isClosed) {
          // Reconnect with 2.5s backoff
          reconnectTimeout = setTimeout(connect, 2500);
        }
      };
    } catch (e) {
      console.error('[WebSocket] Init failed:', e);
      if (!isClosed) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) ws.close();
  };
}
