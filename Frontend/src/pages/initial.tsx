import { useState, useEffect, useRef } from "react";
import { Activity, Camera, Cpu, Hand, Sparkles, Zap, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandSign } from "@/hooks/useWebSocket";
import hand from "@/assets/hero-hand.jpg";

const SIGNS = [
  { sign: "✊", label: "Closed Hand" },
  { sign: "✋", label: "Open Hand" },
  { sign: "👍", label: "Thumbs Up" },
  { sign: "✌️", label: "Peace" },
  { sign: "👆", label: "Point Up" },
  { sign: "👌", label: "OK" },
  { sign: "😎", label: "Cool" },
  { sign: "👈", label: "Point Left" },
  { sign: "👉", label: "Point Right" },
  { sign: "👎", label: "Thumbs Down" },
];

function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 30;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setVal(Math.round(cur));
      if (cur >= target) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

function useSmoothedConfidence(raw: number, alpha = 0.15) {
  const emaRef = useRef(raw);
  const [displayed, setDisplayed] = useState(raw);

  useEffect(() => {
    if (raw === 0) {
      emaRef.current = 0;
      setDisplayed(0);
      return;
    }
    emaRef.current = alpha * raw + (1 - alpha) * emaRef.current;
    setDisplayed(Math.round(emaRef.current));
  }, [raw, alpha]);

  return displayed;
}

const Index = () => {
  const [recording, setRecording] = useState(false);
  const { prediction, confidence, connected, frameSrc } = useHandSign(recording);

  const prevPrediction = useRef(prediction);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prediction !== prevPrediction.current && prediction !== "No hand detected") {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 400);
      prevPrediction.current = prediction;
      return () => clearTimeout(id);
    }
  }, [prediction]);

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!recording) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const gestureCount = useCountUp(10, 700);
  const keypointCount = useCountUp(21, 900);
  const displayedConfidence = useSmoothedConfidence(confidence);

  const getEmoji = (label: string) => {
    const map: Record<string, string> = {
      "Closed Hand":      "✊",
      "Open Hand":        "✋",
      "Thumbs Up":        "👍",
      "Peace":            "✌️",
      "Point up":         "👆",   // matches server casing exactly
      "OK":               "👌",
      "Cool":             "😎",
      "Point Left":       "👈",
      "Point Right":      "👉",
      "Thumbs Down":      "👎",
      "No hand detected": "🖐️",
    };
    return map[label] ?? "🤚";
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-40" style={{ zIndex: 0 }} />
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0, background: "radial-gradient(ellipse 80% 60% at 20% 0%, hsl(186 100% 55% / 0.12), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 100%, hsl(305 100% 60% / 0.12), transparent 60%)" }} />
      <div className="pointer-events-none fixed -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-accent/20 blur-[140px]" style={{ zIndex: 0 }} />
      <div className="pointer-events-none fixed -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[140px]" style={{ zIndex: 0 }} />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center px-0 pt-2 pb-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Hand className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div>
  {/* <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
    v2.1 · 
  </p> */}
  <h2 className="text-lg font-bold leading-none">
    SIGNAL<span className="text-primary">.AI</span>
  </h2>
</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-0 pt-0 pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? "animate-ping bg-primary" : "bg-destructive"}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`} />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {connected ? "Live Inference Active" : "Backend Disconnected"}
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Read every <br />
              <span className="text-gradient">hand sign</span> in <br />
              real‑time.
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              A neural vision engine that translates gestures into commands. 21
              keypoints, 10 classes, sub‑16ms latency — straight from your webcam.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className={`gap-2 transition-all duration-300 ${
                  recording
                    ? "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25"
                    : "bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90"
                }`}
                onClick={() => setRecording((r) => !r)}
              >
                {recording ? (
                  <><Square className="h-4 w-4" /> Stop Detection</>
                ) : (
                  <><Camera className="h-4 w-4" /> Start Detection</>
                )}
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-border bg-secondary/40 backdrop-blur">
                <Sparkles className="h-4 w-4" /> Try Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { k: gestureCount.toString(), v: "Gestures" },
                { k: keypointCount.toString(), v: "Keypoints" },
                { k: "<16ms", v: "Latency" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur">
                  <p className="font-mono text-2xl font-bold text-primary">{s.k}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border border-primary/20" />
            <div className="scanline relative overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant">

              <div className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRecording((r) => !r)}
                    className="flex h-7 items-center gap-2 rounded-full bg-destructive/15 px-3 text-xs font-mono text-destructive"
                  >
                    {recording ? (
                      <><span className="h-2 w-2 animate-blink rounded-full bg-destructive" />REC&nbsp;<span className="opacity-70">{formatTime(elapsed)}</span></>
                    ) : (
                      <><Square className="h-3 w-3" /> IDLE</>
                    )}
                  </button>
                  <span className="font-mono text-xs text-muted-foreground">CAM_01 · 480p</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" />
                  {connected ? "30 FPS" : "0 FPS"}
                </div>
              </div>

              <div className="relative aspect-square bg-black">
                {frameSrc ? (
                  <img src={frameSrc} alt="Live camera feed with landmarks" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <img src={hand} alt="Hand preview" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary/40 backdrop-blur">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-mono text-sm text-muted-foreground drop-shadow">
                        {recording ? (connected ? "Waiting for frame..." : "Connecting to server...") : "Click Start Detection to begin"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />

                {["top-4 left-4 border-l-2 border-t-2", "top-4 right-4 border-r-2 border-t-2", "bottom-4 left-4 border-l-2 border-b-2", "bottom-4 right-4 border-r-2 border-b-2"].map((c) => (
                  <div key={c} className={`absolute h-8 w-8 border-primary ${c}`} />
                ))}

                <div className={`absolute bottom-6 left-6 right-6 rounded-xl border border-primary/40 p-4 backdrop-blur-md transition-colors duration-300 ${flash ? "bg-primary/20" : "bg-background/70"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-3xl transition-transform duration-300 ${flash ? "scale-110" : "scale-100"}`}>
                        {getEmoji(prediction)}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Detected</p>
                        <p className="text-lg font-bold">{prediction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</p>
                      <p className="font-mono text-2xl font-bold text-primary tabular-nums">{displayedConfidence}%</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-gradient-primary" style={{ width: `${displayedConfidence}%`, transition: "width 0.4s ease-out" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-1/3 hidden rounded-2xl border border-border bg-card/80 p-3 backdrop-blur md:block">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs">MediaPipe · RF</span>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">/ gesture library</p>
              <h3 className="mt-2 text-3xl font-bold md:text-4xl">Trained on 10 classes</h3>
            </div>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <Play className="h-4 w-4" /> View all
            </Button>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${SIGNS.length}, minmax(0, 1fr))` }}>
            {SIGNS.map((s) => {
              // match "Point up" from server vs "Point Up" in SIGNS label
              const isActive = prediction.toLowerCase() === s.label.toLowerCase();
              return (
                <div key={s.label} className={`group relative aspect-square rounded-2xl border bg-gradient-surface p-4 transition-all duration-300 ${isActive ? "border-primary glow-primary -translate-y-1" : "border-border"}`}>
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className={`text-4xl transition-transform group-hover:scale-110 ${isActive ? "animate-pulse-glow" : ""}`}>
                      {s.sign}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute right-2 top-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            { icon: Zap, title: "Edge inference", desc: "Runs entirely on your machine. No frames leave the device." },
            { icon: Cpu, title: "21 keypoint mesh", desc: "Sub-pixel accurate skeletal tracking with depth estimation." },
            { icon: Sparkles, title: "Custom gestures", desc: "Record 50 samples and train your own class in under a minute." },
          ].map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur transition-all hover:border-primary/40">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:bg-primary/20" />
              <f.icon className="mb-4 h-6 w-6 text-primary" />
              <h4 className="mb-2 text-lg font-semibold">{f.title}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-0 py-6 font-mono text-xs text-muted-foreground">
          <span>© 2026 SIGNAL.AI</span>
          <span className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-primary animate-pulse-glow" : "bg-destructive"}`} />
            {connected ? "All systems nominal" : "Backend offline"}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;