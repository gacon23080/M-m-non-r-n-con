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
  currentTrack: MusicTrack;
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
  nextTrack: () => void;
  prevTrack: () => void;
  selectTrack: (track: MusicTrack) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  togglePlayerExpanded: () => void;
  addTrackToPlaylist: (track: MusicTrack) => void;
  updateTrack: (track: MusicTrack) => void;
  removeTrack: (id: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<MusicTrack[]>(() => {
    const saved = localStorage.getItem('mnrc_custom_playlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_MUSIC_TRACKS;
  });

  // Subscribe to Firestore musicTracks
  useEffect(() => {
    const q = query(collection(db, 'musicTracks'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicTrack));
        tracks.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPlaylist(tracks);
      } else {
        if (!localStorage.getItem('mnrc_music_seeded')) {
          localStorage.setItem('mnrc_music_seeded', 'true');
          try {
            for (const track of INITIAL_MUSIC_TRACKS) {
              await setDoc(doc(db, 'musicTracks', track.id), track);
            }
          } catch (e) {
            console.warn('Could not seed initial music tracks to Firestore:', e);
            setPlaylist(INITIAL_MUSIC_TRACKS);
          }
        } else {
          setPlaylist([]);
        }
      }
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

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Save playlist changes
  useEffect(() => {
    localStorage.setItem('mnrc_custom_playlist', JSON.stringify(playlist));
  }, [playlist]);

  // If track does not have youtubeId, play pleasant web audio synthesizer
  useEffect(() => {
    const ytId = currentTrack?.youtubeId || (currentTrack?.youtubeUrl ? extractYouTubeId(currentTrack.youtubeUrl) : null);
    
    if (isPlaying && !ytId) {
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
    if (isPlaying) {
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
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRepeat, currentTrackIndex]);

  const togglePlay = () => {
    soundManager.playBoop();
    setIsPlaying((prev) => !prev);
  };

  const startPlayback = () => {
    setIsPlaying(true);
  };

  const nextTrack = () => {
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
    soundManager.playBoop();
    setProgress(0);
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const selectTrack = (track: MusicTrack) => {
    soundManager.playMagicChime();
    const idx = playlist.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    } else {
      setPlaylist((prev) => [track, ...prev]);
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
    setProgress(0);
    // Explicitly start synth if needed
    const current = idx !== -1 ? playlist[idx] : track;
    const ytId = current.youtubeId || (current.youtubeUrl ? extractYouTubeId(current.youtubeUrl) : null);
    if (!ytId) {
      soundManager.startMelody(current.synthTheme || 'classroom', (note) => {
        setActiveNote(note);
      });
    }
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
    setPlaylist((prev) => [enriched, ...prev]);
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
    setPlaylist((prev) => prev.map((t) => (t.id === track.id ? enriched : t)));
    try {
      await setDoc(doc(db, 'musicTracks', track.id), enriched, { merge: true });
    } catch (e) {
      console.warn('Could not update track in Firestore:', e);
    }
  };

  const removeTrack = async (id: string) => {
    soundManager.playBoop();
    setPlaylist((prev) => prev.filter((t) => t.id !== id));
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
