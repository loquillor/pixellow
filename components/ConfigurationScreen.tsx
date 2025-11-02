
import React, { useState, ChangeEvent } from 'react';
import type { Genre, Track } from '../types';
import { FolderIcon, PlusIcon, TrashIcon, CheckCircleIcon, BackIcon } from './Icons';

interface GenreInput {
  id: number;
  name: string;
  files: File[];
  fileCount: number;
}

interface ConfigurationScreenProps {
  onSave: (genres: Genre[]) => void;
  initialGenres: Genre[];
  onBack: () => void;
  canGoBack: boolean;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onSave, initialGenres, onBack, canGoBack }) => {
  const [genreInputs, setGenreInputs] = useState<GenreInput[]>(
    initialGenres.length > 0 
      ? initialGenres.map((g, i) => ({ id: i, name: g.name, files: [], fileCount: 0 }))
      : [{ id: Date.now(), name: '', files: [], fileCount: 0 }]
  );
  const [isLoading, setIsLoading] = useState(false);

  const addGenreInput = () => {
    setGenreInputs([...genreInputs, { id: Date.now(), name: '', files: [], fileCount: 0 }]);
  };
  
  const removeGenreInput = (id: number) => {
    setGenreInputs(genreInputs.filter(input => input.id !== id));
  };
  
  const handleNameChange = (id: number, name: string) => {
    setGenreInputs(genreInputs.map(input => (input.id === id ? { ...input, name } : input)));
  };

  const handleFilesChange = (id: number, event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const mp3Files = Array.from(event.target.files).filter(file => file.name.toLowerCase().endsWith('.mp3'));
      setGenreInputs(genreInputs.map(input => (input.id === id ? { ...input, files: mp3Files, fileCount: mp3Files.length } : input)));
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => {
        resolve(0); // Resolve with 0 if there's an error
      }
    });
  }

  const handleSave = async () => {
    setIsLoading(true);
    const validGenres = genreInputs.filter(g => g.name.trim() !== '' && g.files.length > 0);
    
    const processedGenres: Genre[] = await Promise.all(validGenres.map(async (g): Promise<Genre> => {
      const tracks: Track[] = await Promise.all(g.files.map(async (file): Promise<Track> => {
        const duration = await getAudioDuration(file);
        const playCount = parseInt(localStorage.getItem(`play_count_${file.name}`) || '0', 10);
        return {
          file,
          name: file.name.replace(/\.mp3$/i, ''),
          duration,
          playCount
        };
      }));

      return {
        name: g.name.trim(),
        tracks: tracks.sort((a,b) => a.name.localeCompare(b.name))
      };
    }));

    onSave(processedGenres);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-4xl font-bold mb-2 text-cyan-300">Configuración</h2>
        <p className="text-gray-400 mb-6 text-lg">
          Añade géneros musicales y selecciona las carpetas correspondientes en tu dispositivo. Todos los archivos deben estar en formato `.mp3`.
          <br/>
          <strong className="text-amber-400">Nota:</strong> Por motivos de seguridad, deberás seleccionar tus carpetas cada vez que cargues la aplicación.
        </p>
      </div>

      <div className="space-y-6">
        {genreInputs.map((input) => (
          <div key={input.id} className="bg-gray-800 p-5 rounded-lg flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Nombre del Género (ej. Rock)"
              value={input.name}
              onChange={(e) => handleNameChange(input.id, e.target.value)}
              className="w-full md:w-1/3 bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md text-xl border-2 border-gray-600 focus:border-cyan-400 focus:ring-0 transition-colors"
            />
            
            <label className="w-full md:w-2/3 cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-colors text-xl">
              <FolderIcon />
              <span>{input.fileCount > 0 ? `${input.fileCount} pistas seleccionadas` : 'Seleccionar Carpeta'}</span>
              <input
                type="file"
                // @ts-ignore
                webkitdirectory="true"
                directory="true"
                multiple
                className="hidden"
                onChange={(e) => handleFilesChange(input.id, e)}
              />
            </label>

            <button onClick={() => removeGenreInput(input.id)} className="p-3 bg-red-600 hover:bg-red-500 rounded-full transition-colors">
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4">
        {canGoBack && (
            <button
                onClick={onBack}
                className="w-full md:w-auto flex-grow bg-gray-700 hover:bg-gray-600 text-cyan-300 font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors text-2xl"
            >
                <BackIcon />
                Regresar
            </button>
        )}
        <button
          onClick={addGenreInput}
          className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-cyan-300 font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors text-2xl"
        >
          <PlusIcon />
          Añadir Género
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || genreInputs.every(g => g.files.length === 0)}
          className="w-full md:w-auto flex-grow bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors text-2xl disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Procesando...
            </>
          ) : (
             <>
              <CheckCircleIcon />
              Guardar y Empezar
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfigurationScreen;
