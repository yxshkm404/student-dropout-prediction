import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./Home/LandingPage";
import LoginPage from "./Home/LoginPage";
import RegisterPage from "./Home/RegisterPage";
import PrincipalLayout from "./Principal/PrincipalLayout";
import PrincipalDashboard from "./Principal/PrincipalDashboard";
import TeacherManagement from "./Principal/TeacherManagement";
import StudentMonitor from "./Principal/StudentMonitor";
import Statistics from "./Principal/Statistics";
import TeacherLayout from "./Teacher/TeacherLayout";
import TeacherDashboard from "./Teacher/TeacherDashboard";
import StudentManagement from "./Teacher/StudentManagement";
import ScoreEntry from "./Teacher/ScoreEntry";
import Predictions from "./Teacher/Predictions";
import ModelInfo from "./Teacher/ModelInfo";
import StudentLayout from "./Student/StudentLayout";
import StudentDashboard from "./Student/StudentDashboard";
import MyScores from "./Student/MyScores";
import MyPrediction from "./Student/MyPrediction";
import MyProfile from "./Student/MyProfile";
import TeacherProfile from "./Teacher/TeacherProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrincipalLayout />}>
          <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
          <Route path="/principal/teachers" element={<TeacherManagement />} />
          <Route path="/principal/students" element={<StudentMonitor />} />
          <Route path="/principal/statistics" element={<Statistics />} />
        </Route>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<StudentManagement />} />
          <Route path="/teacher/scores" element={<ScoreEntry />} />
          <Route path="/teacher/predictions" element={<Predictions />} />
          <Route path="/teacher/models" element={<ModelInfo />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
        </Route>

        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/scores" element={<MyScores />} />
          <Route path="/student/prediction" element={<MyPrediction />} />
          <Route path="/student/profile" element={<MyProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;