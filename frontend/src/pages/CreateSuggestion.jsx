import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CreateSuggestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, canVote } = useAuth();

  const insertAtCursor = (before, after = '') => {
    const textarea = document.getElementById('description');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = description.substring(start, end);
    const newText = description.substring(0, start) + before + selectedText + after + description.substring(end);
    setDescription(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertBold = () => insertAtCursor('**', '**');
  const insertItalic = () => insertAtCursor('*', '*');
  const insertCode = () => insertAtCursor('`', '`');
  const insertLink = () => insertAtCursor('[', '](url)');
  const insertImage = () => insertAtCursor('![', '](image-url)');
  const insertList = () => insertAtCursor('- ', '');
  const insertHeader = () => insertAtCursor('## ', '');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !canVote())) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, canVote, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          authorId: user?.discordId || 'anonymous',
          authorName: user?.username || 'Anonymous'
        }),
      });

      if (response.ok) {
        const suggestion = await response.json();
        navigate(`/suggestion/${suggestion.id}`);
      } else {
        console.error('Failed to create suggestion');
      }
    } catch (error) {
      console.error('Error creating suggestion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="bg-slate-800 text-white p-4 shadow-lg border-b border-slate-700">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Voting & Feedback System</h1>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl shadow-2xl p-8 border border-slate-600">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">Create New Suggestion</h2>
          <form onSubmit={submit}>
            <div className="mb-6">
              <label className="block text-slate-300 font-semibold mb-2">Title</label>
              <input
                type="text"
                placeholder="Enter suggestion title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-slate-300 font-semibold mb-2">Description</label>
              <p className="text-slate-400 text-sm mb-2">Supports Markdown formatting (e.g., **bold**, *italic*, [link](url), ![image](url), line breaks)</p>

              {/* Markdown Toolbar */}
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-800 rounded-lg border border-slate-600">
                <button
                  type="button"
                  onClick={insertBold}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={insertItalic}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={insertCode}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors font-mono"
                  title="Code"
                >
                  `code`
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="Link"
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="Image"
                >
                  🖼️ Image
                </button>
                <button
                  type="button"
                  onClick={insertList}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={insertHeader}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded border border-slate-500 transition-colors"
                  title="Header"
                >
                  H2
                </button>
              </div>

              <textarea
                id="description"
                placeholder="Describe your suggestion in detail"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Submit Suggestion
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateSuggestion;
