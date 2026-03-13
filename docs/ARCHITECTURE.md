# 🏗 Student Dropout Prediction System — Architecture

## Overview

This is a **full-stack web application** that predicts whether a student is at risk of dropping out based on their test scores, using **Machine Learning** algorithms. It uses a role-based access system with three user types.

---

## 🔐 User Roles

| Role | Login Credentials | What They Can Do |
|------|------------------|-----------------|
| **Principal** | Email: `principal@school.com` / Password: `principal123` | Approve/reject teachers, monitor all students, view statistics |
| **Teacher** | Registered via the app (needs Principal approval) | Add students, enter scores, run ML predictions, view model info |
| **Student** | Added by their Teacher (needs Teacher approval) | View own scores, view dropout prediction, update profile |

### Approval Flow

```
Teacher registers → PENDING → Principal approves → APPROVED (can login)
Student is added  → PENDING → Teacher approves  → APPROVED (can login)
```

---

## 🧩 System Architecture

```mermaid
graph TB
    subgraph "Frontend — React 19 + Vite"
        UI[Browser / User Interface]
    end

    subgraph "Reverse Proxy — Nginx"
        NG[Nginx :80]
    end

    subgraph "Backend — Spring Boot 3.5"
        API[REST API :8080]
        AUTH[AuthController]
        TC[TeacherController]
        PC[PrincipalController]
        SC[StudentController]
        JPA[Hibernate / JPA]
    end

    subgraph "ML Service — Flask / Python"
        ML[Flask API :5000]
        DT[Decision Tree - J48]
        KM[K-Means Clustering]
        AP[Apriori Association Rules]
    end

    subgraph "Database — MySQL 8"
        DB[(dropout_db)]
    end

    UI --> NG
    NG -- "static files" --> UI
    NG -- "/api/*" --> API
    API --> AUTH
    API --> TC
    API --> PC
    API --> SC
    JPA --> DB
    TC -- "POST /ml/predict" --> ML
    TC -- "GET /ml/metrics" --> ML
    TC -- "GET /ml/clusters" --> ML
    TC -- "GET /ml/rules" --> ML
    ML --> DT
    ML --> KM
    ML --> AP
```

---

## 📁 Project Structure

```
CODE/
├── docker-compose.yml              # Orchestrates all 4 services
├── .env                            # MySQL credentials
├── INSTALLATION.md                 # Setup guide
├── ARCHITECTURE.md                 # This file
│
├── BACKEND/demo/                   # Spring Boot Backend
│   ├── Dockerfile
│   ├── pom.xml                     # Maven dependencies
│   └── src/main/
│       ├── java/com/example/demo/
│       │   ├── Controller/
│       │   │   ├── AuthController.java       # Login & teacher registration
│       │   │   ├── TeacherController.java    # Student mgmt, scores, predictions
│       │   │   ├── PrincipalController.java  # Teacher mgmt, statistics
│       │   │   └── StudentController.java    # Student profile, scores view
│       │   ├── Repository/                   # JPA data access layer
│       │   └── entity/
│       │       ├── Teacher.java              # Teacher entity
│       │       ├── Student.java              # Student entity
│       │       ├── Score.java                # Test scores entity
│       │       └── Prediction.java           # ML prediction results
│       └── resources/
│           ├── application.properties        # Local dev config
│           ├── application-docker.properties # Docker config
│           └── flask-ml/                     # Flask ML Service
│               ├── Dockerfile
│               ├── app.py                    # Flask API
│               ├── requirements.txt
│               └── data/                     # Pre-trained ML models
│                   ├── decision_tree_model.pkl
│                   ├── kmeans_model.pkl
│                   ├── scaler.pkl
│                   ├── label_encoder.pkl
│                   ├── association_rules.json
│                   └── model_metadata.json
│
└── FRONTEND/my-react-app/          # React Frontend
    ├── Dockerfile
    ├── nginx.conf                  # Nginx reverse proxy config
    ├── package.json
    └── src/
        ├── Home/                   # Landing, Login, Register pages
        ├── Principal/              # Principal dashboard & management
        ├── Teacher/                # Teacher dashboard & tools
        └── Student/                # Student dashboard & views
```

---

## 🗄 Database Schema

The database `dropout_db` has **4 tables**, auto-created by Hibernate:

```mermaid
erDiagram
    TEACHERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        enum status "PENDING | APPROVED | REJECTED"
    }

    STUDENTS {
        bigint id PK
        varchar student_id UK
        varchar name
        varchar email UK
        varchar password
        enum status "PENDING | APPROVED | REJECTED"
        bigint teacher_id FK
    }

    SCORES {
        bigint id PK
        bigint student_id FK,UK
        double test_1 "0.0 - 10.0"
        double test_2 "0.0 - 10.0"
        double test_3 "0.0 - 10.0"
        double test_4 "0.0 - 10.0"
        double main_exam "0.0 - 10.0"
        datetime created_at
    }

    PREDICTIONS {
        bigint id PK
        bigint student_id FK,UK
        varchar status "A (Pass) or R (At Risk)"
        int cluster_group "0-3, null if Pass"
        varchar weak_tests "Comma-separated list"
        double pass_probability "0.0 - 1.0"
        double risk_probability "0.0 - 1.0"
        datetime created_at
    }

    TEACHERS ||--o{ STUDENTS : "has many"
    STUDENTS ||--o| SCORES : "has one"
    STUDENTS ||--o| PREDICTIONS : "has one"
```

---

## 🤖 Machine Learning Pipeline

The Flask ML service uses **3 algorithms** on pre-trained models:

### 1. J48 Decision Tree (Classification)
- **Input:** 5 test scores (normalized via `scaler.pkl`)
- **Output:** `A` (Pass) or `R` (At Risk) + probability percentages
- **Accuracy:** ~93.8%

### 2. K-Means Clustering (Grouping)
- **When:** Only runs if student is classified as "At Risk"
- **Output:** Assigns student to 1 of 4 risk groups:

| Cluster | Description |
|---------|------------|
| 0 | Very Low Scorer — needs urgent support in all tests |
| 1 | Borderline Fail — slightly below passing in all tests |
| 2 | Average Weak — moderate scores but below threshold |
| 3 | Low Main Exam — weak in main exam and tests |

### 3. Apriori Association Rules (Pattern Detection)
- **Purpose:** Finds patterns like "students who fail Test 1 usually also fail Test 3"
- **Output:** Matching rules with confidence percentages

---

## 📊 Data Flow — How Data Enters the System

### Step 1: Principal Logs In (Hardcoded Account)
```
Email:    principal@school.com
Password: principal123
```
The principal account is pre-configured in the system code.

### Step 2: Teacher Registers
- Teacher goes to the **Register** page and fills in Name, Email, Password
- Account is created with status **PENDING**
- Principal logs in → **Teacher Management** → Approves the teacher
- Teacher can now log in

### Step 3: Teacher Adds Students
- Teacher logs in → **Student Management** → Adds student (Name, Email, Student ID, Password)
- Student account is created with status **PENDING**
- Teacher approves the student → Student can now log in

### Step 4: Teacher Enters Test Scores
- Teacher logs in → **Score Entry** → Selects a student
- Enters 5 scores (each between **0.0 and 10.0**):
  - Test 1, Test 2, Test 3, Test 4, Main Exam

### Step 5: Teacher Runs Prediction
- Teacher logs in → **Predictions** → Selects a student → Clicks "Predict"
- Backend sends the 5 scores to Flask ML → Gets prediction result
- Result is saved in the database and displayed:
  - **Status:** Pass or At Risk
  - **Probability:** Pass % and Risk %
  - **Risk Group:** (if At Risk) which cluster they belong to
  - **Weak Tests:** Which tests scored below 7.0
  - **Matching Rules:** Association rule patterns

### Step 6: Student Views Their Data
- Student logs in → Dashboard shows their scores and prediction results
- Students can also update their profile

### Visual Flow

```mermaid
sequenceDiagram
    participant P as Principal
    participant T as Teacher
    participant B as Backend (Spring Boot)
    participant F as Flask ML
    participant DB as MySQL
    participant S as Student

    P->>B: Login (hardcoded)
    T->>B: Register
    B->>DB: Save teacher (PENDING)
    P->>B: Approve teacher
    B->>DB: Update status → APPROVED

    T->>B: Login
    T->>B: Add student
    B->>DB: Save student (PENDING)
    T->>B: Approve student
    B->>DB: Update status → APPROVED

    T->>B: Enter scores (5 tests)
    B->>DB: Save scores

    T->>B: Run prediction
    B->>F: POST /ml/predict (5 scores)
    F->>F: Normalize → Decision Tree → K-Means → Apriori
    F-->>B: Prediction result
    B->>DB: Save prediction
    B-->>T: Display result

    S->>B: Login
    B->>DB: Fetch scores & prediction
    B-->>S: Display dashboard
```

---

## 🌐 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Login for all roles (Principal/Teacher/Student) |
| POST | `/teacher/register` | Register a new teacher |

### Teacher (`/api/teacher`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/students` | Add a new student |
| GET | `/students/{teacherId}` | Get all students for a teacher |
| PUT | `/students/approve/{id}` | Approve student account |
| PUT | `/students/reject/{id}` | Reject student account |
| POST | `/scores` | Enter test scores for a student |
| POST | `/predict/{studentId}` | Run ML prediction on a student |
| GET | `/predictions/{teacherId}` | Get all predictions |
| GET | `/model/metrics` | Get ML model accuracy metrics |
| GET | `/clusters` | Get K-Means cluster information |
| GET | `/rules` | Get association rules |
| GET/PUT | `/profile/{teacherId}` | View/update teacher profile |

### Principal (`/api/principal`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/teachers` | Get all teachers |
| GET | `/teachers/pending` | Get pending teachers |
| PUT | `/teachers/approve/{id}` | Approve teacher account |
| PUT | `/teachers/reject/{id}` | Reject teacher account |
| GET | `/monitor` | Monitor all students across teachers |
| GET | `/statistics` | Get system-wide statistics |

### Student (`/api/student`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scores/{studentId}` | View own scores |
| GET | `/prediction/{studentId}` | View own prediction |
| GET/PUT | `/profile/{studentId}` | View/update profile |

### Flask ML (`/ml`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Run prediction on 5 scores |
| GET | `/metrics` | Get model accuracy |
| GET | `/clusters` | Get cluster centroids |
| GET | `/rules` | Get association rules |
| GET | `/health` | Health check |

---

## 🐳 Docker Services

| Service | Image | Internal Port | Host Port |
|---------|-------|--------------|-----------|
| `mysql` | mysql:8.0 | 3306 | 3307 |
| `flask-ml` | code-flask-ml | 5000 | 5001 |
| `backend` | code-backend | 8080 | 8080 |
| `frontend` | code-frontend | 80 | 3000 |

---

## 🛠 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7, Recharts, Chart.js |
| Backend | Spring Boot 3.5.11, Java 17, Maven, Hibernate/JPA |
| ML Service | Python 3.11, Flask, scikit-learn, NumPy, Gunicorn |
| Database | MySQL 8.0 |
| Reverse Proxy | Nginx (Alpine) |
| Containerization | Docker, Docker Compose |
