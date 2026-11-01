import React, { createContext, useContext, useEffect, useState } from 'react';
import { MusicTrack } from '../types';
import { INITIAL_MUSIC_TRACKS } from '../lib/initialData';
import { soundManager } from '../lib/sound';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, deleteDoc, doc, query, orderBy, getDocs } from 'firebase/firestore';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Match standard, youtu.be, embed, shorts
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface MusicContextType {
  playlist: MusicTrack[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  progress: number;
  isPlayerExpanded: boolean;
  activeNote: string;
  togglePlay: () => void;
  startPlayback: () => void;
  pausePlayback: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (track: MusicTrack) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  togglePlayerExpanded: () => void;
  addTrackToPlaylist: (track: MusicTrack) => Promise<void>;
  updateTrack: (track: MusicTrack) => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);

  // Subscribe to Firestore musicTracks (Strict: Never auto-seed if deleted or empty)
  useEffect(() => {
    const q = query(collection(db, 'musicTracks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicTrack));
      tracks.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPlaylist(tracks);
    }, (err) => {
      console.warn('musicTracks subscription note:', err);
    });

    return () => unsubscribe();
  }, []);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<string>('');

  const currentTrack: MusicTrack | null = playlist[currentTrackIndex] || playlist[0] || null;

  // Synthesizer ambient melody handler: strictly stopped when !isPlaying or !currentTrack
  useEffect(() => {
    if (!currentTrack || !isPlaying) {
      soundManager.stopMelody();
      setActiveNote('');
      return;
    }

    const ytId = currentTrack.youtubeId || (currentTrack.youtubeUrl ? extractYouTubeId(currentTrack.youtubeUrl) : null);
    
    // Play soothing synth melody only if there is no external YouTube track
    if (!ytId) {
      soundManager.startMelody(currentTrack.synthTheme || 'classroom', (note) => {
        setActiveNote(note);
      });
    } else {
      soundManager.stopMelody();
      setActiveNote('');
    }

    return () => {
      soundManager.stopMelody();
    };
  }, [isPlaying, currentTrack]);

  // Track progress simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && currentTrack && playlist.length > 0) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (isRepeat) {
              return 0;
            } else {
              nextTrack();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // When paused or empty, do not advance progress
      soundManager.stopMelody();
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRepeat, currentTrackIndex, currentTrack, playlist.length]);

  const togglePlay = () => {
    soundManager.playBoop();
    if (isPlaying) {
      // Pause completely
      setIsPlaying(false);
      soundManager.stopMelody();
    } else {
      if (playlist.length > 0) {
        setIsPlaying(true);
      }
    }
  };

  const startPlayback = () => {
    if (playlist.length > 0) {
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    soundManager.stopMelody();
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    soundManager.playBoop();
    setProgress(0);
    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(randIdx);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    soundManager.playBoop();
    setProgress(0);
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const selectTrack = (track: MusicTrack) => {
    soundManager.playMagicChime();
    const idx = playlist.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
    setIsPlaying(true);
    setProgress(0);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    soundManager.setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    soundManager.playBoop();
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.enabled = !next;
      return next;
    });
  };

  const toggleShuffle = () => {
    soundManager.playBoop();
    setIsShuffle((prev) => !prev);
  };

  const toggleRepeat = () => {
    soundManager.playBoop();
    setIsRepeat((prev) => !prev);
  };

  const togglePlayerExpanded = () => {
    soundManager.playBoop();
    setIsPlayerExpanded((prev) => !prev);
  };

  const addTrackToPlaylist = async (track: MusicTrack) => {
    soundManager.playMagicChime();
    const ytId = track.youtubeUrl ? extractYouTubeId(track.youtubeUrl) : null;
    const enriched = { ...track, youtubeId: ytId || undefined };
    try {
      await setDoc(doc(db, 'musicTracks', track.id), enriched);
    } catch (e) {
      console.warn('Could not save track to Firestore:', e);
    }
  };

  const updateTrack = async (track: MusicTrack) => {
    soundManager.playMagicChime();
    const ytId = track.youtubeUrl ? extractYouTubeId(track.youtubeUrl) : null;
    const enriched = { ...track, youtubeId: ytId || undefined };
    try {
      await setDoc(doc(db, 'musicTracks', track.id), enriched, { merge: true });
    } catch (e) {
      console.warn('Could not update track in Firestore:', e);
    }
  };

  const removeTrack = async (id: string) => {
    soundManager.playBoop();
    try {
      await deleteDoc(doc(db, 'musicTracks', id));
    } catch (e) {
      console.warn('Could not delete track from Firestore:', e);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        playlist,
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        progress,
        isPlayerExpanded,
        activeNote,
        togglePlay,
        startPlayback,
        pausePlayback,
        nextTrack,
        prevTrack,
        selectTrack,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        togglePlayerExpanded,
        addTrackToPlaylist,
        updateTrack,
        removeTrack
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
