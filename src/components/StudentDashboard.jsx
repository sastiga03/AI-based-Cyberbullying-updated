import { 
  MessageSquare, Bell, FileText, CheckCircle, CheckCircle2, User, LogOut, 
  UploadCloud, Send, ShieldAlert, BookOpen, Settings, AlertTriangle, 
  Paperclip, Camera, Save, Info, UserCheck, Phone, MapPin, Calendar,
  Sun, Moon, Clock, Download, Check, RefreshCw
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { STUDENT_RULES } from '../mockData';
import { analyzeCyberbullying } from '../utils/aiDetector';
import { MAIN_API_URL } from '../config';

export default function StudentDashboard({ 
  user, 
  onLogout, 
  announcements, 
  readAnnouncements = [],
  markAnnouncementAsRead, 
  tasks: rawTasks, 
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
  bookCounseling,
  users = [],
  cases = [],
  uploadFile
}) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('student_active_tab') || 'dashboard');
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatInputs, setChatInputs] = useState({});
  
  const [taskSuccessModal, setTaskSuccessModal] = useState(false);
  const [reportSuccessModal, setReportSuccessModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('student_active_tab', activeTab);
  }, [activeTab]);
  
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedContact, activeTab]);

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

  const isDeptMatch = (dept1, dept2) => {
    const d1 = (dept1 || '').trim().toLowerCase();
    const d2 = (dept2 || '').trim().toLowerCase();
    if (!d1 || !d2) return false;
    if (d1 === d2 || d1.includes(d2) || d2.includes(d1)) return true;
    
    const clean = (s) => s.replace(/and/g, '').replace(/&/g, '').replace(/[^a-z0-9]/g, '');
    const c1 = clean(d1);
    const c2 = clean(d2);
    if (c1 === c2 || c1.includes(c2) || c2.includes(c1)) return true;

    const aliases = {
      'cse': ['computer science', 'computerscienceengineering', 'computerscience', 'cse'],
      'it': ['information technology', 'informationtechnology', 'it'],
      'ece': ['electronics communication', 'electronicscommunicationengineering', 'electronicscommunication', 'ece'],
      'civil': ['civil engineering', 'civilengineering', 'civil'],
      'eee': ['electrical electronics', 'electricalelectronicsengineering', 'electricalelectronics', 'eee'],
      'mech': ['mechanical engineering', 'mechanicalengineering', 'mechanical', 'mech']
    };

    let group1 = null;
    let group2 = null;
    
    for (const [key, list] of Object.entries(aliases)) {
      const cleanedList = list.map(clean);
      if (key === c1 || cleanedList.some(item => c1.includes(item) || item.includes(c1))) {
        group1 = key;
      }
      if (key === c2 || cleanedList.some(item => c2.includes(item) || item.includes(c2))) {
        group2 = key;
      }
    }
    
    if (group1 && group2 && group1 === group2) return true;
    
    return false;
  };

  const isTaskTargetedToStudent = (task, studentUser) => {
    if (!task.targetClass) return false;
    if (!studentUser || !studentUser.dept) return false;
    
    const targets = task.targetClass.split(',').map(d => d.trim().toLowerCase());
    const studentDept = studentUser.dept.trim().toLowerCase();
    
    return targets.some(target => isDeptMatch(target, studentDept));
  };

  const tasks = (rawTasks || []).filter(t => isTaskTargetedToStudent(t, user));

  // Calculate dynamic chat contacts (Student-to-Student within the same department)
  const chatContacts = new Map();
  // Add users from DB who are Students in the same department, excluding self and any teacher-like accounts
  users.forEach(u => {
    if (u.role === 'Student' && u.name !== user.name && !u.name.toLowerCase().includes('teacher')) {
      if (isDeptMatch(u.dept, user.dept)) {
        chatContacts.set(u.name, { name: u.name, role: u.role, id: u.id });
      }
    }
  });
  // Add historical chat contacts not in user table (excluding mock and teacher accounts)
  Object.keys(chats).forEach((name, idx) => {
    if (name !== user.name && !name.toLowerCase().includes('teacher') && name !== 'Jan She' && name !== 'Sanshetha S' && !chatContacts.has(name)) {
      chatContacts.set(name, { name: name, role: 'Student', id: 'history-' + idx });
    }
  });
  const contactsList = Array.from(chatContacts.values());

  useEffect(() => {
    if (activeTab === 'chat' && contactsList.length > 0) {
      if (!selectedContact || selectedContact === 'Jan She' || selectedContact === 'Sanshetha S' || !contactsList.some(c => c.name === selectedContact)) {
        setSelectedContact(contactsList[0].name);
      }
    }
  }, [activeTab, contactsList, selectedContact]);
  const [issueDragActive, setIssueDragActive] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState('');

  const departmentalTeachers = (users || []).filter(u => 
    (u.role || '').trim().toLowerCase() === 'teacher' && 
    isDeptMatch(u.dept, user.dept)
  );

  useEffect(() => {
    if (departmentalTeachers.length > 0) {
      const exists = departmentalTeachers.some(t => t.name === selectedTeacherName);
      if (!exists) {
        setSelectedTeacherName(departmentalTeachers[0].name);
      }
    } else {
      setSelectedTeacherName('');
    }
  }, [users, user.dept, departmentalTeachers]);

  // Settings State
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhotoUrl || null);

  useEffect(() => {
    setProfilePhoto(user?.profilePhotoUrl || null);
  }, [user?.profilePhotoUrl]);

  const [age, setAge] = useState(user.age || '20');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user.address || 'KCE Student Hostel, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Computer Science & Engineering');
  const [batch, setBatch] = useState(user.batch || '2023-2027');

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const reportFileInputRef = useRef(null);

  // Count unread announcements
  const unreadCount = announcements.filter(a => !readAnnouncements.includes(a.id)).length;

  // Chart data
  const assignedCount = tasks.length;
  const mySubmissions = (submissions || []).filter(s => 
    s.studentName === user.name && 
    tasks.some(t => t.title.toLowerCase() === (s.taskTitle || '').toLowerCase())
  );
  const completedCount = mySubmissions.length;
  const pendingCount = Math.max(0, assignedCount - completedCount);

  const chartData = [
    { name: 'Total Tasks', count: assignedCount },
    { name: 'Completed Tasks', count: completedCount },
    { name: 'Pending Tasks', count: pendingCount }
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
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      alert('Please upload a file before submitting.');
      return;
    }

    // Upload the file to server
    let fileUrl = '';
    if (uploadFile) {
      fileUrl = await uploadFile(uploadedFile);
    }
    
    // Submit task callback to parent state
    submitTask({
      taskTitle: selectedTaskToSubmit.title,
      fileName: uploadedFile.name,
      fileUrl: fileUrl,
      comment: taskComment
    });

    setTaskSuccessModal(true);
  };

  // Programmatic file downloader for submissions & resources directly to disk
  const handleDownloadFile = async (fileName, fileUrl, title) => {
    const cleanFileName = fileName || `${(title || 'academic_document').replace(/\s+/g, '_')}.pdf`;

    try {
      if (fileUrl && fileUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const cached = localStorage.getItem(`material_file_${cleanFileName}`) || localStorage.getItem(`material_file_${fileName}`);
      if (cached && cached.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = cached;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      if (fileUrl) {
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${MAIN_API_URL}${fileUrl}`;
        const res = await fetch(fullUrl);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = cleanFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
          return;
        }
      }
    } catch (e) {
      console.error("Error downloading file", e);
    }

    const content = `Karpagam College of Engineering - SafeGuard Platform\n\nAcademic Document: ${cleanFileName}\nUser: ${user.name}\nTimestamp: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName.includes('.') ? cleanFileName : cleanFileName + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      file: issueFile ? issueFile.name : null,
      teacherName: selectedTeacherName
    });

    setReportSuccessModal(true);
  };

  // Chat message send
  const handleSendMessage = (contactName) => {
    const text = chatInputs[contactName] || '';
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
      batch,
      profilePhotoUrl: profilePhoto
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
        const photoUrl = event.target.result;
        setProfilePhoto(photoUrl);
        updateProfile({ profilePhotoUrl: photoUrl });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const [readMaterials, setReadMaterials] = useState(() => {
    const stored = localStorage.getItem(`readMaterials_${user.email}`);
    return stored ? JSON.parse(stored) : [];
  });
  const handleMarkMaterialAsRead = (id) => {
    if (!readMaterials.includes(id)) {
      const next = [...readMaterials, id];
      setReadMaterials(next);
      localStorage.setItem(`readMaterials_${user.email}`, JSON.stringify(next));
    }
  };

  const [readChatMsgCounts, setReadChatMsgCounts] = useState(() => {
    const stored = localStorage.getItem(`readChatMsgCounts_${user.email}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    const initialCounts = {};
    Object.keys(chats || {}).forEach(name => {
      initialCounts[name] = (chats[name] || []).length;
    });
    return initialCounts;
  });

  useEffect(() => {
    localStorage.setItem(`readChatMsgCounts_${user.email}`, JSON.stringify(readChatMsgCounts));
  }, [readChatMsgCounts, user.email]);

  useEffect(() => {
    if (activeTab === 'chat' && selectedContact) {
      const totalMsgs = (chats[selectedContact] || []).length;
      setReadChatMsgCounts(prev => ({
        ...prev,
        [selectedContact]: totalMsgs
      }));
    }
  }, [selectedContact, activeTab, chats]);

  const incomingMessagesCount = contactsList.reduce((acc, u) => {
    const totalCount = (chats[u.name] || []).length;
    const readCount = readChatMsgCounts[u.name] || 0;
    const unreadCount = Math.max(0, totalCount - readCount);
    return acc + unreadCount;
  }, 0);

  const materialsCount = (materials || [])
    .filter(m => isDeptMatch(m.dept, user.dept))
    .filter(m => !readMaterials.includes(m.id))
    .length;
  const unreadAnnouncementsCount = (announcements || []).filter(a => !a.read).length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 16) return 'Good Afternoon';
    return 'Good Evening';
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
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <MessageSquare size={18} />
            <span>Chat with Friends</span>
            {incomingMessagesCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {incomingMessagesCount}
              </span>
            )}
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
            onClick={() => setActiveTab('materials')} 
            className={`sidebar-nav-item ${activeTab === 'materials' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <BookOpen size={18} />
            <span>Materials</span>
            {materialsCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {materialsCount}
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
              style={{ position: 'relative' }}
            >
              <MessageSquare size={20} />
              {incomingMessagesCount > 0 && (
                <span className="icon-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: '#fff', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '50%', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {incomingMessagesCount}
                </span>
              )}
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
              <div className="glass-panel chart-card" style={{ height: '350px' }}>
                <div className="chart-header">
                  <h3 style={{ fontSize: '1.1rem' }}>Task Completion Process</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Statistics</span>
                </div>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} name="Tasks Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Unread Announcements Quick Section */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '350px' }}>
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
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.content || ann.description || ''}</p>
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
               {announcements.map(ann => {
                const isRead = readAnnouncements.includes(ann.id);
                return (
                  <div 
                    key={ann.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      borderLeft: `4px solid ${isRead ? 'var(--text-muted)' : 'var(--primary)'}`,
                      background: isRead ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      opacity: isRead ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span className={`badge ${isRead ? 'badge-secondary' : 'badge-info'}`} style={{ marginBottom: '6px' }}>
                          {isRead ? 'Read' : 'Unread'}
                        </span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                          By Principal
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{ann.title}</h3>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '16px' }}>
                      {ann.content || ann.description || ''}
                    </p>
                    {!isRead && (
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
                );
              })}
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
                        <th>Subject</th>
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
                              <td>
                                <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                                  {task.subject || 'General'}
                                </span>
                              </td>
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
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map((sub, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{sub.taskTitle}</td>
                      <td>{sub.date}</td>
                      <td>
                        <span 
                          onClick={() => handleDownloadFile(sub.fileName, sub.fileUrl)}
                          style={{ textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          {sub.fileName}
                        </span>
                      </td>
                      <td>
                        {/* Mask the AI results for students except simple safe status */}
                        <span className={`badge ${sub.severityScore > 30 ? 'badge-warning' : 'badge-success'}`}>
                          {sub.severityScore > 30 ? 'Flagged' : 'Verified Safe'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {mySubmissions.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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
                {contactsList.length === 0 ? (
                  <div style={{ padding: '24px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No registered classmates found in your department.
                  </div>
                ) : contactsList.map(u => {
                  const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const lastMsg = chats[u.name]?.[chats[u.name]?.length - 1]?.text || 'No messages yet';
                  const avatarBg = 'var(--accent)';
                  const totalCount = (chats[u.name] || []).length;
                  const readCount = readChatMsgCounts[u.name] || 0;
                  const unreadCountForContact = Math.max(0, totalCount - readCount);
                  return (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedContact(u.name)} 
                      className={`chat-contact-item ${selectedContact === u.name ? 'active' : ''}`}
                    >
                      <div className="user-avatar-circle" style={{ background: avatarBg }}>{initials}</div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{u.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {unreadCountForContact > 0 && selectedContact !== u.name && (
                              <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                                {unreadCountForContact}
                              </span>
                            )}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Active
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {lastMsg}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Content Panel */}
            {selectedContact ? (
              <div className="chat-main-area">
                <div className="chat-header-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-avatar-circle" style={{ background: 'var(--accent)' }}>
                      {selectedContact.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{selectedContact}</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Active Now</span>
                    </div>
                  </div>
                </div>

                {/* Messages log */}
                <div className="chat-messages-log">
                  {(chats[selectedContact] || []).map((msg, idx) => {
                    const aiAnalysis = analyzeCyberbullying(msg.text);
                    const isFlagged = msg.isFlagged || aiAnalysis.isBullying;

                    return (
                      <div 
                        key={idx} 
                        className={`chat-bubble ${msg.sender === user.name ? 'sent' : 'received'} ${isFlagged ? 'flagged' : ''}`}
                        style={isFlagged ? {
                          border: '2px solid #ef4444',
                          background: 'rgba(239, 68, 68, 0.28)',
                          color: '#ffffff'
                        } : {}}
                      >
                        <p style={{ fontSize: '0.9rem' }}>{msg.text}</p>
                        {isFlagged && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#ff8080', fontWeight: 'bold', marginTop: '6px' }}>
                            <span>🛡️</span>
                            <span>AI Flagged: {aiAnalysis.category} ({aiAnalysis.severityScore}%)</span>
                          </div>
                        )}
                        <span style={{ display: 'block', fontSize: '0.65rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                          {msg.time}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Improved type a message input section */}
                <div className="chat-input-bar">
                  <div className="chat-input-container">
                    <input 
                      type="text" 
                      className="chat-input-field" 
                      placeholder="Type a message..."
                      value={chatInputs[selectedContact] || ''}
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
            ) : (
              <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', minHeight: '400px' }}>
                <MessageSquare size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>Conversation not yet started</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Select a friend from the conversations list on the left to start chatting.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. Report Issue View */}
        {activeTab === 'report' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Reported Issues History */}
            <div className="glass-panel" style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Reported Issues</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '16px' }}>
                Your submitted reports log.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cases.filter(c => c.studentName === user.name).length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    No reports submitted yet.
                  </p>
                ) : (
                  cases.filter(c => c.studentName === user.name).map(c => (
                    <div key={c.id} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span>{c.content ? c.content.split(':')[0] : 'Report'}</span>
                        <span className={`badge ${c.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '2px 4px' }}>
                          {c.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.content ? c.content.split(':').slice(1).join(':').trim() : ''}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Submit Form */}
            <div className="glass-panel" style={{ padding: '32px' }}>
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
                    Choose Teacher (Same Department) *
                  </label>
                  {departmentalTeachers.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--warning)', fontStyle: 'italic', margin: 0 }}>
                      No teachers found for department: {dept}. Please add a teacher from Admin Dashboard first.
                    </p>
                  ) : (
                    <select 
                      className="form-input"
                      value={selectedTeacherName}
                      onChange={(e) => setSelectedTeacherName(e.target.value)}
                      required
                    >
                      {departmentalTeachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  )}
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
                  <button type="submit" className="btn btn-primary" disabled={departmentalTeachers.length === 0}>
                    Submit To Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Book Counseling View */}
        {activeTab === 'bookCounseling' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Book Counselor Session</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Connect with Karpagam College of Engineering's student counseling services.
                </p>
              </div>
              {!showCounselingForm && (
                <button 
                  onClick={() => setShowCounselingForm(true)} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Calendar size={16} />
                  <span>Book Counseling</span>
                </button>
              )}
            </div>

            {showCounselingForm ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                bookCounseling({
                  studentName: user.name,
                  rollNo: counselingRollNo,
                  dept: counselingDept,
                  reason: counselingReason,
                  email: user.email
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
                  const validStudentSlots = (counselingSlots || []).filter(s => {
                    if (!s) return false;
                    const r = String(s.reason || '').toLowerCase().trim();
                    if (r.includes('experiencing stress regarding exam schedule')) return false;
                    if (r.includes('i wanna talk to you') || r.includes('wanna talk')) return false;
                    return true;
                  });

                  const mySlots = validStudentSlots.filter(s => {
                    if (!s.studentName) return true;
                    const sName = String(s.studentName).trim().toLowerCase();
                    const uName = String(user?.name || '').trim().toLowerCase();
                    const uEmail = String(user?.email || '').trim().toLowerCase();
                    return sName === uName || sName === uEmail || (uName && (sName.includes(uName) || uName.includes(sName)));
                  });

                  const latestSlot = mySlots.length > 0 ? mySlots[mySlots.length - 1] : null;
                  const isFinished = latestSlot && (latestSlot.status === 'Finished' || latestSlot.status === 'Completed');
                  const isPending = latestSlot && latestSlot.status === 'Pending';

                  return (
                    <div 
                      className="glass-panel" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '16px', 
                        padding: '24px', 
                        background: isFinished ? 'rgba(16, 185, 129, 0.08)' : (isPending && latestSlot?.timings) ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)',
                        borderLeft: isFinished ? '5px solid var(--success)' : (isPending && latestSlot?.timings) ? '5px solid var(--danger)' : '5px solid var(--primary)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: isFinished ? 'var(--success)' : (isPending && latestSlot?.timings) ? 'var(--danger)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem', fontWeight: 'bold' }}>
                            MJ
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold' }}>{latestSlot?.counselorName || 'Meena Jegan'}</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Student Counselor</p>
                          </div>
                        </div>

                        {latestSlot && (
                          <span className={`badge ${isFinished ? 'badge-success' : (isPending && latestSlot?.timings) ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                            {latestSlot.status}
                          </span>
                        )}
                      </div>

                      {latestSlot ? (
                        <div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <strong>Reason:</strong> {latestSlot.reason}
                          </p>

                          {latestSlot.timings && (
                            <p style={{ fontSize: '0.9rem', color: isFinished ? 'var(--success)' : (isPending && latestSlot?.timings) ? 'var(--danger)' : 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                              Scheduled Timing: {latestSlot.timings}
                            </p>
                          )}

                          {isFinished && (
                            <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', borderRadius: '6px', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={18} />
                              <span>Counselling ended successfully</span>
                            </div>
                          )}

                          {isPending && latestSlot?.timings && (
                            <div style={{ marginTop: '12px' }}>
                              <button 
                                onClick={() => setShowCounselingForm(true)} 
                                className="btn btn-secondary"
                                style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.85rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <RefreshCw size={14} />
                                <span>ReSchedule Counseling</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: '0.85rem' }}>No active counseling booked yet. Click "Book Counseling" above to request a session.</p>
                        </div>
                      )}
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

        {/* 6. Materials View */}
        {activeTab === 'materials' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            {(() => {
              const getCanonicalTeacherName = (rawName) => {
                if (!rawName) return '';
                const trimmed = rawName.trim();
                const clean = trimmed.replace(/^prof\.?\s*/i, '').replace(/^dr\.?\s*/i, '').replace(/^mr\.?\s*/i, '').replace(/^mrs\.?\s*/i, '').replace(/\s+/g, ' ').trim();
                
                if (clean.toLowerCase().includes('anand')) return 'Prof. Anand Kumar';
                
                const matchUser = (users || []).find(u => {
                  const un = (u.name || '').toLowerCase().replace(/^prof\.?\s*/i, '').replace(/\s+/g, '');
                  return un === clean.toLowerCase().replace(/\s+/g, '');
                });
                if (matchUser) return matchUser.name.startsWith('Prof.') ? matchUser.name : `Prof. ${matchUser.name}`;

                return trimmed.startsWith('Prof.') ? trimmed : `Prof. ${trimmed}`;
              };

              const normalizeTeacherName = (name) => {
                if (!name) return '';
                return name
                  .toLowerCase()
                  .replace(/^prof\.?\s*/i, '')
                  .replace(/^dr\.?\s*/i, '')
                  .replace(/^mr\.?\s*/i, '')
                  .replace(/^mrs\.?\s*/i, '')
                  .replace(/\s+/g, '')
                  .trim();
              };

              const isTeacherMatch = (name1, name2) => {
                if (!name1 || !name2) return false;
                const n1 = normalizeTeacherName(name1);
                const n2 = normalizeTeacherName(name2);
                return n1 === n2 || n1.includes(n2) || n2.includes(n1);
              };

              const normalizeDept = (dept) => {
                if (!dept) return 'cse';
                const d = dept.trim().toLowerCase();
                if (d.includes('cse') || d.includes('computer')) return 'cse';
                if (d.includes('it') || d.includes('information')) return 'it';
                if (d.includes('ai') || d.includes('artificial') || d.includes('ad')) return 'ai';
                if (d.includes('ece') || d.includes('electronic') || d.includes('comm')) return 'ece';
                if (d.includes('civil')) return 'civil';
                if (d.includes('mech')) return 'mech';
                if (d.includes('eee') || d.includes('electrical')) return 'eee';
                return d;
              };

              const isDeptMatch = (dept1, dept2) => {
                if (!dept1 || !dept2) return true;
                return normalizeDept(dept1) === normalizeDept(dept2);
              };

              if (selectedTeacherMaterials) {
                // Find all materials matching this selected teacher
                const teacherMaterials = (materials || []).filter(m => {
                  const nameMatch = getCanonicalTeacherName(m.teacherName) === selectedTeacherMaterials || isTeacherMatch(m.teacherName, selectedTeacherMaterials);
                  return nameMatch && isDeptMatch(m.dept, user.dept);
                });

                return (
                  <div>
                    <button 
                      onClick={() => setSelectedTeacherMaterials(null)} 
                      className="btn btn-secondary" 
                      style={{ marginBottom: '20px', fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                      ← Back to Teachers
                    </button>

                    <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                      Materials by {selectedTeacherMaterials}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                      Access course materials, notes, and academic references posted for your department.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {teacherMaterials.map(mat => {
                        const isRead = readMaterials.includes(mat.id);

                        return (
                          <div key={mat.id} className="glass-panel" style={{ padding: '22px', background: 'var(--bg-tertiary)', borderLeft: isRead ? '4px solid var(--border-glass)' : '4px solid var(--primary)', opacity: isRead ? 0.85 : 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{mat.title}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                                  {mat.subject || 'General'}
                                </span>
                                {isRead && (
                                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                    Read
                                  </span>
                                )}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mat.date}</span>
                              </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                              {mat.description}
                            </p>

                            {mat.fileName && (
                              <div 
                                onClick={() => handleDownloadFile(mat.fileName, mat.fileUrl, mat.title)}
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '8px', 
                                  padding: '8px 14px', 
                                  background: 'var(--bg-secondary)', 
                                  borderRadius: '6px', 
                                  border: '1px solid var(--border-glass)',
                                  cursor: 'pointer',
                                  marginBottom: '16px'
                                }}
                                title="Click to download original file"
                              >
                                <FileText size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'underline' }}>
                                  {mat.fileName}
                                </span>
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Faculty: <strong>{getCanonicalTeacherName(mat.teacherName)}</strong> {mat.dept ? `(${mat.dept})` : ''}
                              </span>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                {isRead ? (
                                  <button 
                                    disabled 
                                    className="btn btn-secondary" 
                                    style={{ fontSize: '0.8rem', padding: '6px 14px', opacity: 0.6, cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <Check size={14} style={{ color: 'var(--success)' }} />
                                    <span>Read</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleMarkMaterialAsRead(mat.id)} 
                                    className="btn btn-secondary" 
                                    style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>Mark as Read</span>
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleDownloadFile(mat.fileName, mat.fileUrl, mat.title)}
                                  className="btn btn-primary" 
                                  style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Download size={14} />
                                  <span>Download PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {teacherMaterials.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No materials posted by {selectedTeacherMaterials} yet.</p>
                          <p style={{ fontSize: '0.8rem' }}>Check back later or explore resources from other department teachers.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 1. Gather all teachers from materials
              const activeMaterials = (materials || []).filter(m => isDeptMatch(m.dept, user.dept));
              const materialTeacherNames = Array.from(new Set(activeMaterials.map(m => getCanonicalTeacherName(m.teacherName)).filter(Boolean)));

              // 2. Teachers from users database
              const registeredTeachers = (users || [])
                .filter(u => u.role === 'Teacher' && isDeptMatch(u.dept, user.dept))
                .map(u => getCanonicalTeacherName(u.name));

              // Combined UNIQUE Canonical Teachers (Only real registered teachers or teachers with uploaded materials)
              const uniqueTeachers = Array.from(new Set([
                ...materialTeacherNames,
                ...registeredTeachers
              ])).filter(Boolean);

              return (
                <div>
                  <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Teacher Materials & Classrooms</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Select a faculty member from your department (<strong>{user.dept || 'Computer Science & Engineering'}</strong>) to view posted materials.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    {uniqueTeachers.map((teacherName, idx) => {
                      const teacherObj = (users || []).find(u => getCanonicalTeacherName(u.name) === teacherName || isTeacherMatch(u.name, teacherName));
                      const teacherMats = (materials || []).filter(m => {
                        const nameMatch = getCanonicalTeacherName(m.teacherName) === teacherName || isTeacherMatch(m.teacherName, teacherName);
                        return nameMatch && isDeptMatch(m.dept, user.dept);
                      });

                      const totalMatsCount = teacherMats.length;
                      const unreadCount = teacherMats.filter(m => !readMaterials.includes(m.id)).length;
                      const initial = teacherName.replace(/^prof\.?\s*/i, '').trim()[0] || 'T';

                      return (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedTeacherMaterials(teacherName)} 
                          className="glass-panel glass-panel-hover" 
                          style={{ padding: '24px', cursor: 'pointer', textAlign: 'center', background: 'var(--bg-tertiary)' }}
                        >
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {initial}
                          </div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>{teacherName}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {teacherObj?.batch || (teacherMats.length > 0 ? teacherMats.map(m => m.title).slice(0, 2).join(', ') : 'Faculty Course Incharge')}
                          </p>
                          {totalMatsCount === 0 ? (
                            <span className="badge badge-secondary" style={{ marginTop: '10px', fontSize: '0.75rem', opacity: 0.8 }}>
                              no materials
                            </span>
                          ) : unreadCount > 0 ? (
                            <span className="badge badge-info" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                              {unreadCount} {unreadCount === 1 ? 'material' : 'materials'}
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                              All Read ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {uniqueTeachers.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                      No faculty materials published for your department yet.
                    </div>
                  )}
                </div>
              );
            })()}
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

      {/* Task Submitted Success Modal */}
      {taskSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Task Submitted Successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Your assignment file and response have been uploaded successfully.</p>
            <button
              type="button"
              onClick={() => {
                setTaskSuccessModal(false);
                setSelectedTaskToSubmit(null);
                setUploadedFile(null);
                setTaskComment('');
                setActiveTab('tasks');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Report Submitted Success Modal */}
      {reportSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Report Submitted to Teacher Successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Your report statement has been delivered securely to your teacher.</p>
            <button
              type="button"
              onClick={() => {
                setReportSuccessModal(false);
                setIssueType('Cyber bullying');
                setIssueDesc('');
                setIssueFile(null);
                setActiveTab('report');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
