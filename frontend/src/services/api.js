
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiService = {
  // Get all ideas
  async getIdeas(token) {
    try {
      console.log('Fetching projects from:', `${API_BASE_URL}/api/ideas`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/ideas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Failed to fetch ideas: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Projects fetched:', data.length);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check if the backend server is running.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please ensure the backend is running on ' + API_BASE_URL);
      }
      
      throw error;
    }
  },

  // Create a new idea
  async createIdea(token, ideaData) {
    try {
      console.log('Creating project at:', `${API_BASE_URL}/api/ideas`);
      const response = await fetch(`${API_BASE_URL}/api/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ideaData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        // Build a more detailed error message
        let errorMessage = errorData.error || `Failed to create project: ${response.status} ${response.statusText}`;
        if (errorData.details) {
          errorMessage += ` - ${errorData.details}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Project created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
    
  // Update an idea
  async updateIdea(token, id, ideaData) {
    const response = await fetch(`${API_BASE_URL}/api/ideas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ideaData)
    });
    if (!response.ok) throw new Error('Failed to update idea');
    return response.json();
  },
    
  // Delete an idea
  async deleteIdea(token, id) {
    const response = await fetch(`${API_BASE_URL}/api/ideas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete idea');
    return response.json();
  }
};
