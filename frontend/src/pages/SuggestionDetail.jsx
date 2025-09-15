import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faArrowLeft, faVoteYea, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';

const SuggestionDetail = () => {
  const { id } = useParams();
  const [suggestion, setSuggestion] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Generate or retrieve user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    fetchSuggestion();
  }, [id]);

  const fetchSuggestion = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/suggestions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestion(data);
      } else {
        console.error('Failed to fetch suggestion');
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
    }
  };

  const vote = async (value) => {
    try {
      const response = await fetch(`http://localhost:3001/api/suggestions/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, vote: value }),
      });

      if (response.ok) {
        await fetchSuggestion();
      } else {
        console.error('Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getUserVote = () => {
    if (!suggestion || !suggestion.voters) return 0;
    const userVote = suggestion.voters.find(v => v.userId === userId);
    return userVote ? userVote.vote : 0;
  };

  if (!suggestion) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-slate-300">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-800 text-white p-4 shadow-lg border-b border-slate-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Suggestions</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Voting & Feedback System</h1>
          <div></div> {/* Spacer for flex justify-between */}
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-slate-600 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-4xl font-bold text-white leading-tight pr-4">{suggestion.title}</h1>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                  suggestion.status === 'open' ? 'bg-green-900 text-green-300 border border-green-700' :
                  suggestion.status === 'planned' ? 'bg-blue-900 text-blue-300 border border-blue-700' :
                  suggestion.status === 'in-progress' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                  'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {suggestion.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div className="text-slate-300 mb-8 text-lg leading-relaxed">
                <ReactMarkdown components={{
                  p: ({children}) => <p className="mb-4">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-slate-200">{children}</em>,
                  code: ({children}) => <code className="bg-slate-700 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                  a: ({href, children}) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                  img: ({src, alt}) => <img src={src} alt={alt} className="max-w-full h-auto rounded-lg border border-slate-600 my-4" />,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                  li: ({children}) => <li>{children}</li>,
                  h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-3">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-slate-500 pl-4 italic text-slate-400 mb-4">{children}</blockquote>
                }}>
                  {suggestion.description}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faVoteYea} className="text-blue-400 text-xl" />
                  <div>
                    <p className="text-slate-400 text-sm">Votes</p>
                    <p className="text-white font-bold text-2xl">{suggestion.votes || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faUser} className="text-purple-400 text-xl" />
                  <div>
                    <p className="text-slate-400 text-sm">Author</p>
                    <p className="text-white font-medium">{suggestion.authorName || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faCalendar} className="text-green-400 text-xl" />
                  <div>
                    <p className="text-slate-400 text-sm">Created</p>
                    <p className="text-white font-medium">{new Date(suggestion.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => vote(1)}
                  className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 ${
                    getUserVote() === 1 ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="text-xl" />
                  <span>Upvote</span>
                </button>
                <button
                  onClick={() => vote(-1)}
                  className={`flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 ${
                    getUserVote() === -1 ? 'ring-2 ring-red-400' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faThumbsDown} className="text-xl" />
                  <span>Downvote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuggestionDetail;
