import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <header className="dashboard-header">
        <h1>🧠 MindMesh</h1>
        <div className="user-section">
          <span>{user.name}</span>
          <button className="logout-button" onClick={logout}>Log Out</button>
        </div>
      </header>

      <div className="dashboard-main">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-title">Projects</h3>
              <button 
                className={`nav-item ${isActive('/projects') && !location.pathname.includes('/new') ? 'active' : ''}`}
                onClick={() => navigate('/projects')}
              >
                📁 My Projects
              </button>
              <button 
                className={`nav-item ${isActive('/projects/new') ? 'active' : ''}`}
                onClick={() => navigate('/projects/new')}
              >
                ➕ Create New Project
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-title">Collaboration</h3>
              <button 
                className={`nav-item ${isActive('/collaborators') ? 'active' : ''}`}
                onClick={() => navigate('/collaborators')}
              >
                👥 Collaborators
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-title">AI Features</h3>
              <button 
                className={`nav-item ${isActive('/ai-insights') ? 'active' : ''}`}
                onClick={() => navigate('/ai-insights')}
              >
                🤖 AI Insights
              </button>
              <button 
                className={`nav-item ${isActive('/mind-maps') ? 'active' : ''}`}
                onClick={() => navigate('/mind-maps')}
              >
                🗺️ Mind Maps
              </button>
              <button 
                className={`nav-item ${isActive('/transcripts') ? 'active' : ''}`}
                onClick={() => navigate('/transcripts')}
              >
                📝 Transcripts
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-title">Account</h3>
              <button 
                className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => navigate('/settings')}
              >
                ⚙️ Settings
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;