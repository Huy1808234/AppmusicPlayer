import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Track, CreateTrackDto } from '../../../types/track.type';

const trackSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  url: z.string().url('Invalid URL format').min(1, 'URL is required'),
  artwork: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

type TrackFormValues = z.infer<typeof trackSchema>;

interface TrackFormProps {
  visible: boolean;
  editingTrack: Track | null;
  onCancel: () => void;
  onSubmit: (data: CreateTrackDto) => Promise<void>;
}

export function TrackForm({ visible, editingTrack, onCancel, onSubmit }: TrackFormProps) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { title: '', artist: '', url: '', artwork: '' }
  });

  useEffect(() => {
    if (visible) {
      if (editingTrack) {
        reset({
          title: editingTrack.title,
          artist: editingTrack.artist,
          url: editingTrack.url,
          artwork: editingTrack.artwork || '',
        });
      } else {
        reset({ title: '', artist: '', url: '', artwork: '' });
      }
    }
  }, [visible, editingTrack, reset]);

  const onFormSubmit = async (data: TrackFormValues) => {
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Modal
      title={editingTrack ? 'Edit Track' : 'Add Track'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit(onFormSubmit)}>
          Submit
        </Button>,
      ]}
      destroyOnClose
    >
      <Form layout="vertical">
        <Form.Item 
          label="Title" 
          validateStatus={errors.title ? 'error' : ''} 
          help={errors.title?.message}
          required
        >
          <Controller
            name="title"
            control={control}
            render={({ field }: any) => <Input {...field} placeholder="Enter track title" />}
          />
        </Form.Item>
        <Form.Item 
          label="Artist" 
          validateStatus={errors.artist ? 'error' : ''} 
          help={errors.artist?.message}
          required
        >
          <Controller
            name="artist"
            control={control}
            render={({ field }: any) => <Input {...field} placeholder="Enter artist name" />}
          />
        </Form.Item>
        <Form.Item 
          label="URL" 
          validateStatus={errors.url ? 'error' : ''} 
          help={errors.url?.message}
          required
        >
          <Controller
            name="url"
            control={control}
            render={({ field }: any) => <Input {...field} placeholder="https://..." />}
          />
        </Form.Item>
        <Form.Item 
          label="Artwork URL"
          validateStatus={errors.artwork ? 'error' : ''} 
          help={errors.artwork?.message}
        >
          <Controller
            name="artwork"
            control={control}
            render={({ field }: any) => <Input {...field} placeholder="https://... (optional)" />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
