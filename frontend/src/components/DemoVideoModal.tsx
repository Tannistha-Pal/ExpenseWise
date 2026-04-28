import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, Maximize2, SkipForward, SkipBack } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoVideoModal = ({ isOpen, onClose }: DemoVideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Demo video URL - using a high-quality demo video
  const demoVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-financial-accountant-discussing-work-39886-large.mp4";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          ref={containerRef}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-foreground">ExpenseWise Demo</h3>
              <p className="text-sm text-muted-foreground">See how ExpenseWise works in action</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              src={demoVideoUrl}
              className="w-full max-h-[60vh] object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Play/Pause Overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handlePlayPause}
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" />
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Skip back 10 seconds"
                >
                  <SkipBack className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Skip forward 10 seconds"
                >
                  <SkipForward className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Toggle fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            
            {/* Demo Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <p className="text-sm font-medium">Dashboard</p>
                <p className="text-xs text-muted-foreground">Overview & insights</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent font-bold">2</span>
                </div>
                <p className="text-sm font-medium">Transactions</p>
                <p className="text-xs text-muted-foreground">Track expenses</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-secondary font-bold">3</span>
                </div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-xs text-muted-foreground">Set limits & goals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">4</span>
                </div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">Reports & trends</p>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.playbackRate = videoRef.current.playbackRate === 1 ? 1.5 : 1;
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Speed: {videoRef.current?.playbackRate === 1.5 ? '1.5x' : '1x'}
              </button>
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.requestPictureInPicture?.();
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                Picture in Picture
              </button>
              <button
                onClick={() => {
                  navigator.share?.({
                    title: 'ExpenseWise Demo',
                    text: 'Check out this amazing expense tracking app!',
                    url: window.location.href
                  });
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-sm font-medium text-white"
              >
                Share Demo
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DemoVideoModal;
