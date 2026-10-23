import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, StopCircle, RefreshCw, Activity, Zap, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EmotionData {
  emotion: string;
  score: number;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "bg-emerald-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  fearful: "bg-purple-500",
  disgusted: "bg-orange-500",
  surprised: "bg-yellow-500",
  neutral: "bg-slate-500",
};

export function Emotion() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState<EmotionData[]>([]);
  const [dominantEmotion, setDominantEmotion] = useState<string>("neutral");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
        setError("Failed to load AI models. Check your connection.");
      }
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 720, height: 560 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsTracking(true);
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setError("Could not access camera. Please allow permissions.");
    }
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsTracking(false);
    setCurrentEmotions([]);
    setDominantEmotion("neutral");
  };

  // Tracking loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const trackFace = async () => {
      if (videoRef.current && canvasRef.current && isTracking) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.paused || video.ended) return;

        const detections = await faceapi.detectSingleFace(
          video, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detections) {
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);
          
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw custom box
            const box = resizedDetections.detection.box;
            ctx.strokeStyle = '#06b6d4'; // Cyan
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }

          const expressions = detections.expressions;
          const emotionsArray = Object.entries(expressions)
            .map(([emotion, score]) => ({ emotion, score: score as number }))
            .sort((a, b) => b.score - a.score);

          setCurrentEmotions(emotionsArray);
          
          const primary = emotionsArray[0];
          if (primary && primary.score > 0.4) {
            setDominantEmotion(primary.emotion);
            setHistory(prev => {
              const newHist = [primary.emotion, ...prev].slice(0, 10);
              return newHist;
            });
          }
        } else {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    if (isTracking && isModelsLoaded) {
      intervalId = setInterval(trackFace, 200); // Run every 200ms
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, isModelsLoaded]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_350px] gap-8">
        
        {/* Main Video Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold glow-text">Emotion Tracker</h1>
              <p className="text-muted-foreground mt-1">Real-time facial expression analysis</p>
            </div>
            
            <button
              onClick={isTracking ? stopVideo : startVideo}
              disabled={!isModelsLoaded}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg",
                !isModelsLoaded ? "opacity-50 cursor-not-allowed bg-muted" :
                isTracking 
                  ? "bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 glow-box"
              )}
            >
              {!isModelsLoaded ? <RefreshCw className="w-5 h-5 animate-spin" /> : 
               isTracking ? <StopCircle className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              {isTracking ? "Stop Tracking" : "Start Camera"}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl">
              {error}
            </div>
          )}

          <div className="relative rounded-2xl overflow-hidden glass-panel aspect-video bg-black/50 flex items-center justify-center border border-white/10 shadow-2xl">
            {!isTracking && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-10 bg-card/80 backdrop-blur-sm">
                <ScanFace className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Camera is inactive</p>
                <p className="text-sm">Click start to begin emotion tracking</p>
              </div>
            )}
            
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              playsInline
              className={cn(
                "w-full h-full object-cover transform scale-x-[-1]", // mirror image
                !isTracking && "hidden"
              )}
              onPlay={() => {
                if (videoRef.current && canvasRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
              }}
            />
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] pointer-events-none z-20"
            />

            {/* Dominant Emotion Overlay */}
            <AnimatePresence>
              {isTracking && dominantEmotion && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-6 left-6 z-30"
                >
                  <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detected</span>
                    <span className={cn(
                      "font-bold text-xl capitalize",
                      EMOTION_COLORS[dominantEmotion]?.replace('bg-', 'text-') || "text-foreground"
                    )}>
                      {dominantEmotion}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Live Analysis</h3>
            </div>
            
            <div className="space-y-4">
              {currentEmotions.length > 0 ? currentEmotions.slice(0, 5).map((emo) => (
                <div key={emo.emotion} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{emo.emotion}</span>
                    <span className="font-mono text-foreground">{(emo.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div 
                      className={cn("h-full rounded-full", EMOTION_COLORS[emo.emotion] || "bg-primary")}
                      initial={{ width: 0 }}
                      animate={{ width: `${emo.score * 100}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-white/10 rounded-xl">
                  Waiting for face detection...
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Recent Timeline</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {history.length > 0 ? history.map((emo, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={`${i}-${emo}`}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium capitalize",
                    EMOTION_COLORS[emo] ? `${EMOTION_COLORS[emo]} bg-opacity-20 text-white border border-white/10` : "bg-muted text-muted-foreground"
                  )}
                >
                  {emo}
                </motion.div>
              )) : (
                <span className="text-sm text-muted-foreground">No history yet.</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
