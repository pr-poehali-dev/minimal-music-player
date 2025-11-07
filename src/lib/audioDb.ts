export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  file: File;
  fileUrl: string;
  addedDate: Date;
  playCount: number;
  liked: boolean;
  disliked: boolean;
  lastPlayed?: Date;
  type: 'music' | 'audiobook';
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdDate: Date;
  cover?: string;
}

export interface PlayHistory {
  id: string;
  trackId: string;
  playedAt: Date;
  duration: number;
}

const DB_NAME = 'AudioPlayerDB';
const DB_VERSION = 1;

class AudioDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('title', 'title', { unique: false });
          trackStore.createIndex('artist', 'artist', { unique: false });
          trackStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('trackId', 'trackId', { unique: false });
          historyStore.createIndex('playedAt', 'playedAt', { unique: false });
        }
      };
    });
  }

  async addTrack(track: AudioTrack): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const request = store.add(track);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTracks(): Promise<AudioTrack[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracks'], 'readonly');
      const store = transaction.objectStore('tracks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTrack(track: AudioTrack): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const request = store.put(track);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTrack(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tracks'], 'readwrite');
      const store = transaction.objectStore('tracks');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addPlaylist(playlist: Playlist): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playlists'], 'readwrite');
      const store = transaction.objectStore('playlists');
      const request = store.add(playlist);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playlists'], 'readonly');
      const store = transaction.objectStore('playlists');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playlists'], 'readwrite');
      const store = transaction.objectStore('playlists');
      const request = store.put(playlist);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePlaylist(id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playlists'], 'readwrite');
      const store = transaction.objectStore('playlists');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addHistory(history: PlayHistory): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['history'], 'readwrite');
      const store = transaction.objectStore('history');
      const request = store.add(history);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(limit?: number): Promise<PlayHistory[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['history'], 'readonly');
      const store = transaction.objectStore('history');
      const index = store.index('playedAt');
      const request = index.openCursor(null, 'prev');
      const results: PlayHistory[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && (!limit || results.length < limit)) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const audioDb = new AudioDatabase();
