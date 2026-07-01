export interface Track {
  _id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
}

export type CreateTrackDto = Omit<Track, '_id'>;
export type UpdateTrackDto = Partial<CreateTrackDto>;
