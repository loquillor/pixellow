
import React, { useContext, useState } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';
import { PlayIcon, PauseIcon, NextIcon, PrevIcon, VisualizerIcon } from './Icons';
import Visualizer, { VisualizerStyle } from './Visualizer';

const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const visualizerStyles: VisualizerStyle[] = ['bars', 'wave', 'circle'];

const Player: React.FC = () => {
    const playerContext = useContext(PlayerContext);
    const [visualizerStyle, setVisualizerStyle] = useState<VisualizerStyle>('bars');

    if (!playerContext || !playerContext.currentTrack) {
        return null;
    }

    const {
        currentTrack,
        isPlaying,
        handlePlayPause,
        playNext,
        playPrev,
        currentTime,
        duration,
        handleSeek,
        analyser,
    } = playerContext;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const cycleVisualizer = () => {
        const currentIndex = visualizerStyles.indexOf(visualizerStyle);
        const nextIndex = (currentIndex + 1) % visualizerStyles.length;
        setVisualizerStyle(visualizerStyles[nextIndex]);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-lg text-white p-4 shadow-2xl z-20 flex flex-col gap-3">
            <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
                 {analyser && (
                    <div className="hidden sm:block">
                        <Visualizer analyser={analyser} style={visualizerStyle} />
                    </div>
                 )}

                <div className="flex-grow overflow-hidden">
                    <p className="text-xl font-bold truncate">{currentTrack.name}</p>
                    <p className="text-sm text-gray-400">Reproduciendo ahora</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button onClick={playPrev} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <PrevIcon />
                    </button>
                    <button onClick={handlePlayPause} className="p-3 bg-cyan-500 rounded-full hover:bg-cyan-400 transition-colors">
                        {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button onClick={playNext} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <NextIcon />
                    </button>
                </div>
                 {analyser && (
                    <button onClick={cycleVisualizer} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <VisualizerIcon />
                    </button>
                 )}
            </div>

            <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
                <span>{formatDuration(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm accent-cyan-400"
                />
                <span>{formatDuration(duration)}</span>
            </div>
             <div className="md:hidden w-full bg-gray-600 h-1 absolute bottom-0 left-0">
                <div className="bg-cyan-400 h-1" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

// FIX: Removed duplicate 'export' keyword.
export default Player;
