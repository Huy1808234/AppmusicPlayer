import axios from 'axios';
import { Track, CreateTrackDto, UpdateTrackDto } from '../types/track.type';

// Cấu hình Base URL động từ .env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const api = axios.create({
  baseURL: API_URL,
});

export const TrackService = {
  getTracks: async (): Promise<Track[]> => {
    const response = await api.get<Track[]>('/tracks');
    // Sort tracks consistently by id
    return response.data.sort((a, b) => Number(a._id) - Number(b._id));
  },

  createTrack: async (data: CreateTrackDto): Promise<{ _id: number }> => {
    const response = await api.post<{ _id: number }>('/tracks', data);
    return response.data;
  },

  updateTrack: async (_id: string, data: UpdateTrackDto): Promise<{ success: boolean }> => {
    const response = await api.put<{ success: boolean }>(`/tracks/${_id}`, data);
    return response.data;
  },

  deleteTrack: async (_id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/tracks/${_id}`);
    return response.data;
  },

  deleteAllTracks: async (): Promise<{ success: boolean; deleted: number }> => {
    const response = await api.delete<{ success: boolean; deleted: number }>('/tracks');
    return response.data;
  }
};
