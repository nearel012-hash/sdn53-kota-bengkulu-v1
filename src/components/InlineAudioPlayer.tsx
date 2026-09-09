import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Music, Download } from 'lucide-react';
import { MediaItem } from '../types';
import { getMediaBlob } from '../services/storage';
import { formatFileSize } from '../utils/fileValidation';

interface InlineAudioPlayerProps {
  key?: string;
  item: MediaItem;
  className?: string;
}

export default function InlineAudioPlayer({ item, className = '' }: InlineAudioPlayerProps) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let activeUrl: string | null = null;
    let isCancelled = false;

    const loadAudio = async () => {
      setIsLoading(true);
      try {
        if (item.dataUrl && item.dataUrl.trim().length > 0) {
          if (!isCancelled) {
            setAudioSrc(item.dataUrl);
            setIsLoading(false);
          }
          return;
        }

        const blob = await getMediaBlob(item.id);
        if (isCancelled) return;

        if (blob) {
          activeUrl = URL.createObjectURL(blob);
          setAudioSrc(activeUrl);
        }
      } catch (err) {
        console.error('Failed to load audio source', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAudio();

    return () => {
      isCancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [item.id, item.dataUrl]);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch((e) => console.warn('Audio play interrupted', e));
    } else {
      audioRef.current.pause();
    }
  };

  const handleDownload = () => {
    if (!audioSrc) return;
    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = item.originalName || `${item.name}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={isLoading || !audioSrc}
          className="w-12 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
          title={isPlaying ? 'Jeda Audio' : 'Putar Audio Langsung'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0">
          <h5 className="text-xs font-bold text-slate-900 truncate">{item.originalName}</h5>
          <span className="text-[11px] text-slate-500 font-mono">
            {formatFileSize(item.size)} • Format {item.extension.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {audioSrc && (
          <audio
            ref={audioRef}
            src={audioSrc}
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            className="h-9 max-w-[200px] sm:max-w-[240px]"
          />
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={!audioSrc}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Unduh Audio"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
