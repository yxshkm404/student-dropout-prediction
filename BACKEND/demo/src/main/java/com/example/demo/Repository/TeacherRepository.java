package com.example.demo.Repository;

import com.example.demo.entity.Teacher;
import com.example.demo.entity.Teacher.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByEmail(String email);

    List<Teacher> findByStatus(Status status);

    boolean existsByEmail(String email);
}