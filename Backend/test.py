import cv2    #OpenCV for video capture and drawing
import mediapipe as mp # gives pretrained ML model for hand tracking
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import joblib
import math
model = joblib.load("gesture_model.pkl")
base_options = python.BaseOptions(model_asset_path='hand_landmarker.task') # loading a pretrained model for hand tracking from the mediapipe library.

options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2
)
gestures = {
    0: "Closed Hand",
    1: "Open Hand",
    2: "Thumbs up",
    3: "Peace",
    4: "Point up",
    5: "OK",
    6: "Cool",
    7: "Point Left",
    8: "Point Right",
    9: "Thumbs Down"
}
detector = vision.HandLandmarker.create_from_options(options) #This initializes the actual ML pipeline for hand tracking using the specified options.

cap = cv2.VideoCapture(0) # start camera default camera is 0

HAND_CONNECTIONS = [ #This defines which points should be connected.
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (5,9),(9,10),(10,11),(11,12),
    (9,13),(13,14),(14,15),(15,16),
    (13,17),(17,18),(18,19),(19,20),
    (0,17)
]

while cap.isOpened(): #jab tak camera open hai
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    result = detector.detect(mp_image)

    if result.hand_landmarks:
        h, w, _ = frame.shape

        for hand in result.hand_landmarks:
            for lm in hand:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)
                print("x = ",cx,"y = ", cy)
            for connection in HAND_CONNECTIONS:
                start_idx, end_idx = connection
                x1 = int(hand[start_idx].x * w)
                y1 = int(hand[start_idx].y * h)
                x2 = int(hand[end_idx].x * w)
                y2 = int(hand[end_idx].y * h)
                cv2.line(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            # Prepare features for prediction
            # ===== PREDICTION =====
                wrist = hand[0]
                ref = hand[12]

                scale = math.sqrt((ref.x - wrist.x)**2 + (ref.y - wrist.y)**2)

                features = []
                for lm in hand:
                    x = (lm.x - wrist.x) / scale
                    y = (lm.y - wrist.y) / scale
                    features.extend([x, y])

                prediction = model.predict([features])
                label = prediction[0]
                label = gestures[label]
                cv2.putText(frame, f"Gesture: {label}", (10, 100),cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                     
    cv2.imshow("Hand Tracking", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()