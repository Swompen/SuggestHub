# SuggestHub Backend

A Node.js backend for a Discord-integrated voting and feedback system using JSON file-based database storage.

## Features

- **Discord OAuth2 Authentication** - Users authenticate via Discord
- **Role-based Access Control** - Different permissions based on Discord roles
- **JSON File Database** - Simple, file-based data persistence
- **RESTful API** - Clean API endpoints for suggestions and voting
- **Session Management** - Secure user sessions with express-session

## API Endpoints

### Authentication
- `GET /auth/discord` - Initiate Discord OAuth2 login
- `GET /auth/discord/callback` - OAuth2 callback
- `GET /auth/logout` - Logout user
- `GET /auth/user` - Get current user info

### Suggestions
- `GET /api/suggestions` - Get all suggestions with vote counts
- `GET /api/suggestions/:id` - Get single suggestion details
- `POST /api/suggestions` - Create new suggestion
- `PATCH /api/suggestions/:id` - Update suggestion status (admin only)
- `DELETE /api/suggestions/:id` - Delete suggestion (admin only)

### Voting
- `PUT /api/suggestions/:id/vote` - Vote on suggestion (add or remove vote)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_super_secret_session_key_here

# Discord OAuth2 Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback
```

## Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "OAuth2" → "General"
4. Add redirect URI: `http://localhost:3001/auth/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3001).

## Database

The backend uses a simple JSON file-based database stored in the `data/` directory:

- `data/database.json` - Contains suggestions, votes, and user data
- Data persists between server restarts
- No external database required

## Project Structure

```
backend/
├── data/
│   └── database.json          # JSON database file
├── node_modules/
├── .env                       # Environment variables
├── .env.example               # Environment template
├── database-factory.js        # Database abstraction layer
├── package.json
├── README.md
└── server.js                  # Express server
```

## API Usage Examples

### Create a Suggestion
```bash
curl -X POST http://localhost:3001/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add dark mode",
    "description": "Please add a dark mode toggle",
    "authorName": "John Doe"
  }'
```

### Vote on a Suggestion
```bash
curl -X PUT http://localhost:3001/api/suggestions/123/vote \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "discord_user_123",
    "voteValue": 1
  }'
```

### Get All Suggestions
```bash
curl http://localhost:3001/api/suggestions
```

## Development

### Available Scripts
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run tests (if implemented)

### Adding Admin Users

To grant admin privileges to a Discord user:

1. Get the user's Discord ID
2. The system automatically checks for admin roles configured in your Discord server
3. Admin users will see additional controls on suggestion cards

## Security Notes

- Session secrets should be strong and unique in production
- CORS is configured to only allow requests from the specified frontend URL
- User authentication is required for voting and creating suggestions
- Admin operations require appropriate Discord role permissions

## License

MIT License - see LICENSE file for details.
