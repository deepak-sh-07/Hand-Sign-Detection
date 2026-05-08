<div align="center">

# 🤚 SIGNAL.AI
### Real-Time Hand Gesture Detection Engine

## 📸 Screenshots

<div align="center">

<img src="src/components/screenshot/" width="49%" />
<img src="src/components/screenshot/2.png" width="49%" />

<img src="src/components/screenshot/3.png" width="49%" />
<img src="src/components/screenshot/4.png" width="49%" />

<img src="src/components/screenshot/5.png" width="49%" />
<img src="src/components/screenshot/6.png" width="49%" />

</div>

<br/>

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand_Tracking-00897B?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![WebSocket](https://img.shields.io/badge/WebSocket-Live_Stream-FF6B6B?style=for-the-badge)
![RandomForest](https://img.shields.io/badge/RandomForest-Classifier-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

<br/>

> **21 keypoints · 10 gesture classes · ~30 FPS · runs entirely on your machine**

<br/>

</div>

---

## ✨ What is this?

**SIGNAL.AI** is a real-time hand gesture recognition system that translates your hand movements into classified gestures — live, from your webcam, with no data leaving your device.

It uses **Google's MediaPipe** to track 21 hand landmarks per frame, normalizes them relative to wrist position and hand scale, and feeds them into a trained **Random Forest classifier** that predicts your gesture in milliseconds. A **React frontend** receives the live annotated video stream and predictions over WebSocket.

---

## 🖐️ Supported Gestures

| # | Gesture | Label |
|---|---------|-------|
| 0 | ✊ | Closed Hand |
| 1 | ✋ | Open Hand |
| 2 | 👍 | Thumbs Up |
| 3 | ✌️ | Peace |
| 4 | 👆 | Point Up |
| 5 | 👌 | OK |
| 6 | 😎 | Cool |
| 7 | 👈 | Point Left |
| 8 | 👉 | Point Right |
| 9 | 👎 | Thumbs Down |

---

## 🏗️ Architecture

```
Webcam
  │
  ▼
MediaPipe HandLandmarker        ← 21 keypoints per hand
  │
  ▼
Feature Extraction              ← normalize by wrist + scale (42 features)
  │
  ▼
Random Forest Classifier        ← gesture_model.pkl
  │
  ▼
WebSocket Server (ws://localhost:8765)
  │
  ▼
React Frontend (localhost:5173) ← live annotated frame + prediction
```

---

## 📁 Project Structure

```
SIGNAL.AI/
│
├── 📷  collect.py              # Data collection script (press 0-9 to label)
├── 🧠  train.py                # Train the Random Forest model
├── 🌐  server.py               # WebSocket server — streams frames + predictions
├── 🤖  gesture_model.pkl       # Trained model (generated after training)
├── 📊  gesture_data.csv        # Collected training data
├── 🗂️  hand_landmarker.task    # MediaPipe pretrained hand tracking model
│
└── frontend/
    └── src/
        └── pages/
            └── Index.tsx       # Main React UI
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/signal-ai.git
cd signal-ai
```

### 2. Install Python dependencies

```bash
pip install mediapipe opencv-python scikit-learn numpy websockets joblib pandas
```

### 3. Download MediaPipe model

Download `hand_landmarker.task` from [MediaPipe Models](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) and place it in the root directory.

### 4. Collect training data

```bash
python collect.py
```

> Press keys **0–9** to label the gesture you're showing. Each keypress saves one sample to `gesture_data.csv`. Collect ~100 samples per gesture.

### 5. Train the model

```bash
python train.py
```

> This generates `gesture_model.pkl`. You'll see accuracy and a classification report printed.

### 6. Start the WebSocket server

```bash
python server.py
```

### 7. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and click **Start Detection**.

---

## 🔬 How the Model Works

Each hand frame produces **42 features** — the x and y coordinates of all 21 landmarks, normalized as:

```python
x = (landmark.x - wrist.x) / scale
y = (landmark.y - wrist.y) / scale
```

Where `scale` is the Euclidean distance between the **wrist (point 0)** and the **middle finger tip (point 12)**. This makes predictions **invariant to hand size and position** in the frame.

These 42 features are passed to a `RandomForestClassifier(n_estimators=100)` which outputs both a class prediction and confidence scores via `predict_proba`.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Hand Tracking | MediaPipe HandLandmarker |
| ML Classifier | scikit-learn RandomForest |
| Backend | Python · asyncio · websockets · OpenCV |
| Frontend | React · TypeScript · Tailwind CSS |
| Streaming | WebSocket (base64 JPEG frames + JSON) |

---

## 💡 Tips for Better Accuracy

- Collect samples in **varied lighting** conditions
- Show gestures at **different distances** from the camera
- Collect at least **80–100 samples** per gesture
- Avoid gestures that look geometrically similar (e.g. OK vs Call Me)
- Retrain after adding new gesture classes

---

## 🗺️ Roadmap

- [ ] Add more gesture classes
- [ ] Replace Random Forest with a lightweight neural network (MLP)
- [ ] Two-hand gesture support
- [ ] Map gestures to system actions (media control, mouse, etc.)
- [ ] Mobile support

---

<div align="center">

Built with 🤚 by [Deepak](https://github.com/deepak-sh-07)

**MediaPipe · RandomForest · React · WebSocket**

</div>