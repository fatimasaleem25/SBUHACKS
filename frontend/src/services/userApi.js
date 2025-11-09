const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const userApi = {
  // Get user settings
  async getSettings(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch settings: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update profile
  async updateProfile(token, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update profile: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update privacy settings
  async updatePrivacy(token, privacySettings) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/privacy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(privacySettings)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update privacy settings: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  },

  // Update security settings
  async updateSecurity(token, securitySettings) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/security`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securitySettings)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update security settings: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },

  // Update notification settings
  async updateNotifications(token, notificationSettings) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update notification settings: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }
};

