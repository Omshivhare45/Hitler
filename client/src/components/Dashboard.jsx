import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Activity } from 'lucide-react';
import TargetCard from './TargetCard';
import AddTargetModal from './AddTargetModal';

const Dashboard = () => {
  const [targets, setTargets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTargets = async () => {
    try {
      const res = await axios.get('https://hitler-v4xv.onrender.com/api/targets');
      setTargets(res.data);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
    const interval = setInterval(fetchTargets, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container fade-in">
      <header className="header">
        <div className="header-brand">
          <Activity size={20} color="var(--text-primary)" />
          <h1>Hitler</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          New Target
        </button>
      </header>

      {loading ? (
        <div className="empty-state">Loading targets...</div>
      ) : targets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Activity size={24} />
          </div>
          <h3>No targets configured</h3>
          <p>Get started by adding a URL to keep your application awake and monitor its uptime.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={2.5} />
            Add Target
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {targets.map((target) => (
            <TargetCard key={target._id} target={target} onDelete={fetchTargets} />
          ))}
        </div>
      )}

      <AddTargetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdded={fetchTargets}
      />
    </div>
  );
};

export default Dashboard;
