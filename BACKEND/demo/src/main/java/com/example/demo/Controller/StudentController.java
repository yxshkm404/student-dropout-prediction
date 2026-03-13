package com.example.demo.Controller;

import com.example.demo.Repository.PredictionRepository;
import com.example.demo.Repository.ScoreRepository;
import com.example.demo.Repository.StudentRepository;
import com.example.demo.entity.Prediction;
import com.example.demo.entity.Score;
import com.example.demo.entity.Student;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    @Autowired private StudentRepository    studentRepository;
    @Autowired private ScoreRepository      scoreRepository;
    @Autowired private PredictionRepository predictionRepository;

    // ── HELPER: check student exists and is APPROVED ───────
    private ResponseEntity<Map<String, Object>> checkStudent(
            Long studentId, Map<String, Object> response) {

        Optional<Student> student = studentRepository.findById(studentId);

        if (student.isEmpty()) {
            response.put("success", false);
            response.put("message", "Student not found!");
            return ResponseEntity.badRequest().body(response);
        }

        if (student.get().getStatus() == Student.Status.PENDING) {
            response.put("success", false);
            response.put("message", "Your account is pending approval by your Teacher. Please wait.");
            return ResponseEntity.status(403).body(response);
        }

        if (student.get().getStatus() == Student.Status.REJECTED) {
            response.put("success", false);
            response.put("message", "Your account has been rejected by your Teacher. Please contact your teacher.");
            return ResponseEntity.status(403).body(response);
        }

        return null; // null = student is valid and APPROVED, proceed
    }

    // ── GET STUDENT PROFILE ────────────────────────────────
    @GetMapping("/profile/{studentId}")
    public ResponseEntity<Map<String, Object>> getProfile(
            @PathVariable Long studentId) {

        Map<String, Object> response = new HashMap<>();

        // Guard: must be APPROVED
        ResponseEntity<Map<String, Object>> guard = checkStudent(studentId, response);
        if (guard != null) return guard;

        Student s = studentRepository.findById(studentId).get();

        response.put("success",     true);
        response.put("id",          s.getId());
        response.put("studentId",   s.getStudentId());
        response.put("name",        s.getName());
        response.put("email",       s.getEmail());
        response.put("status",      s.getStatus().name());
        response.put("teacherName", s.getTeacher().getName());
        return ResponseEntity.ok(response);
    }

    // ── GET STUDENT SCORES ─────────────────────────────────
    @GetMapping("/scores/{studentId}")
    public ResponseEntity<Map<String, Object>> getScores(
            @PathVariable Long studentId) {

        Map<String, Object> response = new HashMap<>();

        // Guard: must be APPROVED
        ResponseEntity<Map<String, Object>> guard = checkStudent(studentId, response);
        if (guard != null) return guard;

        Student s = studentRepository.findById(studentId).get();

        Optional<Score> score = scoreRepository.findByStudent(s);
        if (score.isEmpty()) {
            response.put("success", false);
            response.put("message", "Scores not entered yet! Ask your teacher to enter your scores.");
            return ResponseEntity.badRequest().body(response);
        }

        Score sc  = score.get();
        double avg = (sc.getTest1() + sc.getTest2() + sc.getTest3() +
                      sc.getTest4() + sc.getMainExam()) / 5.0;

        response.put("success",  true);
        response.put("test1",    sc.getTest1());
        response.put("test2",    sc.getTest2());
        response.put("test3",    sc.getTest3());
        response.put("test4",    sc.getTest4());
        response.put("mainExam", sc.getMainExam());
        response.put("average",  Math.round(avg * 10.0) / 10.0);
        return ResponseEntity.ok(response);
    }

    // ── GET STUDENT PREDICTION ─────────────────────────────
    @GetMapping("/prediction/{studentId}")
    public ResponseEntity<Map<String, Object>> getPrediction(
            @PathVariable Long studentId) {

        Map<String, Object> response = new HashMap<>();

        // Guard: must be APPROVED
        ResponseEntity<Map<String, Object>> guard = checkStudent(studentId, response);
        if (guard != null) return guard;

        Student s = studentRepository.findById(studentId).get();

        Optional<Prediction> prediction = predictionRepository.findByStudent(s);
        if (prediction.isEmpty()) {
            response.put("success", false);
            response.put("message", "Prediction not run yet! Ask your teacher to run the prediction.");
            return ResponseEntity.badRequest().body(response);
        }

        Prediction p = prediction.get();
        response.put("success",         true);
        response.put("status",          p.getStatus());
        response.put("statusMeaning",   p.getStatus().equals("A") ? "Pass" : "At Risk");
        response.put("clusterGroup",    p.getClusterGroup());
        response.put("weakTests",       p.getWeakTests());
        response.put("passProbability", p.getPassProbability() * 100);
        response.put("riskProbability", p.getRiskProbability() * 100);
        response.put("message",         p.getStatus().equals("A")
            ? "Great job! Keep it up!"
            : "You need to improve: " + p.getWeakTests());
        return ResponseEntity.ok(response);
    }

    // ── UPDATE STUDENT PROFILE ─────────────────────────────
    @PutMapping("/profile/{studentId}")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable Long studentId,
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        Optional<Student> opt = studentRepository.findById(studentId);
        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Student not found!");
            return ResponseEntity.badRequest().body(response);
        }

        Student s = opt.get();

        String newName     = request.get("name");
        String newEmail    = request.get("email");
        String newPassword = request.get("password");

        // Validate name
        if (newName != null && !newName.trim().isEmpty()) {
            s.setName(newName.trim());
        }

        // Validate email — must be unique if changed
        if (newEmail != null && !newEmail.trim().isEmpty()
                && !newEmail.trim().equalsIgnoreCase(s.getEmail())) {
            if (studentRepository.existsByEmail(newEmail.trim())) {
                response.put("success", false);
                response.put("message", "Email already in use by another student!");
                return ResponseEntity.badRequest().body(response);
            }
            s.setEmail(newEmail.trim());
        }

        // Validate password — only update if provided
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (newPassword.trim().length() < 6) {
                response.put("success", false);
                response.put("message", "Password must be at least 6 characters!");
                return ResponseEntity.badRequest().body(response);
            }
            s.setPassword(newPassword.trim());
        }

        studentRepository.save(s);

        response.put("success", true);
        response.put("message", "Profile updated successfully!");
        response.put("name",    s.getName());
        response.put("email",   s.getEmail());
        return ResponseEntity.ok(response);
    }
}