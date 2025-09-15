let dbInstance = null;

async function getDatabase() {
  if (!dbInstance) {
    console.log('Using simple file-based database');
    // Create a simple file-based database without lowdb for now
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');

    const dataDir = './data';
    const dbFile = path.join(dataDir, 'database.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    dbInstance = {
      async initialize() {
        console.log('Simple DB initialized');
        if (!fs.existsSync(dbFile)) {
          // Create initial database file
          const initialData = {
            suggestions: [],
            votes: [],
            users: []
          };
          fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
        }
      },

      async getAllSuggestions() {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const suggestions = data.suggestions.map(suggestion => {
          const suggestionVotes = data.votes.filter(v => v.suggestionId === suggestion.id);
          const voteCount = suggestionVotes.reduce((sum, vote) => sum + (vote.voteValue || 1), 0);
          return { ...suggestion, votes: voteCount, voters: suggestionVotes };
        });
        return suggestions;
      },

      async createSuggestion(suggestion) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const newSuggestion = {
          ...suggestion,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          votes: 0
        };
        data.suggestions.push(newSuggestion);
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
        return newSuggestion;
      },

      async getSuggestionById(id) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const suggestion = data.suggestions.find(s => s.id === id);
        if (suggestion) {
          const suggestionVotes = data.votes.filter(v => v.suggestionId === id);
          const voteCount = suggestionVotes.reduce((sum, vote) => sum + (vote.voteValue || 1), 0);
          return { ...suggestion, votes: voteCount, voters: suggestionVotes };
        }
        return null;
      },

      async updateSuggestion(id, updates) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const index = data.suggestions.findIndex(s => s.id === id);
        if (index !== -1) {
          data.suggestions[index] = { ...data.suggestions[index], ...updates, updatedAt: new Date().toISOString() };
          fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
          return data.suggestions[index];
        }
        return null;
      },

      async deleteSuggestion(id) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const index = data.suggestions.findIndex(s => s.id === id);
        if (index !== -1) {
          data.suggestions.splice(index, 1);
          fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
          return true;
        }
        return false;
      },

      async getVotesForSuggestion(suggestionId) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        return data.votes.filter(v => v.suggestionId === suggestionId);
      },

      async hasUserVoted(suggestionId, userId) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        return data.votes.some(v => v.suggestionId === suggestionId && v.userId === userId);
      },

      async addVote(suggestionId, userId, voteValue = 1) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        data.votes.push({
          id: uuidv4(),
          suggestionId,
          userId,
          voteValue,
          createdAt: new Date().toISOString()
        });
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
      },

      async removeVote(suggestionId, userId) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const index = data.votes.findIndex(v => v.suggestionId === suggestionId && v.userId === userId);
        if (index !== -1) {
          data.votes.splice(index, 1);
          fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
        }
      },

      async getUserByDiscordId(discordId) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        return data.users.find(u => u.discordId === discordId) || null;
      },

      async createUser(user) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        data.users.push(user);
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
        return user;
      },

      async updateUser(discordId, updates) {
        const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
        const index = data.users.findIndex(u => u.discordId === discordId);
        if (index !== -1) {
          data.users[index] = { ...data.users[index], ...updates };
          fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
          return data.users[index];
        }
        return null;
      },

      async close() {
        // Simple file-based DB doesn't need special closing
        console.log('Database connection closed');
      }
    };

    await dbInstance.initialize();
  }

  return dbInstance;
}

async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

module.exports = { getDatabase, closeDatabase };
