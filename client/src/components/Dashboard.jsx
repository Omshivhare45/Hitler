import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Activity } from 'lucide-react';
import { useAuth, UserButton, SignInButton, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import TargetCard from './TargetCard';
import AddTargetModal from './AddTargetModal';
import AdminPanel from './AdminPanel';

const Dashboard = () => {
  const [targets, setTargets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'omshivhare666@gmail.com';

  const fetchTargets = async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    
    try {
      const token = await getToken();
      const res = await axios.get('http://localhost:5000/api/targets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTargets(res.data);
    } catch (err) {
      console.error('Failed to fetch targets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      setLoading(true);
      fetchTargets();
      const interval = setInterval(fetchTargets, 15000);
      return () => clearInterval(interval);
    } else {
      setTargets([]);
      setLoading(false);
    }
  }, [isSignedIn]);

  if (view === 'admin' && isAdmin) {
    return <AdminPanel onBack={() => setView('dashboard')} />;
  }

  return (
    <div className="app-container fade-in">
      <header className="header">
        <div className="header-brand">
          <img src="/logo.png" alt="App Logo" style={{ height: '24px', width: 'auto' }} />
          <h1>Hitler</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SignedIn>
            {isAdmin && (
              <button className="btn btn-secondary" onClick={() => setView('admin')} style={{ marginRight: '0.5rem' }}>
                Admin Panel
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} strokeWidth={2.5} />
              New Target
            </button>
            <UserButton />
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      {loading ? (
        <div className="empty-state">Loading targets...</div>
      ) : !isSignedIn ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Activity size={24} />
          </div>
          <h3>Welcome to Hitler</h3>
          <p>Please sign in to start tracking your applications and monitoring uptime.</p>
          <SignInButton mode="modal">
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Get Started</button>
          </SignInButton>
        </div>
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

      <SignedIn>
        <AddTargetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdded={fetchTargets}
        />
      </SignedIn>
    </div>
  );
};

export default Dashboard;
