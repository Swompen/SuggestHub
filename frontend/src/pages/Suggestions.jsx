import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faTrash, faWrench, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { suggestionsApi, votingApi } from '../services/api';
import Header from '../components/Header';

const Suggestions = () => {
  const { user, isAuthenticated, isAdmin, loading: authLoading, devMode } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('new');
  const [adminPanels, setAdminPanels] = useState({});
  const [adminErrors, setAdminErrors] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await suggestionsApi.getAll();
      setSuggestions(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId, voteValue) => {
    if (!isAuthenticated && !devMode) {
      alert('Please login to vote');
      return;
    }

    try {
      // In dev mode, use a mock user ID
      const userId = devMode ? 'dev_user_123' : undefined;
      await votingApi.vote(suggestionId, userId, voteValue);
      // Refresh suggestions to get updated vote counts
      await fetchSuggestions();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. You may have already voted.');
    }
  };

  const handleStatusChange = async (suggestionId, newStatus) => {
    try {
      await suggestionsApi.updateStatus(suggestionId, newStatus);
      await fetchSuggestions();
      setAdminErrors(prev => ({ ...prev, [suggestionId]: null }));
      setAdminPanels(prev => ({ ...prev, [suggestionId]: false }));
    } catch (error) {
      console.error('Error updating status:', error);
      setAdminErrors(prev => ({ ...prev, [suggestionId]: 'Failed to update status' }));
    }
  };

  const handleDelete = async (suggestionId) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) {
      return;
    }

    try {
      await suggestionsApi.delete(suggestionId);
      await fetchSuggestions();
      setAdminErrors(prev => ({ ...prev, [suggestionId]: null }));
      setAdminPanels(prev => ({ ...prev, [suggestionId]: false }));
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      setAdminErrors(prev => ({ ...prev, [suggestionId]: 'Failed to delete suggestion' }));
    }
  };

  const toggleAdminPanel = (suggestionId) => {
    setAdminPanels(prev => ({
      ...prev,
      [suggestionId]: !prev[suggestionId]
    }));
  };

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    switch (sort) {
      case 'votes':
        return b.votes - a.votes;
      case 'old':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'new':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-green-500';
      case 'Planned': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading suggestions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Suggestions</h1>
          <div className="flex items-center space-x-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="new">Newest First</option>
              <option value="old">Oldest First</option>
              <option value="votes">Most Votes</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Open Column */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">
              Open ({sortedSuggestions.filter(s => s.status === 'Open').length})
            </h2>
            <div className="space-y-4">
              {sortedSuggestions
                .filter(s => s.status === 'Open')
                .map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={handleVote}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onToggleAdmin={toggleAdminPanel}
                    showAdminPanel={adminPanels[suggestion.id]}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    user={user}
                    adminErrors={adminErrors}
                    devMode={devMode}
                  />
                ))}
            </div>
          </div>

          {/* Planned Column */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-gray-700 pb-2">
              Planned ({sortedSuggestions.filter(s => s.status === 'Planned').length})
            </h2>
            <div className="space-y-4">
              {sortedSuggestions
                .filter(s => s.status === 'Planned')
                .map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={handleVote}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onToggleAdmin={toggleAdminPanel}
                    showAdminPanel={adminPanels[suggestion.id]}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    user={user}
                    adminErrors={adminErrors}
                    devMode={devMode}
                  />
                ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-2">
              In Progress ({sortedSuggestions.filter(s => s.status === 'In Progress').length})
            </h2>
            <div className="space-y-4">
              {sortedSuggestions
                .filter(s => s.status === 'In Progress')
                .map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={handleVote}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onToggleAdmin={toggleAdminPanel}
                    showAdminPanel={adminPanels[suggestion.id]}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    user={user}
                    adminErrors={adminErrors}
                    devMode={devMode}
                  />
                ))}
            </div>
          </div>

          {/* Rejected Column */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-red-400 border-b border-gray-700 pb-2">
              Rejected ({sortedSuggestions.filter(s => s.status === 'Rejected').length})
            </h2>
            <div className="space-y-4">
              {sortedSuggestions
                .filter(s => s.status === 'Rejected')
                .map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onVote={handleVote}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onToggleAdmin={toggleAdminPanel}
                    showAdminPanel={adminPanels[suggestion.id]}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    user={user}
                    adminErrors={adminErrors}
                    devMode={devMode}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Suggestion Card Component
const SuggestionCard = ({
  suggestion,
  onVote,
  onStatusChange,
  onDelete,
  onToggleAdmin,
  showAdminPanel,
  isAuthenticated,
  isAdmin,
  user,
  adminErrors,
  devMode
}) => {
  const hasUserVoted = user && suggestion.voters?.some(voter => voter.userId === user.discordId);
  const userVote = user && suggestion.voters?.find(voter => voter.userId === user.discordId);
  const userVoteValue = userVote?.voteValue || 0;

  // Calculate upvote and downvote counts
  const upvoteCount = suggestion.voters?.filter(voter => voter.voteValue === 1).length || 0;
  const downvoteCount = suggestion.voters?.filter(voter => voter.voteValue === -1).length || 0;

  // Truncate description to limit card height
  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    // Find the last space before maxLength to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated).trim() + '...';
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 h-64 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <Link
          to={`/suggestion/${suggestion.id}`}
          className="text-lg font-medium hover:text-blue-400 transition-colors duration-200 flex-1"
        >
          {suggestion.title}
        </Link>
      </div>

      <div className="text-gray-300 text-sm mb-3 flex-1 overflow-hidden" style={{maxHeight: '120px'}}>
        <div className="overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical'}}>
          <ReactMarkdown components={{
            p: ({children}) => <p className="mb-2">{children}</p>,
            strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
            em: ({children}) => <em className="italic text-gray-200">{children}</em>,
            code: ({children}) => <code className="bg-gray-600 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
            a: ({href, children}) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            img: ({src, alt}) => <img src={src} alt={alt} className="max-w-full h-auto rounded-lg border border-gray-600 my-2" />,
            ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({children}) => <li>{children}</li>,
            h1: ({children}) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-base font-bold text-white mb-2">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm font-bold text-white mb-1">{children}</h3>
          }}>
            {truncateText(suggestion.description)}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={faUser} />
          <span>{suggestion.authorName}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={faCalendar} />
          <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onVote(suggestion.id, 1)}
            disabled={!isAuthenticated}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              userVoteValue === 1
                ? 'bg-green-600 text-white'
                : isAuthenticated
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-600 text-gray-500 cursor-not-allowed'
            } transition-colors duration-200`}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>{upvoteCount}</span>
          </button>
          <button
            onClick={() => onVote(suggestion.id, -1)}
            disabled={!isAuthenticated}
            className={`flex items-center space-x-1 px-3 py-1 rounded ${
              userVoteValue === -1
                ? 'bg-red-600 text-white'
                : isAuthenticated
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-600 text-gray-500 cursor-not-allowed'
            } transition-colors duration-200`}
          >
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>{downvoteCount}</span>
          </button>
        </div>

        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => onToggleAdmin(suggestion.id)}
              className="text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faWrench} />
            </button>
            {showAdminPanel && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={() => onToggleAdmin(suggestion.id)}></div>
                <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => onToggleAdmin(suggestion.id)}>
                  <div className="bg-gray-600 rounded-lg p-6 shadow-lg min-w-80 max-w-md" onClick={e => e.stopPropagation()}>
                    <h3 className="text-white text-lg font-semibold mb-4">Admin Controls</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-white text-sm mb-2 block">Change Status</label>
                        <select
                          value={suggestion.status}
                          onChange={(e) => onStatusChange(suggestion.id, e.target.value)}
                          className="bg-gray-700 text-white text-sm px-3 py-2 rounded w-full"
                        >
                          <option value="Open">Open</option>
                          <option value="Planned">Planned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <button
                        onClick={() => onDelete(suggestion.id)}
                        className="text-red-400 hover:text-red-300 text-sm flex items-center space-x-2 w-full justify-center py-2 px-4 border border-red-400 rounded hover:bg-red-400 hover:text-white transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Delete Suggestion</span>
                      </button>
                      {adminErrors[suggestion.id] && (
                        <div className="text-red-300 text-sm bg-red-900 bg-opacity-50 p-3 rounded">
                          {adminErrors[suggestion.id]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
