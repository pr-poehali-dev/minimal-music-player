import { useAudio } from '@/contexts/AudioContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Player = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    toggleLike,
    toggleDislike,
  } = useAudio();

  const [visualBars, setVisualBars] = useState<number[]>(Array(40).fill(0));

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setVisualBars(Array(40).fill(0).map(() => Math.random()));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisualBars(Array(40).fill(0));
    }
  }, [isPlaying]);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border p-6">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          Выберите трек для воспроизведения
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-4 opacity-20">
          {visualBars.map((height, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full transition-all duration-100"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([value]) => seekTo(value)}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={currentTrack.liked ? 'default' : 'ghost'}
              size="icon"
              onClick={() => toggleLike(currentTrack.id)}
              className="h-10 w-10"
            >
              <Icon name="ThumbsUp" size={18} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="h-12 w-12"
            >
              <Icon name="SkipBack" size={20} />
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="h-14 w-14 rounded-full"
            >
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="h-12 w-12"
            >
              <Icon name="SkipForward" size={20} />
            </Button>

            <Button
              variant={currentTrack.disliked ? 'destructive' : 'ghost'}
              size="icon"
              onClick={() => toggleDislike(currentTrack.id)}
              className="h-10 w-10"
            >
              <Icon name="ThumbsDown" size={18} />
            </Button>
          </div>

          <div className="flex items-center gap-2 min-w-[140px]">
            <Icon name="Volume2" size={18} className="text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => setVolume(value / 100)}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
