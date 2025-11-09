import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService } from '../services/api';
import './Pages.css';

const MyProjects = () => {
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching projects...');
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      console.log('Token obtained, calling API...');
      const data = await apiService.getIdeas(token);
      
      console.log('Projects received:', data);
      setProjects(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects. Please check your connection and try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      await apiService.deleteIdea(token, id);
      setProjects(projects.filter(project => project._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#C9D8E6' }}>
          <div style={{ marginBottom: '1rem' }}>Loading projects...</div>
          <div style={{ fontSize: '0.9rem', color: '#8B9BAE' }}>
            If this takes too long, check that the backend server is running.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#ff6b6b',
          backgroundColor: '#2A1F1F',
          borderRadius: '8px',
          border: '1px solid #ff6b6b',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Error loading projects</h3>
          <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>{error}</p>
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#1A2332', 
            borderRadius: '8px',
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <strong>Common fixes:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Make sure the backend server is running</li>
              <li>Check that the API URL is correct in your .env file</li>
              <li>Verify your Auth0 token is valid</li>
              <li>Check the browser console for more details</li>
            </ul>
          </div>
          <button
            onClick={fetchProjects}
            className="primary-button"
            style={{ marginTop: '1.5rem' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p className="page-subtitle">Manage and collaborate on your mind mapping projects</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/projects/new')}>
          + Create New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-header">
              <h3>{project.title}</h3>
              <span className="status-badge active">Active</span>
            </div>

            <div className="project-description" style={{
              margin: '1rem 0',
              color: '#C9D8E6',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}>
              {project.description}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                margin: '1rem 0'
              }}>
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#2A3F5F',
                      color: '#4A90E2',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="project-meta">
              <span>🕒 Created {new Date(project.createdAt).toLocaleDateString()}</span>
              {project.isOwner && <span style={{ marginLeft: '1rem' }}>👤 Owner</span>}
              {!project.isOwner && <span style={{ marginLeft: '1rem' }}>👥 Collaborator</span>}
              {project.collaborators && project.collaborators.length > 0 && (
                <span style={{ marginLeft: '1rem' }}>
                  👥 {project.collaborators.length} {project.collaborators.length === 1 ? 'collaborator' : 'collaborators'}
                </span>
              )}
            </div>

            <div className="project-actions">
              <button
                className="primary-button"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                Open Project
              </button>
              {project.isOwner && (
                <button
                  className="secondary-button"
                  onClick={() => handleDeleteProject(project._id)}
                  style={{ color: '#ff6b6b' }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to start collaborating and generating mind maps</p>
          <button className="primary-button" onClick={() => navigate('/projects/new')}>
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProjects;