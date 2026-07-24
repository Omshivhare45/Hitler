import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AddTargetModal = ({ isOpen, onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [interval, setIntervalVal] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/targets', { name, url, interval: Number(interval) });
      onAdded();
      onClose();
      setName('');
      setUrl('');
      setIntervalVal(8);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>Add Target</h2>
          <p>Configure a new endpoint to monitor and keep awake.</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">App Name</label>
            <input
              type="text"
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main API Server"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="url">Endpoint URL</label>
            <input
              type="url"
              id="url"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/health"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="interval">Ping Interval (minutes)</label>
            <input
              type="number"
              id="interval"
              className="input"
              value={interval}
              onChange={(e) => setIntervalVal(e.target.value)}
              min="1"
              max="60"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTargetModal;
