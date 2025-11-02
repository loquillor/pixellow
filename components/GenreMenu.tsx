
import React from 'react';
import type { Genre, Track } from '../types';
import { MusicNoteIcon, CheckIcon, PlayIcon, ShuffleIcon, SearchIcon } from './Icons';
import TrackItem from './TrackItem';

interface GenreMenuProps {
  genres: Genre[];
  selectedGenres: Genre[];
  onToggleGenre: (genre: Genre) => void;
  onShowTracks: () => void;
  onShowSingleGenre: (genre: Genre) => void;
  onShufflePlay: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Track[];
  onPlayFromSearch: (track: Track) => void;
  onGlobalShuffle: () => void;
}

const GenreMenu: React.FC<GenreMenuProps> = ({
  genres,
  selectedGenres,
  onToggleGenre,
  onShowTracks,
  onShowSingleGenre,
  onShufflePlay,
  searchQuery,
  onSearchChange,
  searchResults,
  onPlayFromSearch,
  onGlobalShuffle
}) => {
  if (genres.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-4xl font-bold text-gray-400">No hay géneros configurados</h2>
            <p className="text-xl mt-4 text-gray-500">Por favor, ve a la configuración para añadir tus carpetas de música.</p>
        </div>
    )
  }
  
  const totalSelectedTracks = selectedGenres.reduce((sum, g) => sum + g.tracks.length, 0);
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="pb-32">
        <div className="mb-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Buscar en toda la biblioteca..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-gray-700 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-md text-xl border-2 border-gray-600 focus:border-cyan-400 focus:ring-0 transition-colors"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <SearchIcon className="w-6 h-6 text-gray-400" />
                </div>
            </div>
            <button
                onClick={onGlobalShuffle}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors shadow-lg flex items-center justify-center gap-3"
            >
                <ShuffleIcon className="w-6 h-6"/>
                Aleatorio Total
            </button>
        </div>
        
        {isSearching ? (
             <div>
                <h2 className="text-3xl font-bold mb-4 text-cyan-300">Resultados de la Búsqueda</h2>
                {searchResults.length > 0 ? (
                    <div className="space-y-3">
                        {searchResults.map((track) => (
                            <TrackItem 
                                key={track.file.name} 
                                track={track} 
                                onPlay={() => onPlayFromSearch(track)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-xl text-gray-500 text-center py-10">No se encontraron pistas.</p>
                )}
            </div>
        ) : (
            <>
                <h2 className="text-5xl font-bold mb-8 text-center text-cyan-300">Selecciona Género(s)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {genres.map((genre) => {
                      const isSelected = selectedGenres.some(g => g.name === genre.name);
                      return (
                        <div
                            key={genre.name}
                            onClick={() => onToggleGenre(genre)}
                            className={`relative cursor-pointer bg-gray-800 p-8 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out group ${isSelected ? 'ring-4 ring-offset-2 ring-offset-gray-900 ring-cyan-400' : 'hover:bg-cyan-800 hover:shadow-cyan-500/20'}`}
                        >
                            {isSelected && (
                                <div className="absolute top-3 right-3 bg-cyan-400 text-gray-900 rounded-full p-1 shadow-md">
                                    <CheckIcon className="w-5 h-5" />
                                </div>
                            )}
                            <div className="flex flex-col items-center justify-center text-center">
                                <MusicNoteIcon className="w-16 h-16 mb-4 text-cyan-400 group-hover:text-white transition-colors" />
                                <h3 className="text-4xl font-bold text-white truncate">{genre.name}</h3>
                                <p className="text-xl text-gray-400 group-hover:text-gray-200 transition-colors">{genre.tracks.length} pistas</p>
                                 <div className="mt-4 w-full">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onShowSingleGenre(genre); }}
                                        className="w-full bg-cyan-600/50 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                                    >
                                        Ver Pistas
                                    </button>
                                </div>
                            </div>
                        </div>
                      )
                    })}
                </div>
            </>
        )}

        {!isSearching && selectedGenres.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-20 border-t border-gray-700 shadow-2xl">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onShowTracks}
                        className="flex-grow bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors shadow-lg flex items-center justify-center gap-3"
                    >
                        <PlayIcon className="w-8 h-8"/>
                        Reproducir Selección ({totalSelectedTracks} pistas)
                    </button>
                    <button
                        onClick={onShufflePlay}
                        className="flex-grow bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors shadow-lg flex items-center justify-center gap-3"
                    >
                        <ShuffleIcon className="w-8 h-8"/>
                        Reproducción Aleatoria
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default GenreMenu;
