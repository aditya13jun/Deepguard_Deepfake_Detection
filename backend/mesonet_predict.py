import tensorflow as tf
import numpy as np
import cv2
import os
from MesoNet.pipeline import Meso4  # ✅ correct import

# Initialize and load the model
model = Meso4()
model.build_model()
model.model.load_weights("MesoNet/weights/Meso4_DF.h5")  # ✅ correct path

def preprocess_image(image_path: str):
    try:
        img = cv2.imread(image_path)
        img = cv2.resize(img, (256, 256))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        return img
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {e}")

def predict_deepfake(image_path: str) -> float:
    input_image = preprocess_image(image_path)
    prediction = model.model.predict(input_image)[0][0]
    return float(prediction)
