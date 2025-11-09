import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService } from '../services/api';
import './Pages.css';

const CreateProject = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    tags: '',
    collaborators: []
  });
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value
    });
  };

  const addCollaborator = () => {
    if (emailInput && emailInput.includes('@')) {
      setProjectData({
        ...projectData,
        collaborators: [...projectData.collaborators, emailInput]
      });
      setEmailInput('');
    }
  };

  const removeCollaborator = (email) => {
    setProjectData({
      ...projectData,
      collaborators: projectData.collaborators.filter(c => c !== email)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Creating project...');
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      // Prepare data for API
      const apiData = {
        title: projectData.title.trim(),
        description: projectData.description.trim(),
        tags: projectData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      console.log('Sending project data:', apiData);
      const result = await apiService.createIdea(token, apiData);
      console.log('Project created:', result);
      
      // Navigate back to projects page
      navigate('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err.message || 'Failed to create project. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Create New Project</h1>
          <p className="page-subtitle">Set up a new collaborative workspace</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#2A1F1F',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          color: '#ff6b6b'
        }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#ff6b6b' }}>⚠️ Error</h4>
          <p style={{ marginBottom: '0.5rem' }}>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#8B9BAE', marginTop: '0.5rem' }}>
            Please check that all required fields are filled and try again.
          </p>
        </div>
      )}

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Project Details</h3>

          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Marketing Strategy Q1"
              value={projectData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="What's this project about? What are the goals?"
              rows="4"
              value={projectData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              placeholder="e.g., marketing, strategy, Q1, 2024"
              value={projectData.tags}
              onChange={handleInputChange}
            />
            <small style={{ color: '#8B9BAE', fontSize: '0.85rem' }}>
              Add tags to help organize and find your project later
            </small>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Collaborators (Optional)</h3>
          <p className="form-help-text">
            Add team members who will participate in conversations and create mind maps
          </p>
  
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-button">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCollaborator())}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={addCollaborator}
              >
                + Add
              </button>
            </div>
          </div>
        
          {projectData.collaborators.length > 0 && (
            <div className="collaborators-list">
              <h4>Added Collaborators</h4>
              {projectData.collaborators.map((email, index) => (
                <div key={index} className="collaborator-tag">
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(email)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
          
        <div className="form-section">
          <h3>AI Features</h3>
          <div className="feature-options">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Enable AI conversation analysis</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Auto-generate mind maps from discussions</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Create transcripts of all conversations</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Generate action items and next steps</span>
            </label>
          </div>
        </div>
                
        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/projects')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>  
        </div>
      </form>
    </div>
  );    
};
            
export default CreateProject;