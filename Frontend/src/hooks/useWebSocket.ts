import { useEffect, useState } from "react";

interface Prediction {
  prediction: string;
  confidence: number;
}

export function useHandSign() {
  const [prediction, setPrediction] = useState<string>("No hand detected");
  const [confidence, setConfidence] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8765");

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const data: Prediction = JSON.parse(event.data);
      setPrediction(data.prediction);
      setConfidence(data.confidence);
    };

    ws.onclose = () => {
      setConnected(false);
      setPrediction("No hand detected");
      setConfidence(0);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  return { prediction, confidence, connected };
}