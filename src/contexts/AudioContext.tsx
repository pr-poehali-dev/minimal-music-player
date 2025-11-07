import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AudioTrack, audioDb } from '@/lib/audioDb';

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  tracks: AudioTrack[];
  queue: AudioTrack[];
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: AudioTrack) => void;
  toggleLike: (trackId: string) => void;
  toggleDislike: (trackId: string) => void;
  loadTracks: () => Promise<void>;
  addTrack: (track: AudioTrack) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [queue, setQueue] = useState<AudioTrack[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('ended', () => {
      playNext();
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadTracks = async () => {
    const loadedTracks = await audioDb.getAllTracks();
    const tracksWithUrls = loadedTracks.map(track => ({
      ...track,
      fileUrl: URL.createObjectURL(track.file)
    }));
    setTracks(tracksWithUrls);
  };

  const addTrack = async (track: AudioTrack) => {
    await audioDb.addTrack(track);
    await loadTracks();
  };

  const playTrack = async (track: AudioTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    const freshUrl = URL.createObjectURL(track.file);
    audioRef.current.src = freshUrl;
    setCurrentTrack(track);
    setIsPlaying(true);
    
    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
      return;
    }

    const updatedTrack = {
      ...track,
      playCount: track.playCount + 1,
      lastPlayed: new Date(),
    };
    await audioDb.updateTrack(updatedTrack);

    await audioDb.addHistory({
      id: `${track.id}-${Date.now()}`,
      trackId: track.id,
      playedAt: new Date(),
      duration: track.duration,
    });

    await loadTracks();
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    }
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else if (tracks.length > 0 && currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const nextIndex = (currentIndex + 1) % tracks.length;
      playTrack(tracks[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (tracks.length > 0 && currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
      playTrack(tracks[prevIndex]);
    }
  };

  const addToQueue = (track: AudioTrack) => {
    setQueue([...queue, track]);
  };

  const toggleLike = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const updatedTrack = {
      ...track,
      liked: !track.liked,
      disliked: false,
    };
    await audioDb.updateTrack(updatedTrack);
    await loadTracks();
  };

  const toggleDislike = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const updatedTrack = {
      ...track,
      disliked: !track.disliked,
      liked: false,
    };
    await audioDb.updateTrack(updatedTrack);
    await loadTracks();
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        tracks,
        queue,
        playTrack,
        togglePlay,
        seekTo,
        setVolume,
        playNext,
        playPrevious,
        addToQueue,
        toggleLike,
        toggleDislike,
        loadTracks,
        addTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};