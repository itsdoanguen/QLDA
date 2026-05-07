import React from 'react';
import { Input, Select, Button, Tag } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

export default function QuickSearch() {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white border border-[#e1e2e4] p-8 rounded-lg flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
          <SearchOutlined className="text-[#0052cc]" />
          Tra cứu nhanh số tờ / số thửa
        </h3>
        <Tag color="blue" className="!m-0 !text-[11px] font-bold">DỮ LIỆU THỜI GIAN THỰC</Tag>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider">Quận / Huyện</label>
          <Select 
            defaultValue="Quận 1" 
            className="w-full !h-10"
            options={[
              { value: 'Quận 1', label: 'Quận 1' },
              { value: 'Quận 3', label: 'Quận 3' },
              { value: 'Thủ Đức', label: 'TP. Thủ Đức' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider">Phường / Xã</label>
          <Select 
            defaultValue="Bến Nghé" 
            className="w-full !h-10"
            options={[
              { value: 'Bến Nghé', label: 'Phường Bến Nghé' },
              { value: 'Đa Kao', label: 'Phường Đa Kao' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider">Số tờ - Số thửa</label>
          <Input className="!h-10 !rounded-md" placeholder="Ví dụ: 12-45" />
        </div>
        <Button 
          type="primary" 
          className="!h-10 !rounded-md !bg-[#0052cc] !font-bold flex items-center justify-center gap-2"
          icon={<SearchOutlined />}
        >
          Tìm kiếm
        </Button>
      </div>
    </div>
  );
}
