
import { createContext } from 'react';
import type { Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  handlePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  currentTime: number;
  duration: number;
  handleSeek: (time: number) => void;
  analyser: AnalyserNode | null;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
