import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { audioDb, PlayHistory } from '@/lib/audioDb';
import { useAudio } from '@/contexts/AudioContext';
import Icon from '@/components/ui/icon';

export const History = () => {
  const { tracks, playTrack } = useAudio();
  const [history, setHistory] = useState<PlayHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const historyData = await audioDb.getHistory(50);
    setHistory(historyData);
  };

  const getTrackById = (trackId: string) => {
    return tracks.find(t => t.id === trackId);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} д. назад`;
    
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupHistoryByDate = () => {
    const grouped: { [key: string]: PlayHistory[] } = {};
    
    history.forEach(item => {
      const date = new Date(item.playedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Вчера';
      } else {
        dateKey = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  };

  if (history.length === 0) {
    return (
      <div className="pb-48">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="History" size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">История пуста</h3>
              <p className="text-sm text-muted-foreground">
                Начните слушать музыку, и здесь появится история воспроизведения
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const groupedHistory = groupHistoryByDate();

  return (
    <div className="space-y-6 pb-48">
      <div>
        <h2 className="text-2xl font-bold">История прослушиваний</h2>
        <p className="text-muted-foreground">Последние {history.length} треков</p>
      </div>

      {Object.entries(groupedHistory).map(([dateKey, items]) => (
        <div key={dateKey} className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground px-2">{dateKey}</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const track = getTrackById(item.trackId);
              if (!track) return null;

              return (
                <Card
                  key={item.id}
                  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => playTrack(track)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Play" size={20} className="text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={14} />
                        <span>{formatDate(item.playedAt)}</span>
                      </div>

                      <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {track.type === 'music' ? '♪' : '📖'}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
