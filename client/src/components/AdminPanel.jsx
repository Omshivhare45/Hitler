import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Users, LayoutDashboard, Link as LinkIcon, Activity } from 'lucide-react';

const AdminPanel = ({ onBack }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = await getToken();
        const res = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--status-down)', marginBottom: '1rem' }}>{error}</div>
        <button className="btn btn-secondary" onClick={onBack}>Return to Dashboard</button>
      </div>
    );
  }

  const totalUsers = stats.length;
  const totalLinks = stats.reduce((acc, user) => acc + user.totalTargets, 0);

  return (
    <div className="admin-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of all platform users and monitored endpoints.</p>
        </div>
        <button className="btn btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={16} /> Back to My Apps
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }}>
            <Users size={24} color="var(--text-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{totalUsers}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%' }}>
            <LinkIcon size={24} color="var(--text-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{totalLinks}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Monitored Links</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 500 }}>User Monitored Projects</h3>
        </div>
        
        {stats.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No users or data found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>User</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Email</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Projects</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Target URLs</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((userStat, index) => (
                  <tr key={userStat.userId || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{userStat.userName}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>{userStat.userEmail}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {userStat.totalTargets}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {userStat.targets.map((target, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: target.status === 'Awake' ? 'var(--status-awake)' : 'var(--status-down)' }}></div>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{target.name}</span>
                            <span style={{ opacity: 0.6 }}>— {target.url}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
