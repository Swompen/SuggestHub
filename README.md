# SuggestHub

A full-stack web application for community-driven suggestion and feedback management. Users can submit suggestions, vote on them, and administrators can manage suggestion statuses. Built with modern web technologies for a seamless user experience.

![Project Preview](https://i.ibb.co/PZKcQSTR/asdasddas.png)

## ✨ Features

### For Users
- **Submit Suggestions**: Create new suggestions with rich markdown formatting and image support
- **Vote System**: Upvote or downvote suggestions, change votes anytime
- **Browse & Filter**: View suggestions by status (Open, Planned, In Progress, Rejected)
- **Sort Options**: Sort by newest or most voted
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: See vote counts and status changes instantly

### For Administrators
- **Status Management**: Change suggestion statuses with a click
- **Admin Panel**: Access admin controls directly from suggestion cards
- **User Management**: View voter information and manage community feedback
- **Delete Suggestions**: Remove inappropriate or duplicate content

### Technical Features
- **User Authentication**: Secure Discord OAuth integration
- **Rich Text Support**: Full markdown rendering with syntax highlighting
- **Image Uploads**: Support for images in suggestions
- **Persistent Storage**: JSON-based database with file system storage
- **Session Management**: Secure user sessions with Express sessions
- **Modern UI**: Clean, dark-themed interface built with Tailwind CSS

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Markdown** - Markdown rendering
- **Font Awesome** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for APIs
- **CORS** - Cross-origin resource sharing
- **Express Session** - Session management
- **File System** - JSON-based data persistence

### Authentication
- **Discord OAuth2** - Social authentication
- **Passport.js** - Authentication middleware

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Discord Application** (for OAuth - see setup below)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voting-feedback-system.git
cd voting-feedback-system
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_super_secret_session_key_here

# Discord OAuth2 Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback


### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

### 4. Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "OAuth2" → "General"
4. Add redirect URI: `http://localhost:3001/auth/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file

## 🚀 Running the Application

### Development Mode

1. **Start the Backend** (in one terminal):
```bash
cd backend
npm run dev
```

2. **Start the Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

3. **Open your browser** and navigate to `http://localhost:5173`

### Production Mode

For production deployment, you can use the build commands:

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

## 📖 Usage

### For Regular Users

1. **Sign In**: Click "Login with Discord" to authenticate
2. **Browse Suggestions**: View all suggestions on the main page
3. **Vote**: Click thumbs up/down to vote on suggestions
4. **Create Suggestion**: Use the "Create Suggestion" page to submit new ideas
5. **Use Markdown**: Format your suggestions with markdown syntax
6. **Add Images**: Include images in your suggestions

### For Administrators

1. **Admin Access**: Admin users see a wrench icon on suggestion cards
2. **Change Status**: Click the wrench to open admin controls
3. **Update Status**: Change suggestion status (Open → Planned → In Progress → Rejected)
4. **Delete Suggestions**: Remove inappropriate content

## 🔌 API Documentation

### Authentication Endpoints

- `GET /api/auth/user` - Get current user info
- `GET /api/auth/logout` - Logout user
- `GET /auth/discord` - Initiate Discord OAuth
- `GET /auth/discord/callback` - OAuth callback

### Suggestions Endpoints

- `GET /api/suggestions` - Get all suggestions
- `GET /api/suggestions/:id` - Get single suggestion
- `POST /api/suggestions` - Create new suggestion
- `PATCH /api/suggestions/:id` - Update suggestion status
- `DELETE /api/suggestions/:id` - Delete suggestion

### Voting Endpoints

- `PUT /api/suggestions/:id/vote` - Vote on suggestion

### Request/Response Examples

**Create Suggestion:**
```json
POST /api/suggestions
{
  "title": "Add dark mode toggle",
  "description": "It would be great to have a **dark mode** toggle in the settings.\n\nThis would improve user experience during nighttime usage.",
  "authorName": "John Doe"
}
```

**Vote on Suggestion:**
```json
PUT /api/suggestions/123/vote
{
  "userId": "discord_user_123",
  "voteValue": 1
}
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start with nodemon
- `npm start` - Start production server

