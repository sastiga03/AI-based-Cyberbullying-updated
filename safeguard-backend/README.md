# KCE SafeGuard Backend

KCE SafeGuard is an AI-based cyberbullying and harmful content detection platform designed for campus safety, with customized workspaces for Students, Teachers, Counselors, Principals, and Admins.

This is the production-ready Spring Boot Maven backend application.

## Technology Stack

* **Java**: Version 21
* **Framework**: Spring Boot 3 (with Web, Security, Validation)
* **Database**: MySQL 8+
* **ORM**: Spring Data JPA (Hibernate)
* **Security**: JWT (JSON Web Tokens) & BCrypt password encryption
* **Documentation**: Swagger UI / OpenAPI 3

---

## Database Configuration

1. **MySQL Database Creation**:
   Login to your MySQL server and run the following command to create the database:
   ```sql
   CREATE DATABASE kce_safeguard;
   ```

2. **Spring Configuration**:
   The database configuration details are located in `src/main/resources/application.properties`. If you need to change your MySQL credentials, edit the following lines:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=root
   ```
   *Note: Hibernate is configured to automatically create and update the database schema on startup (`spring.jpa.hibernate.ddl-auto=update`), so there is no need to run manual schema creation scripts.*

---

## Eclipse Import & Running Guide

This project is a standard Maven project, making it directly importable into Eclipse.

### 1. Import to Eclipse
1. Open Eclipse IDE.
2. Select **File → Import...**
3. Choose **Maven → Existing Maven Projects** and click **Next**.
4. Click **Browse...** and select the `safeguard-backend` project root directory.
5. Ensure the `pom.xml` checkbox is ticked, and click **Finish**.
6. Eclipse will build the workspace and resolve all dependencies from Maven Central automatically.

### 2. Run the Application
1. In the Eclipse **Project Explorer**, expand the imported project.
2. Navigate to `src/main/java` -> `com.kce.safeguard` -> right-click `SafeguardApplication.java`.
3. Choose **Run As → Java Application** (or right-click the project root and select **Run As → Spring Boot App**).
4. The server will start on port `8080`.

---

## API Testing & Documentation

Once the application is running, the Swagger UI is fully enabled and accessible at:
```
http://localhost:8080/swagger-ui/index.html
```

### Pre-populated Demo Credentials (startup data auto-populated)
The database is auto-populated with the following accounts (all passwords are encrypted with BCrypt on startup):

| Name | Role | Email | Password |
|---|---|---|---|
| Harshini Sasti | Student | `studentp101@kce.ac.in` | `studentp101` |
| AnandKumar | Teacher | `teacherp101@kce.ac.in` | `teacherp101` |
| Meena Jegan | Counselor | `counselormeerajegan@kce.ac.in` | `meerajegan` |
| Suresh | Admin | `adminsuresh@kce.ac.in` | `admin` |
| Krishnamurthy | Principal | `principalkrishnamurthy@kce.ac.in` | `Krishnamurthy` |

---

## API Documentation

All secure endpoints require the HTTP Header: `Authorization: Bearer <your-jwt-token>`. You can obtain the token using the Login API.

### 1. Authentication Module

#### Login
* **Method**: `POST`
* **Endpoint**: `/api/auth/login`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "email": "studentp101@kce.ac.in",
    "password": "studentp101"
  }
  ```
* **Response Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "name": "Harshini Sasti",
      "email": "studentp101@kce.ac.in",
      "role": "Student",
      "age": 20,
      "phone": "+91 98765 43210",
      "address": "KCE Student Hostel, Coimbatore",
      "dept": "Computer Science & Engineering",
      "batch": "2023-2027",
      "profilePhotoUrl": null
    }
  }
  ```

#### Register
* **Method**: `POST`
* **Endpoint**: `/api/auth/register`
* **Auth Required**: No
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@kce.ac.in",
    "password": "password123",
    "role": "Student"
  }
  ```
* **Response Body**: User details object.

---

### 2. User & Profile Module

#### Get User Profile
* **Method**: `GET`
* **Endpoint**: `/api/users/profile`
* **Auth Required**: Yes

#### Update Profile Settings
* **Method**: `PUT`
* **Endpoint**: `/api/users/profile`
* **Auth Required**: Yes (updates currently logged-in user profile details)
* **Request Body**:
  ```json
  {
    "age": 21,
    "phone": "+91 99999 88888",
    "address": "Coimbatore Campus Quarters",
    "dept": "Computer Science",
    "batch": "2023-2027",
    "profilePhotoUrl": "data:image/png;base64,iVBORw0K..."
  }
  ```

#### Admin: CRUD Users
* **GET `/api/users`**: List all users (Optional parameter `?search=query` searches by name/email).
* **POST `/api/users`**: Create a user (Restricted to Admin).
* **PUT `/api/users/{id}`**: Update user details (Restricted to Admin).
* **DELETE `/api/users/{id}`**: Delete user (Restricted to Admin).
* **POST `/api/users/upload`**: Import users via bulk mock file upload.

---

### 3. Tasks Module

#### View Active Tasks
* **Method**: `GET`
* **Endpoint**: `/api/tasks`
* **Auth Required**: Yes
* **Query Parameters**:
  * `all` (boolean, default false): Set to `true` by teachers/admins to see hidden draft tasks.
  * `search` (string): Filters task title.

#### Create Task
* **Method**: `POST`
* **Endpoint**: `/api/tasks`
* **Auth Required**: Yes (Restricted to Teacher/Admin)
* **Request Body**:
  ```json
  {
    "title": "Database Normalization Assignment",
    "desc": "Normalize the hospital DB schema to 3NF & BCNF.",
    "dueDate": "2026-08-15",
    "targetClass": "CSE A",
    "visible": false,
    "fileName": "assignment_desc.pdf"
  }
  ```

#### Publish Hidden Task
* **Method**: `POST`
* **Endpoint**: `/api/tasks/{id}/publish`
* **Auth Required**: Yes (Restricted to Teacher/Admin)

---

### 4. Submissions Module

#### Submit Task (Includes AI Bullying Scanner)
* **Method**: `POST`
* **Endpoint**: `/api/submissions`
* **Auth Required**: Yes (Student role)
* **Request Body**:
  ```json
  {
    "taskTitle": "Data Structures Assignment",
    "fileName": "bst_tree.pdf",
    "comment": "You look like a cow and your body like an elephant"
  }
  ```
* **Response Body**: Returns the submission object, with calculated severity score and flag status:
  ```json
  {
    "id": 5,
    "taskTitle": "Data Structures Assignment",
    "fileName": "bst_tree.pdf",
    "date": "2026-08-04",
    "status": "Received",
    "feedback": "Awaiting Review",
    "severityScore": 80,
    "flagStatus": "Flagged",
    "studentName": "Harshini Sasti",
    "content": "You look like a cow and your body like an elephant"
  }
  ```

#### View Submissions
* **Method**: `GET`
* **Endpoint**: `/api/submissions`
* **Auth Required**: Yes
* **Query Parameters**:
  * `all` (boolean, default false): Fetches all student submissions (Teachers, Counselors, Admin).
  * `filter` (string): Filter by "Flagged" or "Safe".

#### Forward Flagged Submission to Counselor
* **Method**: `POST`
* **Endpoint**: `/api/submissions/{id}/forward`
* **Auth Required**: Yes (Teacher/Admin role)

---

### 5. Cyberbullying Cases Module

#### View Incidents/Cases
* **Method**: `GET`
* **Endpoint**: `/api/cases`
* **Auth Required**: Yes (Counselor, Principal, Teacher, Admin)
* **Query Parameters**:
  * `status`: Filters by `Pending` or `Resolved` or `All`.

#### Report Issue (Self-report)
* **Method**: `POST`
* **Endpoint**: `/api/cases`
* **Auth Required**: Yes (Student role)
* **Request Body**:
  ```json
  {
    "type": "Cyber bullying",
    "desc": "A student in my class is posting threatening comments on social media.",
    "file": "evidence.png"
  }
  ```

#### Resolve Case
* **Method**: `PUT`
* **Endpoint**: `/api/cases/{id}/resolve`
* **Auth Required**: Yes (Counselor/Admin role)
* **Request Body**:
  ```json
  {
    "decision": "Falsely Detected / Student Warned / Parent Met"
  }
  ```

---

### 6. Messaging & Chat Module

#### Get Conversations Log
* **Method**: `GET`
* **Endpoint**: `/api/chats`
* **Auth Required**: Yes (Returns student-to-student conversations list grouped by contact name)

#### Send Chat Message
* **Method**: `POST`
* **Endpoint**: `/api/chats`
* **Auth Required**: Yes
* **Request Body**:
  ```json
  {
    "recipient": "Jan She",
    "text": "I completed the assignment"
  }
  ```

---

### 7. Student-to-Teacher Messages Inbox

#### View Teacher Inbox Messages
* **Method**: `GET`
* **Endpoint**: `/api/student-messages`
* **Auth Required**: Yes (Restricted to Teacher, Admin, Principal)

#### Forward Inbox Message to Counselor
* **Method**: `POST`
* **Endpoint**: `/api/student-messages/{id}/forward`
* **Auth Required**: Yes (Restricted to Teacher, Admin)

---

### 8. Counseling Slots Module

#### Book Counseling Slot
* **Method**: `POST`
* **Endpoint**: `/api/counseling-slots`
* **Auth Required**: Yes (Student role)
* **Request Body**:
  ```json
  {
    "rollNo": "23CSE101",
    "dept": "Computer Science & Engineering",
    "reason": "Exhausted and need support regarding exams."
  }
  ```

#### Approve Counseling Slot
* **Method**: `PUT`
* **Endpoint**: `/api/counseling-slots/{id}/approve`
* **Auth Required**: Yes (Counselor/Admin role)
* **Request Body**:
  ```json
  {
    "timings": "2026-08-10 11:00 AM - 12:00 PM"
  }
  ```

---

### 9. Learning Materials Module

#### View Materials
* **Method**: `GET`
* **Endpoint**: `/api/materials`
* **Auth Required**: Yes

#### Share Material
* **Method**: `POST`
* **Endpoint**: `/api/materials`
* **Auth Required**: Yes (Teacher/Admin role)

---

### 10. Dashboard Statistics Module

#### Fetch Statistics
* **Method**: `GET`
* **Endpoint**: `/api/dashboard/stats`
* **Auth Required**: Yes (Automatically returns statistics specific to the logged-in user's role: safety scores, counts of pending incidents, scan rates, active tasks counts)

---

### 11. File Upload/Download Module

#### Upload File
* **Method**: `POST`
* **Endpoint**: `/api/files/upload`
* **Auth Required**: Yes (Multipart file upload)
* **Response**: Returns a JSON with the `fileUrl` download link.

#### Download File
* **Method**: `GET`
* **Endpoint**: `/api/files/download/{fileName}`
* **Auth Required**: No (Allows access to download files directly)
