from flask import Flask, request, jsonify
from flask_cors import CORS
from mesonet_predict import predict_deepfake
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        prediction = predict_deepfake(file_path)  # float between 0 and 1
        label = 'Real' if prediction < 0.5 else 'Deepfake'
        confidence = round(100 - abs(prediction - 0.5) * 200, 2)

        return jsonify({
            'result': label,
            'confidence': confidence
        })
    except Exception as e:
        print("Prediction error:", e)
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    app.run(debug=True)
