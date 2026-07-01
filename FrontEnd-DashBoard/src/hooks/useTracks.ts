import { message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTrackDto, UpdateTrackDto } from '../types/track.type';
import { TrackService } from '../services/track.service';

export function useTracks() {
  const queryClient = useQueryClient();

  const {
    data: tracks = [],
    isLoading,
    error: queryError,
    refetch: fetchTracks,
  } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      try {
        return await TrackService.getTracks();
      } catch (err) {
        message.error('Failed to load tracks');
        throw err;
      }
    },
  });

  const error = queryError ? 'Failed to load tracks' : null;

  const addMutation = useMutation({
    mutationFn: (data: CreateTrackDto) => TrackService.createTrack(data),
    onSuccess: () => {
      message.success('Added track successfully');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Submit failed';
      message.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrackDto }) =>
      TrackService.updateTrack(id, data),
    onSuccess: () => {
      message.success('Updated track successfully');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Submit failed';
      message.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TrackService.deleteTrack(id),
    onSuccess: () => {
      message.success('Deleted track successfully');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: () => {
      message.error('Delete failed');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => TrackService.deleteAllTracks(),
    onSuccess: () => {
      message.success('All tracks deleted');
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
    onError: () => {
      message.error('Failed to delete all tracks');
    },
  });

  return {
    tracks,
    isLoading,
    error,
    fetchTracks,
    addTrack: addMutation.mutateAsync,
    updateTrack: (id: string, data: UpdateTrackDto) => updateMutation.mutateAsync({ id, data }),
    deleteTrack: deleteMutation.mutateAsync,
    deleteAllTracks: deleteAllMutation.mutateAsync,
  };
}
