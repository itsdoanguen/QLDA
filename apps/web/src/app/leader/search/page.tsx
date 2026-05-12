"use client";

import React, { useState } from 'react';
import { Input, Button, Card, Tag, Space, Descriptions, Divider } from 'antd';
import { SearchOutlined, EnvironmentOutlined, FileTextOutlined, GlobalOutlined } from '@ant-design/icons';
import CadastralMap from '@/components/staff/search/CadastralMap';

// MOCK DATA for Leader Search
const mockLandData = {
  id: "HS-2023-1102",
  owner: "Nguyễn Văn Tuấn",
  address: "Thửa đất số 45, Tờ bản đồ số 12, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  area: "142.8 m²",
  landType: "Đất ở tại đô thị",
  purpose: "Xây dựng nhà ở gắn liền với đất",
  term: "Lâu dài",
  source: "Nhận chuyển nhượng từ ông Trần Văn B",
  status: "Đã cấp GCN",
  mapData: {
    center: "10.7769, 106.7009",
    plotNumber: "12",
    parcelNumber: "45"
  }
};

export default function LeaderSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setSearchResult(mockLandData);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-[28px] font-bold text-gray-900 m-0">Tra cứu Thông tin Địa chính</h1>
        <p className="text-gray-500">Tìm kiếm và kiểm tra thông tin mẫu đất trên bản đồ số</p>
      </div>

      {/* Search Header */}
      <Card className="shadow-sm border-gray-200">
        <div className="flex gap-3">
          <Input 
            size="large"
            placeholder="Nhập số tờ, số thửa hoặc mã hồ sơ..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1 rounded-lg h-12"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button 
            type="primary" 
            size="large" 
            className="h-12 bg-[#0c56d0] font-bold px-8 rounded-lg"
            onClick={handleSearch}
            loading={loading}
          >
            TRA CỨU
          </Button>
        </div>
      </Card>

      {searchResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Info */}
          <div className="col-span-12 lg:col-span-7">
            <Card 
              title={<span className="flex items-center gap-2"><FileTextOutlined className="text-[#0c56d0]" /> Thông tin thửa đất</span>}
              className="shadow-sm border-gray-200 h-full"
            >
              <div className="mb-6">
                <Tag color="green" className="font-bold border-none uppercase px-3 py-1">Trạng thái: {searchResult.status}</Tag>
              </div>

              <Descriptions 
                column={1} 
                bordered 
                size="small" 
                styles={{ label: { fontWeight: 'bold', width: '200px', backgroundColor: '#f9fafb' } }}
              >
                <Descriptions.Item label="Mã hồ sơ">{searchResult.id}</Descriptions.Item>
                <Descriptions.Item label="Chủ sở hữu">{searchResult.owner}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{searchResult.address}</Descriptions.Item>
                <Descriptions.Item label="Diện tích">{searchResult.area}</Descriptions.Item>
                <Descriptions.Item label="Loại đất">{searchResult.landType}</Descriptions.Item>
                <Descriptions.Item label="Mục đích sử dụng">{searchResult.purpose}</Descriptions.Item>
                <Descriptions.Item label="Thời hạn sử dụng">{searchResult.term}</Descriptions.Item>
                <Descriptions.Item label="Nguồn gốc sử dụng">{searchResult.source}</Descriptions.Item>
              </Descriptions>

              <Divider />
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <GlobalOutlined className="text-[#0c56d0] mt-1" />
                  <div>
                    <div className="text-[13px] font-bold text-blue-900 mb-1">Ghi chú quy hoạch</div>
                    <p className="text-[12px] text-blue-800 m-0">
                      Thửa đất nằm trong khu vực quy hoạch dân cư hiện hữu chỉnh trang. Không có tranh chấp, khiếu kiện được ghi nhận.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Map */}
          <div className="col-span-12 lg:col-span-5">
            <CadastralMap data={searchResult.mapData} />
            
            <Card className="mt-6 shadow-sm border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <EnvironmentOutlined className="text-red-500" /> Chỉ dẫn đường đi
              </h4>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>Khoảng cách đến UBND:</span>
                  <span className="font-bold text-gray-900">1.2 km</span>
                </div>
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>Mặt tiền đường:</span>
                  <span className="font-bold text-gray-900">Lê Lợi (12m)</span>
                </div>
                <Button block ghost type="primary" className="mt-2 font-bold border-[#0c56d0] text-[#0c56d0]">Xem Google Maps</Button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200">
          <SearchOutlined className="text-6xl text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">Nhập thông tin để bắt đầu tra cứu thửa đất</p>
        </div>
      )}
    </div>
  );
}
