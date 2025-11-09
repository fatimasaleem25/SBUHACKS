import React, { useState } from 'react';
import './Pages.css';

const MindMaps = () => {
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const mindMaps = [
    {
      id: 1,
      name: 'Q1 Marketing Strategy',
      project: 'Marketing Strategy Q1',
      nodes: 23,
      createdBy: 'AI Generated',
      createdAt: '2 hours ago',
      lastEdited: '1 hour ago',
      thumbnail: '🎯'
    },
    {
      id: 2,
      name: 'Social Media Campaign Ideas',
      project: 'Marketing Strategy Q1',
      nodes: 15,
      createdBy: 'John Doe',
      createdAt: '1 day ago',
      lastEdited: '12 hours ago',
      thumbnail: '📱'
    },
    {
      id: 3,
      name: 'Product Features Brainstorm',
      project: 'Product Roadmap 2024',
      nodes: 31,
      createdBy: 'AI Generated',
      createdAt: '2 days ago',
      lastEdited: '1 day ago',
      thumbnail: '💡'
    },
    {
      id: 4,
      name: 'Team Structure Proposal',
      project: 'Team Brainstorming',
      nodes: 12,
      createdBy: 'Jane Smith',
      createdAt: '3 days ago',
      lastEdited: '2 days ago',
      thumbnail: '👥'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Mind Maps</h1>
          <p className="page-subtitle">Visualize ideas and conversations</p>
        </div>
        <button className="primary-button">+ Create Mind Map</button>
      </div>

      <div className="mindmaps-controls">
        <div className="search-bar">
          <input type="search" placeholder="Search mind maps..." />
        </div>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞ Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰ List
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'mindmaps-grid' : 'mindmaps-list'}>
        {mindMaps.map(map => (
          <div key={map.id} className={`mindmap-item ${viewMode}`}>
            <div className="mindmap-thumbnail">
              <span className="thumbnail-icon">{map.thumbnail}</span>
              <div className="mindmap-overlay">
                <button className="overlay-button">Open</button>
                <button className="overlay-button">Edit</button>
              </div>
            </div>
            <div className="mindmap-info">
              <h3>{map.name}</h3>
              <div className="mindmap-meta">
                <span className="project-tag">{map.project}</span>
                <span>{map.nodes} nodes</span>
              </div>
              <div className="mindmap-details">
                <span>👤 {map.createdBy}</span>
                <span>•</span>
                <span>Created {map.createdAt}</span>
              </div>
              <div className="mindmap-actions">
                <button className="primary-button">Open</button>
                <button className="secondary-button">Share</button>
                <button className="text-button">⋮</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ai-generation-prompt">
        <div className="prompt-card">
          <h3>🤖 Generate Mind Map with AI</h3>
          <p>Let Gemini AI create a mind map from your conversation transcripts</p>
          <button className="primary-button">Generate from Latest Conversation</button>
        </div>
      </div>
    </div>
  );
};

export default MindMaps;