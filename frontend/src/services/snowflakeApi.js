const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const snowflakeApi = {
  // Get analytics data from Snowflake
  async getAnalytics(token, queryType, filters = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/snowflake/analytics?queryType=${queryType}&filters=${encodeURIComponent(JSON.stringify(filters))}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Sync data to Snowflake
  async syncData(token, type, id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/snowflake/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to sync: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  },

  // Log analytics event
  async logEvent(token, eventType, projectId = null, recordingId = null, metadata = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/snowflake/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventType, projectId, recordingId, metadata })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to log event: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  }
};

