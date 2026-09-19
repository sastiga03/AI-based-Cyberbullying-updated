import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CounselorDashboard from './components/CounselorDashboard';
import AdminDashboard from './components/AdminDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';

import { analyzeCyberbullying } from './utils/aiDetector';
import { AUTH_API_URL, MAIN_API_URL } from './config';

function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Navigation states
  // 'landing' | 'login' | 'student' | 'teacher' | 'counselor' | 'admin' | 'principal'
  const [page, setPage] = useState(() => localStorage.getItem('currentPage') || 'landing');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep currentPage synced to localStorage
  useEffect(() => {
    if (page) {
      localStorage.setItem('currentPage', page);
    }
  }, [page]);

  // App Database States (loaded dynamically from Spring Boot backend)
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [hiddenTasks, setHiddenTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        const legacyMockNames = ['mouna', 'thejan', 'aakil', 'thrisha', 'jaya she', 'asin', 'sanjai', 'sheriya', 'rahul', 'sneha'];
        const clean = parsed.filter(c => {
          if (!c || !c.studentName) return false;
          if (legacyMockNames.includes(c.studentName.toLowerCase())) return false;
          return true;
        });
        localStorage.setItem('cached_cases', JSON.stringify(clean));
        return clean;
      }
    } catch (e) {}
    return [];
  });
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('cached_chats');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed['Jan She'];
        delete parsed['Sanshetha S'];
        return parsed;
      }
    } catch (e) {}
    return {};
  });
  const [users, setUsers] = useState([]);

  // Shared materials state
  const [materials, setMaterials] = useState([]);

  // Shared counseling slots state
  const [counselingSlots, setCounselingSlots] = useState([]);

  // Messages log for Teacher
  const [studentMessages, setStudentMessages] = useState([]);

  // Messages log for Counselor (forwarded messages)
  const [counselorMessages, setCounselorMessages] = useState([]);

  const [forwardedMessages, setForwardedMessages] = useState(() => {
    const stored = localStorage.getItem('forwardedMessages');
    return stored ? JSON.parse(stored) : [];
  });

  const [forwardedSubmissions, setForwardedSubmissions] = useState(() => {
    const stored = localStorage.getItem('forwardedSubmissions');
    return stored ? JSON.parse(stored) : [];
  });

  const [readCounselorMessages, setReadCounselorMessages] = useState(() => {
    const stored = localStorage.getItem('readCounselorMessages');
    return stored ? JSON.parse(stored) : [];
  });

  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    const email = localStorage.getItem('currentUserEmail') || '';
    const stored = localStorage.getItem(`readAnnouncements_${email}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(`readAnnouncements_${currentUser.email}`);
      setReadAnnouncements(stored ? JSON.parse(stored) : []);
    } else {
      setReadAnnouncements([]);
    }
  }, [currentUser]);

  const markMessageAsForwarded = (msgId) => {
    setForwardedMessages(prev => {
      const next = [...prev, msgId];
      localStorage.setItem('forwardedMessages', JSON.stringify(next));
      return next;
    });
  };

  const markCounselorMessageAsRead = (msgId) => {
    setReadCounselorMessages(prev => {
      const next = [...prev, msgId];
      localStorage.setItem('readCounselorMessages', JSON.stringify(next));
      return next;
    });
  };



  const uploadFile = async (fileObj) => {
    if (!fileObj) return null;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileObj);
    try {
      const res = await fetch(`${MAIN_API_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.fileUrl;
      }
    } catch (e) {
      console.error("File upload failed", e);
    }
    return null;
  };

  // Refresh all application states from the backend
  const refreshData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Fetch announcements
    try {
      const res = await fetch(`${MAIN_API_URL}/api/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const raw = await res.json();
        const clean = (raw || []).filter(a => {
          if (!a || !a.title) return false;
          const t = a.title.toLowerCase();
          const c = (a.content || '').toLowerCase();
          if (t.includes('1786599') || t.includes('all roles notice') || t.includes('student specific notice') || t.includes('teacher specific notice') || c.includes('test content')) {
            return false;
          }
          return true;
        });
        setAnnouncements(clean);
      }
    } catch (e) { console.error("Error loading announcements:", e); }

    // 2. Fetch tasks
    try {
      const res = await fetch(`${MAIN_API_URL}/api/tasks?all=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const allTasks = await res.json();
        const deletedTaskIds = JSON.parse(localStorage.getItem('deleted_task_ids') || '[]');
        const validTasks = allTasks.filter(t => !deletedTaskIds.includes(String(t.id)));
        setTasks(validTasks.filter(t => t.visible));
        setHiddenTasks(validTasks.filter(t => !t.visible));
      }
    } catch (e) { console.error("Error loading tasks:", e); }

    // 3. Fetch submissions
    try {
      const res = await fetch(`${MAIN_API_URL}/api/submissions?all=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const allSubs = await res.json();
        const deletedSubIds = JSON.parse(localStorage.getItem('deleted_sub_ids') || '[]');
        const deletedTaskTitles = JSON.parse(localStorage.getItem('deleted_task_titles') || '[]');
        const validSubs = allSubs.filter(s => 
          !deletedSubIds.includes(String(s.id)) && 
          !deletedTaskTitles.includes((s.taskTitle || '').trim().toLowerCase())
        );
        setSubmissions(validSubs);
      }
    } catch (e) { console.error("Error loading submissions:", e); }

    // 4. Fetch cases
    try {
      const res = await fetch(`${MAIN_API_URL}/api/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const backendCases = await res.json();
        const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
        const merged = [...backendCases];
        cached.forEach(cCase => {
          const idx = merged.findIndex(c => String(c.id) === String(cCase.id));
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...cCase };
          } else {
            merged.unshift(cCase);
          }
        });
        const cleanCases = merged.filter(c => {
          if (!c || !c.content) return true;
          const lower = c.content.toLowerCase();
          if (lower.includes('not ugly') || lower.includes("don't worry") || lower.includes('dont worry')) {
            const analysis = analyzeCyberbullying(c.content);
            return analysis.isBullying;
          }
          return true;
        });
        localStorage.setItem('cached_cases', JSON.stringify(cleanCases));
        setCases(cleanCases);
      }
    } catch (e) { console.error("Error loading cases:", e); }

    // 5. Fetch chats
    try {
      const res = await fetch(`${MAIN_API_URL}/api/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setChats(await res.json());
    } catch (e) { console.error("Error loading chats:", e); }

    // 6. Fetch users/contacts (accessible to all roles, fallback to /api/users)
    try {
      let res = await fetch(`${AUTH_API_URL}/api/users/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        res = await fetch(`${AUTH_API_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      if (res.ok) setUsers(await res.json());
    } catch (e) { }

    // 7. Fetch materials
    try {
      const res = await fetch(`${MAIN_API_URL}/api/materials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const allMaterials = await res.json();
        const deletedMatIds = JSON.parse(localStorage.getItem('deleted_material_ids') || '[]');
        setMaterials(allMaterials.filter(m => !deletedMatIds.includes(String(m.id))));
      }
    } catch (e) { console.error("Error loading materials:", e); }

    // 8. Fetch counseling slots
    try {
      const res = await fetch(`${MAIN_API_URL}/api/counseling-slots?all=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const backendSlots = await res.json();
        localStorage.setItem('cached_counseling_slots', JSON.stringify(backendSlots));
        setCounselingSlots(backendSlots);
      }
    } catch (e) { 
      console.error("Error loading slots:", e);
      const cached = JSON.parse(localStorage.getItem('cached_counseling_slots') || '[]');
      setCounselingSlots(cached);
    }

    // 9. Fetch student messages (Teacher inbox)
    try {
      const res = await fetch(`${MAIN_API_URL}/api/student-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const msgs = await res.json();
        setStudentMessages(msgs);
        setCounselorMessages(msgs.map(m => ({
          id: m.id,
          teacherName: m.teacherName || 'Faculty Team',
          studentName: m.studentName,
          content: m.content,
          date: m.date
        })));
      }
    } catch (e) { }
  };

  // Sync theme with HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Restores user session on page load/refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserStr = localStorage.getItem('user');
    const savedPage = localStorage.getItem('currentPage');
    if (token && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setCurrentUser(savedUser);
        if (savedPage) {
          setPage(savedPage);
        } else if (savedUser.role) {
          setPage(savedUser.role.toLowerCase());
        }

        // Fetch fresh profile from backend to ensure profilePhotoUrl is up to date
        fetch(`${AUTH_API_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(freshProfile => {
            if (freshProfile) {
              setCurrentUser(prev => {
                const merged = { ...(prev || {}), ...freshProfile };
                localStorage.setItem('user', JSON.stringify(merged));
                return merged;
              });
            }
          })
          .catch(e => {});
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else if (savedPage) {
      setPage(savedPage);
    }
  }, []);

  // Load backend data when user logs in
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (userCredentials) => {
    setCurrentUser(userCredentials);
    localStorage.setItem('user', JSON.stringify(userCredentials));
    const targetPage = userCredentials.role ? userCredentials.role.toLowerCase() : 'landing';
    setPage(targetPage);
    localStorage.setItem('currentPage', targetPage);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${AUTH_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error("Logout request failed, proceeding to clear local session", e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setCurrentUser(null);
    setAnnouncements([]);
    setPage('landing');
  };

  const handleNavigate = (targetPage) => {
    setPage(targetPage);
  };

  // Operations:
  // 1. Student marks announcement as read
  const markAnnouncementAsRead = async (announcementId) => {
    const token = localStorage.getItem('token');
    if (currentUser && !readAnnouncements.includes(announcementId)) {
      const next = [...readAnnouncements, announcementId];
      setReadAnnouncements(next);
      localStorage.setItem(`readAnnouncements_${currentUser.email}`, JSON.stringify(next));
    }
    try {
      await fetch(`${MAIN_API_URL}/api/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 2. Student submits a task
  const submitTask = async ({ taskTitle, fileName, fileUrl, comment }) => {
    if (comment) {
      const analysis = analyzeCyberbullying(comment);
      if (analysis.isBullying) {
        const newCase = {
          id: Date.now().toString(),
          studentName: currentUser?.name || 'Harshini Sasti',
          className: currentUser?.dept ? `${currentUser.dept} A` : 'CSE A',
          severity: `${analysis.severityScore}%`,
          date: new Date().toISOString().split('T')[0],
          content: `Task Submission (${taskTitle}): ${comment}`,
          status: 'Pending',
          decision: '',
          result: analysis.result
        };
        setCases(prev => [newCase, ...(prev || [])]);
        try {
          const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
          localStorage.setItem('cached_cases', JSON.stringify([newCase, ...cached]));
        } catch (e) {}

        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${MAIN_API_URL}/api/ai/scan-submission`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentName: currentUser?.name || 'Harshini Sasti', comment: comment, className: 'CSE A' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.caseCreated && data.caseId) {
              const dbId = String(data.caseId);
              setCases(prev => (prev || []).map(c => String(c.id) === String(newCase.id) ? { ...c, id: dbId } : c));
              const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
              const updatedCached = cached.map(c => String(c.id) === String(newCase.id) ? { ...c, id: dbId } : c);
              localStorage.setItem('cached_cases', JSON.stringify(updatedCached));
            }
          }
        } catch (e) {}
      }
    }

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskTitle, fileName, fileUrl, comment })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 3. Teacher publishes a hidden task
  const publishHiddenTask = async (taskId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/tasks/${taskId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 4. Teacher creates a new task
  const createNewTask = async ({ title, desc, dueDate, targetClass, subject, fileName, fileUrl, visible = true }) => {
    try {
      const delTitles = JSON.parse(localStorage.getItem('deleted_task_titles') || '[]');
      const updated = delTitles.filter(t => t !== (title || '').trim().toLowerCase());
      localStorage.setItem('deleted_task_titles', JSON.stringify(updated));
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, desc, dueDate, targetClass, subject, fileName, fileUrl, visible })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // Teacher deletes a task
  const deleteTask = async (taskId) => {
    const targetTask = [...(tasks || []), ...(hiddenTasks || [])].find(t => String(t.id) === String(taskId));
    const targetTitle = targetTask?.title ? targetTask.title.trim().toLowerCase() : null;

    setTasks(prev => (prev || []).filter(t => String(t.id) !== String(taskId)));
    setHiddenTasks(prev => (prev || []).filter(t => String(t.id) !== String(taskId)));

    if (targetTitle) {
      setSubmissions(prev => (prev || []).filter(s => (s.taskTitle || '').trim().toLowerCase() !== targetTitle));
    }

    try {
      const cached = JSON.parse(localStorage.getItem('cached_tasks') || '[]');
      localStorage.setItem('cached_tasks', JSON.stringify(cached.filter(t => String(t.id) !== String(taskId))));

      const delIds = JSON.parse(localStorage.getItem('deleted_task_ids') || '[]');
      if (!delIds.includes(String(taskId))) {
        localStorage.setItem('deleted_task_ids', JSON.stringify([...delIds, String(taskId)]));
      }

      if (targetTitle) {
        const delTitles = JSON.parse(localStorage.getItem('deleted_task_titles') || '[]');
        if (!delTitles.includes(targetTitle)) {
          localStorage.setItem('deleted_task_titles', JSON.stringify([...delTitles, targetTitle]));
        }
      }
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // Teacher deletes a student submission
  const deleteSubmission = async (subId) => {
    setSubmissions(prev => (prev || []).filter(s => String(s.id) !== String(subId)));
    try {
      const delSubs = JSON.parse(localStorage.getItem('deleted_sub_ids') || '[]');
      if (!delSubs.includes(String(subId))) {
        localStorage.setItem('deleted_sub_ids', JSON.stringify([...delSubs, String(subId)]));
      }
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/submissions/${subId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 5. Teacher forwards a flagged submission to Counselor
  const forwardSubmissionToCounselor = async (sub) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/submissions/${sub.id}/forward`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const next = [...forwardedSubmissions, sub.id];
      setForwardedSubmissions(next);
      localStorage.setItem('forwardedSubmissions', JSON.stringify(next));

      // Also create a message under the Counselor's name in Student Messages
      await fetch(`${MAIN_API_URL}/api/student-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: sub.studentName,
          subject: `Forwarded Submission: ${sub.taskTitle}`,
          content: `Task: ${sub.taskTitle}\nFile: ${sub.fileName}\nAI Flagged: ${sub.flagStatus} (${sub.severityScore}%)\nStudent Comment: ${sub.content || 'None'}`,
          teacherName: 'Meena Jegan'
        })
      });

      refreshData();
    } catch (e) { console.error(e); }
  };

  // 6. Teacher forwards a student message to Counselor
  const forwardMessageToCounselor = async (msg) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/student-messages/${msg.id}/forward`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      markMessageAsForwarded(msg.id);
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 7. Counselor resolves a case
  const resolveCase = async (caseId, decisionText) => {
    setCases(prev => (prev || []).map(c => 
      String(c.id) === String(caseId) ? { ...c, status: 'Resolved', decision: decisionText || 'Resolved' } : c
    ));
    try {
      const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
      const updated = cached.map(c => String(c.id) === String(caseId) ? { ...c, status: 'Resolved', decision: decisionText || 'Resolved' } : c);
      localStorage.setItem('cached_cases', JSON.stringify(updated));
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/cases/${caseId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ decision: decisionText || 'Resolved' })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 8. Add chat message (with CyberGuard-NLP AI scanning)
  const addChatMessage = async (contactName, messageObj) => {
    const text = messageObj?.text || '';
    
    // Immediately update local chats state
    setChats(prev => {
      const updated = {
        ...prev,
        [contactName]: [...(prev[contactName] || []), { ...messageObj, isFlagged: false }]
      };
      try {
        localStorage.setItem('cached_chats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (text) {
      const analysis = analyzeCyberbullying(text);
      if (analysis.isBullying) {
        const newCase = {
          id: Date.now().toString(),
          studentName: messageObj.sender || currentUser?.name || 'Harshini Sasti',
          className: currentUser?.dept ? `${currentUser.dept} A` : 'CSE A',
          severity: `${analysis.severityScore}%`,
          date: new Date().toISOString().split('T')[0],
          content: text,
          status: 'Pending',
          decision: '',
          result: analysis.result
        };
        setCases(prev => [newCase, ...(prev || [])]);
        try {
          const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
          localStorage.setItem('cached_cases', JSON.stringify([newCase, ...cached]));
        } catch (e) {}

        // Immediately update chat flagged styling locally
        setChats(prev => {
          const chatList = prev[contactName] || [];
          const updatedList = chatList.map((m, i) => 
            i === chatList.length - 1 ? { ...m, isFlagged: true } : m
          );
          const updated = { ...prev, [contactName]: updatedList };
          try {
            localStorage.setItem('cached_chats', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${MAIN_API_URL}/api/ai/scan-message`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: messageObj.sender || currentUser?.name || 'Harshini Sasti', content: text, className: 'CSE A' })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.caseCreated && data.caseId) {
              const dbId = String(data.caseId);
              setCases(prev => (prev || []).map(c => String(c.id) === String(newCase.id) ? { ...c, id: dbId } : c));
              const cached = JSON.parse(localStorage.getItem('cached_cases') || '[]');
              const updatedCached = cached.map(c => String(c.id) === String(newCase.id) ? { ...c, id: dbId } : c);
              localStorage.setItem('cached_cases', JSON.stringify(updatedCached));
            }
          }
        } catch (e) {}
      }
    }

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient: contactName, text: messageObj.text })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 9. Student reports an issue
  const reportIssue = async ({ type, desc, file, teacherName }) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/cases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, desc, file })
      });

      await fetch(`${MAIN_API_URL}/api/student-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentName: currentUser ? currentUser.name : "Harshini Sasti",
          subject: `Report: ${type}`,
          content: desc,
          teacherName: teacherName
        })
      });

      refreshData();
    } catch (e) { console.error(e); }
  };

  // 10. Admin adds a user
  const addUser = async (newUserObj) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${AUTH_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserObj)
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 11. Admin deletes a user
  const deleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${AUTH_API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 12. Update Profile Settings details
  const updateProfile = async (newDetails) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${AUTH_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDetails)
      });
      if (response.ok) {
        const updated = await response.json();
        setCurrentUser(prev => {
          const next = { ...(prev || {}), ...updated };
          localStorage.setItem('user', JSON.stringify(next));
          return next;
        });
      }
    } catch (e) { console.error(e); }
  };

  // 13. Handler to add a new material
  const addMaterial = async (newMat) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMat)
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  const deleteMaterial = async (matId) => {
    setMaterials(prev => (prev || []).filter(m => String(m.id) !== String(matId)));
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/materials/${matId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 14. Handler to book a counseling slot
  const bookCounseling = async (slotDetails) => {
    const tempId = Date.now().toString();
    const newSlot = {
      id: tempId,
      studentName: slotDetails.studentName || currentUser?.name || 'Harshini Sasti',
      rollNo: slotDetails.rollNo || '23CSE101',
      dept: slotDetails.dept || 'Computer Science & Engineering',
      reason: slotDetails.reason,
      status: 'Pending',
      timings: '',
      counselorName: 'Meena Jegan'
    };

    setCounselingSlots(prev => [...(prev || []), newSlot]);

    try {
      const cached = JSON.parse(localStorage.getItem('cached_counseling_slots') || '[]');
      localStorage.setItem('cached_counseling_slots', JSON.stringify([...cached, newSlot]));
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${MAIN_API_URL}/api/counseling-slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slotDetails)
      });
      if (res.ok) {
        const saved = await res.json();
        setCounselingSlots(prev => (prev || []).map(s => String(s.id) === String(tempId) ? saved : s));
        try {
          const cached = JSON.parse(localStorage.getItem('cached_counseling_slots') || '[]');
          const filtered = cached.filter(s => String(s.id) !== String(tempId));
          localStorage.setItem('cached_counseling_slots', JSON.stringify([...filtered, saved]));
        } catch (e) {}
      }
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 15. Handler to approve / update a counseling slot (handles timings, status, and reschedule)
  const updateCounselingSlot = async (slotId, updateData) => {
    setCounselingSlots(prev => (prev || []).map(slot => 
      String(slot.id) === String(slotId) ? { ...slot, ...updateData } : slot
    ));

    try {
      const cached = JSON.parse(localStorage.getItem('cached_counseling_slots') || '[]');
      const updated = cached.map(slot => String(slot.id) === String(slotId) ? { ...slot, ...updateData } : slot);
      if (!updated.some(s => String(s.id) === String(slotId))) {
        updated.push({ id: slotId, ...updateData });
      }
      localStorage.setItem('cached_counseling_slots', JSON.stringify(updated));
    } catch (e) {}

    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/counseling-slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  const approveCounselingSlot = async (slotId, timings) => {
    return updateCounselingSlot(slotId, { status: 'Approved', timings });
  };

  // 16. Handler to add a principal announcement
  const addAnnouncement = async (newAnn) => {
    const token = localStorage.getItem('token');
    const contentText = newAnn.description || newAnn.content || '';
    try {
      await fetch(`${MAIN_API_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newAnn.title,
          content: contentText,
          description: contentText,
          targetRole: newAnn.targetRole
        })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // Helper to ensure role-specific targeting for campus announcements
  const getRoleFilteredAnnouncements = (role) => {
    return (announcements || []).filter(ann => {
      if (!ann) return false;
      const target = (ann.targetRole || 'All').trim().toLowerCase();
      if (!role || role.toLowerCase() === 'principal') return true;
      if (target === 'all') return true;
      const r = role.trim().toLowerCase();
      return target === r || target.startsWith(r) || r.startsWith(target);
    });
  };

  // 16b. Handler to delete an announcement
  const deleteAnnouncement = async (announcementId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${MAIN_API_URL}/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 17. Handler to update a user (Admin dashboard)
  const updateUser = async (userId, updatedUser) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${AUTH_API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedUser)
      });
      refreshData();
    } catch (e) { console.error(e); }
  };



  return (
    <div className="App">
      {page === 'landing' && (
        <LandingPage 
          theme={theme} 
          toggleTheme={toggleTheme} 
          onNavigate={handleNavigate} 
        />
      )}

      {page === 'login' && (
        <LoginPage 
          onLogin={handleLogin} 
          onNavigate={handleNavigate} 
        />
      )}

      {page === 'student' && currentUser && (
        <StudentDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          announcements={getRoleFilteredAnnouncements('Student')}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
          tasks={tasks}
          submitTask={submitTask}
          submissions={submissions}
          chats={chats}
          addChatMessage={addChatMessage}
          reportIssue={reportIssue}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          materials={materials}
          counselingSlots={counselingSlots}
          bookCounseling={bookCounseling}
          users={users}
          cases={cases}
          uploadFile={uploadFile}
        />
      )}

      {page === 'teacher' && currentUser && (
        <TeacherDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          tasks={tasks}
          hiddenTasks={hiddenTasks}
          publishHiddenTask={publishHiddenTask}
          createNewTask={createNewTask}
          deleteTask={deleteTask}
          submissions={submissions}
          deleteSubmission={deleteSubmission}
          forwardSubmissionToCounselor={forwardSubmissionToCounselor}
          messages={studentMessages}
          forwardMessageToCounselor={forwardMessageToCounselor}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          materials={materials}
          addMaterial={addMaterial}
          deleteMaterial={deleteMaterial}
          announcements={getRoleFilteredAnnouncements('Teacher')}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
          forwardedMessages={forwardedMessages}
          forwardedSubmissions={forwardedSubmissions}
          uploadFile={uploadFile}
          users={users}
        />
      )}

      {page === 'counselor' && currentUser && (
        <CounselorDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          cases={cases}
          resolveCase={resolveCase}
          messages={counselorMessages}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          counselingSlots={counselingSlots}
          approveCounselingSlot={approveCounselingSlot}
          updateCounselingSlot={updateCounselingSlot}
          announcements={getRoleFilteredAnnouncements('Counselor')}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
          forwardedMessages={forwardedMessages}
          readCounselorMessages={readCounselorMessages}
          markCounselorMessageAsRead={markCounselorMessageAsRead}
        />
      )}

      {page === 'admin' && currentUser && (
        <AdminDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          users={users}
          addUser={addUser}
          deleteUser={deleteUser}
          cases={cases}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          counselingSlots={counselingSlots}
          studentMessages={studentMessages}
          updateUser={updateUser}
          setUsers={setUsers}
          announcements={getRoleFilteredAnnouncements('Admin')}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
        />
      )}

      {page === 'principal' && currentUser && (
        <PrincipalDashboard 
          user={currentUser} 
          onLogout={handleLogout}
          cases={cases}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          addAnnouncement={addAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
          counselingSlots={counselingSlots}
           announcements={announcements}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
          studentMessages={studentMessages}
        />
      )}
    </div>
  );
}

export default App;
