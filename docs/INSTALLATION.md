# 🚀 Setup & Installation

Want to run this project on your own computer? It's easier than it looks! 

Instead of installing 10 different pieces of software (like Java, Python, and MySQL servers), we use **Docker**. Docker is like a magic moving box—it packs up the entire application and everything it needs into little containers that run perfectly on any computer.

Follow these simple steps:

---

## 🛠 What You Need First

Before you start, you only need to download **two** things:

1. **[Git](https://git-scm.com/downloads)** (To download the code to your computer)
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (To run the application boxes)

*Make sure Docker Desktop is open and running in the background before you continue!*

---

## 🏃‍♀️ Step-by-Step Guide

### Step 1: Download the Code
Open your computer's terminal (or Command Prompt) and paste this command to download the project:

```bash
git clone https://github.com/yxshkm404/student-dropout-prediction.git
cd student-dropout-prediction
```

### Step 2: Configure the Database (.env)

You need to set up the database passwords. Create a file named `.env` in the same folder where you ran the commands above, and add these two lines:

```bash
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=dropout_db
```

### Step 3: Start the Project
Because we are using Docker, starting the project takes exactly **one command**. 

In your terminal, make sure you are in the `student-dropout-prediction` folder, and run:

```bash
docker-compose up --build
```

**Wait about 2-3 minutes.** You will see a lot of text scrolling by. This is Docker downloading Java, Python, a database, and setting up the whole system for you!

When the text stops moving rapidly, the app is ready.

---

## 🎉 How to View the App

Once Docker is finished building, you can open your web browser (like Chrome or Safari) and go to these links:

*   **🖥 The Main Website (Frontend):** [http://localhost:3000](http://localhost:3000) *(Go here to click around!)*
*   **⚙️ The Backend API:** [http://localhost:8080/api/teacher/model/metrics](http://localhost:8080/api/teacher/model/metrics) *(API test)*
*   **🤖 The AI Server:** [http://localhost:5001/ml/health](http://localhost:5001/ml/health) *(ML test)*

### How to Log In as the Principal
To test out the Principal features, use the account that is built into the system:

*   **Email:** `principal@school.com`
*   **Password:** `principal123`

*(From there, you can approve new Teacher accounts that you create!)*

---

## 🛑 How to Stop the App

When you are done testing, go back to your terminal where the text is running and press:

`Ctrl + C` (or `Cmd + C` on Mac)

If you want to completely erase the containers and start fresh next time (which deletes the mock student data inside the local database), run this command:
```bash
docker-compose down -v
```
