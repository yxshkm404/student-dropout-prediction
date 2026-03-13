package com.example.demo.Controller;

import com.example.demo.Repository.PredictionRepository;
import com.example.demo.Repository.StudentRepository;
import com.example.demo.Repository.TeacherRepository;
import com.example.demo.entity.Prediction;
import com.example.demo.entity.Student;
import com.example.demo.entity.Teacher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/principal")
@CrossOrigin(origins = "*")
public class PrincipalController {

    @Autowired private TeacherRepository    teacherRepository;
    @Autowired private StudentRepository    studentRepository;
    @Autowired private PredictionRepository predictionRepository;

    // ── GET ALL TEACHERS ─────────────────────────────────────
    @GetMapping("/teachers")
    public ResponseEntity<Map<String, Object>> getAllTeachers() {
        Map<String, Object> response = new HashMap<>();
        List<Teacher> teachers = teacherRepository.findAll();
        response.put("success",  true);
        response.put("teachers", teachers);
        return ResponseEntity.ok(response);
    }

    // ── GET PENDING TEACHERS ─────────────────────────────────
    @GetMapping("/teachers/pending")
    public ResponseEntity<Map<String, Object>> getPendingTeachers() {
        Map<String, Object> response = new HashMap<>();
        List<Teacher> pending = teacherRepository.findByStatus(Teacher.Status.PENDING);
        response.put("success",  true);
        response.put("teachers", pending);
        response.put("count",    pending.size());
        return ResponseEntity.ok(response);
    }

    // ── APPROVE TEACHER ──────────────────────────────────────
    @PutMapping("/teachers/approve/{id}")
    public ResponseEntity<Map<String, Object>> approveTeacher(
            @PathVariable Long id) {

        Map<String, Object> response = new HashMap<>();
        Optional<Teacher> teacher = teacherRepository.findById(id);

        if (teacher.isEmpty()) {
            response.put("success", false);
            response.put("message", "Teacher not found!");
            return ResponseEntity.badRequest().body(response);
        }

        teacher.get().setStatus(Teacher.Status.APPROVED);
        teacherRepository.save(teacher.get());

        response.put("success", true);
        response.put("message", "Teacher " + teacher.get().getName() + " has been approved! They can now login.");
        return ResponseEntity.ok(response);
    }

    // ── REJECT TEACHER ───────────────────────────────────────
    @PutMapping("/teachers/reject/{id}")
    public ResponseEntity<Map<String, Object>> rejectTeacher(
            @PathVariable Long id) {

        Map<String, Object> response = new HashMap<>();
        Optional<Teacher> teacher = teacherRepository.findById(id);

        if (teacher.isEmpty()) {
            response.put("success", false);
            response.put("message", "Teacher not found!");
            return ResponseEntity.badRequest().body(response);
        }

        teacher.get().setStatus(Teacher.Status.REJECTED);
        teacherRepository.save(teacher.get());

        response.put("success", true);
        response.put("message", "Teacher " + teacher.get().getName() + " has been rejected.");
        return ResponseEntity.ok(response);
    }

    // ── MONITOR ALL STUDENTS ─────────────────────────────────
    @GetMapping("/monitor")
    public ResponseEntity<Map<String, Object>> monitorAll() {
        Map<String, Object> response = new HashMap<>();

        long totalStudents    = studentRepository.count();
        long pendingStudents  = studentRepository.countByStatus(Student.Status.PENDING);
        long approvedStudents = studentRepository.countByStatus(Student.Status.APPROVED);
        long rejectedStudents = studentRepository.countByStatus(Student.Status.REJECTED);
        long totalAtRisk      = predictionRepository.findByStatus("R").size();
        long totalPass        = predictionRepository.findByStatus("A").size();
        List<Prediction> all  = predictionRepository.findAll();

        response.put("success",          true);
        response.put("totalStudents",    totalStudents);
        response.put("pendingStudents",  pendingStudents);
        response.put("approvedStudents", approvedStudents);
        response.put("rejectedStudents", rejectedStudents);
        response.put("totalAtRisk",      totalAtRisk);
        response.put("totalPass",        totalPass);
        response.put("predictions",      all);
        return ResponseEntity.ok(response);
    }

    // ── OVERALL STATISTICS ───────────────────────────────────
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> response = new HashMap<>();

        long totalTeachers    = teacherRepository.count();
        long pendingTeachers  = teacherRepository.findByStatus(Teacher.Status.PENDING).size();
        long approvedTeachers = teacherRepository.findByStatus(Teacher.Status.APPROVED).size();
        long rejectedTeachers = teacherRepository.findByStatus(Teacher.Status.REJECTED).size();

        long totalStudents    = studentRepository.count();
        long pendingStudents  = studentRepository.countByStatus(Student.Status.PENDING);
        long approvedStudents = studentRepository.countByStatus(Student.Status.APPROVED);
        long rejectedStudents = studentRepository.countByStatus(Student.Status.REJECTED);

        long atRiskStudents = predictionRepository.findByStatus("R").size();
        long passStudents   = predictionRepository.findByStatus("A").size();

        response.put("success",          true);
        // Teacher stats
        response.put("totalTeachers",    totalTeachers);
        response.put("pendingTeachers",  pendingTeachers);
        response.put("approvedTeachers", approvedTeachers);
        response.put("rejectedTeachers", rejectedTeachers);
        // Student stats
        response.put("totalStudents",    totalStudents);
        response.put("pendingStudents",  pendingStudents);
        response.put("approvedStudents", approvedStudents);
        response.put("rejectedStudents", rejectedStudents);
        // Prediction stats
        response.put("atRiskStudents",   atRiskStudents);
        response.put("passStudents",     passStudents);
        return ResponseEntity.ok(response);
    }
}