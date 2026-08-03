import { 
  MessageSquare, Bell, FileText, CheckCircle2, User, LogOut, 
  UploadCloud, Send, ShieldAlert, BookOpen, Settings, AlertTriangle, 
  Paperclip, Camera, Save, Info, UserCheck, Phone, MapPin, Calendar,
  Sun, Moon
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { STUDENT_RULES } from '../mockData';

export default function StudentDashboard({ 
  user, 
  onLogout, 
  announcements, 
  markAnnouncementAsRead, 
  tasks, 
  submitTask, 
  submissions, 
  chats, 
  addChatMessage, 
  reportIssue, 
  updateProfile,
  theme,
  toggleTheme,
  materials,
  counselingSlots,
  bookCounseling
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState('Jan She');
  const [chatInputs, setChatInputs] = useState({ 'Jan She': '', 'Sanshetha S': '' });
  
  // Tasks state
  const [tasksFilter, setTasksFilter] = useState('all'); // 'all' or 'submitted'
  const [taskSearch, setTaskSearch] = useState('');
  
  // Counseling states
  const [counselingRollNo, setCounselingRollNo] = useState('');
  const [counselingDept, setCounselingDept] = useState(user.dept || 'Computer Science & Engineering');
  const [counselingReason, setCounselingReason] = useState('');
  const [showCounselingForm, setShowCounselingForm] = useState(false);
  const [showCounselingSuccess, setShowCounselingSuccess] = useState(false);

  // Materials states
  const [selectedTeacherMaterials, setSelectedTeacherMaterials] = useState(null);
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [taskComment, setTaskComment] = useState('');

  // Report Issue state
  const [issueType, setIssueType] = useState('Cyber bullying');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueFile, setIssueFile] = useState(null);
  const [issueDragActive, setIssueDragActive] = useState(false);

  // Settings State
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [age, setAge] = useState(user.age || '20');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user.address || 'KCE Student Hostel, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Computer Science & Engineering');
  const [batch, setBatch] = useState(user.batch || '2023-2027');

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const reportFileInputRef = useRef(null);

  // Count unread announcements
  const unreadCount = announcements.filter(a => !a.read).length;

  // Chart data
  const assignedCount = tasks.length;
  const completedCount = submissions.filter(s => s.studentName === user.name).length;
  const safetyScore = 92; // Constant static base or custom

  const chartData = [
    { name: 'Assigned Tasks', count: assignedCount },
    { name: 'Completed Tasks', count: completedCount },
    { name: 'Safety Score (%)', count: safetyScore }
  ];

  // Drag and Drop helpers for Task Submit
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Drag and drop for Issue Report
  const handleIssueDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIssueDragActive(true);
    } else if (e.type === "dragleave") {
      setIssueDragActive(false);
    }
  };

  const handleIssueDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIssueDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setIssueFile(e.dataTransfer.files[0]);
    }
  };

  const handleIssueFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIssueFile(e.target.files[0]);
    }
  };

  // Handles submitting task
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert('Please upload a file before submitting.');
      return;
    }
    
    // Submit task callback to parent state
    submitTask({
      taskTitle: selectedTaskToSubmit.title,
      fileName: uploadedFile.name,
      comment: taskComment
    });

    alert('Task Submitted');
    setSelectedTaskToSubmit(null);
    setUploadedFile(null);
    setTaskComment('');
    setTasksFilter('submitted'); // Show submitted tasks tab
    setActiveTab('tasks'); // Redirect to Tasks Main page
  };

  // Handles reporting issue
  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueDesc) {
      alert('Please provide a description.');
      return;
    }
    
    reportIssue({
      type: issueType,
      desc: issueDesc,
      file: issueFile ? issueFile.name : null
    });

    alert('Submitted');
    setIssueType('Cyber bullying');
    setIssueDesc('');
    setIssueFile(null);
    setActiveTab('dashboard'); // Redirect to Dashboard
  };

  // Chat message send
  const handleSendMessage = (contactName) => {
    const text = chatInputs[contactName];
    if (!text.trim()) return;

    addChatMessage(contactName, {
      sender: user.name,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setChatInputs({ ...chatInputs, [contactName]: '' });
  };

  // Save Settings Changes
  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    updateProfile({
      age,
      phone,
      address,
      dept,
      batch
    });

    alert('Changes Saved');
    setActiveTab('dashboard');
  };

  // Simulate Photo Folder Open
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
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Student Workspace</span>
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
            onClick={() => { setActiveTab('tasks'); setTasksFilter('all'); }} 
            className={`sidebar-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          >
            <FileText size={18} />
            <span>My Tasks</span>
          </li>
          <li 
            onClick={() => setActiveTab('submissions')} 
            className={`sidebar-nav-item ${activeTab === 'submissions' ? 'active' : ''}`}
          >
            <CheckCircle2 size={18} />
            <span>My Submissions</span>
          </li>
          <li 
            onClick={() => setActiveTab('chat')} 
            className={`sidebar-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare size={18} />
            <span>Chat with Friends</span>
          </li>
          <li 
            onClick={() => setActiveTab('report')} 
            className={`sidebar-nav-item ${activeTab === 'report' ? 'active' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Report an Issue</span>
          </li>
          <li 
            onClick={() => setActiveTab('bookCounseling')} 
            className={`sidebar-nav-item ${activeTab === 'bookCounseling' ? 'active' : ''}`}
          >
            <UserCheck size={18} />
            <span>Book Counseling</span>
          </li>
          <li 
            onClick={() => setActiveTab('announcements')} 
            className={`sidebar-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
          >
            <Bell size={18} />
            <span>Announcements</span>
          </li>
          <li 
            onClick={() => setActiveTab('materials')} 
            className={`sidebar-nav-item ${activeTab === 'materials' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Materials</span>
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Welcome Back, {user.name}!</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>III Year, {dept}</p>
          </div>

          <div className="top-bar-icons">
            {/* Theme Toggle Icon */}
            <button 
              onClick={toggleTheme} 
              className="icon-badge-btn" 
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Message Icon navigates to Chat */}
            <button 
              onClick={() => setActiveTab('chat')} 
              className="icon-badge-btn" 
              title="Chat with Friends"
            >
              <MessageSquare size={20} />
            </button>

            {/* Notification Bell Icon opens announcements */}
            <button 
              onClick={() => setActiveTab('announcements')} 
              className="icon-badge-btn" 
              title="Announcements"
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
            </button>

            <div className="user-menu-trigger">
              {profilePhoto ? (
                <img src={profilePhoto} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar-circle">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Student</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Switchboard */}
        
        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Task Completion Graph */}
              <div className="glass-panel chart-card">
                <div className="chart-header">
                  <h3 style={{ fontSize: '1.1rem' }}>Task Completion Process & Safety Metrics</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Statistics</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" scale="point" padding={{ left: 30, right: 30 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" barSize={40} fill="var(--primary)" radius={[4, 4, 0, 0]} name="Value / Count" />
                      <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={3} name="Safety Score Curve" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Unread Announcements Quick Section */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Campus Announcements</h3>
                  <button onClick={() => setActiveTab('announcements')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    View All
                  </button>
                </div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                  {announcements.filter(a => !a.read).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={24} style={{ color: 'var(--success)', margin: '0 auto 8px', display: 'block' }} />
                      No unread announcements.
                    </div>
                  ) : (
                    announcements.filter(a => !a.read).map(ann => (
                      <div 
                        key={ann.id} 
                        className="glass-panel" 
                        style={{ padding: '12px', borderLeft: '4px solid var(--primary)', background: 'var(--bg-tertiary)' }}
                      >
                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '2px' }}>
                          By Principal
                        </div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>{ann.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Student Rules and Informative Content */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <AlertTriangle style={{ color: 'var(--warning)' }} />
                <h3 style={{ fontSize: '1.2rem' }}>KCE Digital Safety Guidelines & Code of Ethics</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
                SafeGuard AI is deployed to secure campus communication channels and help students focus on studies in a harassment-free space. All actions and interactions must adhere to the digital standards of Karpagam College of Engineering.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--primary)' }}>Key Campus Rules</h4>
                  <ul style={{ listStyle: 'inside disc', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {STUDENT_RULES.slice(0, 3).map((rule, idx) => <li key={idx}>{rule}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '12px', color: 'var(--accent)' }}>Digital Safety & Reporting</h4>
                  <ul style={{ listStyle: 'inside disc', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {STUDENT_RULES.slice(3).map((rule, idx) => <li key={idx}>{rule}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Announcements View */}
        {activeTab === 'announcements' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Announcements Board</h2>
              <button onClick={() => setActiveTab('dashboard')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Back to Dashboard
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {announcements.map(ann => (
                <div 
                  key={ann.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    borderLeft: `4px solid ${ann.read ? 'var(--text-muted)' : 'var(--primary)'}`,
                    background: ann.read ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    opacity: ann.read ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className={`badge ${ann.read ? 'badge-secondary' : 'badge-info'}`} style={{ marginBottom: '6px' }}>
                        {ann.read ? 'Read' : 'Unread'}
                      </span>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                        By Principal
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{ann.title}</h3>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '16px' }}>
                    {ann.content}
                  </p>
                  {!ann.read && (
                    <button 
                      onClick={() => markAnnouncementAsRead(ann.id)} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      <span>Mark as Read</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. My Tasks View */}
        {activeTab === 'tasks' && (
          <div>
            {/* If task is selected to submit */}
            {selectedTaskToSubmit ? (
              <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Submit Task</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Task: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{selectedTaskToSubmit.title}</span> • Instructor: {selectedTaskToSubmit.instructor}
                </p>

                <form onSubmit={handleTaskSubmit}>
                  {/* Drag and Drop Zone */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Upload Reference File *
                    </label>
                    <div 
                      className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <UploadCloud size={40} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p style={{ fontWeight: '500' }}>Drag & drop or click to upload</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF, DOC up to 20MB</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.zip"
                      />
                    </div>
                    {uploadedFile && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 'bold' }}>{uploadedFile.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Add Comment
                    </label>
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      placeholder="Notes for your teacher..."
                      value={taskComment}
                      onChange={(e) => setTaskComment(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setSelectedTaskToSubmit(null)} 
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit Task
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Task Main List
              <div className="glass-panel" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>My Assigned Tasks</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track, review and submit assignments.</p>
                  </div>
                  
                  {/* Task Filter Tab triggers: All vs Submitted */}
                  <div className="dashboard-tabs" style={{ margin: 0 }}>
                    <span 
                      onClick={() => setTasksFilter('all')} 
                      className={`dashboard-tab ${tasksFilter === 'all' ? 'active' : ''}`}
                    >
                      All Tasks ({tasks.length})
                    </span>
                    <span 
                      onClick={() => setTasksFilter('submitted')} 
                      className={`dashboard-tab ${tasksFilter === 'submitted' ? 'active' : ''}`}
                    >
                      Submitted Tasks Alone
                    </span>
                  </div>
                </div>

                {/* Search Bar inside Tasks */}
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search tasks by title, description or instructor..." 
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                </div>

                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Instructor</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Initially displaying up to 10 tasks */}
                      {tasks
                        .filter(t => {
                          if (tasksFilter === 'all') return t.visible;
                          // If 'submitted', we filter to show only tasks that have a corresponding submission
                          const isSub = submissions.some(sub => sub.taskTitle === t.title && sub.studentName === user.name);
                          return isSub;
                        })
                        .filter(t => {
                          if (!taskSearch.trim()) return true;
                          const q = taskSearch.toLowerCase();
                          return (
                            t.title.toLowerCase().includes(q) ||
                            (t.desc && t.desc.toLowerCase().includes(q)) ||
                            t.instructor.toLowerCase().includes(q)
                          );
                        })
                        .slice(0, 10)
                        .map(task => {
                          const isSub = submissions.some(sub => sub.taskTitle === task.title && sub.studentName === user.name);
                          return (
                            <tr key={task.id}>
                              <td style={{ fontWeight: '600' }}>{task.title}</td>
                              <td>{task.instructor}</td>
                              <td>{task.dueDate}</td>
                              <td>
                                <span className={`badge ${isSub ? 'badge-success' : 'badge-warning'}`}>
                                  {isSub ? 'Submitted' : 'Pending'}
                                </span>
                              </td>
                              <td>
                                {isSub ? (
                                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={16} /> Completed
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => setSelectedTaskToSubmit(task)} 
                                    className="btn btn-primary" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                  >
                                    Submit
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {tasks.filter(t => {
                        if (tasksFilter === 'all') return t.visible;
                        const isSub = submissions.some(sub => sub.taskTitle === t.title && sub.studentName === user.name);
                        return isSub;
                      }).length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No tasks found matching this criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Submissions View */}
        {activeTab === 'submissions' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>My Submissions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Historical log of tasks submitted by you and scanned by the Safeguard AI.
            </p>

            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Task Name</th>
                    <th>Submission Date</th>
                    <th>Uploaded File</th>
                    <th>AI Scan Status</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.filter(s => s.studentName === user.name).map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{sub.taskTitle}</td>
                      <td>{sub.date}</td>
                      <td>
                        <span style={{ textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}>
                          {sub.fileName}
                        </span>
                      </td>
                      <td>
                        {/* Mask the AI results for students except simple safe status */}
                        <span className={`badge ${sub.severityScore > 30 ? 'badge-warning' : 'badge-success'}`}>
                          {sub.severityScore > 30 ? 'Under Review' : 'Verified Safe'}
                        </span>
                      </td>
                      <td style={{ fontStyle: 'italic' }}>{sub.feedback || 'Awaiting Review'}</td>
                    </tr>
                  ))}
                  {submissions.filter(s => s.studentName === user.name).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No submissions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. Chat with Friends View */}
        {activeTab === 'chat' && (
          <div className="chat-container">
            {/* Contacts Sidebar */}
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Conversations</h3>
              </div>
              <div className="chat-contacts-list">
                <div 
                  onClick={() => setSelectedContact('Jan She')} 
                  className={`chat-contact-item ${selectedContact === 'Jan She' ? 'active' : ''}`}
                >
                  <div className="user-avatar-circle" style={{ background: 'var(--accent)' }}>JS</div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Jan She</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {chats['Jan She'][chats['Jan She'].length - 1]?.text}
                    </p>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedContact('Sanshetha S')} 
                  className={`chat-contact-item ${selectedContact === 'Sanshetha S' ? 'active' : ''}`}
                >
                  <div className="user-avatar-circle" style={{ background: 'var(--warning)' }}>SS</div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Sanshetha S</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10m ago</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {chats['Sanshetha S'][chats['Sanshetha S'].length - 1]?.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Content Panel */}
            <div className="chat-main-area">
              <div className="chat-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="user-avatar-circle" style={{ background: selectedContact === 'Jan She' ? 'var(--accent)' : 'var(--warning)' }}>
                    {selectedContact === 'Jan She' ? 'JS' : 'SS'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{selectedContact}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Active Now</span>
                  </div>
                </div>
              </div>

              {/* Messages log */}
              <div className="chat-messages-log">
                {(chats[selectedContact] || []).map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-bubble ${msg.sender === user.name ? 'sent' : 'received'}`}
                  >
                    <p style={{ fontSize: '0.9rem' }}>{msg.text}</p>
                    <span style={{ display: 'block', fontSize: '0.65rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Improved type a message input section */}
              <div className="chat-input-bar">
                <button className="icon-badge-btn" style={{ margin: 0, color: 'var(--text-muted)' }} title="Attach file">
                  <Paperclip size={18} />
                </button>
                <div className="chat-input-container">
                  <input 
                    type="text" 
                    className="chat-input-field" 
                    placeholder="Type a message..."
                    value={chatInputs[selectedContact]}
                    onChange={(e) => setChatInputs({ ...chatInputs, [selectedContact]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(selectedContact); }}
                  />
                </div>
                <button 
                  onClick={() => handleSendMessage(selectedContact)} 
                  className="btn btn-primary" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Report Issue View */}
        {activeTab === 'report' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Report Cyberbullying or Harmful Content</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Report cyberbullying, harassment, or offensive behaviors. This report goes to your teacher & student counselor.
            </p>

            <form onSubmit={handleIssueSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Issue Type
                </label>
                <select 
                  className="form-input"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option value="Cyber bullying">Cyberbullying / Insults</option>
                  <option value="Offensive">Offensive Language / Profanity</option>
                  <option value="Harassment">Harassment / Exclusions</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea 
                  className="form-input" 
                  rows="5" 
                  placeholder="Describe the incident in detail (mention date, channel, individuals involved)..."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Drag and Drop File Upload for Issues */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Attach Screenshot / Evidence (Optional)
                </label>
                <div 
                  className={`drag-drop-zone ${issueDragActive ? 'active' : ''}`}
                  onDragEnter={handleIssueDrag}
                  onDragOver={handleIssueDrag}
                  onDragLeave={handleIssueDrag}
                  onDrop={handleIssueDrop}
                  onClick={() => reportFileInputRef.current.click()}
                >
                  <UploadCloud size={32} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>Drag & drop or click to upload</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Images, PDF up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    ref={reportFileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleIssueFileSelect}
                    accept="image/*,.pdf"
                  />
                </div>
                {issueFile && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 'bold' }}>{issueFile.name}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('dashboard')} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit To Teacher
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Book Counseling View */}
        {activeTab === 'bookCounseling' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Book Counselor Session</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Connect with Karpagam College of Engineering's student counseling services.
            </p>

            {showCounselingForm ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                bookCounseling({
                  rollNo: counselingRollNo,
                  department: counselingDept,
                  reason: counselingReason
                });
                setShowCounselingSuccess(true);
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Student Name</label>
                  <input type="text" className="form-input" value={user.name} disabled style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Roll No *</label>
                  <input type="text" className="form-input" value={counselingRollNo} onChange={(e) => setCounselingRollNo(e.target.value)} required placeholder="eg. 23CS101" />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Department *</label>
                  <input type="text" className="form-input" value={counselingDept} onChange={(e) => setCounselingDept(e.target.value)} required />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Reason textbox *</label>
                  <textarea className="form-input" rows="4" value={counselingReason} onChange={(e) => setCounselingReason(e.target.value)} required placeholder="Describe what you'd like to discuss..." />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCounselingForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Request Counselor</button>
                </div>
              </form>
            ) : (
              <div>
                {(() => {
                  const mySlot = counselingSlots.find(s => s.studentName === user.name);
                  return (
                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}>
                          MJ
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>Meena Jegan</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Counselor</p>
                          {mySlot && mySlot.status === 'Approved' && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 'bold', marginTop: '6px' }}>
                              Timing Slot: {mySlot.timings}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {!mySlot ? (
                          <button onClick={() => setShowCounselingForm(true)} className="btn btn-primary">
                            Book Counseling
                          </button>
                        ) : mySlot.status === 'Pending' ? (
                          <button disabled className="btn btn-secondary" style={{ cursor: 'not-allowed', color: 'var(--text-muted)' }}>
                            Not Approved Yet
                          </button>
                        ) : (
                          <button disabled className="btn btn-primary" style={{ background: 'var(--success)', cursor: 'not-allowed', borderColor: 'var(--success)', color: '#fff' }}>
                            Approved
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Counseling Booking Success Pop-up Modal */}
            {showCounselingSuccess && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div className="glass-panel" style={{ width: '380px', padding: '28px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '10px' }}>Counseling booked.</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Counseling will be approved after counselor approves
                  </p>
                  <button 
                    onClick={() => {
                      setShowCounselingSuccess(false);
                      setShowCounselingForm(false);
                    }} 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                  >
                    Ok
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Materials View */}
        {activeTab === 'materials' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            {selectedTeacherMaterials ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>{selectedTeacherMaterials}'s Classroom</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Access and download educational reference materials.</p>
                  </div>
                  <button onClick={() => setSelectedTeacherMaterials(null)} className="btn btn-secondary">
                    Back to Teachers list
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {materials
                    .filter(m => {
                      if (selectedTeacherMaterials === 'Anand Kumar') {
                        return m.teacherName === 'AnandKumar' || m.teacherName === 'Anand Kumar';
                      }
                      return m.teacherName === selectedTeacherMaterials;
                    })
                    .map(mat => (
                      <div key={mat.id} className="glass-panel" style={{ padding: '20px', background: 'var(--bg-tertiary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{mat.title}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mat.date}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                          {mat.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{mat.fileName}</span>
                          </div>
                          <button 
                            onClick={() => {
                              alert(`Simulating file download: ${mat.fileName}`);
                              const element = document.createElement("a");
                              const file = new Blob([`Simulated content for academic resource: ${mat.fileName}`], {type: 'text/plain'});
                              element.href = URL.createObjectURL(file);
                              element.download = mat.fileName;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                            }} 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  {materials.filter(m => {
                    if (selectedTeacherMaterials === 'Anand Kumar') {
                      return m.teacherName === 'AnandKumar' || m.teacherName === 'Anand Kumar';
                    }
                    return m.teacherName === selectedTeacherMaterials;
                  }).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No materials posted by this teacher yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Teacher Materials & Classrooms</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Select a faculty member below to view posted resources and download files.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  {[
                    { name: 'Anand Kumar', subjects: 'Data Structures, DBMS' },
                    { name: 'Prof. Rak Karnan', subjects: 'Computational Methods, Algorithm Analysis' },
                    { name: 'Prof. Suresh Kumar', subjects: 'Computer Networks' }
                  ].map((teacher, idx) => (
                    <div key={idx} onClick={() => setSelectedTeacherMaterials(teacher.name)} className="glass-panel glass-panel-hover" style={{ padding: '24px', cursor: 'pointer', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {teacher.name.replace('Prof.', '').trim().split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>{teacher.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{teacher.subjects}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Settings View */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Student Profile Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              View academic credentials and manage personal profile contact details.
            </p>

            <form onSubmit={handleSaveSettings}>
              {/* Profile Photo Section - opens native dialog */}
              <div className="settings-avatar-section">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="settings-avatar-preview" />
                ) : (
                  <div className="settings-avatar-preview">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
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
                {/* Disabled read-only name and email */}
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
      </main>
    </div>
  );
}
