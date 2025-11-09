import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/userApi';
import './Pages.css';

const Settings = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    picture: user?.picture || '',
    bio: '',
    location: '',
    website: ''
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: true,
    allowInvites: true,
    showActivity: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectInvites: true,
    collaborationUpdates: true,
    aiInsights: true,
    weeklyDigest: false
  });

  useEffect(() => {
    // Load user settings from backend
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      const settings = await userApi.getSettings(token);
      
      if (settings.profile) {
        setProfileData({
          name: settings.profile.name || user?.name || '',
          email: settings.profile.email || user?.email || '',
          picture: settings.profile.picture || user?.picture || '',
          bio: settings.profile.bio || '',
          location: settings.profile.location || '',
          website: settings.profile.website || ''
        });
      }
      
      if (settings.privacy) {
        setPrivacySettings(settings.privacy);
      }
      
      if (settings.security) {
        setSecuritySettings(settings.security);
      }
      
      if (settings.notifications) {
        setNotificationSettings(settings.notifications);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Use Auth0 user data as fallback
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        picture: user?.picture || '',
        bio: '',
        location: '',
        website: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePrivacyChange = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting]
    });
  };

  const handleSecurityChange = (setting) => {
    setSecuritySettings({
      ...securitySettings,
      [setting]: !securitySettings[setting]
    });
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      await userApi.updateProfile(token, {
        name: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (settingsType) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }
      });
      
      if (settingsType === 'Privacy') {
        await userApi.updatePrivacy(token, privacySettings);
      } else if (settingsType === 'Security') {
        await userApi.updateSecurity(token, securitySettings);
      } else if (settingsType === 'Notification') {
        await userApi.updateNotifications(token, notificationSettings);
      }
      
      setSuccess(`${settingsType} settings saved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = () => {
    // Auth0 password reset
    window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/v2/change_password?client_id=${import.meta.env.VITE_AUTH0_CLIENT_ID}&email=${encodeURIComponent(user?.email || '')}&connection=Username-Password-Authentication`;
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      alert('Account deletion is not yet implemented. Please contact support.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'account', label: 'Account', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h2>Profile Settings</h2>
            <p className="section-description">Manage your personal information and profile details</p>
            
            <div className="form-group">
              <label>Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img 
                  src={profileData.picture || user?.picture || 'https://via.placeholder.com/80'} 
                  alt="Profile" 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
                <button type="button" className="secondary-button">
                  Change Picture
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <small style={{ color: '#8B9BAE' }}>Email cannot be changed here. Use Auth0 dashboard.</small>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={profileData.website}
                onChange={handleProfileChange}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="primary-button"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Privacy Settings</h2>
            <p className="section-description">Control who can see your information and activity</p>
            
            <div className="settings-group">
              <label className="settings-label">Profile Visibility</label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6',
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Show Email Address</label>
                <p className="settings-description">Allow others to see your email address</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacySettings.showEmail}
                  onChange={() => handlePrivacyChange('showEmail')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Allow Project Invites</label>
                <p className="settings-description">Let others invite you to projects</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacySettings.allowInvites}
                  onChange={() => handlePrivacyChange('allowInvites')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Show Activity Status</label>
                <p className="settings-description">Display when you're online or active</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacySettings.showActivity}
                  onChange={() => handlePrivacyChange('showActivity')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="primary-button"
                onClick={() => handleSaveSettings('Privacy')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h2>Security Settings</h2>
            <p className="section-description">Manage your account security and authentication</p>
            
            <div className="settings-item">
              <div>
                <label className="settings-label">Two-Factor Authentication</label>
                <p className="settings-description">Add an extra layer of security to your account</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={() => handleSecurityChange('twoFactorEnabled')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Login Alerts</label>
                <p className="settings-description">Get notified when someone logs into your account</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.loginAlerts}
                  onChange={() => handleSecurityChange('loginAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-group">
              <label className="settings-label">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3F5F',
                  borderRadius: '8px',
                  color: '#C9D8E6',
                  width: '100%',
                  maxWidth: '200px'
                }}
              />
            </div>

            <div className="settings-group" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #2A3F5F' }}>
              <label className="settings-label">Password</label>
              <p className="settings-description" style={{ marginBottom: '1rem' }}>
                Change your password to keep your account secure
              </p>
              <button 
                type="button" 
                className="secondary-button"
                onClick={handlePasswordReset}
              >
                Reset Password
              </button>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="primary-button"
                onClick={() => handleSaveSettings('Security')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h2>Notification Settings</h2>
            <p className="section-description">Choose what notifications you want to receive</p>
            
            <div className="settings-item">
              <div>
                <label className="settings-label">Email Notifications</label>
                <p className="settings-description">Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Project Invites</label>
                <p className="settings-description">Get notified when you're invited to a project</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.projectInvites}
                  onChange={() => handleNotificationChange('projectInvites')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Collaboration Updates</label>
                <p className="settings-description">Notifications about project collaboration changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.collaborationUpdates}
                  onChange={() => handleNotificationChange('collaborationUpdates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">AI Insights</label>
                <p className="settings-description">Get notified when AI generates new insights</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.aiInsights}
                  onChange={() => handleNotificationChange('aiInsights')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-item">
              <div>
                <label className="settings-label">Weekly Digest</label>
                <p className="settings-description">Receive a weekly summary of your activity</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyDigest}
                  onChange={() => handleNotificationChange('weeklyDigest')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="primary-button"
                onClick={() => handleSaveSettings('Notification')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="settings-section">
            <h2>Account Management</h2>
            <p className="section-description">Manage your account and data</p>
            
            <div className="settings-group" style={{ marginBottom: '2rem' }}>
              <label className="settings-label">Account Information</label>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#1A2332', 
                borderRadius: '8px',
                border: '1px solid #2A3F5F'
              }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {user?.email}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>User ID:</strong> {user?.sub}</p>
                <p><strong>Account Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="settings-group" style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #2A3F5F' }}>
              <label className="settings-label">Data Export</label>
              <p className="settings-description" style={{ marginBottom: '1rem' }}>
                Download a copy of all your data
              </p>
              <button 
                type="button" 
                className="secondary-button"
                onClick={() => alert('Data export feature coming soon!')}
              >
                Export My Data
              </button>
            </div>

            <div className="settings-group" style={{ marginBottom: '2rem' }}>
              <label className="settings-label" style={{ color: '#ff6b6b' }}>Danger Zone</label>
              <p className="settings-description" style={{ marginBottom: '1rem', color: '#8B9BAE' }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button 
                type="button" 
                className="danger-button"
                onClick={handleDeleteAccount}
                style={{
                  backgroundColor: '#2A1F1F',
                  border: '1px solid #ff6b6b',
                  color: '#ff6b6b'
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#C9D8E6' }}>
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Account Settings</h1>
          <p className="page-subtitle">Manage your account preferences and security</p>
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

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;

