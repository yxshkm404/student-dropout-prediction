package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "test_1", nullable = false)
    private Double test1;

    @Column(name = "test_2", nullable = false)
    private Double test2;

    @Column(name = "test_3", nullable = false)
    private Double test3;

    @Column(name = "test_4", nullable = false)
    private Double test4;

    @Column(name = "main_exam", nullable = false)
    private Double mainExam;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public Score() {}

    public Score(Student student, Double test1, Double test2,
                 Double test3, Double test4, Double mainExam) {
        this.student = student;
        this.test1 = test1;
        this.test2 = test2;
        this.test3 = test3;
        this.test4 = test4;
        this.mainExam = mainExam;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Double getTest1() { return test1; }
    public void setTest1(Double test1) { this.test1 = test1; }

    public Double getTest2() { return test2; }
    public void setTest2(Double test2) { this.test2 = test2; }

    public Double getTest3() { return test3; }
    public void setTest3(Double test3) { this.test3 = test3; }

    public Double getTest4() { return test4; }
    public void setTest4(Double test4) { this.test4 = test4; }

    public Double getMainExam() { return mainExam; }
    public void setMainExam(Double mainExam) { this.mainExam = mainExam; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}