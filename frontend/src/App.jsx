import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Suggestions from './pages/Suggestions';
import SuggestionDetail from './pages/SuggestionDetail';
import CreateSuggestion from './pages/CreateSuggestion';
import Login from './components/Login';

function AppContent() {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Check for Discord OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || window.location.pathname === '/auth/discord/callback') {
      // OAuth callback - refresh auth status
      checkAuthStatus();
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, [checkAuthStatus]);

  return (
    <Routes>
      <Route path="/" element={<Suggestions />} />
      <Route path="/suggestion/:id" element={<SuggestionDetail />} />
      <Route path="/create" element={<CreateSuggestion />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
