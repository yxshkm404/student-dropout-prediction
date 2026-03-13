package com.example.demo.Repository;

import com.example.demo.entity.Score;
import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {

    Optional<Score> findByStudent(Student student);

    boolean existsByStudent(Student student);
}