import React, { useState } from 'react';
import { Button, Progress, Tag, Input, Table, Tooltip } from 'antd';
import { 
  FilterOutlined, 
  ReloadOutlined, 
  LeftOutlined, 
  RightOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function TasksTable({ tasks, loading, onRefresh, onSelectRecord, selectedId }: any) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const filteredTasks = tasks.filter((t: any) => 
    t.id.toString().includes(searchText) ||
    t.address.toLowerCase().includes(searchText.toLowerCase()) ||
    t.owner?.fullName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const STATUS_MAP: any = {
    'Draft': { label: 'Bản nháp', color: 'default' },
    'Submitted': { label: 'Chờ duyệt', color: 'processing' },
    'CB_APPROVED': { label: 'Đã duyệt', color: 'success' },
    'Needs Supplement': { label: 'Bổ sung', color: 'warning' },
    'Rejected': { label: 'Từ chối', color: 'error' },
    'Minted': { label: 'Blockchain', color: 'cyan' },
  };

  return (
    <div className="bg-white border border-[#e1e2e4] rounded-lg overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#f3f4f6] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#fcfdfe]">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h3 className="text-[16px] font-bold text-[#111827] whitespace-nowrap">Danh sách hồ sơ</h3>
          <Input 
            placeholder="Tìm theo ID, tên người nộp, địa chỉ..." 
            prefix={<SearchOutlined className="text-[#9ca3af]" />}
            className="!h-9 !rounded-md max-w-md"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 self-end md:self-auto">
          <Tooltip title="Làm mới">
            <Button 
              type="text" 
              icon={<ReloadOutlined className="text-[#6b7280]" />} 
              onClick={onRefresh}
              loading={loading}
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#e1e2e4]">
              <th className="px-6 py-3 text-[11px] uppercase text-[#6b7280] font-bold tracking-wider">Mã hồ sơ</th>
              <th className="px-6 py-3 text-[11px] uppercase text-[#6b7280] font-bold tracking-wider">Người nộp</th>
              <th className="px-6 py-3 text-[11px] uppercase text-[#6b7280] font-bold tracking-wider">Địa chỉ thửa đất</th>
              <th className="px-6 py-3 text-[11px] uppercase text-[#6b7280] font-bold tracking-wider text-center">Trạng thái</th>
              <th className="px-6 py-3 text-[11px] uppercase text-[#6b7280] font-bold tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#9ca3af]">
                  {loading ? "Đang tải dữ liệu..." : "Không tìm thấy hồ sơ nào"}
                </td>
              </tr>
            ) : (
              filteredTasks.map((record: any) => {
                const status = STATUS_MAP[record.status] || { label: record.status, color: 'default' };
                const isSelected = selectedId === record.id;

                return (
                  <tr 
                    key={record.id} 
                    className={`transition-colors cursor-pointer group ${isSelected ? 'bg-[#f0f7ff]' : 'hover:bg-[#f9fafb]'}`}
                    onClick={() => onSelectRecord(record)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] text-[#0052cc] font-semibold">#{record.id}</div>
                      <div className="text-[11px] text-[#9ca3af]">{dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-medium text-[#374151]">{record.owner?.fullName}</div>
                      <div className="text-[12px] text-[#6b7280]">{record.owner?.vneidNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] text-[#374151] max-w-[250px] truncate" title={record.address}>
                        {record.address}
                      </div>
                      <div className="text-[11px] text-[#9ca3af]">Tờ {record.plotNumber || '—'} / Thửa {record.parcelNumber || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Tag color={status.color} className="!m-0 font-medium">{status.label}</Tag>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<EditOutlined />} 
                        className="text-[#0052cc]"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/staff/processing/${record.id}`);
                        }}
                      >
                        Xử lý
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-[#fcfdfe] border-t border-[#f3f4f6] flex justify-between items-center text-[12px] text-[#6b7280]">
        <span>Hiển thị {filteredTasks.length} trên {tasks.length} hồ sơ</span>
        <div className="flex gap-1">
          <Button size="small" icon={<LeftOutlined />} disabled />
          <Button size="small" type="primary" className="!bg-[#0052cc]">1</Button>
          <Button size="small" icon={<RightOutlined />} disabled />
        </div>
      </div>
    </div>
  );
}
