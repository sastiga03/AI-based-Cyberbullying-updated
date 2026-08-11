import { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import CounselorDashboard from './components/CounselorDashboard';
import AdminDashboard from './components/AdminDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';

import { 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_TASKS, 
  INITIAL_HIDDEN_TASKS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_CASES, 
  INITIAL_CHATS, 
  INITIAL_USERS 
} from './mockData';

function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Navigation states
  // 'landing' | 'login' | 'student' | 'teacher' | 'counselor' | 'admin' | 'principal'
  const [page, setPage] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);

  // App Database States (loaded dynamically from Spring Boot backend)
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [hiddenTasks, setHiddenTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [cases, setCases] = useState([]);
  const [chats, setChats] = useState({});
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
      const res = await fetch('http://localhost:8082/api/files/upload', {
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
      const res = await fetch('http://localhost:8082/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAnnouncements(await res.json());
    } catch (e) { console.error("Error loading announcements:", e); }

    // 2. Fetch tasks
    try {
      const res = await fetch('http://localhost:8082/api/tasks?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const allTasks = await res.json();
        setTasks(allTasks.filter(t => t.visible));
        setHiddenTasks(allTasks.filter(t => !t.visible));
      }
    } catch (e) { console.error("Error loading tasks:", e); }

    // 3. Fetch submissions
    try {
      const res = await fetch('http://localhost:8082/api/submissions?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSubmissions(await res.json());
    } catch (e) { console.error("Error loading submissions:", e); }

    // 4. Fetch cases
    try {
      const res = await fetch('http://localhost:8082/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCases(await res.json());
    } catch (e) { console.error("Error loading cases:", e); }

    // 5. Fetch chats
    try {
      const res = await fetch('http://localhost:8082/api/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setChats(await res.json());
    } catch (e) { console.error("Error loading chats:", e); }

    // 6. Fetch users/contacts (accessible to all roles, fallback to /api/users)
    try {
      let res = await fetch('http://localhost:8081/api/users/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        res = await fetch('http://localhost:8081/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      if (res.ok) setUsers(await res.json());
    } catch (e) { }

    // 7. Fetch materials
    try {
      const res = await fetch('http://localhost:8082/api/materials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMaterials(await res.json());
    } catch (e) { console.error("Error loading materials:", e); }

    // 8. Fetch counseling slots
    try {
      const res = await fetch('http://localhost:8082/api/counseling-slots?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCounselingSlots(await res.json());
    } catch (e) { console.error("Error loading slots:", e); }

    // 9. Fetch student messages (Teacher inbox)
    try {
      const res = await fetch('http://localhost:8082/api/student-messages', {
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
    if (token && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        setCurrentUser(savedUser);
        setPage(savedUser.role.toLowerCase());
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
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
    setPage(userCredentials.role.toLowerCase()); // e.g. redirects to 'student', 'teacher', etc.
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
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
      await fetch(`http://localhost:8082/api/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 2. Student submits a task
  const submitTask = async ({ taskTitle, fileName, fileUrl, comment }) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/submissions', {
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
      await fetch(`http://localhost:8082/api/tasks/${taskId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 4. Teacher creates a new task
  const createNewTask = async ({ title, desc, dueDate, targetClass, fileName, fileUrl, visible = true }) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, desc, dueDate, targetClass, fileName, fileUrl, visible })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 5. Teacher forwards a flagged submission to Counselor
  const forwardSubmissionToCounselor = async (sub) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8082/api/submissions/${sub.id}/forward`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const next = [...forwardedSubmissions, sub.id];
      setForwardedSubmissions(next);
      localStorage.setItem('forwardedSubmissions', JSON.stringify(next));

      // Also create a message under the Counselor's name in Student Messages
      await fetch('http://localhost:8082/api/student-messages', {
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
      await fetch(`http://localhost:8082/api/student-messages/${msg.id}/forward`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      markMessageAsForwarded(msg.id);
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 7. Counselor resolves a case (removes it from database)
  const resolveCase = async (caseId, decisionText) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8082/api/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 8. Add chat message
  const addChatMessage = async (contactName, messageObj) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/chats', {
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
      await fetch('http://localhost:8082/api/cases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, desc, file })
      });

      await fetch('http://localhost:8082/api/student-messages', {
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
      await fetch('http://localhost:8081/api/users', {
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
      await fetch(`http://localhost:8081/api/users/${userId}`, {
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
      const response = await fetch('http://localhost:8081/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDetails)
      });
      if (response.ok) {
        const updated = await response.json();
        setCurrentUser(prev => ({ ...prev, ...updated }));
      }
    } catch (e) { console.error(e); }
  };

  // 13. Handler to add a new material
  const addMaterial = async (newMat) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/materials', {
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

  // 14. Handler to book a counseling slot
  const bookCounseling = async (slotDetails) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/counseling-slots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slotDetails)
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 15. Handler to approve a counseling slot (also handles rescheduling)
  const approveCounselingSlot = async (slotId, timings) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8082/api/counseling-slots/${slotId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timings })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 16. Handler to add a principal announcement
  const addAnnouncement = async (newAnn) => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:8082/api/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newAnn.title,
          description: newAnn.description,
          targetRole: newAnn.targetRole
        })
      });
      refreshData();
    } catch (e) { console.error(e); }
  };

  // 17. Handler to update a user (Admin dashboard)
  const updateUser = async (userId, updatedUser) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8081/api/users/${userId}`, {
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
          announcements={announcements}
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
          submissions={submissions}
          forwardSubmissionToCounselor={forwardSubmissionToCounselor}
          messages={studentMessages}
          forwardMessageToCounselor={forwardMessageToCounselor}
          updateProfile={updateProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          materials={materials}
          addMaterial={addMaterial}
          announcements={announcements}
          readAnnouncements={readAnnouncements}
          markAnnouncementAsRead={markAnnouncementAsRead}
          forwardedMessages={forwardedMessages}
          forwardedSubmissions={forwardedSubmissions}
          uploadFile={uploadFile}
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
          announcements={announcements}
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
          announcements={announcements}
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
