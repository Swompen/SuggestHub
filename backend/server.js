// Main server file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const { getDatabase } = require('./database-factory');

const app = express();
const PORT = process.env.PORT || 3001;
const DEV_MODE = process.env.DEV_MODE === 'true';

// Role configuration
const VOTER_ROLES = process.env.VOTER_ROLES ? process.env.VOTER_ROLES.split(',').map(r => r.trim()) : [];
const ADMIN_ROLES = process.env.ADMIN_ROLES ? process.env.ADMIN_ROLES.split(',').map(r => r.trim()) : [];

console.log('DEV_MODE environment variable:', process.env.DEV_MODE);
console.log('DEV_MODE boolean value:', DEV_MODE);
console.log(`Server starting in ${DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log('Voter roles:', VOTER_ROLES);
console.log('Admin roles:', ADMIN_ROLES);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Role checking functions
function hasRole(user, requiredRoles) {
  if (!user || !user.roles) return false;
  if (DEV_MODE) return true; // In dev mode, allow everything
  return requiredRoles.some(role => user.roles.includes(role));
}

function canVote(user) {
  return hasRole(user, VOTER_ROLES) || hasRole(user, ADMIN_ROLES);
}

function isAdmin(user) {
  return hasRole(user, ADMIN_ROLES);
}

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Middleware to check voting permissions
function requireVotingPermission(req, res, next) {
  if (!canVote(req.session.user)) {
    return res.status(403).json({ error: 'Insufficient permissions to vote' });
  }
  next();
}

// Middleware to check admin permissions
function requireAdminPermission(req, res, next) {
  if (!isAdmin(req.session.user)) {
    return res.status(403).json({ error: 'Admin permissions required' });
  }
  next();
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/suggestions', async (req, res) => {
  try {
    const db = await getDatabase();
    const suggestions = await db.getAllSuggestions();
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

app.get('/api/suggestions/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const suggestion = await db.getSuggestionById(id);
    if (suggestion) {
      res.json(suggestion);
    } else {
      res.status(404).json({ error: 'Suggestion not found' });
    }
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({ error: 'Failed to fetch suggestion' });
  }
});

app.post('/api/suggestions', requireVotingPermission, async (req, res) => {
  try {
    const db = await getDatabase();
    const { title, description, authorId, authorName } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const suggestion = await db.createSuggestion({
      title,
      description,
      status: 'Open',
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous'
    });

    res.status(201).json(suggestion);
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to create suggestion' });
  }
});

app.patch('/api/suggestions/:id', requireAdminPermission, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const updates = req.body;

    const suggestion = await db.updateSuggestion(id, updates);
    if (suggestion) {
      res.json(suggestion);
    } else {
      res.status(404).json({ error: 'Suggestion not found' });
    }
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Failed to update suggestion' });
  }
});

app.put('/api/suggestions/:id/vote', requireVotingPermission, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { userId, voteValue } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hasVoted = await db.hasUserVoted(id, userId);
    if (hasVoted) {
      await db.removeVote(id, userId);
      res.json({ message: 'Vote removed' });
    } else {
      await db.addVote(id, userId, voteValue || 1);
      res.json({ message: 'Vote added' });
    }
  } catch (error) {
    console.error('Error voting on suggestion:', error);
    res.status(500).json({ error: 'Failed to vote on suggestion' });
  }
});

// Development mode authentication routes
if (DEV_MODE) {
  console.log('Development mode: Using mock authentication');

  // Mock user for development
  const mockUser = {
    id: 'dev_user_123',
    discordId: 'dev_user_123',
    username: 'DevUser',
    discriminator: '0001',
    avatar: null,
    email: 'dev@example.com',
    roles: ['111111111111111111', '222222222222222222', '123456789012345678'] // Mock role IDs for testing
  };

  app.get('/auth/discord', (req, res) => {
    // In dev mode, immediately "log in" the user by setting session
    req.session.user = mockUser;

    // Check if this is an API call (expects JSON response)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      // API call - return JSON response
      res.json({ success: true, message: 'Dev login successful', user: mockUser });
    } else {
      // Browser request - redirect to frontend
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    }
  });

  app.get('/auth/user', (req, res) => {
    if (req.session.user) {
      // Add permission flags to the user object
      const userWithPermissions = {
        ...req.session.user,
        canVote: canVote(req.session.user),
        isAdmin: isAdmin(req.session.user)
      };
      res.json(userWithPermissions);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
} else {
  // Production authentication routes would go here
  app.get('/auth/user', (req, res) => {
    res.status(401).json({ error: 'Authentication not implemented in production yet' });
  });
}

// Start server
async function startServer() {
  try {
    console.log('Initializing database...');
    const db = await getDatabase();
    console.log('Database initialized successfully');

    console.log('Starting server...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  const { closeDatabase } = require('./database-factory');
  if (closeDatabase) {
    await closeDatabase();
  }
  process.exit(0);
});
