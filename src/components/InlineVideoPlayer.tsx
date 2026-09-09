import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Maximize, Video as VideoIcon } from 'lucide-react';
import { MediaItem } from '../types';
import { getMediaBlob } from '../services/storage';
import { formatFileSize } from '../utils/fileValidation';

interface InlineVideoPlayerProps {
  key?: string;
  item: MediaItem;
  autoPlay?: boolean;
  className?: string;
  showDetails?: boolean;
}

export default function InlineVideoPlayer({
  item,
  autoPlay = false,
  className = '',
  showDetails = true
}: InlineVideoPlayerProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let activeUrl: string | null = null;
    let isCancelled = false;

    const loadVideo = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        if (item.dataUrl && item.dataUrl.trim().length > 0) {
          if (!isCancelled) {
            setVideoSrc(item.dataUrl);
            setIsLoading(false);
          }
          return;
        }

        const blob = await getMediaBlob(item.id);
        if (isCancelled) return;

        if (blob) {
          activeUrl = URL.createObjectURL(blob);
          setVideoSrc(activeUrl);
        } else {
          setLoadError('Berkas video tidak ditemukan di penyimpanan lokal.');
        }
      } catch (err) {
        console.error('Failed to load video source', err);
        if (!isCancelled) {
          setLoadError('Gagal memuat video.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      isCancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [item.id, item.dataUrl]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch((e) => console.warn('Play interrupted', e));
    } else {
      videoRef.current.pause();
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleDownload = () => {
    if (!videoSrc) return;
    const a = document.createElement('a');
    a.href = videoSrc;
    a.download = item.originalName || `${item.name}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md ${className}`}
    >
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-slate-400">
            <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Menyiapkan video...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center p-6 text-rose-400 text-center">
            <VideoIcon className="w-10 h-10 mb-2 text-rose-500/80" />
            <p className="text-xs font-medium">{loadError}</p>
          </div>
        ) : videoSrc ? (
          <div className="relative w-full h-full group flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              playsInline
              autoPlay={autoPlay}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
            >
              Browser Anda tidak mendukung tag video HTML5.
            </video>

            {/* Quick Play Overlay Button when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute z-10 w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all backdrop-blur-xs group/play focus:outline-hidden"
                aria-label="Putar Video Sekarang"
                title="Klik untuk langsung memutar video"
              >
                <Play className="w-7 h-7 fill-white translate-x-0.5 text-white" />
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Video Footer Info & Actions */}
      {showDetails && (
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="font-semibold text-white truncate text-xs">{item.originalName}</h5>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatFileSize(item.size)} • Format {item.extension.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {videoSrc && (
              <>
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title={isPlaying ? 'Jeda' : 'Putar Langsung'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-blue-400" />
                      <span>Jeda</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                      <span>Putar Video</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={isMuted ? 'Buka Suara' : 'Bisukan'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Layar Penuh"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Unduh File Video"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
