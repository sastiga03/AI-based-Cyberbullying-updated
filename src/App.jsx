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

  // App Database States (for interactive cross-dashboard functionality)
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [hiddenTasks, setHiddenTasks] = useState(INITIAL_HIDDEN_TASKS);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [cases, setCases] = useState(INITIAL_CASES);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [users, setUsers] = useState(INITIAL_USERS);

  // Shared materials state
  const [materials, setMaterials] = useState([
    { id: 1, title: "Binary Search Trees Lecture Notes", description: "This document covers binary search tree insertion, deletion, and search algorithms with complexity analysis.", teacherName: "AnandKumar", fileName: "bst_lecture_notes.pdf", date: "2026-07-28" },
    { id: 2, title: "Relational Database Schema Design", description: "Guide on normalizing relational database tables to 3NF and BCNF. Includes solved exercises.", teacherName: "AnandKumar", fileName: "rdbms_normalization.pdf", date: "2026-07-30" },
    { id: 3, title: "Numerical Integration Methods", description: "Complete overview of Trapezoidal and Simpson's rules with error margins.", teacherName: "Prof. Rak Karnan", fileName: "numerical_integration.pdf", date: "2026-07-29" }
  ]);

  // Shared counseling slots state
  const [counselingSlots, setCounselingSlots] = useState([]);

  // Handler to add a new material
  const addMaterial = (newMat) => {
    setMaterials(prev => [{
      id: prev.length + 1,
      date: new Date().toISOString().split('T')[0],
      ...newMat
    }, ...prev]);
  };

  // Handler to book a counseling slot
  const bookCounseling = (slotDetails) => {
    setCounselingSlots(prev => [...prev, {
      id: prev.length + 1,
      studentName: currentUser ? currentUser.name : 'Harshini Sasti',
      status: 'Pending',
      timings: '',
      counselorName: 'Meena Jegan',
      ...slotDetails
    }]);
  };

  // Handler to approve a counseling slot (also handles rescheduling)
  const approveCounselingSlot = (slotId, timings) => {
    setCounselingSlots(prev => prev.map(s => 
      s.id === slotId ? { ...s, status: 'Approved', timings: timings } : s
    ));
  };

  // Handler to add a principal announcement
  const addAnnouncement = (newAnn) => {
    setAnnouncements(prev => [{
      id: prev.length + 1,
      title: newAnn.title || `Notice to ${newAnn.targetRole}`,
      content: newAnn.description,
      date: new Date().toISOString().split('T')[0],
      read: false,
      postedBy: 'Principal',
      ...newAnn
    }, ...prev]);
  };

  // Handler to update a user (Admin dashboard)
  const updateUser = (userId, updatedUser) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
  };

  // Messages log for Teacher
  const [studentMessages, setStudentMessages] = useState([
    { id: 1, studentName: 'Harshini Sasti', subject: 'Question about assignment', content: 'Professor, can I use a doubly linked list instead of a binary tree for the data structures assignment?', date: '2026-06-30' },
    { id: 2, studentName: 'Divya', subject: 'Request for extension', content: 'Sir, I am unwell. Can I get a 1-day extension for the database project submission?', date: '2026-06-29' },
    { id: 3, studentName: 'Madhan', subject: 'Feedback Request', content: 'Ma\'am, I have submitted my project. Please let me know if there are any issues with it.', date: '2026-06-28' }
  ]);

  // Messages log for Counselor (forwarded messages)
  const [counselorMessages, setCounselorMessages] = useState([
    { id: 1, teacherName: 'Prof AnandKumar', studentName: 'Mouna', content: 'This Student has been continuously seen on the list of flagged contents and I would ask you to keep an eye on this student’s behaviour and give counseling as well.', date: '2026-06-05' },
    { id: 2, teacherName: 'Prof AnandKumar', studentName: 'Thrisha', content: 'This Student has a flagged Content of 95% and she should be highly monitored.', date: '2026-08-04' }
  ]);

  // Sync theme with HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (userCredentials) => {
    setCurrentUser(userCredentials);
    setPage(userCredentials.role); // e.g. redirects to 'student', 'teacher', etc.
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('landing');
  };

  const handleNavigate = (targetPage) => {
    setPage(targetPage);
  };

  // Operations:
  // 1. Student marks announcement as read
  const markAnnouncementAsRead = (announcementId) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId ? { ...ann, read: true } : ann
    ));
  };

  // 2. Student submits a task
  const submitTask = ({ taskTitle, fileName, comment }) => {
    // Add submission record
    const newSub = {
      id: submissions.length + 1,
      taskTitle,
      fileName,
      date: new Date().toISOString().split('T')[0],
      status: 'Received',
      feedback: 'Awaiting Review',
      severityScore: 2, // Default safe score
      flagStatus: 'Safe',
      studentName: currentUser ? currentUser.name : 'Harshini Sasti',
      content: comment
    };
    setSubmissions(prev => [newSub, ...prev]);

    // Mark task as submitted
    setTasks(prev => prev.map(t => 
      t.title === taskTitle ? { ...t, submitted: true } : t
    ));
  };

  // 3. Teacher publishes a hidden task
  const publishHiddenTask = (taskId) => {
    // Set hidden task to visible
    setHiddenTasks(prev => prev.map(ht => 
      ht.id === taskId ? { ...ht, visible: true } : ht
    ));

    // Find the task and add it to student active tasks list
    const taskToPub = hiddenTasks.find(ht => ht.id === taskId);
    if (taskToPub) {
      const newTask = {
        id: tasks.length + 1,
        title: taskToPub.title,
        instructor: currentUser ? currentUser.name : 'Prof. Anand Kumar',
        desc: 'Class assignment published by teacher.',
        dueDate: taskToPub.dueDate,
        submitted: false,
        visible: true
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  // 4. Teacher creates a new task
  const createNewTask = ({ title, desc, dueDate, targetClass, fileName }) => {
    const newTask = {
      id: tasks.length + 1,
      title,
      instructor: currentUser ? currentUser.name : 'Prof. Anand Kumar',
      desc,
      dueDate,
      submitted: false,
      visible: true
    };
    setTasks(prev => [...prev, newTask]);
  };

  // 5. Teacher forwards a flagged submission to Counselor
  const forwardSubmissionToCounselor = (sub) => {
    const newCase = {
      id: cases.length + 1,
      studentName: sub.studentName,
      className: 'CSE A', // default
      severity: `${sub.severityScore}%`,
      date: sub.date,
      content: sub.content || 'Submission file: ' + sub.fileName,
      status: 'Pending',
      decision: '',
      result: `Flagged Content Severity: ${sub.severityScore}%`
    };
    setCases(prev => [newCase, ...prev]);
  };

  // 6. Teacher forwards a student message to Counselor
  const forwardMessageToCounselor = (msg) => {
    const newCounselorMsg = {
      id: counselorMessages.length + 1,
      teacherName: currentUser ? currentUser.name : 'Prof AnandKumar',
      studentName: msg.studentName,
      content: msg.content,
      date: msg.date
    };
    setCounselorMessages(prev => [newCounselorMsg, ...prev]);

    // Also add to counselor cases list
    const newCase = {
      id: cases.length + 1,
      studentName: msg.studentName,
      className: 'CSE A',
      severity: '80%', // Assume high severity when forwarded
      date: msg.date,
      content: msg.content,
      status: 'Pending',
      decision: '',
      result: 'Forwarded message inquiry review'
    };
    setCases(prev => [newCase, ...prev]);
  };

  // 7. Counselor resolves a case
  const resolveCase = (caseId, decisionText) => {
    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, status: 'Resolved', decision: decisionText } : c
    ));
  };

  // 8. Add chat message
  const addChatMessage = (contactName, messageObj) => {
    setChats(prev => ({
      ...prev,
      [contactName]: [...(prev[contactName] || []), messageObj]
    }));
  };

  // 9. Student reports an issue
  const reportIssue = ({ type, desc, file }) => {
    // Adds case directly to Counselor cases for review
    const newCase = {
      id: cases.length + 1,
      studentName: currentUser ? currentUser.name : 'Harshini Sasti',
      className: 'CSE A',
      severity: '45%', // Default low-mid severity
      date: new Date().toISOString().split('T')[0],
      content: `${type}: ${desc}`,
      status: 'Pending',
      decision: '',
      result: 'Student reported issue'
    };
    setCases(prev => [newCase, ...prev]);
  };

  // 10. Admin adds a user
  const addUser = (newUserObj) => {
    const newUser = {
      id: users.length + 1,
      ...newUserObj
    };
    setUsers(prev => [...prev, newUser]);
  };

  // 11. Admin deletes a user
  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // 12. Update Profile Settings details
  const updateProfile = (newDetails) => {
    if (currentUser) {
      setCurrentUser(prev => ({
        ...prev,
        ...newDetails
      }));
    }
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
          studentMessages={studentMessages}
          announcements={announcements}
        />
      )}
    </div>
  );
}

export default App;
