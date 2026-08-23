import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, FileText, CheckCircle, CheckCircle2, User, LogOut, 
  UploadCloud, Send, ShieldAlert, BookOpen, Settings, AlertTriangle, 
  Paperclip, Camera, Save, Eye, EyeOff, PlusCircle, Check, ArrowRight,
  Sun, Moon, Plus, Bell, FileDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { analyzeCyberbullying } from '../utils/aiDetector';

export default function TeacherDashboard({ 
  user, 
  onLogout, 
  tasks, 
  hiddenTasks, 
  publishHiddenTask, 
  createNewTask, 
  submissions, 
  forwardSubmissionToCounselor, 
  messages, 
  forwardMessageToCounselor, 
  updateProfile, 
  theme, 
  toggleTheme, 
  materials, 
  addMaterial, 
  announcements, 
  readAnnouncements = [], 
  markAnnouncementAsRead, 
  forwardedMessages = [], 
  forwardedSubmissions = [], 
  uploadFile,
  users = []
}) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('teacher_active_tab') || 'dashboard');

  const teacherSubjects = user.subjects ? user.subjects.split(', ').map(s => s.trim()) : (user.batch ? [user.batch] : []);

  const defaultDepts = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical & Electronics Engineering'
  ];
  const availableDepartments = Array.from(new Set([
    ...defaultDepts,
    ...(users || []).map(u => u.dept).filter(Boolean)
  ]));

  const [taskCreatedModal, setTaskCreatedModal] = useState(false);
  const [forwardedMessageModal, setForwardedMessageModal] = useState(false);
  const [materialUploadedModal, setMaterialUploadedModal] = useState(false);
  const [hiddenTaskCreatedModal, setHiddenTaskCreatedModal] = useState(false);
  const [hiddenTaskPublishedModal, setHiddenTaskPublishedModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('teacher_active_tab', activeTab);
  }, [activeTab]);

  const isNameMatch = (name1, name2) => {
    const n1 = (name1 || '').trim().toLowerCase();
    const n2 = (name2 || '').trim().toLowerCase();
    if (!n1 || !n2) return false;
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  const isDeptMatch = (dept1, dept2) => {
    const d1 = (dept1 || '').trim().toLowerCase();
    const d2 = (dept2 || '').trim().toLowerCase();
    if (!d1 || !d2) return false;
    return d1 === d2 || d1.includes(d2) || d2.includes(d1);
  };

  const filteredMessages = (messages || []).filter(msg => {
    const nameMatch = !msg.teacherName || isNameMatch(msg.teacherName, user.name);
    if (!nameMatch) return false;

    const student = (users || []).find(u => 
      (u.name || '').trim().toLowerCase() === (msg.studentName || '').trim().toLowerCase()
    );

    if (student && user.dept) {
      return isDeptMatch(student.dept, user.dept);
    }
    return true;
  });

  const teacherUnreadMessagesCount = filteredMessages.filter(msg => !forwardedMessages.includes(msg.id)).length;

  const unreadAnnouncementsCount = (announcements || []).filter(a => !readAnnouncements.includes(a.id)).length;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 16) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Create Task states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskClass, setNewTaskClass] = useState('Computer Science & Engineering');
  const [selectedDepts, setSelectedDepts] = useState(['Computer Science & Engineering']);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState('');

  // Switch Class state
  const [selectedClass, setSelectedClass] = useState('III Year Computer Science');
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Submissions drilldown state
  const [selectedSubmissionTask, setSelectedSubmissionTask] = useState(null);

  // Document preview state
  const [previewFile, setPreviewFile] = useState(null);

  // Materials manager states
  const [materialsView, setMaterialsView] = useState('list'); // 'list' or 'create'
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialDesc, setNewMaterialDesc] = useState('');
  const [newMaterialDept, setNewMaterialDept] = useState(
    (user.dept === 'Computer Science & Engineering' || user.dept === 'Information & Technology') 
      ? user.dept 
      : 'Computer Science & Engineering'
  );
  const [newMaterialFile, setNewMaterialFile] = useState(null);
  const [newMaterialDragActive, setNewMaterialDragActive] = useState(false);
  const [newMaterialSubject, setNewMaterialSubject] = useState('');
  const materialFileInputRef = useRef(null);

  // Announcements scrolling ref
  const announcementsRef = useRef(null);

  const handleDownloadFile = async (fileName, fileUrl, studentName) => {
    const cleanFileName = fileName || 'academic_document.pdf';
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
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8082${fileUrl}`;
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

    const content = `Karpagam College of Engineering - SafeGuard Platform\n\nAcademic Document: ${cleanFileName}\nUser: ${studentName || user.name}\nTimestamp: ${new Date().toLocaleString()}`;
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

  // Create Hidden Task states
  const [showCreateHiddenTaskModal, setShowCreateHiddenTaskModal] = useState(false);
  const [hiddenTaskTitle, setHiddenTaskTitle] = useState('');
  const [hiddenTaskFile, setHiddenTaskFile] = useState(null);
  const [hiddenTaskDueDate, setHiddenTaskDueDate] = useState('');
  const [hiddenTaskDepts, setHiddenTaskDepts] = useState(['Computer Science & Engineering']);
  const [showHiddenDeptDropdown, setShowHiddenDeptDropdown] = useState(false);
  const [isCreatingHiddenTask, setIsCreatingHiddenTask] = useState(false);
  const [hiddenTaskSubject, setHiddenTaskSubject] = useState('');

  const handleCreateHiddenTask = async (e) => {
    e.preventDefault();
    if (!hiddenTaskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }
    if (!hiddenTaskDueDate) {
      alert("Please select a due date.");
      return;
    }
    if (hiddenTaskDepts.length === 0) {
      alert("Please select at least one department.");
      return;
    }
    if (!hiddenTaskSubject) {
      alert("Please select a subject.");
      return;
    }
    if (!hiddenTaskFile) {
      alert("Please upload a reference PDF file.");
      return;
    }
    if (!hiddenTaskFile.name.toLowerCase().endsWith('.pdf')) {
      alert("Only PDF reference files are allowed.");
      return;
    }

    setIsCreatingHiddenTask(true);
    try {
      let fileUrl = '';
      if (uploadFile) {
        fileUrl = await uploadFile(hiddenTaskFile);
      }
      
      await createNewTask({
        title: hiddenTaskTitle,
        desc: 'Hidden Reference Task',
        dueDate: hiddenTaskDueDate,
        targetClass: hiddenTaskDepts.join(', '),
        subject: hiddenTaskSubject,
        fileName: hiddenTaskFile.name,
        fileUrl: fileUrl,
        visible: false
      });

      setShowCreateHiddenTaskModal(false);
      setHiddenTaskTitle('');
      setHiddenTaskDueDate('');
      setHiddenTaskDepts(['Computer Science & Engineering']);
      setHiddenTaskSubject('');
      setHiddenTaskFile(null);
      setShowHiddenDeptDropdown(false);
      setHiddenTaskCreatedModal(true);
    } catch (err) {
      console.error(err);
      alert("Failed to create hidden task.");
    } finally {
      setIsCreatingHiddenTask(false);
    }
  };

  // Filter for submissions
  const [submissionFilter, setSubmissionFilter] = useState('All'); // 'All' | 'Flagged' | 'Safe'

  // Settings states
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhotoUrl || null);

  useEffect(() => {
    setProfilePhoto(user?.profilePhotoUrl || null);
  }, [user?.profilePhotoUrl]);

  const [age, setAge] = useState(user.age || '42');
  const [phone, setPhone] = useState(user.phone || '+91 94432 12345');
  const [address, setAddress] = useState(user.address || 'KCE Staff Quarters, Coimbatore');
  const [dept, setDept] = useState(user.dept || 'Computer Science & Engineering');
  const [batch, setBatch] = useState(user.batch || 'Faculty');

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const uniqueDepartments = Array.from(new Set([
    "Information & Technology",
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Artificial Intelligence & Data Science",
    ...((users || [])
      .map(u => u.dept)
      .filter(Boolean)
      .map(d => d.trim()))
  ]));

  const emailPrefix = (user.email || '').split('@')[0].toLowerCase();
  const myTasks = tasks.filter(t => (t.instructor || '').trim().toLowerCase() === emailPrefix);
  const myHiddenTasks = hiddenTasks.filter(t => (t.instructor || '').trim().toLowerCase() === emailPrefix);

  const myTasksTitles = [
    ...myTasks.map(t => t.title.toLowerCase()),
    ...myHiddenTasks.map(t => t.title.toLowerCase())
  ];
  const mySubmissions = submissions.filter(s => myTasksTitles.includes((s.taskTitle || '').toLowerCase()));

  // 1. Chart Data
  // Submission Analytics
  const totalTasksCount = myTasks.length + myHiddenTasks.length;
  const totalSubsCount = mySubmissions.length;

  const submissionAnalyticsData = [
    { name: 'Total Tasks', count: totalTasksCount },
    { name: 'Total Submissions', count: totalSubsCount }
  ];

  // Class Task Completion
  const classCompletionData = [
    { name: 'CSE A', completionRate: 85 },
    { name: 'IYB', completionRate: 70 },
    { name: 'AD C', completionRate: 92 },
    { name: 'ECE C', completionRate: 64 }
  ];

  // Drag and Drop helpers for Create Task
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

  // Submit Create Task
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDueDate || !newTaskSubject) {
      alert('Please fill out Title, Due Date, and Subject.');
      return;
    }

    createNewTask({
      title: newTaskTitle,
      desc: newTaskDesc,
      dueDate: newTaskDueDate,
      targetClass: newTaskClass,
      subject: newTaskSubject,
      fileName: uploadedFile ? uploadedFile.name : ''
    });

    setTaskCreatedModal(true);
  };

  // Forward submission to counselor
  const handleForwardSubmission = (sub) => {
    forwardSubmissionToCounselor(sub);
    alert('Case successfully forwarded to Counselor.');
  };

  // Forward message to counselor
  const handleForwardMessage = (msg) => {
    forwardMessageToCounselor(msg);
    setForwardedMessageModal(true);
  };

  // Save changes settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateProfile({ age, phone, address, profilePhotoUrl: profilePhoto });
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

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <span className="logo-k" style={{ fontSize: '1.8rem' }}>K</span>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>KCE SafeGuard</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Faculty Workspace</span>
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
            onClick={() => setActiveTab('createTask')} 
            className={`sidebar-nav-item ${activeTab === 'createTask' ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Create Task</span>
          </li>
          <li 
            onClick={() => { setActiveTab('submissions'); setSelectedSubmissionTask(null); }} 
            className={`sidebar-nav-item ${activeTab === 'submissions' ? 'active' : ''}`}
          >
            <CheckCircle2 size={18} />
            <span>Student Submissions</span>
          </li>
          <li 
            onClick={() => setActiveTab('messages')} 
            className={`sidebar-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <MessageSquare size={18} />
            <span>Student Messages</span>
            {teacherUnreadMessagesCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                {teacherUnreadMessagesCount}
              </span>
            )}
          </li>
          <li 
            onClick={() => {
              setActiveTab('materials');
              setMaterialsView('list');
            }} 
            className={`sidebar-nav-item ${activeTab === 'materials' ? 'active' : ''}`}
          >
            <Plus size={18} />
            <span>View & upload Materials</span>
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{getGreeting()}, {user.name}!</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <span>Tutor</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontWeight: '600' }}>{user.dept || 'Computer Science & Engineering'}</span>
              {(user.subjects || user.batch) && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontWeight: '600', color: 'var(--accent)' }}>Handling: {user.subjects || user.batch}</span>
                </>
              )}
            </div>
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

            {/* Email/Message icon navigates to Student Messages */}
            <button 
              onClick={() => setActiveTab('messages')} 
              className="icon-badge-btn" 
              title="Student Messages"
              style={{ position: 'relative' }}
            >
              <MessageSquare size={20} />
              {teacherUnreadMessagesCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {teacherUnreadMessagesCount}
                </span>
              )}
            </button>

            <div className="user-menu-trigger">
              {profilePhoto ? (
                <img src={profilePhoto} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="user-avatar-circle" style={{ background: 'var(--primary)' }}>AK</div>
              )}
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Instructor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        
        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Top Stat Cards */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div 
                onClick={() => { setActiveTab('submissions'); setSelectedSubmissionTask(null); }}
                className="glass-panel stat-card glass-panel-hover" 
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL TASKS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalTasksCount}</span>
                </div>
              </div>

              <div 
                onClick={() => { setActiveTab('submissions'); setSelectedSubmissionTask(null); }}
                className="glass-panel stat-card glass-panel-hover" 
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ background: 'var(--success-glow)', color: 'var(--success)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL SUBMISSIONS</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{totalSubsCount}</span>
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
              
              {/* Submission Analytics Graph */}
              <div className="glass-panel chart-card">
                <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Submission Analytics</h3>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <BarChart data={submissionAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Hidden Task Management (Replaces Recent Student Submissions) */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Hidden Task Management</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks hidden from students until published</span>
                </div>
                <button 
                  onClick={() => setShowCreateHiddenTaskModal(true)} 
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Create hidden task
                </button>
              </div>

              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Subject</th>
                      <th>Reference File</th>
                      <th>Visible to Students</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHiddenTasks.map(task => {
                      const fName = task.fileName || task.file || 'reference.pdf';
                      const fUrl = task.fileUrl;
                      return (
                        <tr key={task.id}>
                          <td style={{ fontWeight: '600' }}>{task.title}</td>
                          <td>
                            <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                              {task.subject || 'General'}
                            </span>
                          </td>
                          <td>
                            <span 
                              onClick={() => {
                                 if (fUrl) {
                                   window.open('http://localhost:8082' + fUrl, '_blank');
                                 } else {
                                  setPreviewFile(fName);
                                }
                              }}
                              style={{ textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileDown size={14} />
                              {fName}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              No
                            </span>
                          </td>
                        <td>
                          {task.visible ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '500' }}>Published</span>
                          ) : (
                            <button 
                              onClick={() => {
                                publishHiddenTask(task.id);
                                setHiddenTaskPublishedModal(true);
                              }}
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Publish Task"
                            >
                              <Eye size={14} />
                              <span>Publish</span>
                            </button>
                          )}
                        </td>
                        </tr>
                      );
                    })}
                    {myHiddenTasks.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          No hidden tasks.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements Scroll target below hidden tasks */}
            <div ref={announcementsRef} className="glass-panel" style={{ padding: '24px', marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} />
                <span>Campus Announcements</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Official campus circulars and notices broadcast by the Principal's Office.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {announcements && announcements.map(ann => {
                  const isRead = readAnnouncements.includes(ann.id);
                  return (
                    <div 
                      key={ann.id} 
                      style={{ 
                        background: 'var(--bg-tertiary)', 
                        padding: '16px', 
                        borderRadius: '10px', 
                        borderLeft: `4px solid ${isRead ? 'var(--text-muted)' : 'var(--accent)'}`, 
                        border: '1px solid var(--border-glass)',
                        opacity: isRead ? 0.75 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{ann.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                        Posted by: Principal
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{ann.content}</p>
                      {!isRead && (
                        <button
                          onClick={() => markAnnouncementAsRead(ann.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  );
                })}
                {(!announcements || announcements.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No announcements available.
                  </div>
                )}
              </div>
            </div>

            {/* Document Preview Modal */}
            {previewFile && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div className="glass-panel" style={{ width: '560px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={20} style={{ color: 'var(--primary)' }} />
                      <span>Document Preview - {previewFile}</span>
                    </h3>
                    <button onClick={() => setPreviewFile(null)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      Close
                    </button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {`=========================================
Karpagam College of Engineering
Department of Computer Science & Engineering
Academic Assignment Reference File: ${previewFile}
=========================================

Instructions:
1. Complete all problem statements in this document.
2. Submit your answers in PDF or ZIP format via the student dashboard.
3. Ensure no plagiarized content is submitted.
4. Safeguard AI monitoring is active on this portal.

Problems:
- Implement the requested code according to standard constraints.
- State time and space complexity for all algorithms.
- Provide sample test cases showing correct execution.

Deadline: Refer to dashboard instructions.`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button onClick={() => setPreviewFile(null)} className="btn btn-primary">
                      Done Reading
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Create Task Tab */}
        {activeTab === 'createTask' && (
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Create New Assignment</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Publish a new task with safety monitors active.
            </p>

            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Task Title *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="eg. Data Structures Assignment-Week4" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Describe the Task Requirements, objectives and evaluation..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Due Date *
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Class Selection
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Click to select departments..." 
                      value={newTaskClass}
                      readOnly
                      onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                      style={{ cursor: 'pointer' }}
                    />
                    {showDeptDropdown && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '100%', 
                        left: '0', 
                        right: '0', 
                        zIndex: '100', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        boxShadow: '0 -8px 16px rgba(0,0,0,0.3)', 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        {uniqueDepartments.map(deptName => {
                          const isSelected = selectedDepts.includes(deptName);
                          return (
                            <label key={deptName} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => {
                                  let updated;
                                  if (isSelected) {
                                    updated = selectedDepts.filter(d => d !== deptName);
                                  } else {
                                    updated = [...selectedDepts, deptName];
                                  }
                                  setSelectedDepts(updated);
                                  setNewTaskClass(updated.join(', '));
                                }}
                              />
                              {deptName}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Choose Subject *
                </label>
                <select 
                  className="form-input" 
                  value={newTaskSubject} 
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {teacherSubjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Reference File */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Upload Reference File (Optional)
                </label>
                <div 
                  className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <UploadCloud size={32} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '500' }}>Drag & drop or click to upload</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDF, DOC up to 20MB</p>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. Student Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            {selectedSubmissionTask ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>Submissions: {selectedSubmissionTask}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Viewing students who uploaded files for this assignment.</p>
                  </div>
                  <button onClick={() => setSelectedSubmissionTask(null)} className="btn btn-secondary">
                    Back to tasks list
                  </button>
                </div>

                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>File</th>
                        <th>AI Flag</th>
                        <th>Severity Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySubmissions
                        .filter(s => s.taskTitle === selectedSubmissionTask)
                        .map(sub => (
                          <tr key={sub.id}>
                            <td style={{ fontWeight: '600' }}>{sub.studentName}</td>
                            <td>
                              <span 
                                onClick={() => handleDownloadFile(sub.fileName, sub.fileUrl, sub.studentName)}
                                style={{ textDecoration: 'underline', color: 'var(--primary)', cursor: 'pointer' }}
                              >
                                {sub.fileName}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${sub.flagStatus === 'Flagged' ? 'badge-danger' : 'badge-success'}`}>
                                {sub.flagStatus}
                              </span>
                            </td>
                            <td style={{ fontWeight: 'bold', color: sub.severityScore > 50 ? 'var(--danger)' : 'inherit' }}>
                              {sub.severityScore}%
                            </td>
                            <td>
                              {sub.flagStatus === 'Flagged' ? (
                                forwardedSubmissions.includes(sub.id) ? (
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'not-allowed' }}
                                    disabled
                                  >
                                    Forwarded
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleForwardSubmission(sub)}
                                    className="btn btn-danger" 
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <span>Forward to Counselor</span>
                                    <ArrowRight size={14} />
                                  </button>
                                )
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No action required</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      {mySubmissions.filter(s => s.taskTitle === selectedSubmissionTask).length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No submissions recorded for this task yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Student Submissions Home</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Select an active task below to view detailed student uploads and AI scores.</p>

                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Task Title</th>
                        <th>Subject</th>
                        <th>Assigned Instructor</th>
                        <th>Submission Count</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTasks.map(t => {
                        const count = mySubmissions.filter(s => s.taskTitle === t.title).length;
                        const instructorName = (t.instructor || '').includes('@') ? t.instructor.split('@')[0] : (t.instructor || emailPrefix);
                        return (
                          <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedSubmissionTask(t.title)}>
                            <td style={{ fontWeight: '600' }}>{t.title}</td>
                            <td>
                              <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                                {t.subject || 'General'}
                              </span>
                            </td>
                            <td>{instructorName}</td>
                            <td>
                              <span className="badge badge-info">{count} submissions</span>
                            </td>
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {myTasks.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            No active tasks posted by you.
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

        {/* 4. Student Messages Tab */}
        {activeTab === 'messages' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Student Messages & Inquiries</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Messages submitted by students asking questions. Flagged communication can be forwarded to counseling.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredMessages.map(msg => {
                const aiAnalysis = analyzeCyberbullying(msg.content);
                const isHighRisk = aiAnalysis.isBullying;

                return (
                  <div 
                    key={msg.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '20px', 
                      background: 'var(--bg-tertiary)',
                      borderLeft: isHighRisk ? '4px solid var(--danger)' : '4px solid var(--primary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar-circle" style={{ background: 'var(--accent)' }}>
                          {msg.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{msg.studentName}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subject: {msg.subject}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${isHighRisk ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={12} />
                          {isHighRisk ? `AI Risk: ${aiAnalysis.category} (${aiAnalysis.severityScore}%)` : 'AI Risk: Safe'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{msg.date}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                      "{msg.content}"
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {forwardedMessages.includes(msg.id) ? (
                        <button 
                          disabled
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'not-allowed', opacity: 0.6 }}
                        >
                          Forwarded
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleForwardMessage(msg)}
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#fff', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                        >
                          Forward to Counselor
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No messages received.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Settings Tab */}
        {activeTab === 'settings' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Teacher Profile Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Manage personal contact details and photo credentials.
            </p>

            <form onSubmit={handleSaveSettings}>
              {/* Profile Photo */}
              <div className="settings-avatar-section">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="settings-avatar-preview" />
                ) : (
                  <div className="settings-avatar-preview">AK</div>
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

              {/* Note: SMS notifications option removed */}

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

        {/* View & upload Materials Tab */}
        {activeTab === 'materials' && (
          <div className="glass-panel" style={{ padding: '32px' }}>
            {materialsView === 'list' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem' }}>View & Upload Reference Materials</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Manage resource materials available for your classes.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setMaterialsView('create');
                      setNewMaterialTitle('');
                      setNewMaterialDesc('');
                      setNewMaterialFile(null);
                    }} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={16} />
                    <span>Create Material</span>
                  </button>
                </div>

                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Material Title</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th>Reference File</th>
                        <th>Upload Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials
                        .filter(m => isNameMatch(m.teacherName, user.name))
                        .map(mat => (
                          <tr key={mat.id}>
                            <td style={{ fontWeight: '600' }}>{mat.title}</td>
                            <td>
                              <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                                {mat.subject || 'General'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.description}</td>
                            <td>
                              <span 
                                onClick={() => handleDownloadFile(mat.fileName, mat.fileUrl, mat.teacherName)}
                                style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                {mat.fileName}
                              </span>
                            </td>
                            <td>{mat.date}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Create new Material</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Add resources or notifications that will be published instantly to students.</p>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMaterialTitle || !newMaterialSubject) {
                    alert('Please enter a title and select a subject');
                    return;
                  }

                  let uploadedUrl = null;
                  let base64Fallback = null;

                  if (newMaterialFile) {
                    try {
                      base64Fallback = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(newMaterialFile);
                      });

                      if (base64Fallback) {
                        try {
                          localStorage.setItem(`material_file_${newMaterialFile.name}`, base64Fallback);
                          localStorage.setItem(`material_file_${newMaterialTitle}`, base64Fallback);
                        } catch (storageErr) {
                          console.warn("Storage quota limit reached for local cache", storageErr);
                        }
                      }
                    } catch (err) {
                      console.error("Error reading file as data URL", err);
                    }

                    if (uploadFile) {
                      try {
                        uploadedUrl = await uploadFile(newMaterialFile);
                      } catch (err) {
                        console.error("Failed uploading material file", err);
                      }
                    }
                  }

                  await addMaterial({
                    title: newMaterialTitle,
                    description: newMaterialDesc,
                    teacherName: user.name || 'Prof. Anand Kumar',
                    fileName: newMaterialFile ? newMaterialFile.name : 'academic_reference.pdf',
                    fileUrl: uploadedUrl || base64Fallback,
                    dept: newMaterialDept,
                    subject: newMaterialSubject
                  });
                  setMaterialUploadedModal(true);
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Material Title *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="eg. Binary Search Trees Deep-dive Notes" 
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Choose Department *
                    </label>
                    <select 
                      className="form-input" 
                      value={newMaterialDept} 
                      onChange={(e) => setNewMaterialDept(e.target.value)}
                      required
                    >
                      {["Computer Science & Engineering", "Information & Technology"].map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Choose Subject *
                    </label>
                    <select 
                      className="form-input" 
                      value={newMaterialSubject} 
                      onChange={(e) => setNewMaterialSubject(e.target.value)}
                      required
                    >
                      <option value="">-- Select Subject --</option>
                      {teacherSubjects.map((sub, i) => (
                        <option key={i} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Description</label>
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      placeholder="Add brief details about the material content..." 
                      value={newMaterialDesc}
                      onChange={(e) => setNewMaterialDesc(e.target.value)}
                    />
                  </div>

                  {/* Drag and drop zone */}
                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Upload files *</label>
                    <div 
                      className={`drag-drop-zone ${newMaterialDragActive ? 'active' : ''}`}
                      onDragEnter={(e) => { e.preventDefault(); setNewMaterialDragActive(true); }}
                      onDragOver={(e) => { e.preventDefault(); setNewMaterialDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setNewMaterialDragActive(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setNewMaterialDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.name.toLowerCase().endsWith('.pdf')) {
                            setNewMaterialFile(file);
                          } else {
                            alert('Only PDF files are allowed!');
                          }
                        }
                      }}
                      onClick={() => materialFileInputRef.current.click()}
                    >
                      <UploadCloud size={36} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>Drag & drop or click to upload</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Only PDF files are allowed up to 30MB</p>
                      </div>
                      <input 
                        type="file" 
                        ref={materialFileInputRef} 
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.name.toLowerCase().endsWith('.pdf')) {
                              setNewMaterialFile(file);
                            } else {
                              alert('Only PDF files are allowed!');
                              e.target.value = null;
                            }
                          }
                        }}
                      />
                    </div>
                    {newMaterialFile && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <FileText size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 'bold' }}>{newMaterialFile.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({(newMaterialFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setMaterialsView('list')} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Create Material
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Create Hidden Task Modal */}
        {showCreateHiddenTaskModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="glass-panel" style={{ width: '500px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--accent)' }}>Create Hidden Task</h3>
              <form onSubmit={handleCreateHiddenTask}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Task Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={hiddenTaskTitle} 
                    onChange={(e) => setHiddenTaskTitle(e.target.value)} 
                    required 
                    placeholder="Enter task title"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Due Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={hiddenTaskDueDate} 
                    onChange={(e) => setHiddenTaskDueDate(e.target.value)} 
                    required 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Choose Department *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Click to select departments..." 
                      value={hiddenTaskDepts.join(', ')}
                      readOnly
                      onClick={() => setShowHiddenDeptDropdown(!showHiddenDeptDropdown)}
                      style={{ cursor: 'pointer' }}
                    />
                    {showHiddenDeptDropdown && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '100%', 
                        left: '0', 
                        right: '0', 
                        zIndex: '100', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        boxShadow: '0 -8px 16px rgba(0,0,0,0.3)', 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        padding: '12px',
                        marginBottom: '8px'
                      }}>
                        {["Computer Science & Engineering", "Information & Technology"].map(deptName => {
                          const isSelected = hiddenTaskDepts.includes(deptName);
                          return (
                            <label key={deptName} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => {
                                  let updated;
                                  if (isSelected) {
                                    updated = hiddenTaskDepts.filter(d => d !== deptName);
                                  } else {
                                    updated = [...hiddenTaskDepts, deptName];
                                  }
                                  setHiddenTaskDepts(updated);
                                }}
                              />
                              {deptName}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Choose Subject *</label>
                  <select 
                    className="form-input" 
                    value={hiddenTaskSubject} 
                    onChange={(e) => setHiddenTaskSubject(e.target.value)}
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {teacherSubjects.map((sub, i) => (
                      <option key={i} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Upload Reference File (PDF only) *</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (!file.name.toLowerCase().endsWith('.pdf')) {
                          alert("Only PDF reference files are allowed.");
                          e.target.value = null;
                          setHiddenTaskFile(null);
                          return;
                        }
                        setHiddenTaskFile(file);
                      }
                    }}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowCreateHiddenTaskModal(false);
                      setHiddenTaskTitle('');
                      setHiddenTaskDueDate('');
                      setHiddenTaskDepts(['Computer Science & Engineering']);
                      setHiddenTaskSubject('');
                      setHiddenTaskFile(null);
                      setShowHiddenDeptDropdown(false);
                    }} 
                    className="btn btn-secondary"
                    disabled={isCreatingHiddenTask}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isCreatingHiddenTask}
                  >
                    {isCreatingHiddenTask ? 'Creating...' : 'Finish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Task Created Success Modal */}
      {taskCreatedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Task Created Successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>The new assignment task has been assigned to students.</p>
            <button
              type="button"
              onClick={() => {
                setTaskCreatedModal(false);
                setNewTaskTitle('');
                setNewTaskDesc('');
                setNewTaskDueDate('');
                setSelectedDepts(['Computer Science & Engineering']);
                setNewTaskClass('Computer Science & Engineering');
                setShowDeptDropdown(false);
                setUploadedFile(null);
                setNewTaskSubject('');
                setActiveTab('createTask');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Forwarded to Counselor Success Modal */}
      {forwardedMessageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Forwarded to Counselor Successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>The message incident has been transferred to the Counselor panel.</p>
            <button
              type="button"
              onClick={() => {
                setForwardedMessageModal(false);
                setActiveTab('messages');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Material Uploaded Success Modal */}
      {materialUploadedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Material Uploaded Successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Academic resources have been published and are available for students to download.</p>
            <button
              type="button"
              onClick={() => {
                setMaterialUploadedModal(false);
                setNewMaterialTitle('');
                setNewMaterialDesc('');
                setNewMaterialFile(null);
                setNewMaterialSubject('');
                setMaterialsView('list');
                setActiveTab('materials');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Hidden Task Created Modal */}
      {hiddenTaskCreatedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Material Uploaded Successfully as hidden</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>The task has been securely saved in Hidden Task Management.</p>
            <button
              type="button"
              onClick={() => {
                setHiddenTaskCreatedModal(false);
                setActiveTab('dashboard');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Hidden Task Published Modal */}
      {hiddenTaskPublishedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '28px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '12px', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>Hidden Material Published successfully</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>The material is now published and available to students.</p>
            <button
              type="button"
              onClick={() => {
                setHiddenTaskPublishedModal(false);
                setActiveTab('dashboard');
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
