from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ── LOAD ALL MODEL FILES ON STARTUP ───────────────────────
BASE_DIR = os.path.join(os.path.dirname(__file__), 'data')

with open(os.path.join(BASE_DIR, 'decision_tree_model.pkl'), 'rb') as f:
    dt_model = pickle.load(f)

with open(os.path.join(BASE_DIR, 'kmeans_model.pkl'), 'rb') as f:
    kmeans = pickle.load(f)

with open(os.path.join(BASE_DIR, 'scaler.pkl'), 'rb') as f:
    scaler = pickle.load(f)

with open(os.path.join(BASE_DIR, 'label_encoder.pkl'), 'rb') as f:
    le = pickle.load(f)

with open(os.path.join(BASE_DIR, 'association_rules.json'), 'r') as f:
    rules = json.load(f)

with open(os.path.join(BASE_DIR, 'model_metadata.json'), 'r') as f:
    metadata = json.load(f)

print("=" * 50)
print("  All model files loaded successfully!")
print(f"  Decision Tree  : ready")
print(f"  K-Means        : {kmeans.n_clusters} clusters ready")
print(f"  Scaler         : ready")
print(f"  Label Encoder  : {list(le.classes_)}")
print(f"  Apriori Rules  : {len(rules)} rules ready")
print("=" * 50)


# ── POST /ml/predict ───────────────────────────────────────
# Spring Boot calls this when teacher clicks Predict
@app.route('/ml/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        test1    = float(data['test1'])
        test2    = float(data['test2'])
        test3    = float(data['test3'])
        test4    = float(data['test4'])
        mainExam = float(data['mainExam'])

        scores_raw = [test1, test2, test3, test4, mainExam]

        # Validate 0.0 - 10.0
        for s in scores_raw:
            if s < 0 or s > 10:
                return jsonify({
                    'success': False,
                    'message': 'Scores must be between 0.0 and 10.0'
                }), 400

        # Step 1: Normalize using scaler.pkl
        scores_array  = np.array([scores_raw])
        scores_scaled = scaler.transform(scores_array)

        # Step 2: Decision Tree prediction
        prediction = dt_model.predict(scores_scaled)[0]
        proba      = dt_model.predict_proba(scores_scaled)[0]
        status     = le.inverse_transform([prediction])[0]  # A or R

        # Step 3: K-Means cluster (only if At Risk)
        cluster             = None
        cluster_description = None
        if status == 'R':
            cluster             = int(kmeans.predict(scores_scaled)[0])
            cluster_description = get_cluster_description(cluster)

        # Step 4: Find weak tests (score < 7.0)
        test_names = ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Main Exam']
        weak_tests = [test_names[i] for i, s in enumerate(scores_raw) if s < 7.0]

        # Step 5: Find matching association rules
        matching_rules = find_matching_rules(scores_raw)

        # Step 6: Average and probabilities
        average   = round(sum(scores_raw) / len(scores_raw), 2)
        pass_prob = round(float(proba[0]) * 100, 2)
        risk_prob = round(float(proba[1]) * 100, 2)

        return jsonify({
            'success':            True,
            'status':             status,
            'statusMeaning':      'Pass' if status == 'A' else 'At Risk',
            'average':            average,
            'cluster':            cluster,
            'clusterDescription': cluster_description,
            'weakTests':          weak_tests,
            'matchingRules':      matching_rules[:3],
            'passProbability':    pass_prob,
            'riskProbability':    risk_prob
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ── GET /ml/metrics ────────────────────────────────────────
@app.route('/ml/metrics', methods=['GET'])
def get_metrics():
    return jsonify({
        'success':       True,
        'accuracy':      round(metadata['dt_accuracy'] * 100, 2),
        'precision':     round(metadata['dt_precision'] * 100, 2),
        'recall':        round(metadata['dt_recall'] * 100, 2),
        'f1Score':       round(metadata['dt_f1'] * 100, 2),
        'algorithm':     'J48 Decision Tree',
        'clustering':    'K-Means (4 clusters)',
        'association':   f"Apriori ({len(rules)} rules)",
        'passThreshold': metadata['pass_threshold'],
        'numClusters':   metadata['num_clusters']
    })


# ── GET /ml/clusters ───────────────────────────────────────
@app.route('/ml/clusters', methods=['GET'])
def get_clusters():
    centroids    = kmeans.cluster_centers_
    cluster_info = []
    for i, c in enumerate(centroids):
        real_scores = [round(v * 10, 2) for v in c]
        cluster_info.append({
            'group':       i,
            'description': get_cluster_description(i),
            'avgScores': {
                'test1':    real_scores[0],
                'test2':    real_scores[1],
                'test3':    real_scores[2],
                'test4':    real_scores[3],
                'mainExam': real_scores[4]
            }
        })
    return jsonify({'success': True, 'clusters': cluster_info})


# ── GET /ml/rules ──────────────────────────────────────────
@app.route('/ml/rules', methods=['GET'])
def get_rules():
    top_rules = sorted(rules, key=lambda x: x['confidence'], reverse=True)[:20]
    return jsonify({'success': True, 'rules': top_rules, 'total': len(rules)})


# ── GET /ml/health ─────────────────────────────────────────
@app.route('/ml/health', methods=['GET'])
def health():
    return jsonify({
        'status':    'Flask ML API is running!',
        'port':      5000,
        'models':    'All loaded!',
        'endpoints': ['/ml/predict', '/ml/metrics', '/ml/clusters', '/ml/rules']
    })


# ── HELPER: cluster description ────────────────────────────
def get_cluster_description(cluster):
    desc = {
        0: 'Very Low Scorer - needs urgent support in all tests',
        1: 'Borderline Fail - slightly below passing in all tests',
        2: 'Average Weak - moderate scores but below threshold',
        3: 'Low Main Exam - weak in main exam and tests'
    }
    return desc.get(cluster, 'Unknown group')


# ── HELPER: find matching association rules ─────────────────
def find_matching_rules(scores_raw):
    test_keys = ['test_1_LOW', 'test_2_LOW', 'test_3_LOW',
                 'test_4_LOW', 'main_exam_LOW']
    low_tests = set()
    for i, s in enumerate(scores_raw):
        if s < 7.0:
            low_tests.add(test_keys[i])

    matching = []
    for rule in rules:
        antecedents = set(rule['antecedents'])
        if antecedents.issubset(low_tests):
            matching.append({
                'antecedents': rule['antecedents'],
                'consequents': rule['consequents'],
                'confidence':  round(rule['confidence'] * 100, 1)
            })
    return sorted(matching, key=lambda x: x['confidence'], reverse=True)


if __name__ == '__main__':
    app.run(port=5000, debug=True)