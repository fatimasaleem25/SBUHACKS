import React, { useState } from 'react';

export default function IdeaForm({ onSubmit, initialData = null, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    tags: initialData?.tags?.join(', ') || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const ideaData = {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    
    onSubmit(ideaData);
    
    // Reset form if not editing
    if (!initialData) {
      setFormData({ title: '', description: '', tags: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#162033',
      borderRadius: '8px',
      border: '1px solid #2A3F5F'
    }}>
      <div>
        <label htmlFor="title" style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#C9D8E6',
          fontWeight: '500'
        }}>
          Project Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0A1126',
            border: '1px solid #2A3F5F',
            borderRadius: '4px',
            color: '#C9D8E6',
            fontSize: '1rem'
          }}
          placeholder="Enter project title"
        />
      </div>

      <div>
        <label htmlFor="description" style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#C9D8E6',
          fontWeight: '500'
        }}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0A1126',
            border: '1px solid #2A3F5F',
            borderRadius: '4px',
            color: '#C9D8E6',
            fontSize: '1rem',
            resize: 'vertical'
          }}
          placeholder="Describe your project"
        />
      </div>

      <div>
        <label htmlFor="tags" style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#C9D8E6',
          fontWeight: '500'
        }}>
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0A1126',
            border: '1px solid #2A3F5F',
            borderRadius: '4px',
            color: '#C9D8E6',
            fontSize: '1rem'
          }}
          placeholder="tech, innovation, research"
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '0.75rem',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {initialData ? 'Update Project' : 'Create Project'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2A3F5F',
              color: '#C9D8E6',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}