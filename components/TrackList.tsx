
import React, { useContext } from 'react';
import type { Genre } from '../types';
import { PlayerContext } from '../contexts/PlayerContext';
import TrackItem from './TrackItem';
import { BackIcon, ShuffleIcon } from './Icons';

interface TrackListProps {
  genre: Genre;
  onBack: () => void;
  onShufflePlay: () => void;
}

const TrackList: React.FC<TrackListProps> = ({ genre, onBack, onShufflePlay }) => {
  const playerContext = useContext(PlayerContext);
  
  if (!playerContext) {
    return <div>Loading player...</div>;
  }

  const { playTrack } = playerContext;
  
  return (
    <div>
        <div className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center min-w-0">
                <button onClick={onBack} className="p-3 rounded-full hover:bg-gray-700 transition-colors mr-4 flex-shrink-0">
                    <BackIcon />
                </button>
                <h2 className="text-5xl font-bold text-cyan-300 truncate">{genre.name}</h2>
            </div>
            {genre.tracks.length > 1 && (
                <button 
                    onClick={onShufflePlay}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors shadow-lg flex items-center gap-2 flex-shrink-0"
                >
                    <ShuffleIcon className="w-6 h-6"/>
                    Aleatorio
                </button>
            )}
        </div>

        {genre.tracks.length > 0 ? (
            <div className="space-y-3">
                {genre.tracks.map((track) => (
                    <TrackItem 
                        key={track.file.name} 
                        track={track} 
                        onPlay={() => playTrack(track)}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <p className="text-2xl text-gray-500">No se encontraron pistas en la carpeta de este género.</p>
            </div>
        )}
    </div>
  );
};

export default TrackList;
