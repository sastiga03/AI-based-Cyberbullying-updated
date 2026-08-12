import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, User, LogOut, Settings, AlertTriangle, 
  Camera, Save, ShieldAlert, CheckCircle2, RefreshCw, Bookmark, BookOpen,
  Sun, Moon, Bell, Calendar, Clock
} from 'lucide-react';
import { COUNSELOR_RULES } from '../mockData';

export default function CounselorDashboard({ 
  user, 
  onLogout, 
  cases, 
  resolveCase, 
  messages, 
  updateProfile, 
  theme, 
  toggleTheme, 
  counselingSlots, 
  approveCounselingSlot, 
  updateCounselingSlot,
  announcements, 
  readAnnouncements = [], 
  markAnnouncementAsRead, 
  forwardedMessages = [], 
  readCounselorMessages = [], 
  markCounselorMessageAsRead
}) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('counselor_active_tab') || 'dashboard');

  useEffect(() => {
    localStorage.setItem('counselor_active_tab', activeTab);
  }, [activeTab]);
  
  const isNameMatch = (name1, name2) => {
    const n1 = (name1 || '').trim().toLowerCase();
    const n2 = (name2 || '').trim().toLowerCase();
    if (!n1 || !n2) return false;
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  const visibleMessages = (messages || []).filter(msg => 
    forwardedMessages.includes(msg.id) || isNameMatch(msg.teacherName, user.name)
  );
  const unreadMessagesCount = visibleMessages.filter(msg => !readCounselorMessages.includes(msg.id)).length;
  
  const pendingSlotsCount = (counselingSlots || []).filter(s => s.status === 'Pending').length;
  const unreadAnnouncementsCount = (announcements || []).filter(a => !readAnnouncements.includes(a.id)).length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 16) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Cases dropdown filter
  const [caseFilterDropdown, setCaseFilterDropdown] = useState('All'); // 'All' | 'Pending' | 'Resolved'

  // Counseling Slot Timings & Statuses
  const [slotDates, setSlotDates] = useState({});
  const [slotTimes, setSlotTimes] = useState({});
  const [slotStatuses, setSlotStatuses] = useState({});
  const [submittedSlots, setSubmittedSlots] = useState({});

  // Announcements ref
  const announcementsRef = useRef(null);

  // Settings states
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhotoUrl || null);

  useEffect(() => {
    setProfilePhoto(user?.profilePhotoUrl || null);
  }, [user?.profilePhotoUrl]);

  const [age, setAge] = useState(user.age || '38');
  const [phone, setPhone] = useState(user.phone || '+91 97890 54321');
  const [address, setAddress] = useState(user.address || 'KCE Counseling Center, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Counseling Department');
  const [batch, setBatch] = useState(user.batch || 'Staff');

  const photoInputRef = useRef(null);

  // Statistics
  const pendingCasesCount = cases.filter(c => c.status === 'Pending').length;
  const totalCasesCount = cases.length;
  const resolvedCasesCount = cases.filter(c => c.status === 'Resolved').length;

  // Top 5 Flagged Persons (highest severity)
  const topFlaggedPersons = [
    { name: 'Thrisha', dept: 'CIVIL', incident: 'Threatening', severity: '95%', flags: 4 },
    { name: 'Rahul', dept: 'CSE', incident: 'Harassment', severity: '87%', flags: 5 },
    { name: 'Thejan', dept: 'IT', incident: 'Bullying', severity: '80%', flags: 3 },
    { name: 'Sneha', dept: 'Algorithm', incident: 'Exclusion', severity: '72%', flags: 2 },
    { name: 'Mouna', dept: 'CSE', incident: 'Mocking', severity: '47%', flags: 2 }
  ];

  const isTimePassed = (timingStr) => {
    if (!timingStr) return false;
    const clean = timingStr.replace(' at ', ' ');
    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      return d.getTime() <= Date.now();
    }
    return false;
  };

  // Action click handler
  const handleCaseAction = (caseId, decisionText) => {
    resolveCase(caseId, decisionText);
    setActiveTab('cases'); // Keep on Cases page to prevent blank page
  };

  // Save changes settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateProfile({ age, phone, address, profilePhotoUrl: profilePhoto });
    alert('Changes Saved');
    setActiveTab('dashboard');
  };

  // Profile photo simulate folder click
  const triggerPhotoUpload = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target.result;
        setProfilePhoto(photoUrl);
        updateProfile({ profilePhotoUrl: photoUrl });
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
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Counselor Workspace</span>
          </div>
        </div>

        <ul className="sidebar-nav-list" style={{ flexGrow: 1 }}>
          <li 
            onClick={() => setActiveTab('dashboard')} 
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Dashboard</span>
          </li>
          <li 
            onClick={() => { setActiveTab('cases'); setCaseFilterDropdown('All'); }} 
            className={`sidebar-nav-item ${activeTab === 'cases' ? 'active' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Cases</span>
          </li>
          <li 
            onClick={() => setActiveTab('messages')} 
            className={`sidebar-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {unreadMessagesCount}
              </span>
            )}
          </li>
          <li 
            onClick={() => setActiveTab('counselingSlots')} 
            className={`sidebar-nav-item ${activeTab === 'counselingSlots' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <Calendar size={18} />
            <span>Counseling Slots</span>
            {pendingSlotsCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {pendingSlotsCount}
              </span>
            )}
          </li>
          <li 
            onClick={() => {
              setActiveTab('dashboard');
              setTimeout(() => {
                if (announcementsRef.current) {
                  announcementsRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }} 
            className="sidebar-nav-item"
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <Bell size={18} />
            <span>Announcements</span>
            {unreadAnnouncementsCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {unreadAnnouncementsCount}
              </span>
            )}
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{getGreeting()}, {user.name}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Student Counselor • Cyber Safety Officer</p>
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

            {/* Message/Email icon navigates to Messages */}
            <button 
              onClick={() => setActiveTab('messages')} 
              className="icon-badge-btn" 
              title="Messages"
              style={{ position: 'relative' }}
            >
              <MessageSquare size={20} />
              {unreadMessagesCount > 0 && (
                <span className="icon-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '50%', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <div className="user-menu-trigger">
              {profilePhoto ? (
                <img src={profilePhoto} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar-circle" style={{ background: 'var(--accent)' }}>MJ</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Counselor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selector */}
        
        {/* 1. Dashboard Main View */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Statistics Cards */}
            <div className="dashboard-grid">
              <div 
                onClick={() => { setActiveTab('cases'); setCaseFilterDropdown('Pending'); }}
                className="glass-panel stat-card glass-panel-hover" 
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'var(--warning-glow)', color: 'var(--warning)' }}>
                  <RefreshCw size={24} className="animate-spin-slow" />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>PENDING CASES</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{pendingCasesCount}</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveTab('cases'); setCaseFilterDropdown('All'); }}
                className="glass-panel stat-card glass-panel-hover" 
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <Bookmark size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL CASES</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalCasesCount}</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveTab('cases'); setCaseFilterDropdown('Resolved'); }}
                className="glass-panel stat-card glass-panel-hover" 
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>RESOLVED CASES</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{resolvedCasesCount}</span>
                </div>
              </div>
            </div>

            {/* Top 5 Flagged Persons Section (Replaces Pending Cases list on Main Dashboard) */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} />
                <span>Top 5 Flagged Persons</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Students with the highest severity rates flagged by the content classification algorithms. Keep under close monitoring.
              </p>
              
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Incident Type</th>
                      <th>Highest Severity Rate</th>
                      <th>Flags Logged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFlaggedPersons.map((person, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{person.name}</td>
                        <td>{person.dept}</td>
                        <td>{person.incident}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{person.severity}</td>
                        <td>
                          <span className="badge badge-danger">{person.flags} flags</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements Card above Rules & Guidance */}
            <div ref={announcementsRef} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} />
                <span>Campus Announcements</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Notices broadcast by the Principal's Office.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                {announcements && announcements.map(ann => {
                  const isRead = readAnnouncements.includes(ann.id);
                  return (
                    <div 
                      key={ann.id} 
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        padding: '12px 16px', 
                        borderRadius: '8px', 
                        borderLeft: `4px solid ${isRead ? 'var(--text-muted)' : 'var(--accent)'}`, 
                        border: '1px solid var(--border-glass)',
                        opacity: isRead ? 0.75 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ann.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2px' }}>By Principal</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{ann.content}</p>
                      {!isRead && (
                        <button
                          onClick={() => markAnnouncementAsRead(ann.id)}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  );
                })}
                {(!announcements || announcements.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No announcements recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Counselor Rules & Guidance below dashboard */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle style={{ color: 'var(--primary)' }} />
                <span>Counselor Rules and Guidance</span>
              </h3>
              <ul style={{ listStyle: 'inside disc', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.6' }}>
                {COUNSELOR_RULES.map((rule, idx) => (
                  <li key={idx} style={{ paddingLeft: '8px' }}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        )}        {/* 2. Cases View (replaces old pendingCases tab) */}
        {activeTab === 'cases' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Cases Database</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Filter, analyze, and resolve campus harassment reviews.
            </p>

            {/* Dropdown Choose Cases */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Choose cases</label>
              <select 
                className="form-input" 
                value={caseFilterDropdown}
                onChange={(e) => setCaseFilterDropdown(e.target.value)}
                style={{ maxWidth: '280px' }}
              >
                <option value="All">Choose Cases (Total Cases)</option>
                <option value="Pending">Pending Cases</option>
                <option value="Resolved">Resolved Cases</option>
              </select>
            </div>

            <div className="custom-table-container" style={{ marginBottom: '24px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Date</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cases
                    .filter(c => {
                      if (caseFilterDropdown === 'Pending') return c.status === 'Pending';
                      if (caseFilterDropdown === 'Resolved') return c.status === 'Resolved';
                      return true;
                    })
                    .map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: '600' }}>{c.studentName}</td>
                        <td>{c.className}</td>
                        <td>{c.date}</td>
                        <td style={{ fontWeight: 'bold', color: parseFloat(c.severity) > 50 ? 'var(--danger)' : 'var(--warning)' }}>
                          {c.severity}
                        </td>
                        <td>
                          <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {cases.filter(c => {
                    if (caseFilterDropdown === 'Pending') return c.status === 'Pending';
                    if (caseFilterDropdown === 'Resolved') return c.status === 'Resolved';
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                        No cases found for this criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Display case resolution panel only if not explicitly filtering resolved */}
            {caseFilterDropdown !== 'Resolved' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Incident Action Panel</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cases.filter(c => c.status === 'Pending').map((c) => (
                    <div key={c.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', background: 'var(--bg-tertiary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{c.studentName} ({c.className})</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Score: {c.severity}</span>
                      </div>
                      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                        "{c.content}"
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <button 
                          onClick={() => handleCaseAction(c.id, 'Solved')} 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          Solved and Mark as Resolved
                        </button>
                        <button 
                          onClick={() => handleCaseAction(c.id, 'Warning Issued')} 
                          className="btn btn-secondary" 
                          style={{ fontSize: '0.8rem', padding: '6px 12px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                        >
                          Warning and Mark as Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                  {cases.filter(c => c.status === 'Pending').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No pending cases left. Excellent safety score!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Messages View */}
        {activeTab === 'messages' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Incident Inquiries</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Messages forwarded from teachers for counselor support.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {visibleMessages.map((msg, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>From: {msg.teacherName || 'Faculty Team'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{msg.date || 'Today'}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Student: <span style={{ fontWeight: '600' }}>{msg.studentName}</span>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '8px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px' }}>
                    {msg.content}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => markCounselorMessageAsRead(msg.id)}
                      disabled={readCounselorMessages.includes(msg.id)}
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', opacity: readCounselorMessages.includes(msg.id) ? 0.6 : 1, cursor: readCounselorMessages.includes(msg.id) ? 'not-allowed' : 'pointer' }}
                    >
                      {readCounselorMessages.includes(msg.id) ? 'Done' : 'Mark as Read'}
                    </button>
                  </div>
                </div>
              ))}
              {visibleMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No messages forwarded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Settings View */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Counselor Profile Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Manage personal records and credentials details.
            </p>

            <form onSubmit={handleSaveSettings}>
              {/* Profile Photo */}
              <div className="settings-avatar-section">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="settings-avatar-preview" />
                ) : (
                  <div className="settings-avatar-preview">MJ</div>
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

        {/* Counseling Slots Tab */}
        {activeTab === 'counselingSlots' && (
          <div>
            {(() => {
              const validCounselingSlots = (counselingSlots || []).filter(s => {
              const r = (s.reason || '').toLowerCase().trim();
              if (r.includes('experiencing stress regarding exam schedule')) return false;
              if (r.includes('i wanna talk to you') || r.includes('wanna talk')) return false;
              return true;
            });

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
                {/* Left Column: Previous Incidents / Sessions History */}
                <div className="glass-panel" style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Previous Incidents & Sessions</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '16px' }}>
                    Scheduled and finished counseling records.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {validCounselingSlots.filter(s => s.status === 'Finished' || s.status === 'Approved' || (s.timings && s.timings.length > 0)).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                        No previous incidents or sessions yet.
                      </p>
                    ) : (
                      validCounselingSlots.filter(s => s.status === 'Finished' || s.status === 'Approved' || (s.timings && s.timings.length > 0)).map(slot => (
                        <div key={slot.id} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', borderLeft: slot.status === 'Finished' ? '3px solid var(--success)' : '3px solid var(--primary)' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block' }}>
                            {slot.studentName} (Roll: {slot.rollNo || 'N/A'})
                          </span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0' }}>
                            Reason: {slot.reason}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: slot.status === 'Finished' ? 'var(--success)' : 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {slot.timings || (slot.status === 'Finished' ? 'Completed' : 'Scheduled')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Counseling Bookings */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Counseling Slot Bookings</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Review student counseling session requests, pick appointment date and time, and update status.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {validCounselingSlots.map(slot => {
                      const currentStatus = slotStatuses[slot.id] || slot.status || 'Pending';
                      const timePassed = isTimePassed(slot.timings);
                      const isFinished = (slot.status === 'Finished');
                      const isPendingAfterTime = (slot.status === 'Pending' && timePassed);
                      const isSubmitted = submittedSlots[slot.id] || (slot.timings && !timePassed);

                      return (
                        <div 
                          key={slot.id} 
                          className="glass-panel" 
                          style={{ 
                            padding: '20px', 
                            background: isFinished ? 'rgba(16, 185, 129, 0.06)' : isPendingAfterTime ? 'rgba(239, 68, 68, 0.06)' : 'var(--bg-tertiary)', 
                            borderLeft: isFinished ? '5px solid var(--success)' : isPendingAfterTime ? '5px solid var(--danger)' : '5px solid var(--primary)',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{slot.studentName} (Roll: {slot.rollNo || 'N/A'})</span>
                            <span className={`badge ${isFinished ? 'badge-success' : isPendingAfterTime ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                              {slot.status}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            <strong>Department:</strong> {slot.dept}
                          </p>
                          
                          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-primary)', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                            "{slot.reason}"
                          </p>

                          {isFinished && (
                            <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', borderRadius: '6px', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} />
                              <span>Counselling ended successfully</span>
                            </div>
                          )}

                          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                              <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                  <Calendar size={14} style={{ color: 'var(--primary)' }} />
                                  <span>Select Date</span>
                                </label>
                                <input 
                                  type="date" 
                                  className="form-input"
                                  value={slotDates[slot.id] !== undefined ? slotDates[slot.id] : ''}
                                  onChange={(e) => setSlotDates({ ...slotDates, [slot.id]: e.target.value })}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                                  <span>Select Time</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <input 
                                    type="time" 
                                    className="form-input"
                                    value={slotTimes[slot.id] !== undefined ? slotTimes[slot.id] : ''}
                                    onChange={(e) => setSlotTimes({ ...slotTimes, [slot.id]: e.target.value })}
                                    style={{ flex: 1 }}
                                  />
                                  <span style={{ 
                                    padding: '8px 14px', 
                                    background: 'var(--bg-tertiary)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '6px', 
                                    fontWeight: 'bold', 
                                    fontSize: '0.85rem', 
                                    color: 'var(--primary)' 
                                  }}>
                                    AM
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!timePassed ? (
                              <div>
                                <button 
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() => {
                                    const dateVal = slotDates[slot.id] || '';
                                    const timeVal = slotTimes[slot.id] || '';
                                    if (!dateVal || !timeVal) {
                                      alert('Please select both date and time to allocate the slot.');
                                      return;
                                    }
                                    const timingStr = `${dateVal} at ${timeVal} AM`;
                                    updateCounselingSlot(slot.id, {
                                      timings: timingStr,
                                      status: slot.status || 'Pending'
                                    });
                                    setSubmittedSlots(prev => ({ ...prev, [slot.id]: true }));
                                  }}
                                  className={`btn ${isSubmitted ? 'btn-secondary' : 'btn-primary'}`}
                                  style={{ 
                                    padding: '8px 22px', 
                                    fontSize: '0.85rem',
                                    background: isSubmitted ? 'var(--success)' : undefined,
                                    color: isSubmitted ? '#fff' : undefined,
                                    borderColor: isSubmitted ? 'var(--success)' : undefined,
                                    cursor: isSubmitted ? 'default' : 'pointer'
                                  }}
                                >
                                  {isSubmitted ? 'Submitted' : 'Submit'}
                                </button>
                              </div>
                            ) : (
                              <div>
                                <div style={{ marginBottom: '16px' }}>
                                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    Counseling Status:
                                  </label>
                                  <select 
                                    className="form-input"
                                    value={currentStatus}
                                    onChange={(e) => setSlotStatuses({ ...slotStatuses, [slot.id]: e.target.value })}
                                    style={{ maxWidth: '240px' }}
                                  >
                                    <option value="Finished">Finished</option>
                                    <option value="Pending">Pending</option>
                                  </select>
                                </div>

                                <button 
                                  type="button"
                                  onClick={() => {
                                    const dateVal = slotDates[slot.id] || '';
                                    const timeVal = slotTimes[slot.id] || '';
                                    let timingStr = slot.timings || '';
                                    if (dateVal && timeVal) {
                                      timingStr = `${dateVal} at ${timeVal} AM`;
                                    }
                                    updateCounselingSlot(slot.id, {
                                      status: currentStatus,
                                      timings: timingStr
                                    });
                                  }}
                                  className="btn btn-primary"
                                  style={{ padding: '8px 22px', fontSize: '0.85rem' }}
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {validCounselingSlots.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No counseling slots requested yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      </main>
    </div>
  );
}
