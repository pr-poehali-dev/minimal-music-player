import { useAudio } from '@/contexts/AudioContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const Favorites = () => {
  const { tracks, playTrack, currentTrack, isPlaying, toggleLike } = useAudio();
  
  const favoriteTracks = tracks.filter(track => track.liked);

  if (favoriteTracks.length === 0) {
    return (
      <div className="pb-48">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Heart" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Нет избранных треков</h3>
              <p className="text-sm text-muted-foreground">
                Нажмите на сердечко у трека, чтобы добавить его в избранное
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-48">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Избранное</h2>
          <p className="text-muted-foreground">{favoriteTracks.length} треков</p>
        </div>
      </div>

      <div className="space-y-2">
        {favoriteTracks.map((track) => (
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
                    name="Heart"
                    size={16}
                    className="text-red-500 fill-red-500"
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
    </div>
  );
};
