import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { collaborationApi } from '../services/collaborationApi';
import { apiService } from '../services/api';
import './Pages.css';

const Collaborators = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('member');
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchCollaborators(selectedProject);
    }
  }, [selectedProject]);

  const getToken = async () => {
    return await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }
    });
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await apiService.getIdeas(token);
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async (projectId) => {
    try {
      const token = await getToken();
      const data = await collaborationApi.getCollaborators(token, projectId);
      setCollaborators(data.collaborators || []);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      setError(err.message);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = await getToken();
      const data = await collaborationApi.getInvitations(token);
      setInvitations(data);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      // Don't set error for invitations, just log it
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!selectedProject || !emailInput.includes('@')) {
      setError('Please select a project and enter a valid email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = await getToken();
      await collaborationApi.sendInvitation(
        token,
        selectedProject,
        emailInput,
        roleInput,
        messageInput
      );
      setSuccess(`Invitation sent to ${emailInput}`);
      setEmailInput('');
      setMessageInput('');
      setRoleInput('member');
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const token = await getToken();
      await collaborationApi.acceptInvitation(token, invitationId);
      setSuccess('Invitation accepted! You now have access to this project.');
      fetchInvitations();
      fetchProjects(); // Refresh projects to show the new one
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const token = await getToken();
      await collaborationApi.rejectInvitation(token, invitationId);
      setSuccess('Invitation rejected');
      fetchInvitations();
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      await collaborationApi.removeCollaborator(token, selectedProject, collaboratorId);
      setSuccess('Collaborator removed successfully');
      fetchCollaborators(selectedProject);
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId, newRole) => {
    try {
      setLoading(true);
      const token = await getToken();
      await collaborationApi.updateCollaboratorRole(token, selectedProject, collaboratorId, newRole);
      setSuccess('Role updated successfully');
      fetchCollaborators(selectedProject);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProjectData = projects.find(p => p._id === selectedProject);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Manage Collaborators</h1>
          <p className="page-subtitle">Invite team members to collaborate on projects</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#2A1F1F',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          color: '#ff6b6b'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#1F2A1F',
          border: '1px solid #51cf66',
          borderRadius: '8px',
          color: '#51cf66'
        }}>
          {success}
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#1A2332',
          borderRadius: '8px',
          border: '1px solid #2A3F5F'
        }}>
          <h3>Pending Invitations ({invitations.length})</h3>
          {invitations.map(invitation => (
            <div key={invitation._id} style={{
              padding: '1rem',
              margin: '1rem 0',
              backgroundColor: '#0A1126',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4>{invitation.projectId?.title || 'Project'}</h4>
                <p>Invited by: {invitation.inviterEmail}</p>
                <p>Role: {invitation.role}</p>
                {invitation.message && <p>{invitation.message}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="primary-button"
                  onClick={() => handleAcceptInvitation(invitation._id)}
                  disabled={loading}
                >
                  Accept
                </button>
                <button
                  className="secondary-button"
                  onClick={() => handleRejectInvitation(invitation._id)}
                  disabled={loading}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
          Select Project:
        </label>
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={{
            padding: '0.75rem',
            backgroundColor: '#1A2332',
            border: '1px solid #2A3F5F',
            borderRadius: '8px',
            color: '#C9D8E6',
            width: '100%',
            maxWidth: '500px'
          }}
        >
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.title} {project.isOwner ? '(Owner)' : '(Collaborator)'}
            </option>
          ))}
        </select>
      </div>

      {/* Invite Section */}
      {selectedProjectData && selectedProjectData.isOwner && (
        <div className="invite-section">
          <h3>Invite New Collaborator</h3>
          <form className="invite-form" onSubmit={handleInvite}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
                Email:
              </label>
              <input
                type="email"
                placeholder="colleague@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
                Role:
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6'
                }}
              >
                <option value="viewer">Viewer (Read-only)</option>
                <option value="member">Member (Can edit)</option>
                <option value="admin">Admin (Can manage)</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#C9D8E6' }}>
                Message (optional):
              </label>
              <textarea
                placeholder="Add a personal message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6',
                  minHeight: '100px'
                }}
              />
            </div>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      )}

      {/* Collaborators List */}
      {selectedProject && (
        <div className="collaborators-section">
          <h3>Current Collaborators</h3>
          <div className="collaborators-table">
            {/* Owner */}
            {selectedProjectData && (
              <div className="collaborator-row">
                <div className="collaborator-main">
                  <div className="avatar-large">
                    {selectedProjectData.ownerEmail?.charAt(0).toUpperCase() || 'O'}
                  </div>
                  <div className="collaborator-details">
                    <h4>Owner</h4>
                    <p>{selectedProjectData.ownerEmail}</p>
                  </div>
                </div>
                <div className="collaborator-actions">
                  <span className="role-badge admin">Owner</span>
                </div>
              </div>
            )}

            {/* Collaborators */}
            {collaborators.map(collaborator => (
              <div key={collaborator.userId} className="collaborator-row">
                <div className="collaborator-main">
                  <div className="avatar-large">
                    {collaborator.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="collaborator-details">
                    <h4>{collaborator.email}</h4>
                    <p>Joined {new Date(collaborator.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="collaborator-actions">
                  <span className={`role-badge ${collaborator.role}`}>
                    {collaborator.role}
                  </span>
                  {selectedProjectData?.isOwner && (
                    <>
                      <select
                        value={collaborator.role}
                        onChange={(e) => handleUpdateRole(collaborator.userId, e.target.value)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#1A2332',
                          border: '1px solid #2A3F5F',
                          borderRadius: '4px',
                          color: '#C9D8E6'
                        }}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="danger-button"
                        onClick={() => handleRemoveCollaborator(collaborator.userId)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Info */}
      <div className="permissions-info">
        <h3>Role Permissions</h3>
        <div className="permissions-grid">
          <div className="permission-card">
            <h4>Admin</h4>
            <ul>
              <li>✓ Manage collaborators</li>
              <li>✓ Edit project details</li>
              <li>✓ Access all features</li>
              <li>✓ View all transcripts and mind maps</li>
            </ul>
          </div>
          <div className="permission-card">
            <h4>Member</h4>
            <ul>
              <li>✓ Join assigned projects</li>
              <li>✓ Create mind maps</li>
              <li>✓ View project transcripts</li>
              <li>✗ Cannot manage collaborators</li>
            </ul>
          </div>
          <div className="permission-card">
            <h4>Viewer</h4>
            <ul>
              <li>✓ View project content</li>
              <li>✓ Read transcripts</li>
              <li>✗ Cannot edit</li>
              <li>✗ Cannot manage collaborators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collaborators;
