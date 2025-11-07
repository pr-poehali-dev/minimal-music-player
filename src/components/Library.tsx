import { useAudio } from '@/contexts/AudioContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { AudioTrack } from '@/lib/audioDb';
import { Card } from '@/components/ui/card';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Library = () => {
  const { tracks, playTrack, currentTrack, isPlaying, addTrack, loadTracks, toggleLike } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'music' | 'audiobook'>('all');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const audio = new Audio();
      const fileUrl = URL.createObjectURL(file);
      audio.src = fileUrl;

      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });

      const fileName = file.name.replace(/\.[^/.]+$/, '');
      const nameParts = fileName.split(' - ');
      
      const track: AudioTrack = {
        id: `${Date.now()}-${i}`,
        title: nameParts[1] || fileName,
        artist: nameParts[0] || 'Неизвестный исполнитель',
        album: nameParts[2],
        duration: audio.duration,
        file,
        fileUrl,
        addedDate: new Date(),
        playCount: 0,
        liked: false,
        disliked: false,
        type: file.name.toLowerCase().includes('книга') || file.name.toLowerCase().includes('глава') ? 'audiobook' : 'music',
      };

      await addTrack(track);
    }

    await loadTracks();
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.album?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesType = typeFilter === 'all' || track.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-48">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск треков, исполнителей, альбомов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            size="sm"
          >
            Всё
          </Button>
          <Button
            variant={typeFilter === 'music' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('music')}
            size="sm"
          >
            Музыка
          </Button>
          <Button
            variant={typeFilter === 'audiobook' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('audiobook')}
            size="sm"
          >
            Аудиокниги
          </Button>
        </div>

        <label htmlFor="file-upload">
          <Button asChild>
            <span className="cursor-pointer">
              <Icon name="Upload" size={18} className="mr-2" />
              Добавить файлы
            </span>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {filteredTracks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Music" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Библиотека пуста</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Добавьте аудиофайлы для начала работы
              </p>
              <label htmlFor="file-upload-empty">
                <Button asChild>
                  <span className="cursor-pointer">
                    <Icon name="Upload" size={18} className="mr-2" />
                    Загрузить файлы
                  </span>
                </Button>
                <input
                  id="file-upload-empty"
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTracks.map((track) => (
            <Card
              key={track.id}
              className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                currentTrack?.id === track.id ? 'bg-accent border-primary' : ''
              }`}
              onClick={() => playTrack(track)}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Icon name="Pause" size={20} className="text-primary" />
                  ) : (
                    <Icon name="Play" size={20} className="text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {track.album && (
                    <span className="hidden md:block truncate max-w-[200px]">{track.album}</span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Icon name="Play" size={14} />
                    <span>{track.playCount}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                  >
                    <Icon 
                      name={track.liked ? 'Heart' : 'HeartOff'} 
                      size={16}
                      className={track.liked ? 'text-red-500 fill-red-500' : ''}
                    />
                  </Button>

                  <span className="font-mono">{formatTime(track.duration)}</span>

                  <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {track.type === 'music' ? '♪' : '📖'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
