const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const collaborationApi = {
  // Send invitation to collaborate on a project
  async sendInvitation(token, projectId, inviteeEmail, role = 'member', message = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, inviteeEmail, role, message })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send invitation: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Get pending invitations for current user
  async getInvitations(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch invitations: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw error;
    }
  },

  // Accept invitation
  async acceptInvitation(token, invitationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to accept invitation: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Reject invitation
  async rejectInvitation(token, invitationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/invitations/${invitationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to reject invitation: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      throw error;
    }
  },

  // Get collaborators for a project
  async getCollaborators(token, projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/projects/${projectId}/collaborators`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch collaborators: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  },

  // Remove collaborator from project
  async removeCollaborator(token, projectId, collaboratorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/projects/${projectId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to remove collaborator: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  },

  // Update collaborator role
  async updateCollaboratorRole(token, projectId, collaboratorId, role) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/collaboration/projects/${projectId}/collaborators/${collaboratorId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update role: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      throw error;
    }
  }
};

