const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const recordingApi = {
  // Save a recording to a project
  async saveRecording(token, recordingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recordings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recordingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save recording: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error saving recording:', error);
      throw error;
    }
  },

  // Get recordings for a project
  async getProjectRecordings(token, projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recordings: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching recordings:', error);
      throw error;
    }
  },

  // Get a specific recording
  async getRecording(token, recordingId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recordings/${recordingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recording: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching recording:', error);
      throw error;
    }
  },

  // Delete a recording
  async deleteRecording(token, recordingId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete recording: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  }
};

