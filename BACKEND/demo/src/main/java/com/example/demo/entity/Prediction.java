package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String status;

    @Column(name = "cluster_group")
    private Integer clusterGroup;

    @Column(name = "weak_tests")
    private String weakTests;

    @Column(name = "pass_probability")
    private Double passProbability;

    @Column(name = "risk_probability")
    private Double riskProbability;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public Prediction() {}

    public Prediction(Student student, String status, Integer clusterGroup,
                      String weakTests, Double passProbability, Double riskProbability) {
        this.student = student;
        this.status = status;
        this.clusterGroup = clusterGroup;
        this.weakTests = weakTests;
        this.passProbability = passProbability;
        this.riskProbability = riskProbability;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getClusterGroup() { return clusterGroup; }
    public void setClusterGroup(Integer clusterGroup) { this.clusterGroup = clusterGroup; }

    public String getWeakTests() { return weakTests; }
    public void setWeakTests(String weakTests) { this.weakTests = weakTests; }

    public Double getPassProbability() { return passProbability; }
    public void setPassProbability(Double passProbability) { this.passProbability = passProbability; }

    public Double getRiskProbability() { return riskProbability; }
    public void setRiskProbability(Double riskProbability) { this.riskProbability = riskProbability; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}