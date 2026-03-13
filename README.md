# Student Dropout Prediction System

Welcome to the **Student Dropout Prediction System** repository! This application is designed to predict the likelihood of a student dropping out by using an integrated stack of React, Spring Boot, a Flask Machine Learning service, and a MySQL database.

For a detailed explanation of the project's purpose, advantages, and beginner-friendly architecture breakdown, please read the [Project Details Document](docs/PROJECT-DETAILS.md).

## 📁 Folder Structure

```text
student-dropout-prediction/
├── BACKEND/
│   └── demo/                     # Spring Boot Application (Java)
│       └── src/main/resources/
│           └── flask-ml/         # Python Flask Microservice (ML Model)
├── FRONTEND/
│   └── my-react-app/             # React UI application (JavaScript)
├── docs/
│   └── project_details.md        # Detailed project documentation for reviews
├── docker-compose.yml            # Orchestration for all services
└── .env                          # Environment variables (Database credentials, etc.)
```

## 🚀 Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Docker:** Must be installed and running ([Download Docker Desktop](https://www.docker.com/products/docker-desktop/)).
- **Git:** To clone the repository.
- **MySQL Workbench** (Optional but recommended): For viewing and managing the database locally.

## 🛠️ Installation & Getting Started

Because this project is heavily reliant on Docker, starting the application is incredibly simple. You do not need Java, Python, or Node.js installed locally on your machine—Docker handles everything!

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd student-dropout-prediction
   ```

2. **Start the application using Docker Compose:**
   Run the following command in the root folder (where `docker-compose.yml` is located):
   ```bash
   docker compose up --build -d
   ```
   *Note: The `-d` flag runs it in detached mode so your terminal remains free. The `--build` flag ensures it builds the latest changes.*

3. **Verify the services are running:**
   ```bash
   docker compose ps
   ```

### Application URLs
Once the build is complete and the containers are running, you can access the services at:
- **Frontend (React UI):** [http://localhost:3000](http://localhost:3000)
- **Backend API (Spring Boot):** [http://localhost:8080](http://localhost:8080)
- **ML Service (Flask):** [http://localhost:5001](http://localhost:5001)

## 🗄️ Connecting to MySQL Workbench

Although MySQL is running inside a Docker Container, we have mapped its port to your local machine (using port `3307`) so you can connect to it using standard database tools without conflicts alongside a local MySQL installation.

To connect your **MySQL Workbench** to the database powering this application:

1. Open **MySQL Workbench**.
2. Click the **+** icon next to "MySQL Connections" to create a new connection.
3. Fill in the connection settings:
   - **Connection Name:** `Dropout Prediction DB (Docker)`
   - **Hostname:** `127.0.0.1` (or `localhost`)
   - **Port:** `3307` *(Crucial: Do not use the default 3306!)*
   - **Username:** `root`
   - **Password:** Click "Store in Vault/Keychain..." and enter the password configured in your `.env` file (the default is usually `root@2218`).
4. Click **Test Connection**. It should say "Successfully made the MySQL connection".
5. Click **OK** to save the connection, and double-click the newly created connection card to open it.
6. The database name is typically `dropout_db`.

## 🛑 Stopping the Application
To safely shut down the containers, free up the ports, and securely preserve your database volume data, run:
```bash
docker compose down
```
If you wish to completely "factory reset" the application and wipe the database data, run:
```bash
docker compose down -v
```

---
*Good luck with your project review!*
