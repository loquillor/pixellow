
import React, { useContext, useEffect, useState } from 'react';
import type { Track } from '../types';
import { PlayerContext } from '../contexts/PlayerContext';
import { PlayIcon, VolumeUpIcon } from './Icons';

interface TrackItemProps {
  track: Track;
  onPlay: () => void;
}

const formatDuration = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const TrackItem: React.FC<TrackItemProps> = ({ track, onPlay }) => {
  const playerContext = useContext(PlayerContext);
  const { currentTrack, isPlaying } = playerContext || {};
  
  const [localTrack, setLocalTrack] = useState(track);

  useEffect(() => {
    // This effect ensures the play count updates visually when changed elsewhere
    if(track.playCount !== localTrack.playCount) {
        setLocalTrack(track);
    }
  }, [track, localTrack.playCount]);


  const isCurrentlyPlaying = currentTrack?.file.name === localTrack.file.name && isPlaying;
  const isSelected = currentTrack?.file.name === localTrack.file.name;

  const baseClasses = "w-full text-left p-4 rounded-lg transition-all duration-200 flex items-center justify-between gap-4";
  const stateClasses = isSelected 
    ? "bg-cyan-800/70 shadow-lg" 
    : "bg-gray-800 hover:bg-gray-700";

  return (
    <button onClick={onPlay} className={`${baseClasses} ${stateClasses}`}>
      <div className="flex items-center gap-4 overflow-hidden">
        {isCurrentlyPlaying ? (
            <VolumeUpIcon className="w-8 h-8 text-green-400 flex-shrink-0 animate-pulse"/>
        ) : (
            <PlayIcon className={`w-8 h-8 flex-shrink-0 ${isSelected ? 'text-cyan-300' : 'text-gray-500'}`} />
        )}
        
        <div className="flex-grow overflow-hidden">
            <p className="text-3xl font-semibold truncate text-gray-100">{localTrack.name}</p>
        </div>
      </div>
      
      <div className="flex items-center flex-shrink-0 gap-6 text-2xl text-gray-400">
        <p>Reprod.: <span className="font-bold text-cyan-400">{localTrack.playCount}</span></p>
        <p>{formatDuration(localTrack.duration)}</p>
      </div>
    </button>
  );
};

export default TrackItem;
