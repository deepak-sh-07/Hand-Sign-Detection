import asyncio
import websockets
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import joblib
import numpy as np
import json
import math

# Load your trained model
model = joblib.load("gesture_model.pkl")

# Same setup as test.py
base_options = python.BaseOptions(model_asset_path='hand_landmarker.task')
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2
)
detector = vision.HandLandmarker.create_from_options(options)

gestures = {
    0: "Closed Hand",
    1: "Open Hand",
    2: "Thumbs Up",
    3: "Peace"
}

async def stream_predictions(websocket):
    cap = cv2.VideoCapture(0)
    print("Client connected, starting stream...")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            result = detector.detect(mp_image)

            prediction = "No hand detected"
            confidence = 0.0

            if result.hand_landmarks:
                hand = result.hand_landmarks[0]  # first hand

                # Exact same feature extraction as test.py
                wrist = hand[0]
                ref = hand[12]

                scale = math.sqrt(
                    (ref.x - wrist.x) ** 2 + (ref.y - wrist.y) ** 2
                )

                features = []
                for lm in hand:
                    x = (lm.x - wrist.x) / scale
                    y = (lm.y - wrist.y) / scale
                    features.extend([x, y])

                pred = model.predict([features])[0]
                proba = model.predict_proba([features])[0]
                confidence = float(np.max(proba))
                prediction = gestures.get(pred, str(pred))

            await websocket.send(json.dumps({
                "prediction": prediction,
                "confidence": round(confidence * 100, 2)
            }))

            await asyncio.sleep(0.05)  # 20 FPS

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    finally:
        cap.release()
        print("Camera released")

async def main():
    print("WebSocket server running on ws://localhost:8765")
    async with websockets.serve(stream_predictions, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())