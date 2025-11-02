
export interface Track {
  file: File;
  name: string;
  duration: number; // in seconds
  playCount: number;
}

export interface Genre {
  name: string;
  tracks: Track[];
}
