
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Genre, Track } from './types';
import { PlayerContext } from './contexts/PlayerContext';
import ConfigurationScreen from './components/ConfigurationScreen';
import GenreMenu from './components/GenreMenu';
import TrackList from './components/TrackList';
import Player from './components/Player';
import { GearIcon } from './components/Icons';

type View = 'config' | 'genres' | 'tracklist';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('config');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<{ name: string; tracks: Track[] } | null>(null);
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<{ context: AudioContext, source: MediaElementAudioSourceNode, analyser: AnalyserNode } | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);


  useEffect(() => {
    const savedGenres = localStorage.getItem('mp3-jukebox-genres');
    if (savedGenres) {
      try {
        const parsedGenres: { name: string }[] = JSON.parse(savedGenres);
        if (parsedGenres.length > 0) {
          setGenres(parsedGenres.map(g => ({ ...g, tracks: [] })));
          setView('config'); // Always start at config to load tracks
        }
      } catch (error) {
        console.error("Error parsing genres from localStorage", error);
        localStorage.removeItem('mp3-jukebox-genres');
      }
    }
  }, []);

  const handleConfigSave = (newlyConfiguredGenres: Genre[]) => {
    setGenres(prevGenres => {
      // Use a Map to easily update existing genres or add new ones.
      // This ensures that genres for which folders were not selected in this session are preserved.
      const genresMap = new Map(prevGenres.map(g => [g.name, g]));

      newlyConfiguredGenres.forEach(configuredGenre => {
        genresMap.set(configuredGenre.name, configuredGenre);
      });

      const updatedGenres = Array.from(genresMap.values());
      
      const genreNames = updatedGenres.map(g => ({ name: g.name }));
      localStorage.setItem('mp3-jukebox-genres', JSON.stringify(genreNames));

      return updatedGenres;
    });
    
    setView('genres');
    setSelectedGenres([]);
  };

  const toggleGenreSelection = (genre: Genre) => {
    setSelectedGenres(prevSelected => {
      const isAlreadySelected = prevSelected.some(g => g.name === genre.name);
      if (isAlreadySelected) {
        return prevSelected.filter(g => g.name !== genre.name);
      } else {
        return [...prevSelected, genre];
      }
    });
  };

  const showSelectedTracks = () => {
    if (selectedGenres.length > 0) {
      const combinedTracks = selectedGenres.flatMap(g => g.tracks);
      combinedTracks.sort((a, b) => a.name.localeCompare(b.name));
      
      const playlistName = selectedGenres.map(g => g.name).join(' & ');
      setCurrentPlaylist({ name: playlistName, tracks: combinedTracks });
      setView('tracklist');
    }
  };

  const showSingleGenre = (genre: Genre) => {
    setCurrentPlaylist({ name: genre.name, tracks: genre.tracks });
    setView('tracklist');
  };
  
  const showShuffledTracks = () => {
    if (selectedGenres.length > 0) {
      const combinedTracks = selectedGenres.flatMap(g => g.tracks);
      const shuffledTracks = shuffleArray(combinedTracks);
      const playlistName = selectedGenres.map(g => g.name).join(' & ');
      setCurrentPlaylist({ name: `${playlistName} (Aleatorio)`, tracks: shuffledTracks });
      setView('tracklist');
      if (shuffledTracks.length > 0) {
        playTrack(shuffledTracks[0]);
      }
    }
  };

  const allTracks = useMemo(() => genres.flatMap(g => g.tracks), [genres]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allTracks.filter(track => track.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, allTracks]);

  const playFromSearchResults = (track: Track) => {
    setCurrentPlaylist({ name: `Resultados de "${searchQuery}"`, tracks: searchResults });
    playTrack(track);
  };

  const handleGlobalShuffle = () => {
    const shuffled = shuffleArray(allTracks);
    setCurrentPlaylist({ name: 'Aleatorio Total', tracks: shuffled });
    if (shuffled.length > 0) {
      playTrack(shuffled[0]);
    }
  };
  
  const shuffleAndPlayCurrent = () => {
    if (currentPlaylist) {
        const shuffledTracks = shuffleArray(currentPlaylist.tracks);
        setCurrentPlaylist(prev => prev ? { ...prev, tracks: shuffledTracks } : null);
        if (shuffledTracks.length > 0) {
            playTrack(shuffledTracks[0]);
        }
    }
  };

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      // Initialize Web Audio API on first play
      if (!audioContextRef.current) {
        // FIX: Added `(window as any)` to support `webkitAudioContext` for older browsers without TypeScript errors.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = context.createMediaElementSource(audioRef.current);
        const analyserNode = context.createAnalyser();
        analyserNode.fftSize = 512;
        source.connect(analyserNode);
        analyserNode.connect(context.destination);
        audioContextRef.current = { context, source, analyser: analyserNode };
        setAnalyser(analyserNode);
      }
      
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.context.state === 'suspended') {
        audioContextRef.current.context.resume();
      }

      if (currentTrack?.file.name === track.file.name) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        setCurrentTrack(track);
        const objectURL = URL.createObjectURL(track.file);
        audioRef.current.src = objectURL;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(e => console.error("Error playing audio:", e));
        
        const newPlayCount = (track.playCount || 0) + 1;
        track.playCount = newPlayCount;
        localStorage.setItem(`play_count_${track.file.name}`, String(newPlayCount));
        
        setGenres(prevGenres => prevGenres.map(g => ({
          ...g,
          tracks: g.tracks.map(t => t.file.name === track.file.name ? { ...t, playCount: newPlayCount } : t)
        })));
      }
    }
  }, [currentTrack, isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if(currentTrack) audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const playNext = useCallback(() => {
    if (!currentPlaylist || !currentTrack) return;
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.file.name === currentTrack.file.name);
    if (currentIndex > -1 && currentIndex < currentPlaylist.tracks.length - 1) {
      playTrack(currentPlaylist.tracks[currentIndex + 1]);
    }
  }, [currentTrack, currentPlaylist, playTrack]);
  
  const playPrev = useCallback(() => {
    if (!currentPlaylist || !currentTrack) return;
    const currentIndex = currentPlaylist.tracks.findIndex(t => t.file.name === currentTrack.file.name);
    if (currentIndex > 0) {
      playTrack(currentPlaylist.tracks[currentIndex - 1]);
    }
  }, [currentTrack, currentPlaylist, playTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const renderView = () => {
    switch(view) {
      case 'config':
        return <ConfigurationScreen 
                  onSave={handleConfigSave} 
                  initialGenres={genres}
                  onBack={() => setView('genres')}
                  canGoBack={genres.some(g => g.tracks.length > 0)}
               />;
      case 'genres':
        return <GenreMenu 
                  genres={genres} 
                  selectedGenres={selectedGenres}
                  onToggleGenre={toggleGenreSelection}
                  onShowTracks={showSelectedTracks}
                  onShowSingleGenre={showSingleGenre}
                  onShufflePlay={showShuffledTracks}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchResults={searchResults}
                  onPlayFromSearch={playFromSearchResults}
                  onGlobalShuffle={handleGlobalShuffle}
                />;
      case 'tracklist':
        if (currentPlaylist) {
          const playlistAsGenre: Genre = {
            name: currentPlaylist.name,
            tracks: currentPlaylist.tracks
          };
          return <TrackList 
                    genre={playlistAsGenre} 
                    onBack={() => { setView('genres'); setSelectedGenres([]); }}
                    onShufflePlay={shuffleAndPlayCurrent}
                 />;
        }
        return null;
      default:
        return <ConfigurationScreen onSave={handleConfigSave} initialGenres={genres} onBack={() => setView('genres')} canGoBack={false} />;
    }
  }

  return (
    <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, playNext, playPrev, handlePlayPause, currentTime, duration, handleSeek, analyser }}>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col pb-40">
        <header className="p-4 bg-gray-800/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-cyan-400">MP3 Jukebox</h1>
          {view !== 'config' && (
            <button onClick={() => setView('config')} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <GearIcon />
            </button>
          )}
        </header>

        <main className="flex-grow p-4 md:p-6">
          {renderView()}
        </main>
        
        {currentTrack && <Player />}

        <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
          crossOrigin="anonymous"
        />
      </div>
    </PlayerContext.Provider>
  );
}

export default App;
