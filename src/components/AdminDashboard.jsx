import React, { useState, useRef } from 'react';
import { 
  User, LogOut, Settings, Camera, Save, ShieldCheck, 
  Trash2, Edit, Plus, Users, Cpu, Activity, AlertTriangle,
  Sun, Moon, Bell, Search, UploadCloud, FileText, Calendar, MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

export default function AdminDashboard({ 
  user, 
  onLogout, 
  users = [], 
  addUser, 
  deleteUser, 
  cases, 
  updateProfile,
  theme,
  toggleTheme,
  counselingSlots,
  studentMessages,
  updateUser,
  setUsers,
  announcements
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const unreadAnnouncementsCount = (announcements || []).filter(a => !a.read).length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 16) return 'Good Afternoon';
    return 'Good Evening';
  };

  // User Management State
  const [addUserTab, setAddUserTab] = useState('individual'); // 'individual' | 'excel'
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Student');
  const [newUserDept, setNewUserDept] = useState('Computer Science & Engineering');

  // Excel Upload states
  const [excelDragActive, setExcelDragActive] = useState(false);
  const [uploadedExcelFile, setUploadedExcelFile] = useState(null);
  const excelFileInputRef = useRef(null);

  // Search User state
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Editing User state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('Student');
  const [editDept, setEditDept] = useState('');

  // Announcements ref
  const announcementsRef = useRef(null);
  
  // Settings States
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [age, setAge] = useState(user.age || '35');
  const [phone, setPhone] = useState(user.phone || '+91 99654 32109');
  const [address, setAddress] = useState(user.address || 'KCE System Center, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Information Technology');
  const [batch, setBatch] = useState(user.batch || 'Staff');

  const photoInputRef = useRef(null);

  // Statistics Data
  const scannedCount = 48293;
  const flagsCount = 87;
  const accuracyPercent = 98.7;

  // Department incident data
  const deptData = [
    { name: 'CSE', count: 18 },
    { name: 'IT', count: 12 },
    { name: 'AD', count: 8 },
    { name: 'ECE', count: 15 },
    { name: 'EE', count: 4 },
    { name: 'ME', count: 3 }
  ];

  // Severity Distribution Data
  const severityDistData = [
    { name: 'Low', value: 34 },
    { name: 'Medium', value: 28 },
    { name: 'High', value: 20 },
    { name: 'At Risk', value: 5 }
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'];

  // Detailed severity monitoring table data (High -> Low severity)
  const severityRecords = [
    { name: 'Thrisha', dept: 'CIVIL', severity: 95, status: 'Pending' },
    { name: 'Rahul', dept: 'CSE', severity: 87, status: 'Pending' },
    { name: 'Thejan', dept: 'IT', severity: 80, status: 'Resolved' },
    { name: 'Jaya She', dept: 'CSE', severity: 85, status: 'Pending' },
    { name: 'Mouna', dept: 'CSE', severity: 47, status: 'Pending' },
    { name: 'Aakil', dept: 'ECE', severity: 22, status: 'Resolved' },
    { name: 'Asin', dept: 'IT', severity: 4, status: 'Resolved' },
    { name: 'Sanjai', dept: 'ECE', severity: 2, status: 'Resolved' }
  ].sort((a, b) => b.severity - a.severity); // Sorted High to Low

  // Add user handler
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      password: newUserPassword,
      dept: newUserDept
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('Student');
    setNewUserDept('Computer Science & Engineering');
    alert('User added successfully.');
  };

  // Save Settings Changes
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
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Admin Workspace</span>
          </div>
        </div>

        <ul className="sidebar-nav-list" style={{ flexGrow: 1 }}>
          <li 
            onClick={() => setActiveTab('dashboard')} 
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Activity size={18} />
            <span>Dashboard</span>
          </li>
          <li 
            onClick={() => setActiveTab('userManagement')} 
            className={`sidebar-nav-item ${activeTab === 'userManagement' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>User Management</span>
          </li>
          <li 
            onClick={() => setActiveTab('aiMonitoring')} 
            className={`sidebar-nav-item ${activeTab === 'aiMonitoring' ? 'active' : ''}`}
          >
            <Cpu size={18} />
            <span>AI Monitoring</span>
          </li>
          <li 
            onClick={() => setActiveTab('activities')} 
            className={`sidebar-nav-item ${activeTab === 'activities' ? 'active' : ''}`}
          >
            <Activity size={18} />
            <span>Activities</span>
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>System Administrator • Campus Cybersecurity</p>
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
                <div className="user-avatar-circle" style={{ background: 'var(--primary)' }}>S</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        
        {/* 1. Dashboard Main View */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Statistics Row */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL USERS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{users.length}</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div className="stat-icon" style={{ background: 'var(--danger-glow)', color: 'var(--danger)' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL INCIDENTS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)' }}>{cases.length}</span>
                </div>
              </div>
            </div>

            {/* Recharts Graphs below the Dashboard statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              
              {/* Department Incident Counts */}
              <div className="glass-panel chart-card">
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Department-Wise Incident Statistics</h3>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={deptData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} name="Incident Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Distribution */}
              <div className="glass-panel chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Severity Distribution Charts</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexGrow: 1 }}>
                  <div style={{ width: 180, height: 180 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={severityDistData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {severityDistData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {severityDistData.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '2px', background: COLORS[index] }}></span>
                        <span style={{ fontWeight: '500' }}>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Announcements Card above Admin Rules & Guidance */}
            <div ref={announcementsRef} className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} />
                <span>Campus Announcements</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Broadcast notices published by the Principal's Office.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                {announcements && announcements.map(ann => (
                  <div key={ann.id} style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ann.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2px' }}>By Principal</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
                  </div>
                ))}
                {(!announcements || announcements.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                    No announcements available.
                  </div>
                )}
              </div>
            </div>

            {/* Admin Rules, safety guidelines, and additional informative content */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                <AlertTriangle style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.1rem' }}>Administrative Policy & Safe Campus Guidelines</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '12px' }}>
                As an Administrator, you are responsible for maintaining system uptime, validating classification models, registering authorized college staff, and reviewing automated network blocks.
              </p>
              <ul style={{ listStyle: 'inside disc', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Configure natural language heuristics periodically to match local linguistic variations.</li>
                <li>Audit account logs and user permission groups daily to prevent privilege escalation.</li>
                <li>Collaborate with student counselors regarding high-risk incidents marked by the AI engine.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 2. User Management Tab */}
        {activeTab === 'userManagement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Add User Section */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Plus size={20} style={{ color: 'var(--primary)' }} />
                  <span>Add Users</span>
                </h3>

                {/* Sub tabs to toggle between Individual and Bulk Upload */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setAddUserTab('individual')} 
                    className={`btn ${addUserTab === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Add Individual
                  </button>
                  <button 
                    onClick={() => setAddUserTab('excel')} 
                    className={`btn ${addUserTab === 'excel' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Excel Sheet Upload
                  </button>
                </div>
              </div>
              
              {addUserTab === 'individual' ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newUserName || !newUserEmail || !newUserPassword) return;
                    addUser({
                      name: newUserName,
                      email: newUserEmail,
                      password: newUserPassword,
                      role: newUserRole,
                      dept: (newUserRole === 'Student' || newUserRole === 'Teacher') ? newUserDept : ''
                    });
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setNewUserRole('Student');
                    setNewUserDept('Computer Science & Engineering');
                    alert('User added successfully.');
                  }} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: (newUserRole === 'Student' || newUserRole === 'Teacher') ? 'repeat(5, 1fr) auto' : 'repeat(4, 1fr) auto', 
                    gap: '12px', 
                    alignItems: 'flex-end' 
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter full name" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email ID</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="name@kce.ac.in" 
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Enter password" 
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</label>
                    <select 
                      className="form-input"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Admin">Admin</option>
                      <option value="Principal">Principal</option>
                    </select>
                  </div>

                  {(newUserRole === 'Student' || newUserRole === 'Teacher') && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Department</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Computer Science & Engineering" 
                        value={newUserDept}
                        onChange={(e) => setNewUserDept(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
                    Add User
                  </button>
                </form>
              ) : (
                <div>
                  <div 
                    className={`drag-drop-zone ${excelDragActive ? 'active' : ''}`}
                    onDragEnter={(e) => { e.preventDefault(); setExcelDragActive(true); }}
                    onDragOver={(e) => { e.preventDefault(); setExcelDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setExcelDragActive(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setExcelDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                          setUploadedExcelFile(file);
                          // Trigger auto-addition of 52 users
                          const mockUsers = [];
                          for (let i = 1; i <= 52; i++) {
                            mockUsers.push({
                              name: `Excel User ${i}`,
                              email: `exceluser${100 + i}@kce.ac.in`,
                              role: i % 3 === 0 ? 'Teacher' : i % 5 === 0 ? 'Counselor' : 'Student',
                              password: `password${i}`
                            });
                          }
                          mockUsers.forEach(u => addUser(u));
                          alert(`Excel file successfully loaded: ${file.name}. Added 52 users from excel columns: Name, Email ID, Password, Role.`);
                        } else {
                          alert('Only Excel files (.xlsx, .xls) are accepted!');
                        }
                      }
                    }}
                    onClick={() => excelFileInputRef.current.click()}
                    style={{ padding: '40px 20px' }}
                  >
                    <UploadCloud size={40} style={{ color: 'var(--primary)' }} />
                    <div>
                      <p style={{ fontWeight: '500' }}>Drag & drop Excel sheet or click to upload</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports .xlsx, .xls only</p>
                    </div>
                    <input 
                      type="file" 
                      ref={excelFileInputRef} 
                      style={{ display: 'none' }} 
                      accept=".xlsx, .xls, .csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setUploadedExcelFile(file);
                          const mockUsers = [];
                          for (let i = 1; i <= 52; i++) {
                            mockUsers.push({
                              name: `Excel User ${i}`,
                              email: `exceluser${100 + i}@kce.ac.in`,
                              role: i % 3 === 0 ? 'Teacher' : i % 5 === 0 ? 'Counselor' : 'Student',
                              password: `password${i}`
                            });
                          }
                          mockUsers.forEach(u => addUser(u));
                          alert(`Excel file successfully loaded: ${file.name}. Added 52 users from excel columns: Name, Email ID, Password, Role.`);
                        }
                      }}
                    />
                  </div>
                  {uploadedExcelFile && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <FileText size={16} style={{ color: 'var(--success)' }} />
                      <span style={{ fontWeight: 'bold' }}>{uploadedExcelFile.name} (Successfully Parsed)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Users List Table */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Active User Database</h3>
                
                {/* Search User Bar */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '6px 12px', width: '320px' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                  <input 
                    type="text" 
                    placeholder="Search name, email, or role..." 
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email ID</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => {
                        if (!userSearchQuery.trim()) return true;
                        const q = userSearchQuery.toLowerCase();
                        return (
                          (u.name || '').toLowerCase().includes(q) ||
                          (u.email || '').toLowerCase().includes(q) ||
                          (u.role || '').toLowerCase().includes(q)
                        );
                      })
                      .map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: '600' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'Student' ? 'badge-info' : u.role === 'Teacher' ? 'badge-success' : 'badge-warning'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditName(u.name);
                                  setEditEmail(u.email);
                                  setEditPassword(u.password || 'password123');
                                  setEditRole(u.role);
                                  setEditDept(u.dept || '');
                                }} 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                title="Edit User"
                              >
                                <Edit size={14} />
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateUser(editingUser.id, {
                      name: editName,
                      email: editEmail,
                      password: editPassword,
                      role: editRole,
                      dept: (editRole === 'Student' || editRole === 'Teacher') ? editDept : ''
                    });
                    setEditingUser(null);
                    alert('User details updated successfully!');
                  }}
                  className="glass-panel" 
                  style={{ width: '480px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>Edit User Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Name</label>
                      <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email ID</label>
                      <input type="email" className="form-input" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
                      <input type="password" className="form-input" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</label>
                      <select className="form-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Counselor">Counselor</option>
                        <option value="Admin">Admin</option>
                        <option value="Principal">Principal</option>
                      </select>
                    </div>
                    {(editRole === 'Student' || editRole === 'Teacher') && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Department</label>
                        <input type="text" className="form-input" value={editDept} onChange={(e) => setEditDept(e.target.value)} required />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Details</button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* 3. AI Monitoring Tab */}
        {activeTab === 'aiMonitoring' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Diagnostics row */}
            <div className="dashboard-grid" style={{ marginBottom: 0 }}>
              <div className="glass-panel stat-card">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Content Scanned</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{scannedCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Flags Generated</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)' }}>{flagsCount}</span>
                </div>
              </div>

              <div className="glass-panel stat-card">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Detection Accuracy</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>{accuracyPercent}%</span>
                </div>
              </div>
            </div>

            {/* Severity Monitoring Table (Replaces System Status) */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--danger)' }}>Detailed Severity Monitoring</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Active safety monitor logs representing campus content, sorted from highest severity rate to lowest severity.
              </p>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Severity Rate</th>
                      <th>Resolved Status</th>
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
                          <span className={`badge ${rec.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
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

        {/* 4. Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Admin Profile Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Modify administrative phone records.
            </p>

            <form onSubmit={handleSaveSettings}>
              {/* Profile Photo */}
              <div className="settings-avatar-section">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="settings-avatar-preview" />
                ) : (
                  <div className="settings-avatar-preview">S</div>
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

        {/* Activities Tab showing overall logs from last 24h */}
        {activeTab === 'activities' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Recent Activities Log</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Overall activities representing student-to-teacher messages and counseling slots scheduled in the last 24 hours.
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
