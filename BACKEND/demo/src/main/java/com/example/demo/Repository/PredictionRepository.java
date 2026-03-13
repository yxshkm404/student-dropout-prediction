package com.example.demo.Repository;

import com.example.demo.entity.Prediction;
import com.example.demo.entity.Student;
import com.example.demo.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    Optional<Prediction> findByStudent(Student student);

    // Get all at risk students
    List<Prediction> findByStatus(String status);

    // Get predictions by teacher's students
    @Query("SELECT p FROM Prediction p WHERE p.student.teacher = :teacher")
    List<Prediction> findByTeacher(Teacher teacher);

    // Count at risk students for a teacher
    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.student.teacher = :teacher AND p.status = 'R'")
    Long countAtRiskByTeacher(Teacher teacher);

    // Count pass students for a teacher
    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.student.teacher = :teacher AND p.status = 'A'")
    Long countPassByTeacher(Teacher teacher);
}