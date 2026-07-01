import React, { useMemo } from 'react';
import { Table, Button, Dropdown, Popconfirm, message, Skeleton, Empty } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { Track } from '../../../types/track.type';

interface TrackTableProps {
  tracks: Track[];
  loading: boolean;
  searchText: string;
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}

export function TrackTable({ tracks, loading, searchText, onEdit, onDelete }: TrackTableProps) {
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('Đã copy link!');
  };

  const filteredTracks = useMemo(() => {
    if (!searchText) return tracks;
    const lower = searchText.toLowerCase();
    return tracks.filter(t => 
      t.title.toLowerCase().includes(lower) || 
      t.artist.toLowerCase().includes(lower)
    );
  }, [tracks, searchText]);

  const columns = [
    { title: 'ID', dataIndex: '_id', width: 80, ellipsis: true },
    { 
      title: 'Artwork', 
      dataIndex: 'artwork',
      width: 100,
      render: (text: string) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {text ? (
            <img 
              src={text} 
              alt="artwork" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement?.classList.add('fallback-icon');
              }} 
            />
          ) : (
            <PictureOutlined className="text-gray-400 text-lg" />
          )}
        </div>
      )
    },
    { 
      title: 'Title', 
      dataIndex: 'title',
      sorter: (a: Track, b: Track) => a.title.localeCompare(b.title),
    },
    { 
      title: 'Artist', 
      dataIndex: 'artist',
      sorter: (a: Track, b: Track) => a.artist.localeCompare(b.artist),
    },
    { 
      title: 'Preview', 
      dataIndex: 'url',
      width: 320,
      render: (url: string) => (
        <div className="flex items-center gap-2">
          <audio controls src={url} preload="none" className="h-8 w-40" />
          <Button 
            type="text" 
            icon={<LinkOutlined />} 
            onClick={() => handleCopy(url)}
            title="Copy URL"
          />
        </div>
      )
    },
    {
      title: 'Actions',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Track) => {
        const items = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => onEdit(record),
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Xóa bài hát"
                description="Bạn có chắc chắn muốn xóa bài hát này?"
                onConfirm={() => onDelete(record._id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <div style={{ color: '#ff4d4f' }}>Delete</div>
              </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={filteredTracks}
      loading={{
        spinning: loading,
        indicator: <Skeleton active title={false} paragraph={{ rows: 5 }} />,
      }}
      locale={{
        emptyText: <Empty description="No tracks found" />,
      }}
      columns={columns}
      scroll={{ x: 1000 }}
      pagination={{ pageSize: 10 }}
    />
  );
}
