import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import VotingPage from './pages/VotingPage';
import LiveResultsPage from './pages/LiveResultsPage';
import ShareModal from './components/ShareModal';
import { api } from './services/api';

function AppContent() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState(() => window.location.hash || '#/');
  const [toastMessage, setToastMessage] = useState('');
  const [sharePoll, setSharePoll] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const navigateTo = (newHash) => {
    window.location.hash = newHash;
    setRoute(newHash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parsing
  const currentHash = route.replace(/^#\/?/, '');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF9FF',
        color: '#6B7280',
        fontSize: '15px',
        fontWeight: 600,
      }}>
        <div className="pulse-dot" style={{ marginRight: '10px' }} />
        <span>Loading PulsePoll...</span>
      </div>
    );
  }

  let content = null;

  // 1. Audience Poll Routes: #/poll/:id and #/poll/:id/results
  if (currentHash.startsWith('poll/')) {
    const parts = currentHash.split('/');
    const pollId = parts[1];
    const isResults = parts[2] === 'results';

    if (isResults) {
      content = (
        <LiveResultsPage
          pollId={pollId}
          onBack={() => navigateTo(user ? '#/dashboard' : '#/')}
          onGoToVote={(id) => navigateTo(`#/poll/${id}`)}
          onOpenShare={async (poll) => {
            if (poll) setSharePoll(poll);
            else {
              const p = await api.getPoll(pollId);
              setSharePoll(p);
            }
          }}
          showToast={showToast}
        />
      );
    } else {
      content = (
        <VotingPage
          pollId={pollId}
          onBack={() => navigateTo(user ? '#/dashboard' : '#/')}
          onGoToResults={(id) => navigateTo(`#/poll/${id}/results`)}
          onOpenShare={async (poll) => {
            if (poll) setSharePoll(poll);
            else {
              const p = await api.getPoll(pollId);
              setSharePoll(p);
            }
          }}
          showToast={showToast}
        />
      );
    }
  }
  // 2. Authentication Pages: #/login and #/signup
  else if (currentHash === 'login' || currentHash === 'signin') {
    content = (
      <AuthPage
        initialMode="login"
        onBackToHome={() => navigateTo('#/')}
        onSuccess={() => navigateTo('#/dashboard')}
        showToast={showToast}
      />
    );
  } else if (currentHash === 'signup' || currentHash === 'register') {
    content = (
      <AuthPage
        initialMode="signup"
        onBackToHome={() => navigateTo('#/')}
        onSuccess={() => navigateTo('#/dashboard')}
        showToast={showToast}
      />
    );
  }
  // 3. Dashboard Route: #/dashboard OR logged-in user at root #/ or #
  else if (currentHash === 'dashboard' || (user && (currentHash === '' || currentHash === '/'))) {
    content = (
      <DashboardPage
        onNavigateToVote={(pollId) => navigateTo(`#/poll/${pollId}`)}
        onNavigateToResults={(pollId) => navigateTo(`#/poll/${pollId}/results`)}
        onNavigateToLanding={() => navigateTo('#/landing')}
        showToast={showToast}
      />
    );
  }
  // 4. Landing Page: #/landing, #/, or visitor root
  else {
    content = (
      <LandingPage
        onGetStarted={() => navigateTo(user ? '#/dashboard' : '#/signup')}
        onSignIn={() => navigateTo(user ? '#/dashboard' : '#/login')}
        onExplore={() => navigateTo(user ? '#/dashboard' : '#/login')}
      />
    );
  }

  return (
    <div className="pulsepoll-app">
      {content}

      {/* Global Share Modal */}
      {sharePoll && (
        <ShareModal
          isOpen={Boolean(sharePoll)}
          onClose={() => setSharePoll(null)}
          poll={sharePoll}
          showToast={showToast}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
