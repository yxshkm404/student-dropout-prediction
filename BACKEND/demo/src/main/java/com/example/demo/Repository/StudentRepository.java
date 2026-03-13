package com.example.demo.Repository;

import com.example.demo.entity.Student;
import com.example.demo.entity.Student.Status;
import com.example.demo.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByStudentId(String studentId);

    List<Student> findByTeacher(Teacher teacher);

    boolean existsByEmail(String email);

    boolean existsByStudentId(String studentId);

	long countByStatus(Status pending);

	List<Student> findByTeacherAndStatus(Teacher teacher, Status pending);
}