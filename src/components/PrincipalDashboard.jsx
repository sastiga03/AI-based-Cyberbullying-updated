import React, { useState, useRef } from 'react';
import { Activity } from "lucide-react";
import { 
  User, LogOut, Settings, Camera, Save, 
  FileText, ShieldCheck, TrendingUp, AlertTriangle,
  Sun, Moon, Bell, UploadCloud, MessageSquare, Calendar
} from 'lucide-react';

export default function PrincipalDashboard({ 
  user, 
  onLogout, 
  cases, 
  updateProfile,
  theme,
  toggleTheme,
  addAnnouncement,
  counselingSlots,
  studentMessages,
  announcements
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Announcement Form states
  const [annTargetRole, setAnnTargetRole] = useState('All');
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annFile, setAnnFile] = useState(null);
  const [annDragActive, setAnnDragActive] = useState(false);
  const annFileInputRef = useRef(null);

  // Settings States
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [age, setAge] = useState(user.age || '55');
  const [phone, setPhone] = useState(user.phone || '+91 94440 98765');
  const [address, setAddress] = useState(user.address || 'KCE Principal Bungalow, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Administration');
  const [batch, setBatch] = useState(user.batch || 'Executive Staff');

  const photoInputRef = useRef(null);

  // Statistics
  const activeCasesCount = cases.filter(c => c.status === 'Pending').length;
  const totalCasesCount = cases.length;
  const campusSafetyScore = 91; // 91% Excellent!

  // Severity analysis table data: High to Low severity
  const severityRecords = [
    { name: 'Thrisha', dept: 'CIVIL C', severity: 95, status: 'Unresolved' },
    { name: 'Rahul', dept: 'CSE A', severity: 87, status: 'Unresolved' },
    { name: 'Thejan', dept: 'IT A', severity: 80, status: 'Resolved' },
    { name: 'Jaya She', dept: 'CSE B', severity: 85, status: 'Unresolved' },
    { name: 'Mouna', dept: 'CSE B', severity: 47, status: 'Unresolved' },
    { name: 'Aakil', dept: 'ECE C', severity: 22, status: 'Resolved' },
    { name: 'Asin', dept: 'IT A', severity: 4, status: 'Resolved' },
    { name: 'Sanjai', dept: 'ECE C', severity: 2, status: 'Resolved' }
  ].sort((a, b) => b.severity - a.severity);

  // Save changes settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateProfile({ age, phone, address });
    alert('Changes Saved');
    setActiveTab('dashboard');
  };

  // Profile image simulator
  const triggerPhotoUpload = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <span className="logo-k" style={{ fontSize: '1.8rem' }}>K</span>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>KCE SafeGuard</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Executive Workspace</span>
          </div>
        </div>

        <ul className="sidebar-nav-list" style={{ flexGrow: 1 }}>
          <li 
            onClick={() => setActiveTab('dashboard')} 
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <TrendingUp size={18} />
            <span>Dashboard & Reports</span>
          </li>
          <li 
            onClick={() => setActiveTab('announcement')} 
            className={`sidebar-nav-item ${activeTab === 'announcement' ? 'active' : ''}`}
          >
            <Bell size={18} />
            <span>Announcement</span>
          </li>
          <li 
            onClick={() => setActiveTab('performance')} 
            className={`sidebar-nav-item ${activeTab === 'performance' ? 'active' : ''}`}
          >
            <Activity size={18} style={{ display: 'none' }} /> {/* To avoid runtime error if Activity not imported, let's use ShieldCheck or custom lucide */}
            <ShieldCheck size={18} />
            <span>Performance</span>
          </li>
          <li 
            onClick={() => setActiveTab('settings')} 
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </li>
        </ul>

        <button onClick={onLogout} className="btn btn-secondary sidebar-nav-item" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Pane */}
      <main className="dashboard-main">
        {/* Top Navigation Bar */}
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Good Morning, Dr. Krishnamurthy!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Principal Office • Karpagam College of Engineering</p>
          </div>

          <div className="top-bar-icons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle Icon */}
            <button 
              onClick={toggleTheme} 
              className="icon-badge-btn" 
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="user-menu-trigger">
              {profilePhoto ? (
                <img src={profilePhoto} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar-circle" style={{ background: 'var(--primary)' }}>DK</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>Dr. Krishnamurthy</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Principal</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        
        {/* 1. Dashboard Reports View */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Executive Status Cards */}
            <div className="dashboard-grid">
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>CAMPUS SAFETY SCORE</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>{campusSafetyScore}%</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ background: 'var(--danger-glow)', color: 'var(--danger)' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>UNRESOLVED INCIDENTS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)' }}>{activeCasesCount}</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL CASES LOGGED</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalCasesCount}</span>
                </div>
              </div>
            </div>

            {/* Severity Analysis Report Table (High to Low Severity) */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--danger)' }}>Detailed Severity Analysis Report</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Executive monitoring panel showing safety metrics for student content scanned on college systems, ranked from high to low severity.
              </p>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department/Class</th>
                      <th>Severity Rate</th>
                      <th>Case Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {severityRecords.map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{rec.name}</td>
                        <td>{rec.dept}</td>
                        <td style={{ fontWeight: 'bold', color: rec.severity > 50 ? 'var(--danger)' : 'var(--warning)' }}>
                          {rec.severity}%
                        </td>
                        <td>
                          <span className={`badge ${rec.status === 'Resolved' ? 'badge-success' : 'badge-danger'}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Principal Profile Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Modify security contact records.
            </p>

            <form onSubmit={handleSaveSettings}>
              {/* Profile Photo */}
              <div className="settings-avatar-section">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="settings-avatar-preview" />
                ) : (
                  <div className="settings-avatar-preview">DK</div>
                )}
                <div>
                  <button 
                    type="button" 
                    onClick={triggerPhotoUpload} 
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <Camera size={16} />
                    <span>Change profile photo</span>
                  </button>
                  <input 
                    type="file" 
                    ref={photoInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handlePhotoSelect}
                    accept="image/*"
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>JPG, PNG or WEBP. Max 2MB.</p>
                </div>
              </div>

              <div className="settings-grid">
                {/* Disabled name & email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Full Name</label>
                  <input type="text" className="form-input" value={user.name} disabled style={{ cursor: 'not-allowed', background: 'var(--bg-tertiary)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" className="form-input" value={user.email} disabled style={{ cursor: 'not-allowed', background: 'var(--bg-tertiary)' }} />
                </div>

                {/* Additional fields age, phone, address */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Age</label>
                  <input type="number" className="form-input" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Phone Number</label>
                  <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Address</label>
                  <input type="text" className="form-input" value={address} disabled style={{ cursor: 'not-allowed', background: 'var(--bg-tertiary)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Department</label>
                  <input type="text" className="form-input" value={dept} disabled style={{ cursor: 'not-allowed', background: 'var(--bg-tertiary)' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Batch</label>
                  <input type="text" className="form-input" value={batch} disabled style={{ cursor: 'not-allowed', background: 'var(--bg-tertiary)' }} />
                </div>
              </div>

              {/* Note: SMS alerts option removed */}

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('dashboard')} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Announcement Form Tab */}
        {activeTab === 'announcement' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Publish New Circular / Announcement</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Create an announcement circular that will instantly notify all selected roles.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!annTitle || !annDesc) return;
              addAnnouncement({
                title: annTitle,
                description: annDesc,
                targetRole: annTargetRole,
                file: annFile ? annFile.name : null
              });
              alert(`Announcement "${annTitle}" successfully published to ${annTargetRole}!`);
              setAnnTitle('');
              setAnnDesc('');
              setAnnFile(null);
              setActiveTab('dashboard');
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>For Which Role *</label>
                <select 
                  className="form-input"
                  value={annTargetRole}
                  onChange={(e) => setAnnTargetRole(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Teacher">Teachers </option>
                  <option value="Student">Students </option>
                  <option value="Counselor">Counselors </option>
                  <option value="Admin">Admins</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Announcement Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="eg. Revised Mid term schedule" 
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description *</label>
                <textarea 
                  className="form-input" 
                  rows="5" 
                  placeholder="Write the circular announcement details here..." 
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                  required
                />
              </div>

              {/* Drag and Drop circular upload (optional) */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Upload Circular PDF/Image (Optional)</label>
                <div 
                  className={`drag-drop-zone ${annDragActive ? 'active' : ''}`}
                  onDragEnter={(e) => { e.preventDefault(); setAnnDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setAnnDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setAnnDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAnnDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setAnnFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => annFileInputRef.current.click()}
                >
                  <UploadCloud size={32} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>Drag & drop or click to upload</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDF, JPG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    ref={annFileInputRef} 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAnnFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                {annFile && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 'bold' }}>{annFile.name}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setActiveTab('dashboard')} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Post Announcement</button>
              </div>
            </form>
          </div>
        )}

        {/* Performance (Activities) Tab */}
        {activeTab === 'performance' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Campus Activity & Performance Metrics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Detailed monitor showing Student-to-Teacher messages and Counseling session logs created in the last 24 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(() => {
                const logs = [];
                // Student Messages in last 24h
                studentMessages.forEach((msg, index) => {
                  logs.push({
                    id: `msg-${index}`,
                    type: 'message',
                    title: `Message from Student: ${msg.studentName}`,
                    desc: `Inquiry: "${msg.content}"`,
                    time: index === 0 ? '3 hours ago' : index === 1 ? '12 hours ago' : '22 hours ago',
                    badge: 'Inquiry'
                  });
                });
                // Counseling Slots booked/approved in last 24h
                counselingSlots.forEach((slot, index) => {
                  logs.push({
                    id: `couns-${index}`,
                    type: 'counseling',
                    title: `Counseling booking: ${slot.studentName}`,
                    desc: `Reason: "${slot.reason}" — Status: ${slot.status} ${slot.timings ? `(${slot.timings})` : ''}`,
                    time: slot.status === 'Approved' ? '1 hour ago' : '15 hours ago',
                    badge: slot.status
                  });
                });

                if (logs.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No activity recorded in the last 24 hours.
                    </div>
                  );
                }

                return logs.map((log) => (
                  <div key={log.id} className="glass-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderLeft: `4px solid ${log.type === 'message' ? 'var(--primary)' : 'var(--success)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{log.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.desc}</p>
                    <span className={`badge ${log.badge === 'Approved' ? 'badge-success' : log.badge === 'Pending' ? 'badge-warning' : 'badge-info'}`} style={{ marginTop: '8px', fontSize: '0.65rem' }}>
                      {log.badge}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
