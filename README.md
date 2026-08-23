# CyberGuard-Safeguard: AI-Based Cyberbullying & Harmful Content Detection Platform

A context-aware cyberbullying and safety safeguarding platform for academic institutions. The platform integrates a **Hybrid Natural Language Processing (NLP) & Large Language Model (LLM)** engine with role-based dashboards to monitor, flag, and resolve incidents of cyberbullying, harassment, insults, and exclusion in real-time student communications and homework submissions.

---

## 🚀 Key Features

* **Multi-Role Dashboards:**
  * **Admin Dashboard:** Manage student/teacher records, assign predefined subjects, track system diagnostics, and visualize incident severity distributions.
  * **Teacher Dashboard:** Publish course materials, assign tasks to multiple target departments, review student submissions, and receive real-time messages from students in their department.
  * **Student Dashboard:** View assigned tasks, download reference materials, upload assignment submissions, and message teachers safely.
  * **Counselor Dashboard:** Monitor active and pending cases, track counseling bookings, and resolve flagged student incidents.
  * **Principal Dashboard:** Executive overview of total campus incident metrics, severity categories, and safety statuses.

* **Advanced AI Detection Pipeline (LLM + NLP):**
  * **Gemini 1.5 Flash Integration:** Processes incoming texts and PDF uploads using Google's Gemini models in the cloud for deep semantic understanding (sarcasm, intent, and subtle insults).
  * **Contextual Evaluation & Negation Scope:** Handles negative modifiers (e.g. *"not ugly"*, *"never stupid"*) as safe comments.
  * **Ethical Discussion Exception:** Excludes descriptive or academic references to harmful terms (e.g. *"calling someone a fool is wrong"*) from triggering alerts.
  * **Rule-Based Fallback:** Automatically switches to an offline keyword scanner if internet connection drops or API keys are missing.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Recharts, Lucide Icons, CSS Modules.
* **Backend:** Spring Boot (Java 21/25), Spring Security, JSON Web Token (JWT).
* **Databases:** MySQL (JPA/Hibernate) for user records, MongoDB for tasks, chat messages, reference materials, and incident cases.

---

## ⚙️ Setup & Configuration

### 1. Configure the Gemini API Key
To enable the Large Language Model (LLM) detection, paste your Gemini API key in the backend properties file:
* Open `backend-services/main-service/src/main/resources/application.properties`
* Update the following line:
  ```properties
  gemini.api.key=YOUR_GEMINI_API_KEY_HERE
  ```

---

## 🏃 Running the Application Manually

Follow these steps to spin up the backend and frontend services:

### Step 1: Run the Authentication Service (`auth-service`)
Open a terminal window and run:
```cmd
cd backend-services/auth-service
cmd.exe /c "java @run_args.txt"
```
*Port:* `8081` (MySQL-based user directory)

### Step 2: Run the Main Content & AI Service (`main-service`)
Open a second terminal window and run:
```cmd
cd backend-services/main-service
cmd.exe /c "java @run_args.txt"
```
*Port:* `8082` (MongoDB-based core service with Gemini capability)

### Step 3: Run the React Vite Client
Open a third terminal in VS Code at the project's root folder and run:
```cmd
npm run dev
```
*Port:* `5173` (or `5174`)

Open your browser and navigate to **`http://localhost:5173`** to access the web portal.

---

## 📁 Project Structure

```
├── backend-services
│   ├── auth-service/     # Spring Boot application for MySQL user auth
│   └── main-service/     # Spring Boot application for MongoDB content & Gemini AI
├── src
│   ├── components/       # Dashboard components (Admin, Teacher, Student, etc.)
│   ├── utils/            # Local rule-based NLP parser (fallback)
│   ├── App.jsx           # Application Router and core request handlers
│   └── main.jsx          # Client entry point
└── package.json          # Vite packages configuration
```
