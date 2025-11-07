import { AudioProvider } from '@/contexts/AudioContext';
import { Player } from '@/components/Player';
import { Library } from '@/components/Library';
import { Favorites } from '@/components/Favorites';
import { Statistics } from '@/components/Statistics';
import { History } from '@/components/History';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AudioProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Music" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Аудиоплеер</h1>
                <p className="text-sm text-muted-foreground">Музыка и аудиокниги офлайн</p>
              </div>
            </div>
          </header>

          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full justify-start mb-6 h-12">
              <TabsTrigger value="library" className="gap-2">
                <Icon name="Library" size={18} />
                Библиотека
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2">
                <Icon name="Heart" size={18} />
                Избранное
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Icon name="History" size={18} />
                История
              </TabsTrigger>
              <TabsTrigger value="statistics" className="gap-2">
                <Icon name="BarChart3" size={18} />
                Статистика
              </TabsTrigger>
            </TabsList>

            <TabsContent value="library">
              <Library />
            </TabsContent>

            <TabsContent value="favorites">
              <Favorites />
            </TabsContent>

            <TabsContent value="history">
              <History />
            </TabsContent>

            <TabsContent value="statistics">
              <Statistics />
            </TabsContent>
          </Tabs>
        </div>

        <Player />
      </div>
    </AudioProvider>
  );
};

export default Index;
