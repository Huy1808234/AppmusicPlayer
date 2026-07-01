import React, { useState } from 'react';
import { Space, Button, Modal, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTracks } from '../hooks/useTracks';
import { TrackTable } from '../components/features/track/TrackTable';
import { TrackForm } from '../components/features/track/TrackForm';
import { Track, CreateTrackDto } from '../types/track.type';

export default function AdminTrackManager() {
  const {
    tracks,
    isLoading,
    addTrack,
    updateTrack,
    deleteTrack,
    deleteAllTracks,
  } = useTracks();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [searchText, setSearchText] = useState('');

  // Delete All State
  const [isDeleteAllModalVisible, setIsDeleteAllModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleAdd = () => {
    setEditingTrack(null);
    setIsModalVisible(true);
  };

  const handleEdit = (track: Track) => {
    setEditingTrack(track);
    setIsModalVisible(true);
  };

  const handleSubmit = async (data: CreateTrackDto) => {
    if (editingTrack) {
      await updateTrack(editingTrack._id, data);
    } else {
      await addTrack(data);
    }
    setIsModalVisible(false);
  };

  const handleDeleteAll = () => {
    if (confirmText !== 'CONFIRM') {
      message.error('Vui lòng gõ chính xác chữ CONFIRM để xóa.');
      return;
    }
    deleteAllTracks();
    setIsDeleteAllModalVisible(false);
    setConfirmText('');
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Admin - Track Manager</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Space>
          <Button type="primary" onClick={handleAdd}>
            Add New Track
          </Button>
          <Button danger onClick={() => setIsDeleteAllModalVisible(true)}>
            Delete All Tracks
          </Button>
        </Space>
        
        <Input
          placeholder="Tìm kiếm theo Title hoặc Artist..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          className="w-full sm:w-80"
          allowClear
        />
      </div>

      <TrackTable
        tracks={tracks}
        loading={isLoading}
        searchText={searchText}
        onEdit={handleEdit}
        onDelete={deleteTrack}
      />

      <TrackForm
        visible={isModalVisible}
        editingTrack={editingTrack}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
      />

      <Modal
        title={<span style={{ color: 'red' }}>Cảnh báo nguy hiểm</span>}
        open={isDeleteAllModalVisible}
        onOk={handleDeleteAll}
        onCancel={() => {
          setIsDeleteAllModalVisible(false);
          setConfirmText('');
        }}
        okText="Xóa tất cả"
        cancelText="Hủy"
        okButtonProps={{ danger: true, disabled: confirmText !== 'CONFIRM' }}
      >
        <p>Hành động này sẽ xóa toàn bộ bài hát trong hệ thống và không thể khôi phục.</p>
        <p>Vui lòng gõ chữ <strong>CONFIRM</strong> vào ô bên dưới để xác nhận:</p>
        <Input 
          value={confirmText} 
          onChange={(e) => setConfirmText(e.target.value)} 
          placeholder="Gõ CONFIRM" 
          style={{ marginTop: 8 }}
        />
      </Modal>
    </div>
  );
}