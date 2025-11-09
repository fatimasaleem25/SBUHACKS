# 🧠 MindMesh

AI-powered collaborative mind mapping platform with real-time transcription, meeting notes, and intelligent insights.

## ✨ Features

- **🎤 Voice Recording & Transcription** - Record meetings and conversations with live transcription
- **🤖 AI-Powered Insights** - Generate meeting notes, insights, mind maps, and brainstorming visualizations using Gemini AI or GPT-4
- **👥 Collaboration** - Invite team members to collaborate on projects with role-based permissions
- **🗺️ Mind Maps** - Generate and visualize mind maps from conversations
- **📝 Meeting Notes** - Automatically generate structured meeting notes
- **🧠 Brainstorming** - Create flowcharts and visualizations for idea generation
- **🔊 Audio Narration** - Convert transcripts to speech using ElevenLabs
- **⚙️ User Settings** - Manage profile, privacy, security, and notification settings

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Atlas or local)
- Auth0 account
- API Keys:
  - Google Gemini API key
  - OpenAI API key (optional, for GPT-4)
  - ElevenLabs API key (optional, for text-to-speech)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fatimasaleem25/SBUHACKS.git
   cd SBUHACKS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=4001
   MONGO_URI=your_mongodb_connection_string
   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_AUDIENCE=your_auth0_audience
   GEMINI_API_KEY=your_gemini_api_key
   OPENAI_API_KEY=your_openai_api_key (optional)
   ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional)
   EMAIL_SERVICE=sendgrid (optional)
   SENDGRID_API_KEY=your_sendgrid_api_key (optional)
   EMAIL_FROM=noreply@yourdomain.com (optional)
   FRONTEND_URL=http://localhost:5173
   ```
   
   Start backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:4001
   VITE_AUTH0_DOMAIN=your_auth0_domain
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_AUTH0_AUDIENCE=your_auth0_audience
   ```
   
   Start frontend:
   ```bash
   npm run dev
   ```

## 📖 Documentation

- [Backend Setup](backend/QUICK_START.md)
- [Email Setup](backend/EMAIL_SETUP.md)
- [OpenAI Setup](backend/OPENAI_SETUP.md)
- [Snowflake Setup](backend/SNOWFLAKE_SETUP.md)
- [Auth0 Setup](frontend/AUTH0_SETUP.md)
- [GitHub Setup](GITHUB_SETUP.md)

## 🏗️ Project Structure

```
mindmesh/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── services/          # AI and external API services
│   │   └── utils/             # Helper functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service functions
│   │   └── main.jsx           # App entry point
│   └── package.json
└── README.md
```

## 🔧 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Auth0 (JWT authentication)
- Google Gemini AI
- OpenAI GPT-4 (optional)
- ElevenLabs (text-to-speech)
- Snowflake (analytics, optional)
- Nodemailer (email notifications)

### Frontend
- React
- React Router
- Auth0 React SDK
- Vite
- Mermaid.js (for diagrams)

## 🎯 API Endpoints

### Projects
- `GET /api/ideas` - Get all projects
- `POST /api/ideas` - Create new project

### Collaboration
- `POST /api/collaboration/invite` - Send invitation
- `GET /api/collaboration/invitations` - Get invitations
- `POST /api/collaboration/invitations/:id/accept` - Accept invitation
- `POST /api/collaboration/invitations/:id/reject` - Reject invitation

### AI Features
- `POST /api/gemini/analyze-conversation` - Analyze conversation
- `POST /api/gemini/meeting-notes` - Generate meeting notes
- `POST /api/gemini/mermaid-mindmap` - Generate mind map
- `POST /api/gemini/brainstorm` - Generate brainstorming visualization
- `POST /api/gemini/transcribe-audio` - Transcribe audio

### Recordings
- `POST /api/recordings` - Save recording
- `GET /api/projects/:id/recordings` - Get project recordings
- `GET /api/recordings/:id` - Get recording details
- `DELETE /api/recordings/:id` - Delete recording

### User Settings
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/privacy` - Update privacy settings
- `PUT /api/user/security` - Update security settings
- `PUT /api/user/notifications` - Update notification settings

## 🔐 Environment Variables

See [Backend Setup](backend/QUICK_START.md) and [Frontend Setup](frontend/AUTH0_SETUP.md) for detailed environment variable configuration.

## 📝 License

MIT

## 👤 Author

Fatima Saleem

## 🙏 Acknowledgments

- Google Gemini AI
- OpenAI
- ElevenLabs
- Auth0
- MongoDB Atlas
