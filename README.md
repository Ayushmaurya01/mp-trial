# Student Performance Tracker 🎓

**Student Performance Tracker** is a full-stack academic performance management web application built for individual students. It centralizes subject tracking, unit progress, topic completion checklists, class lecture logs, attendance monitoring, and assignment deadline tracking with real-time automatic progress calculations and visual analytics.

---

## 🚀 Key Features

1. **Secure Student Authentication**
   - JWT-based authentication with bcrypt password hashing.
   - Student profile containing name, email, course/branch, and semester/year.
   - Full data isolation ensuring logged-in students access only their academic records.

2. **Real-Time Academic Dashboard**
   - Live summary metrics: Overall Academic Progress %, Average Attendance %, Total Subjects, and Pending Assignments count.
   - Low attendance warning alerts when attendance dips below 75%.
   - Subject breakdown cards with interactive circular progress gauges.
   - Recently updated academic activities feed (lectures & assignments).

3. **Subject Management Module**
   - Full CRUD operations for academic subjects (e.g., Data Structures, DBMS, Operating Systems).
   - Track subject name, course code, faculty name, semester, and course objectives.

4. **Unit & Topic Syllabus Management**
   - Organize subjects into numbered Units (e.g. Unit 1, Unit 2).
   - Create individual Topics inside units with interactive completion checkboxes.
   - Automated unit & topic completion percentage calculations:
     $$\text{Topic Completion \%} = \frac{\text{Completed Topics}}{\text{Total Topics}} \times 100$$
   - Units automatically switch to completed when 100% of their topics are finished.

5. **Attendance Tracking & Low Attendance Alert**
   - Dedicated attendance tracker per subject recording total, present, and absent lectures.
   - Formula:
     $$\text{Attendance \%} = \frac{\text{Present Lectures}}{\text{Total Lectures}} \times 100$$
   - One-click quick log buttons (`+ Present`, `+ Absent`).
   - Warning banners triggered automatically when attendance is below target threshold.

6. **Lecture History Tracking**
   - Log class lectures with date, topic covered, notes, and attendance integration.

7. **Assignment Management**
   - Track homework & coursework deadlines.
   - Filter by status (`All`, `Pending`, `Completed`).
   - Overdue badges for missed deadlines.

8. **Transparent Progress Analytics**
   - Overall aggregate academic progress calculation based on transparent weighted formula:
     $$\text{Subject Progress \%} = (0.40 \times \text{Topic \%}) + (0.30 \times \text{Attendance \%}) + (0.30 \times \text{Assignment \%})$$
   - Detailed subject comparison table.

9. **Viva Demonstration Utility**
   - Built-in "Seed Demo Data" button to insert sample B.Tech subjects, syllabus units, attendance records, and assignments with one click for live presentations.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), JavaScript (ES6+), HTML5, CSS3 Custom Academic Design System, React Router v6, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js REST APIs, JWT (`jsonwebtoken`), `bcryptjs`, CORS, dotenv.
- **Database**: MongoDB & Mongoose ODM (with automatic `mongodb-memory-server` fallback for zero-config execution if MongoDB server is not running locally).

---

## 📁 System Architecture & Folder Structure

```
Student Performance Tracker/
├── client/                      # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/              # SVGs and branding
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Gauges, ProgressBars, Modals, EmptyStates, Toast
│   │   │   ├── dashboard/       # Dashboard specific cards & widgets
│   │   ├── context/             # AuthContext & ToastContext
│   │   ├── layouts/             # DashboardLayout & AuthLayout
│   │   ├── pages/               # Landing, Login, Register, Dashboard, Subjects, SubjectDetail, Attendance, Assignments, Progress, Profile
│   │   ├── services/            # Axios API configuration & endpoints
│   │   ├── utils/               # Date formatters & helpers
│   │   ├── App.jsx              # React Router setup & protected routes
│   │   ├── index.css            # Academic Dark/Light CSS design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js Express REST API Backend
│   ├── config/                  # MongoDB DB connection + memory fallback
│   ├── controllers/             # Auth, Subject, Unit, Topic, Attendance, Lecture, Assignment, Progress controllers
│   ├── middleware/              # JWT Protect & Error handling middlewares
│   ├── models/                  # Mongoose models (User, Subject, Unit, Topic, Attendance, Lecture, Assignment)
│   ├── routes/                  # Express routes
│   ├── services/                # Progress calculation service engine
│   ├── utils/                   # JWT helper & seed sample data generator
│   ├── index.js                 # Express server entry point
│   └── package.json
├── .env.example                 # Sample environment configuration
├── package.json                 # Root script for concurrent execution
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (Optional: If local MongoDB is not installed, the application automatically uses an in-memory database server).

### 1. Clone & Install Dependencies
Run from project root directory:
```bash
# Install root, server, and client dependencies
npm run install:all
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` or set environment variables:
`server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/student_tracker
JWT_SECRET=super_secret_student_tracker_jwt_key_2026_academic_demo
JWT_EXPIRE=30d
```

### 3. Run the Application
From the root directory:
```bash
# Start both backend REST API (Port 5000) and frontend client (Port 3000) concurrently
npm run dev
```

Open your browser and navigate to:
**`http://localhost:3000`**

---

## 🧪 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new student | ❌ |
| `POST` | `/api/auth/login` | Student login | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile / password | ✅ |
| `POST` | `/api/auth/seed` | Seed sample academic data | ✅ |
| `GET` | `/api/subjects` | List student subjects | ✅ |
| `POST` | `/api/subjects` | Create new subject | ✅ |
| `GET` | `/api/subjects/:id` | Get subject details & progress | ✅ |
| `PUT` | `/api/subjects/:id` | Update subject | ✅ |
| `DELETE` | `/api/subjects/:id` | Delete subject & cascaded data | ✅ |
| `GET` | `/api/subjects/:subjectId/units` | List units for subject | ✅ |
| `POST` | `/api/subjects/:subjectId/units` | Create unit | ✅ |
| `PUT` | `/api/units/:id` | Update unit status | ✅ |
| `DELETE` | `/api/units/:id` | Delete unit | ✅ |
| `GET` | `/api/units/:unitId/topics` | List topics for unit | ✅ |
| `POST` | `/api/units/:unitId/topics` | Create topic | ✅ |
| `PUT` | `/api/topics/:id` | Toggle topic completion | ✅ |
| `DELETE` | `/api/topics/:id` | Delete topic | ✅ |
| `GET` | `/api/attendance` | Fetch all subject attendance | ✅ |
| `POST` | `/api/attendance/log` | Quick log +1 present/absent | ✅ |
| `PUT` | `/api/attendance/:id` | Update attendance counts | ✅ |
| `GET` | `/api/lectures` | List lecture history | ✅ |
| `POST` | `/api/lectures` | Record lecture entry | ✅ |
| `GET` | `/api/assignments` | List assignments | ✅ |
| `POST` | `/api/assignments` | Create assignment | ✅ |
| `PUT` | `/api/assignments/:id` | Toggle assignment status | ✅ |
| `DELETE` | `/api/assignments/:id` | Delete assignment | ✅ |
| `GET` | `/api/progress` | Fetch overall student progress | ✅ |

---

## 🎯 Viva Demonstration Workflow

For B.Tech mini project presentation:
1. Open `http://localhost:3000`.
2. Register a new student account (e.g. `alex@student.edu`).
3. On the empty dashboard, click **"Seed Demo Data"**.
4. Observe automatic population of B.Tech subjects (*Data Structures*, *DBMS*, *Computer Networks*, *Operating Systems*).
5. Open **Data Structures** subject details:
   - Check off topics in Unit 2 (*Circular Linked List*).
   - Notice Unit 2 completion percentage and Subject progress gauge update instantly.
6. Navigate to **Attendance**:
   - Click `+ Present` or `+ Absent`.
   - Observe real-time attendance percentage recalculation and warning banner for low attendance.
7. Navigate to **Assignments**:
   - Check off an assignment as Completed.
8. Navigate to **Progress Analytics**:
   - Review transparent progress formulas and aggregate academic index.

---

## 🔮 Future Scope

- Integration with institution timetable APIs.
- CGPA / SGPA grade calculator module.
- Automated email/push reminders for upcoming assignment due dates.
- Export academic progress report as PDF / CSV.

---

## 📄 License

This mini project is open-source under the ISC License.
