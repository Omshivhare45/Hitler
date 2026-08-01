import React from 'react';
import { Trash2, ExternalLink, Pause, Play } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const TargetCard = ({ target, onDelete }) => {
  const isAwake = target.status === 'Awake';
  const isDown = target.status === 'Down' || target.status === 'Failed';
  
  let statusClass = 'status-unknown';
  if (isAwake) statusClass = 'status-awake';
  if (isDown) statusClass = 'status-down';

  const { getToken } = useAuth();

  const handleDelete = async () => {
    if (confirm(`Remove ${target.name} from tracking?`)) {
      try {
        const token = await getToken();
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/targets/${target._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onDelete();
      } catch (err) {
        console.error('Failed to delete target', err);
      }
    }
  };

  const handleToggle = async () => {
    try {
      const token = await getToken();
      await axios.put(`${import.meta.env.VITE_API_URL}/api/targets/${target._id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDelete(); // refreshes list
    } catch (err) {
      console.error('Failed to toggle target', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins === 0) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const formatLiveTime = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const date = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Less than a day';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  return (
    <div className="target-card fade-in">
      <div className="target-header">
        <div className="target-info">
          <h3 className="target-title">{target.name}</h3>
          <a href={target.url} target="_blank" rel="noreferrer" className="target-url">
            {target.url.replace(/^https?:\/\//, '')}
            <ExternalLink size={12} />
          </a>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div className="card-actions">
            <button className={`btn-icon ${target.isActive === false ? 'success' : 'danger'}`} onClick={handleToggle} title={target.isActive === false ? "Start Hitting" : "Stop Hitting"}>
              {target.isActive === false ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button className="btn-icon danger" onClick={handleDelete} title="Remove Target">
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className={`status-pill ${statusClass}`}>
            <div className="status-dot"></div>
            {target.status}
          </div>
        </div>
      </div>

      <div className="target-metrics">
        <div className="metric">
          <span className="metric-label">Interval</span>
          <span className="metric-value">{target.interval}m</span>
        </div>
        <div className="metric">
          <span className="metric-label">Last Ping</span>
          <span className="metric-value">{formatTimeAgo(target.lastPing)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Live For</span>
          <span className="metric-value">{formatLiveTime(target.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default TargetCard;