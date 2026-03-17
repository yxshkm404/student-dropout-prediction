# 🌟 Features & Roles

This section explains exactly what everyone can do in the Student Dropout Prediction System.

Think of the system as a secure school building. Not everyone has the keys to every room. We use **User Roles** to make sure the right people see the right information.

---

## 👩‍💼 The Principal

The Principal is the administrator of the entire system. They have a bird's-eye view of everything happening across all teachers and all students.

| Feature / Action | What it means |
| :--- | :--- |
| **Approve Teachers** | When a new teacher registers, they cannot log in right away. The Principal must verify they actually work at the school and click "Approve" before the teacher can use the app. |
| **Reject Teachers** | If an unauthorized person tries to register, the Principal can reject them to keep student data safe. |
| **School-Wide Statistics** | The Principal can see a special dashboard showing how many students are passing and how many are "At Risk" across the *entire* school. |
| **Monitor All Students** | The Principal can search for any student in the school to check their test scores and AI prediction results, no matter which teacher they belong to. |

---

## 👨‍🏫 The Teacher

The Teacher does the day-to-day work in the app. They manage their own classroom of students and use the AI to help them teach.

| Feature / Action | What it means |
| :--- | :--- |
| **Add Students** | Teachers create accounts for their students. Just like teachers, students need to be "Approved" by the teacher before they can log in. |
| **Enter Test Scores** | The teacher enters grades for 5 exams (Internal Tests 1-4, and the Main Exam). Scores must be between 0.0 and 10.0. |
| **Run AI Predictions** | With the click of a button, the teacher sends the student's scores to the AI. The system instantly replies with whether the student is likely to Pass or is At Risk of dropping out. |
| **View Risk Severity** | If a student is At Risk, the system categorizes them (e.g., "Very Low Scorer" vs "Borderline Fail") so the teacher knows how urgent the situation is. |
| **See Weak Tests** | The app highlights exactly which subjects or tests the student is struggling with the most. |
| **View Actionable Rules** | The AI discovers patterns (like *"Students who fail Test 1 and Test 2 almost always fail Test 3"*). Teachers can view these rules to intervene early. |

---

## 🎒 The Student

Students have their own portal! The goal here is transparency and motivation.

| Feature / Action | What it means |
| :--- | :--- |
| **View Own Scores** | Students can log in anytime to see the test scores their teacher has entered for them. |
| **View AI Prediction** | Students can see their own Pass/Risk prediction. If they are marked "At Risk", the dashboard turns red to warn them. If they are marked "Pass", it turns green to encourage them. |
| **Update Profile** | Students can change their name or password to keep their account secure. |

---

### Understanding the Flow

Here is a simple way to understand how a student goes from being added to getting an AI prediction:

1. 📝 **Teacher Adds Student**: The teacher enters the student's name into the system.
2. ✅ **Teacher Approves Student**: The student can now log in to the app from their home computer.
3. 💯 **Teacher Enters Scores**: As the school year goes on, the teacher types in grades (0 to 10).
4. 🔮 **Teacher Clicks "Predict"**: The AI looks at the scores and calculates the risk of dropping out.
5. 📊 **Everyone Sees the Result**: The Teacher, the Principal, and the Student can all log in to see the results and work together to improve the student's grades!

<br>
![Teamwork](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop)
*The goal of these features is to bring principals, teachers, and students together to prevent dropouts.*
