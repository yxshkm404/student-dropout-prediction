# 🔮 Prediction Logic — How It Works

This document explains **how the Student Dropout Prediction system works**, including how predictions are made, and how the **Risk Percentage** and **Pass Percentage** are calculated.

---

## 📊 Overview

The system uses **three ML algorithms** working together:

| Algorithm              | Purpose                                          | Implementation          |
|------------------------|--------------------------------------------------|-------------------------|
| **J48 Decision Tree**  | Classifies a student as **Pass (A)** or **At Risk (R)** | `decision_tree_model.pkl` |
| **K-Means Clustering** | Groups at-risk students into 4 severity levels   | `kmeans_model.pkl`       |
| **Apriori Association**| Reveals patterns like "Low Test 1 → Low Test 3"  | `association_rules.json` |

---

## 🔁 End-to-End Prediction Flow

```
React Frontend                 Spring Boot                   Flask ML API
─────────────                  ───────────                   ────────────
Teacher clicks                 POST /api/teacher             POST /ml/predict
"Run Prediction"  ──────────►  /predict/{studentId}  ──────► (app.py)
                               │                             │
                               │  Reads scores from DB       │  1. Normalize scores
                               │  Sends to Flask             │  2. Decision Tree predict
                               │                             │  3. K-Means cluster (if Risk)
                               │  ◄──────────────────────────│  4. Find weak tests
                               │  Saves Prediction to DB     │  5. Match Apriori rules
                               │                             │  6. Return probabilities
Teacher sees result ◄──────────│
```

---

## 🧪 Input Features

The model takes **5 test scores**, each on a scale of **0.0 – 10.0**:

| Feature     | Description                |
|-------------|----------------------------|
| `test_1`    | Internal Test 1 score      |
| `test_2`    | Internal Test 2 score      |
| `test_3`    | Internal Test 3 score      |
| `test_4`    | Internal Test 4 score      |
| `main_exam` | Final/Main Examination score |

---

## 🔬 Step-by-Step Prediction (inside Flask `app.py`)

### Step 1 — Normalize Scores

```python
scores_array  = np.array([scores_raw])       # e.g. [[4.5, 3.2, 6.1, 5.0, 2.8]]
scores_scaled = scaler.transform(scores_array) # MinMaxScaler normalization
```

The raw scores (0–10) are normalized using a pre-trained **MinMaxScaler** (`scaler.pkl`) so the model sees values in the same range it was trained on.

---

### Step 2 — Decision Tree Classification (Pass / At Risk)

```python
prediction = dt_model.predict(scores_scaled)[0]       # 0 or 1
proba      = dt_model.predict_proba(scores_scaled)[0]  # [pass_prob, risk_prob]
status     = le.inverse_transform([prediction])[0]     # 'A' (Pass) or 'R' (At Risk)
```

The **J48 Decision Tree** classifier outputs:
- A **class label**: `A` (Pass) or `R` (At Risk)
- A **probability array**: `[P(Pass), P(At Risk)]` — this is where risk% and pass% come from

---

### ⭐ How Risk % and Pass % Are Calculated

```python
pass_prob = round(float(proba[0]) * 100, 2)   # → 100.0% or 0.0%
risk_prob = round(float(proba[1]) * 100, 2)   # → 0.0% or 100.0%
```

| Value          | Source                        | Formula                         | Actual Output      |
|----------------|-------------------------------|---------------------------------|--------------------|
| **Pass %**     | `proba[0]` from Decision Tree | `P(class = A) × 100`           | **100.0%** or **0.0%** |
| **Risk %**     | `proba[1]` from Decision Tree | `P(class = R) × 100`           | **0.0%** or **100.0%** |

> **Key point**: The Pass % and Risk % are always **100% or 0%** — never intermediate values.  
> This is because the Decision Tree's leaf nodes are **pure** (each leaf contains training samples of only one class).  
> `Pass % + Risk % = 100%` always.

**Why always 100% or 0%?**
- The Decision Tree has been trained on historical student data (700 students) with a clear **7.0 pass threshold**.
- When a new student's scores reach a leaf node, the tree counts how many training samples in that leaf were Pass (A) vs At Risk (R).
- Because the tree is deep enough and the data separates cleanly at the 7.0 threshold, every leaf node ends up **pure** — containing 100% of one class.
- Example: A leaf might have 50 Pass students and 0 At Risk students → `proba = [1.0, 0.0]` → Pass% = 100%, Risk% = 0%.
- This means the prediction is always a **hard classification** — either fully Pass or fully At Risk.

### 🤔 FAQ: Is it wrong that the model gives exactly 100% or 0% risk?

**No, it is NOT wrong! It is 100% correct for this specific model and dataset.**

You do not have a broken model. Here is why it is completely normal and mathematically correct:

1. **You have cleanly separated data**: The dataset has clear rules (e.g., scoring above 7.0 means passing).
2. **Decision Trees are "Confident"**: A Decision Tree algorithm works by splitting data into groups like a flowchart. Because your data has a clear boundary, the tree was able to keep splitting until every single "bucket" (leaf) at the end of the flowchart contained **only** passing students or **only** failing students.
3. **Pure leaves**: In Machine Learning, we call these "pure leaves". If a new student's scores drop them into a bucket that had 50 passing students and 0 failing students during training, the math is simple:
   - `Pass % = (50 / 50) * 100 = 100%`
   - `Risk % = (0 / 50) * 100 = 0%`

It simply means **your model has zero doubt about its classification** because it has learned exactly what a passing student's scores look like versus an at-risk student's scores.

---

## 3️⃣ K-Means Clustering (Only for At-Risk Students)

```python
if status == 'R':
    cluster = int(kmeans.predict(scores_scaled)[0])
```

If the student is classified as **At Risk**, K-Means assigns them to one of **4 risk severity clusters**:

| Cluster | Description                                     |
|---------|--------------------------------------------------|
| 0       | **Very Low Scorer** — needs urgent support in all tests |
| 1       | **Borderline Fail** — slightly below passing in all tests |
| 2       | **Average Weak** — moderate scores but below threshold |
| 3       | **Low Main Exam** — weak in main exam and tests  |

This helps teachers understand **what kind** of at-risk student they're dealing with.

---

### Step 4 — Identify Weak Tests

```python
test_names = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Main Exam']
weak_tests = [test_names[i] for i, s in enumerate(scores_raw) if s < 7.0]
```

Any individual test score **below 7.0** (the pass threshold) is flagged as a "weak test". This tells the teacher exactly **which subjects** the student needs help in.

---

### Step 5 — Apriori Association Rule Matching

```python
test_keys = ['test_1_LOW', 'test_2_LOW', 'test_3_LOW', 'test_4_LOW', 'main_exam_LOW']
low_tests = set()
for i, s in enumerate(scores_raw):
    if s < 7.0:
        low_tests.add(test_keys[i])
```

The system checks against **180+ pre-mined association rules** to find patterns like:

> *"If a student scores low on Test 1 AND Test 2, there is a **98.8% confidence** they also score low on Test 3"*

Each rule has:
- **Antecedents**: the "if" part (e.g., `test_1_LOW, test_2_LOW`)
- **Consequents**: the "then" part (e.g., `test_3_LOW`)
- **Confidence**: how often this pattern holds (e.g., 98.8%)

The top 3 matching rules are returned in the prediction result.

---

### Step 6 — Average Score

```python
average = round(sum(scores_raw) / len(scores_raw), 2)
```

A simple arithmetic mean of all 5 test scores — provided as a quick reference alongside the ML prediction.

---

## 📦 Final Prediction Response

When all steps complete, the Flask API returns:

```json
{
  "success": true,
  "status": "R",
  "statusMeaning": "At Risk",
  "average": 4.54,
  "passProbability": 0.0,
  "riskProbability": 100.0,
  "cluster": 0,
  "clusterDescription": "Very Low Scorer - needs urgent support in all tests",
  "weakTests": ["Test 1", "Test 2", "Test 4", "Main Exam"],
  "matchingRules": [
    {
      "antecedents": ["test_1_LOW", "test_2_LOW"],
      "consequents": ["test_3_LOW"],
      "confidence": 98.8
    }
  ]
}
```

Spring Boot then **saves this prediction to the MySQL database** and forwards the result to the React frontend.

---

## 📈 Model Performance (from `model_metadata.json`)

| Metric       | Value   |
|--------------|---------|
| Accuracy     | 93.80%  |
| Precision    | 93.80%  |
| Recall       | 98.40%  |
| F1 Score     | 96.10%  |
| Cohen's Kappa| 0.884   |
| MAE          | 0.0735  |
| RMSE         | 0.2267  |

The model was trained on a dataset of **700 students** with scores ranging from 0.0 to 10.0 and a pass threshold of **7.0**.

---

## 🗂️ Pre-trained Model Files

All model files are stored in `BACKEND/demo/src/main/resources/flask-ml/data/`:

| File                      | Contents                                  |
|---------------------------|-------------------------------------------|
| `decision_tree_model.pkl` | Trained J48 Decision Tree classifier      |
| `kmeans_model.pkl`        | Trained K-Means model (4 clusters)        |
| `scaler.pkl`              | MinMaxScaler fitted on training data      |
| `label_encoder.pkl`       | Encodes `A`/`R` ↔ `0`/`1`                |
| `association_rules.json`  | 180+ Apriori rules (support, confidence, lift) |
| `model_metadata.json`     | Accuracy, precision, recall, thresholds   |

---

## 🧠 Summary

```
┌────────────────────────────────────────────────────────────────┐
│                    PREDICTION PIPELINE                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Raw Scores [4.5, 3.2, 6.1, 5.0, 2.8]                        │
│       │                                                        │
│       ▼                                                        │
│  ┌──────────┐                                                  │
│  │  Scaler  │  Normalize to training range                     │
│  └────┬─────┘                                                  │
│       │                                                        │
│       ▼                                                        │
│  ┌───────────────────┐                                         │
│  │  Decision Tree    │  → Status: Pass (A) or At Risk (R)      │
│  │  (predict_proba)  │  → Pass%: 100.0% or 0.0%                │
│  │                   │  → Risk%: 0.0% or 100.0%                │
│  └────┬──────────────┘                                         │
│       │                                                        │
│       ├──── If At Risk ────┐                                   │
│       │                    ▼                                    │
│       │           ┌──────────────┐                              │
│       │           │   K-Means    │  → Cluster: 0               │
│       │           │  (4 groups)  │  → "Very Low Scorer"        │
│       │           └──────────────┘                              │
│       │                                                        │
│       ▼                                                        │
│  ┌────────────────┐                                            │
│  │  Weak Tests    │  → Scores < 7.0 flagged                    │
│  │  (threshold)   │  → ["Test 1", "Test 2", "Main Exam"]      │
│  └────┬───────────┘                                            │
│       │                                                        │
│       ▼                                                        │
│  ┌────────────────┐                                            │
│  │  Apriori Rules │  → Matching patterns found                 │
│  │  (180+ rules)  │  → "Low T1 + Low T2 → Low T3 (98.8%)"    │
│  └────────────────┘                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```
