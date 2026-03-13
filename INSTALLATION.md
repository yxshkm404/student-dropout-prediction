# 🎓 Student Dropout Prediction System — Installation Guide

A step-by-step guide to set up and run this project on any computer using **Docker**.

---

## 📋 Prerequisites

You only need **two things** installed on your computer:

### 1. Git (to download the project)

| OS | Install Command / Link |
|----|----------------------|
| **Windows** | Download from [git-scm.com](https://git-scm.com/download/win) |
| **macOS** | `brew install git` or download from [git-scm.com](https://git-scm.com/download/mac) |
| **Linux** | `sudo apt install git` (Ubuntu/Debian) or `sudo dnf install git` (Fedora) |

✅ **Verify:** Open a terminal and run:
```bash
git --version
```
You should see something like `git version 2.x.x`.

---

### 2. Docker Desktop (to run the project)

| OS | Download Link |
|----|--------------|
| **Windows** | [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/) |
| **macOS** | [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/) |
| **Linux** | [Docker Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/) |

> [!IMPORTANT]
> **Windows users:** Docker Desktop requires **WSL 2** (Windows Subsystem for Linux). The Docker installer will guide you through setting it up if you don't have it already.

After installing, **open Docker Desktop** and wait until the whale icon in the taskbar/menu bar shows "Docker Desktop is running".

✅ **Verify:** Open a terminal and run:
```bash
docker --version
docker compose version
```
You should see version numbers for both.

---

## 🚀 Installation Steps

### Step 1: Clone the Project

Open a terminal (Command Prompt / PowerShell on Windows, Terminal on macOS/Linux):

```bash
git clone <repository-url>
```

> Replace `<repository-url>` with the actual GitHub URL of this project.

Then navigate into the project folder:

```bash
cd CODE
```

---

### Step 2: Start the Application

Make sure **Docker Desktop is running**, then execute:

```bash
docker compose up --build -d
```

**What this does:**
- `--build` → Builds all the application images from scratch
- `-d` → Runs everything in the background (detached mode)

⏳ **First time will take 3–5 minutes** (it downloads Java, Python, Node.js, MySQL, etc.). Subsequent starts will be much faster.

You'll see output like:
```
✔ Image mysql:8.0            Pulled
✔ Image code-frontend        Built
✔ Image code-flask-ml        Built
✔ Image code-backend         Built
✔ Container dropout-mysql    Healthy
✔ Container dropout-flask-ml Healthy
✔ Container dropout-backend  Started
✔ Container dropout-frontend Started
```

---

### Step 3: Open the Application

Once everything is running, open your browser and go to:

### 👉 [http://localhost:3000](http://localhost:3000)

That's it! The app is running! 🎉

---

## 📦 What's Running Behind the Scenes

| Service | Description | Port |
|---------|------------|------|
| **Frontend** | React web interface | [localhost:3000](http://localhost:3000) |
| **Backend** | Spring Boot REST API | [localhost:8080](http://localhost:8080) |
| **Flask ML** | Machine Learning prediction engine | localhost:5001 |
| **MySQL** | Database storing all student/teacher data | localhost:3307 |

---

## 🛠 Useful Commands

Run all commands from the project root folder (`CODE/`).

### Check if all containers are running
```bash
docker compose ps
```
All 4 containers should show **"Up"** or **"Healthy"**.

### View live logs (to debug issues)
```bash
docker compose logs -f
```
Press `Ctrl + C` to stop watching logs.

### View logs for a specific service
```bash
docker compose logs backend     # Spring Boot logs
docker compose logs flask-ml    # Flask ML logs
docker compose logs frontend    # Nginx logs
docker compose logs mysql       # MySQL logs
```

### Stop the application
```bash
docker compose down
```

### Stop and delete ALL data (fresh start)
```bash
docker compose down -v
```
> ⚠️ This removes the database volume — all student/teacher data will be deleted.

### Restart after code changes
```bash
docker compose up --build -d
```

---

## ❓ Troubleshooting

### "Cannot connect to Docker daemon"
**Solution:** Open **Docker Desktop** app and wait until it says "Running".

### "Port already in use"
**Solution:** Another app is using port 3000, 8080, 5001, or 3307. Either:
- Stop the conflicting app, or
- Edit `docker-compose.yml` and change the host port (the number **before** the colon):
  ```yaml
  ports:
    - "4000:80"    # Change 3000 to 4000
  ```

### "Container keeps restarting"
**Solution:** Check the logs:
```bash
docker compose logs <service-name>
```
Common causes:
- MySQL not ready yet — wait 30 seconds and try again
- Port conflict — see above

### Build fails with "no space left on device"
**Solution:** Docker has run out of disk space. Clean up:
```bash
docker system prune -a
```
> ⚠️ This removes ALL unused Docker images and containers.

---

## 🔌 Connect MySQL Workbench to the Database

If you want to view or manage the database directly, you can use **MySQL Workbench** (a free GUI tool).

### 1. Install MySQL Workbench

Download from: [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)

> Choose your OS and install it. No MySQL server installation is needed — the database is already running inside Docker.

### 2. Create a New Connection

Open MySQL Workbench and click the **+** button next to "MySQL Connections":

| Field | Value |
|-------|-------|
| **Connection Name** | `Dropout Prediction DB` (or any name) |
| **Hostname** | `127.0.0.1` |
| **Port** | `3307` |
| **Username** | `root` |
| **Password** | Click "Store in Vault" → enter `root@2218` |

> [!IMPORTANT]
> The port is **3307** (not the default 3306), because we mapped it to avoid conflicts with any local MySQL installation.

### 3. Click "Test Connection"

You should see **"Successfully made the MySQL connection"**. Click **OK** to save.

### 4. Connect and Explore

Double-click your new connection. In the left sidebar under **Schemas**, you'll see:

```
dropout_db
├── Tables
│   ├── teachers      → All registered teachers
│   ├── students      → All students (linked to teachers)
│   ├── scores        → Test scores for each student
│   └── predictions   → ML prediction results
```

### 5. Useful Queries

Click on the **SQL Editor** tab (the lightning bolt icon) and try these:

```sql
-- See all teachers
SELECT * FROM dropout_db.teachers;

-- See all students with their teacher name
SELECT s.student_id, s.name, s.email, s.status, t.name AS teacher_name
FROM dropout_db.students s
JOIN dropout_db.teachers t ON s.teacher_id = t.id;

-- See all predictions with student names
SELECT st.name, st.student_id, p.status, p.pass_probability, p.risk_probability, p.weak_tests
FROM dropout_db.predictions p
JOIN dropout_db.students st ON p.student_id = st.id;

-- See all scores
SELECT st.name, sc.test_1, sc.test_2, sc.test_3, sc.test_4, sc.main_exam
FROM dropout_db.scores sc
JOIN dropout_db.students st ON sc.student_id = st.id;
```

---

## 🔑 First-Time Login

After starting the app, open [http://localhost:3000](http://localhost:3000) and use these default credentials:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Principal** | `principal@school.com` | `principal123` | Pre-configured, no registration needed |
| **Teacher** | — | — | Register via the app, then Principal must approve |
| **Student** | — | — | Added by a Teacher, then Teacher must approve |

> For a detailed explanation of user roles and data flow, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📌 Summary

```
1. Install Git + Docker Desktop
2. Clone the repo
3. Run: docker compose up --build -d
4. Open: http://localhost:3000
5. Login as Principal: principal@school.com / principal123
```

That's all you need! 🚀
