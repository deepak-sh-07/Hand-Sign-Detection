import { useEffect, useState, useRef } from "react";

interface WSData {
  frame: string;
  prediction: string;
  confidence: number;
}

export function useHandSign(active: boolean) {
  const [prediction, setPrediction] = useState<string>("No hand detected");
  const [confidence, setConfidence] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [frameSrc, setFrameSrc] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!active) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      setFrameSrc("");
      setPrediction("No hand detected");
      setConfidence(0);
      return;
    }

    const ws = new WebSocket("ws://localhost:8765");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to backend");
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data: WSData = JSON.parse(event.data);
      setPrediction(data.prediction);
      setConfidence(data.confidence);
      setFrameSrc(`data:image/jpeg;base64,${data.frame}`);
    };

    ws.onclose = () => {
      console.log("Disconnected from backend");
      setConnected(false);
      setFrameSrc("");
      setPrediction("No hand detected");
      setConfidence(0);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    return () => ws.close();
  }, [active]);

  return { prediction, confidence, connected, frameSrc };
}