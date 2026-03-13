package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    // ── NEW: Student approval status (approved by Teacher) ──
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    public enum Status {
        PENDING,   // waiting for teacher approval
        APPROVED,  // teacher approved — can login
        REJECTED   // teacher rejected
    }

    // Constructors
    public Student() {}

    public Student(String studentId, String name, String email,
                   String password, Teacher teacher) {
        this.studentId = studentId;
        this.name      = name;
        this.email     = email;
        this.password  = password;
        this.teacher   = teacher;
        this.status    = Status.PENDING; // default: pending approval
    }

    // Getters and Setters
    public Long getId()                      { return id; }
    public void setId(Long id)               { this.id = id; }

    public String getStudentId()                   { return studentId; }
    public void   setStudentId(String studentId)   { this.studentId = studentId; }

    public String getName()              { return name; }
    public void   setName(String name)   { this.name = name; }

    public String getEmail()               { return email; }
    public void   setEmail(String email)   { this.email = email; }

    public String getPassword()                  { return password; }
    public void   setPassword(String password)   { this.password = password; }

    public Teacher getTeacher()                { return teacher; }
    public void    setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Status getStatus()              { return status; }
    public void   setStatus(Status status) { this.status = status; }
}