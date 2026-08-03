// Mock Data for KCE Cyberbullying & Harmful Content Detection Platform

export const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: "Cyber Safety Workshop - 24 July", date: "2026-07-24", read: false, content: "KCE is organizing a campus-wide Cyber Safety Workshop focusing on digital ethics and cyberbullying awareness. Attendance is mandatory." },
  { id: 2, title: "Mid-Term Exam Schedule Released", date: "2026-07-02", read: false, content: "The mid-term examination timetable for all departments has been published on the student portal. Exams start July 15." },
  { id: 3, title: "Anti-Bullying Campus Policy Update", date: "2026-06-28", read: true, content: "The Karpagam management has updated the student handbook with strict guidelines regarding digital communications and social media harassment." },
  { id: 4, title: "AI Security Tool Deployment on KCE Network", date: "2026-06-25", read: false, content: "Our college network is now monitored by an advanced AI safety agent that flags offensive and threatening language automatically to protect students." }
];

export const INITIAL_TASKS = [
  { id: 1, title: "Data Structures Assignment", instructor: "Prof. Anand Kumar", desc: "Implement a binary search tree with insert, delete operations and tree traversals.", dueDate: "2026-07-05", submitted: false, visible: true },
  { id: 2, title: "Computational Methods", instructor: "Prof. Rak Karnan", desc: "Complete Exercise 9 and 10 in Chapter 8 concerning numeric integration methods.", dueDate: "2026-07-05", submitted: false, visible: true },
  { id: 3, title: "Database Systems Design", instructor: "Prof. Anand Kumar", desc: "Create an Entity-Relationship (ER) model and schema design for a hospital management database.", dueDate: "2026-07-12", submitted: false, visible: true },
  { id: 4, title: "Algorithm Analysis Review", instructor: "Prof. Rak Karnan", desc: "Analyze the time complexity of quicksort and mergesort under best, average, and worst-case scenarios.", dueDate: "2026-07-15", submitted: false, visible: true },
  { id: 5, title: "Computer Networks Lab", instructor: "Prof. Anand Kumar", desc: "Simulate TCP sliding window protocols using NS2 or packet tracer.", dueDate: "2026-07-18", submitted: false, visible: true }
];

export const INITIAL_HIDDEN_TASKS = [
  { id: 101, title: "Theory of Computation HW3", file: "toc_assignment_3.pdf", visible: false, dueDate: "2026-07-20" },
  { id: 102, title: "Operating Systems Project", file: "os_process_scheduler.docx", visible: false, dueDate: "2026-07-28" },
  { id: 103, title: "Software Engineering Case Study", file: "se_agile_methods.pdf", visible: false, dueDate: "2026-08-05" }
];

export const INITIAL_SUBMISSIONS = [
  { id: 1, taskTitle: "Data Structures Assignment", fileName: "assignment.pdf", date: "2026-07-05", status: "Received", feedback: "Good effort", severityScore: 85, flagStatus: "Flagged", studentName: "Jaya She", content: "You look like a cow and your body like an elephant" },
  { id: 2, taskTitle: "Computational Methods", fileName: "asin_hw.pdf", date: "2026-07-05", status: "Received", feedback: "Excellent", severityScore: 4, flagStatus: "Safe", studentName: "Asin", content: "Completed the numerical analysis and graphed the error rates." },
  { id: 3, taskTitle: "Database Systems Design", fileName: "sajai_hw.pdf", date: "2026-06-30", status: "Received", feedback: "Satisfactory", severityScore: 2, flagStatus: "Safe", studentName: "Sanjai", content: "Attached ER diagram and normal forms normalized to 3NF." },
  { id: 4, taskTitle: "Algorithm Analysis Review", fileName: "sheriyalab.pdf", date: "2026-06-29", status: "Received", feedback: "Review Required", severityScore: 91, flagStatus: "Flagged", studentName: "Sheriya", content: "You are such a fool and you are fit for nothing and we will never include you in our friends group and you will be isolated" }
];

export const INITIAL_CASES = [
  { id: 1, studentName: "Mouna", className: "CSE B", severity: "47%", date: "2026-06-05", content: "Hey shut up !Very funny", status: "Pending", decision: "", result: "Mocking ------ 47% ------ Average" },
  { id: 2, studentName: "Thejan", className: "IT A", severity: "80%", date: "2026-06-26", content: "You look like a cow and your body like an elephant", status: "Pending", decision: "", result: "Bullying ------ 80% ------ High" },
  { id: 3, studentName: "Aakil", className: "ECE C", severity: "22%", date: "2026-09-06", content: "Hey shut up !Very funny", status: "Resolved", decision: "Falsely Detected", result: "Angry ------ 22% ------ Low" },
  { id: 4, studentName: "Thrisha", className: "CIVIL C", severity: "95%", date: "2026-08-04", content: "You dont deserve this and better go die somewhere", status: "Pending", decision: "", result: "Threatening ------ 95% ------ At Risk" }
];

export const INITIAL_CHATS = {
  "Jan She": [
    { sender: "Jan She", text: "Hey HarshiniSasti! This is Jan She", time: "10:02 AM" },
    { sender: "Jan She", text: "Why no reply harsh??", time: "02:12 PM" },
    { sender: "Harshini Sasti", text: "Hey Jan She, I was busy", time: "04:16 PM" },
    { sender: "Jan She", text: "You are useless, u are so rude such a bull", time: "04:17 PM" }
  ],
  "Sanshetha S": [
    { sender: "Sanshetha S", text: "Hi Harshini! Did you complete the network lab?", time: "11:30 AM" },
    { sender: "Harshini Sasti", text: "Yes, I just submitted the NS2 simulation code.", time: "12:15 PM" },
    { sender: "Sanshetha S", text: "Can you help me with the slide window part? I am stuck.", time: "12:20 PM" }
  ]
};

export const INITIAL_USERS = [
  { id: 1, name: "Harshini Sasti", email: "studentp101@kce.ac.in", role: "Student" },
  { id: 2, name: "AnandKumar", email: "teacherp101@kce.ac.in", role: "Teacher" },
  { id: 3, name: "Meena Jegan", email: "counselormeerajegan@kce.ac.in", role: "Counselor" },
  { id: 4, name: "Suresh", email: "adminsuresh@kce.ac.in", role: "Admin" },
  { id: 5, name: "Krishnamurthy", email: "principalkrishnamurthy@kce.ac.in", role: "Principal" }
];

export const STUDENT_RULES = [
  "Treat fellow students with respect on all digital platforms and campus forums.",
  "Do not share offensive, abusive, or harassing material in class groups and submission portals.",
  "Immediately report any cyberbullying incident or harmful behavior through the platform.",
  "Adhere strictly to academic honesty in all assignment uploads."
];

export const COUNSELOR_RULES = [
  "Conduct confidential review of all cases forwarded by teachers or flagged by the AI.",
  "Conduct counseling sessions with care, focusing on the mental safety and wellness of both parties.",
  "Update the case statuses promptly (Resolved, Waiting, Falsely Detected) based on physical verification.",
  "Take actions based on the severity rate of the issue.",
  "Organize regular cyber safety and digital wellness seminars on campus."
];
