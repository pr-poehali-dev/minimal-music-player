import { useAudio } from '@/contexts/AudioContext';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';
import { audioDb, PlayHistory } from '@/lib/audioDb';

export const Statistics = () => {
  const { tracks } = useAudio();
  const [history, setHistory] = useState<PlayHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await audioDb.getHistory();
    setHistory(historyData);
  };

  const totalPlayCount = tracks.reduce((sum, track) => sum + track.playCount, 0);
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);
  const likedTracks = tracks.filter(t => t.liked).length;
  const musicTracks = tracks.filter(t => t.type === 'music').length;
  const audiobookTracks = tracks.filter(t => t.type === 'audiobook').length;

  const mostPlayedTracks = [...tracks]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${mins}мин`;
  };

  const getListeningByDay = () => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const counts = Array(7).fill(0);
    
    history.forEach(item => {
      const day = new Date(item.playedAt).getDay();
      counts[day]++;
    });

    const maxCount = Math.max(...counts, 1);
    
    return days.map((day, index) => ({
      day,
      count: counts[index],
      height: (counts[index] / maxCount) * 100,
    }));
  };

  const listeningData = getListeningByDay();

  return (
    <div className="space-y-6 pb-48">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Music" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего треков</p>
              <p className="text-2xl font-bold">{tracks.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Play" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Прослушиваний</p>
              <p className="text-2xl font-bold">{totalPlayCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Общее время</p>
              <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Heart" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Избранное</p>
              <p className="text-2xl font-bold">{likedTracks}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Прослушивания по дням</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {listeningData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full bg-primary/10 rounded-t-lg overflow-hidden">
                  <div
                    className="bg-primary rounded-t-lg transition-all duration-500"
                    style={{ height: `${item.height}%`, minHeight: '4px' }}
                  />
                  <div className="absolute inset-0 flex items-end justify-center pb-1">
                    <span className="text-xs font-semibold text-primary-foreground">
                      {item.count > 0 ? item.count : ''}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика по типам</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">♪</span>
                </div>
                <div>
                  <p className="font-medium">Музыка</p>
                  <p className="text-sm text-muted-foreground">{musicTracks} треков</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{Math.round((musicTracks / tracks.length) * 100) || 0}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
                <div>
                  <p className="font-medium">Аудиокниги</p>
                  <p className="text-sm text-muted-foreground">{audiobookTracks} треков</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{Math.round((audiobookTracks / tracks.length) * 100) || 0}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Топ-5 треков</h3>
        <div className="space-y-3">
          {mostPlayedTracks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Данные появятся после прослушивания треков
            </p>
          ) : (
            mostPlayedTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Play" size={14} />
                  <span className="font-semibold">{track.playCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
