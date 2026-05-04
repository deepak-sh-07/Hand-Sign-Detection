import { useState } from "react";
import { Activity, Camera, Cpu, Hand, Sparkles, Zap, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHandSign } from "@/hooks/useWebSocket";
import hand from "@/assets/hero-hand.jpg";
const SIGNS = [
  { sign: "✋", label: "Open Hand" },
  { sign: "✊", label: "Closed Hand" },
  { sign: "👍", label: "Thumbs Up" },
  { sign: "✌️", label: "Peace" },
  { sign: "🤙", label: "Call Me" },
  { sign: "👆", label: "Point Up" },
  { sign: "😎", label: "Cool" },
];

const Index = () => {
  const [recording, setRecording] = useState(false);
  const { prediction, confidence, connected, frameSrc } = useHandSign(recording);

  const getEmoji = (label: string) => {
    const map: Record<string, string> = {
      "Open Hand": "✋",
      "Closed Hand": "✊",
      "Thumbs Up": "👍",
      "Peace": "✌️",
      "Call Me": "🤙",
      "Point Up": "👆",
      "Cool": "😎",
      "No hand detected": "🖐️",
    };
    return map[label] ?? "🤚";
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-0 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Hand className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              v2.1 · neural
            </p>
            <h2 className="text-lg font-bold leading-none">
              SIGNAL<span className="text-primary">.AI</span>
            </h2>
          </div>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          {["Detect", "Models", "Dataset", "Docs"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-7xl px-0 pt-8 pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left copy */}
          <div className="space-y-8">

            {/* Connection badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-1.5 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    connected ? "animate-ping bg-primary" : "bg-destructive"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    connected ? "bg-primary" : "bg-destructive"
                  }`}
                />
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
              A neural vision engine that translates gestures into commands. 21 keypoints,
              4 classes, sub‑16ms latency — straight from your webcam.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gap-2 bg-gradient-primary text-primary-foreground glow-primary hover:opacity-90"
                onClick={() => setRecording(true)}
              >
                <Camera className="h-4 w-4" /> Start Detection
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-border bg-secondary/40 backdrop-blur"
              >
                <Sparkles className="h-4 w-4" /> Try Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { k: "7", v: "Gestures" },
                { k: "21", v: "Keypoints" },
                { k: "<16ms", v: "Latency" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur"
                >
                  <p className="font-mono text-2xl font-bold text-primary">{s.k}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right viewer */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border border-primary/20" />

            <div className="scanline relative overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant">

              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRecording((r) => !r)}
                    className="flex h-7 items-center gap-2 rounded-full bg-destructive/15 px-3 text-xs font-mono text-destructive"
                  >
                    {recording ? (
                      <>
                        <span className="h-2 w-2 animate-blink rounded-full bg-destructive" />
                        REC
                      </>
                    ) : (
                      <>
                        <Square className="h-3 w-3" /> IDLE
                      </>
                    )}
                  </button>
                  <span className="font-mono text-xs text-muted-foreground">
                    CAM_01 · 480p
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" />
                  {connected ? "30 FPS" : "0 FPS"}
                </div>
              </div>

              {/* Viewport */}
              <div className="relative aspect-square bg-black">

                {frameSrc ? (
                  <img
                    src={frameSrc}
                    alt="Live camera feed with landmarks"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    {/* Hero hand image */}
                    <img
                      src={hand}
                      alt="Hand preview"
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    {/* Overlay text */}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary/40 backdrop-blur">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-mono text-sm text-muted-foreground drop-shadow">
                        {recording
                          ? connected
                            ? "Waiting for frame..."
                            : "Connecting to server..."
                          : "Click Start Detection to begin"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />

                {/* Corner brackets */}
                {[
                  "top-4 left-4 border-l-2 border-t-2",
                  "top-4 right-4 border-r-2 border-t-2",
                  "bottom-4 left-4 border-l-2 border-b-2",
                  "bottom-4 right-4 border-r-2 border-b-2",
                ].map((c) => (
                  <div key={c} className={`absolute h-8 w-8 border-primary ${c}`} />
                ))}

                {/* Detection overlay */}
                <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-primary/40 bg-background/70 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-3xl">
                        {getEmoji(prediction)}
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Detected
                        </p>
                        <p className="text-lg font-bold">{prediction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Confidence
                      </p>
                      <p className="font-mono text-2xl font-bold text-primary">
                        {confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-700"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chip */}
            <div className="absolute -right-4 top-1/3 hidden rounded-2xl border border-border bg-card/80 p-3 backdrop-blur md:block">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs">MediaPipe · RF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gesture gallery */}
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                / gesture library
              </p>
              <h3 className="mt-2 text-3xl font-bold md:text-4xl">Trained on 7 classes</h3>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Play className="h-4 w-4" /> View all
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SIGNS.map((s) => {
              const isActive = prediction === s.label;
              return (
                <div
                  key={s.label}
                  className={`group relative aspect-square rounded-2xl border bg-gradient-surface p-4 transition-all duration-300 ${
                    isActive
                      ? "border-primary glow-primary -translate-y-1"
                      : "border-border"
                  }`}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span
                      className={`text-4xl transition-transform group-hover:scale-110 ${
                        isActive ? "animate-pulse-glow" : ""
                      }`}
                    >
                      {s.sign}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
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

        {/* Feature row */}
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Edge inference",
              desc: "Runs entirely on your machine. No frames leave the device.",
            },
            {
              icon: Cpu,
              title: "21 keypoint mesh",
              desc: "Sub-pixel accurate skeletal tracking with depth estimation.",
            },
            {
              icon: Sparkles,
              title: "Custom gestures",
              desc: "Record 50 samples and train your own class in under a minute.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-6 backdrop-blur transition-all hover:border-primary/40"
            >
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
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-primary animate-pulse-glow" : "bg-destructive"
              }`}
            />
            {connected ? "All systems nominal" : "Backend offline"}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;