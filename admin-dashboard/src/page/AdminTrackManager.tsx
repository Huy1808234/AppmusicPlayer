import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Space,
  message,
  Upload
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const API_URL = 'http://localhost:3000';

export default function AdminTrackManager() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [artworkUrl, setArtworkUrl] = useState<string>('');
  
  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tracks`);
      const sorted = res.data.sort((a: any, b: any) => Number(a.id) - Number(b.id));
      setTracks(sorted);
    } catch (error) {
      message.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdd = () => {
    form.resetFields();
    setArtworkUrl('');
    setEditingTrack(null);
    setIsModalVisible(true);
  };

  const handleEdit = (track: any) => {
    setEditingTrack(track);
    setArtworkUrl(track.artwork);
    form.setFieldsValue(track);
    setIsModalVisible(true);
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete(`${API_URL}/tracks`);
      message.success('All tracks deleted');
      fetchTracks();
    } catch (error) {
      message.error('Failed to delete all tracks');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/tracks/${id}`);
      message.success('Deleted');
      fetchTracks();
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, artwork: artworkUrl };
      if (editingTrack) {
        await axios.put(`${API_URL}/tracks/${editingTrack.id}`, payload);
        message.success('Updated');
      } else {
        await axios.post(`${API_URL}/tracks`, payload);
        message.success('Added');
      }
      setIsModalVisible(false);
      fetchTracks();
    } catch (err: any) {
        const msg = err?.response?.data?.error || 'Submit failed';
        message.error(msg);
      }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin - Track Manager</h2>
      <Space style={{ marginBottom: 16 }}>
  <Button type="primary" onClick={handleAdd}>
    Add New Track
  </Button>
  <Button danger onClick={handleDeleteAll}>
    Delete All Tracks
  </Button>
</Space>

      <Table
        rowKey="id"
        dataSource={tracks}
        loading={loading}
        columns={[
          { title: 'ID', dataIndex: 'id' },
          { title: 'Title', dataIndex: 'title' },
          { title: 'Artist', dataIndex: 'artist' },
          { title: 'URL', dataIndex: 'url' },
          {
            title: 'Artwork',
            dataIndex: 'artwork',
            render: (text: string) => (
              text ? <img src={text} alt="artwork" style={{ width: 60, height: 60, objectFit: 'cover' }} /> : 'N/A'
            )
          },
          {
            title: 'Actions',
            render: (_, record) => (
              <Space>
                <Button onClick={() => handleEdit(record)}>Edit</Button>
                <Button danger onClick={() => handleDelete(record.id)}>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingTrack ? 'Edit Track' : 'Add Track'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Artist" name="artist" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="URL" name="url" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item label="Artwork URL">
            <Input value={artworkUrl} onChange={(e) => setArtworkUrl(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}