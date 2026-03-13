package com.example.demo.Controller;

import com.example.demo.Repository.StudentRepository;
import com.example.demo.Repository.TeacherRepository;
import com.example.demo.entity.Student;
import com.example.demo.entity.Teacher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    // ── TEACHER REGISTER ───────────────────────────────────
    // Status defaults to PENDING — Principal must approve
    @PostMapping("/teacher/register")
    public ResponseEntity<Map<String, Object>> teacherRegister(
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        String email = request.get("email");
        String name  = request.get("name");
        String pass  = request.get("password");

        if (teacherRepository.existsByEmail(email)) {
            response.put("success", false);
            response.put("message", "Email already registered!");
            return ResponseEntity.badRequest().body(response);
        }

        Teacher teacher = new Teacher(name, email, pass, Teacher.Status.PENDING);
        teacherRepository.save(teacher);

        response.put("success", true);
        response.put("message", "Registration successful! Please wait for the Principal to approve your account before logging in.");
        return ResponseEntity.ok(response);
    }

    // ── UNIVERSAL LOGIN ────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> request) {

        Map<String, Object> response = new HashMap<>();

        String email    = request.get("email");
        String password = request.get("password");
        String role     = request.get("role");

        // ── Principal login (hardcoded) ──────────────────
        if ("PRINCIPAL".equals(role)) {
            if ("principal@school.com".equals(email) &&
                "principal123".equals(password)) {
                response.put("success", true);
                response.put("role",    "PRINCIPAL");
                response.put("name",    "Principal");
                response.put("message", "Welcome, Principal!");
                return ResponseEntity.ok(response);
            }
            response.put("success", false);
            response.put("message", "Invalid Principal credentials!");
            return ResponseEntity.badRequest().body(response);
        }

        // ── Teacher login ────────────────────────────────
        if ("TEACHER".equals(role)) {
            Optional<Teacher> opt = teacherRepository.findByEmail(email);

            if (opt.isEmpty()) {
                response.put("success", false);
                response.put("message", "No teacher account found with this email!");
                return ResponseEntity.badRequest().body(response);
            }

            Teacher teacher = opt.get();

            if (!teacher.getPassword().equals(password)) {
                response.put("success", false);
                response.put("message", "Incorrect password!");
                return ResponseEntity.badRequest().body(response);
            }

            if (teacher.getStatus() == Teacher.Status.PENDING) {
                response.put("success", false);
                response.put("message", "Your account is pending approval by the Principal. Please wait.");
                return ResponseEntity.badRequest().body(response);
            }

            if (teacher.getStatus() == Teacher.Status.REJECTED) {
                response.put("success", false);
                response.put("message", "Your account has been rejected by the Principal. Please contact your school.");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success", true);
            response.put("role",    "TEACHER");
            response.put("id",      teacher.getId());
            response.put("name",    teacher.getName());
            response.put("message", "Welcome, " + teacher.getName() + "!");
            return ResponseEntity.ok(response);
        }

        // ── Student login ────────────────────────────────
        if ("STUDENT".equals(role)) {
            Optional<Student> opt = studentRepository.findByEmail(email);

            if (opt.isEmpty()) {
                response.put("success", false);
                response.put("message", "No student account found with this email!");
                return ResponseEntity.badRequest().body(response);
            }

            Student student = opt.get();

            if (!student.getPassword().equals(password)) {
                response.put("success", false);
                response.put("message", "Incorrect password!");
                return ResponseEntity.badRequest().body(response);
            }

            // ── NEW: Check student approval status ──────
            if (student.getStatus() == Student.Status.PENDING) {
                response.put("success", false);
                response.put("message", "Your account is pending approval by your Teacher. Please wait.");
                return ResponseEntity.badRequest().body(response);
            }

            if (student.getStatus() == Student.Status.REJECTED) {
                response.put("success", false);
                response.put("message", "Your account has been rejected by your Teacher. Please contact your teacher.");
                return ResponseEntity.badRequest().body(response);
            }

            response.put("success",   true);
            response.put("role",      "STUDENT");
            response.put("id",        student.getId());
            response.put("name",      student.getName());
            response.put("studentId", student.getStudentId());
            response.put("message",   "Welcome, " + student.getName() + "!");
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("message", "Invalid role selected!");
        return ResponseEntity.badRequest().body(response);
    }
}