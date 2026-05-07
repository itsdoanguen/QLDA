"use client";

import React, { useState } from 'react';
import SearchBar from '@/components/staff/search/SearchBar';
import PropertyInfo from '@/components/staff/search/PropertyInfo';
import BlockchainProvenance from '@/components/staff/search/BlockchainProvenance';
import CadastralMap from '@/components/staff/search/CadastralMap';

// MOCK DATA
const mockSearchResult = {
  status: "An toàn",
  statusDescription: "Đã xác minh trên Ledger",
  area: "120.5 m²",
  landType: "Đất ở đô thị (Lâu dài)",
  provenance: [
    {
      id: 1,
      title: "Cấp mới Giấy chứng nhận",
      status: "THÀNH CÔNG",
      date: "24/05/2023 • 14:30:05",
      txHash: "0x4f2...a931",
      type: "primary"
    },
    {
      id: 2,
      title: "Chuyển nhượng quyền sử dụng",
      date: "10/12/2020 • 09:15:22",
      details: "Bên bán: Nguyễn Văn B | Bên mua: Nguyễn Văn A",
      txHash: "0x8b1...e420",
      type: "secondary"
    },
    {
      id: 3,
      title: "Thế chấp ngân hàng (Vietcombank)",
      date: "15/05/2018 • 16:45:10",
      details: "Đã giải chấp ngày 05/10/2020",
      type: "secondary",
      italic: true
    }
  ],
  mapData: {
    center: "10.762622, 106.660172",
    plotNumber: "12",
    parcelNumber: "45"
  }
};

export default function StaffSearchPage() {
  const [searchData, setSearchData] = useState<any | null>(mockSearchResult);

  const handleSearch = () => {
    // Simulate API call
    setSearchData(mockSearchResult);
  };

  return (
    <div className="space-y-6">
      {/* Header matching the image's top section for the main area */}
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-[24px] font-bold text-[#111827] m-0">Blockchain Explorer for Land</h1>
        <div className="h-6 w-[1px] bg-gray-300"></div>
        <div className="text-gray-500 text-sm flex items-center gap-1">
          <span className="anticon">📍</span> Quận 1, TP. Hồ Chí Minh
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />

      {searchData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <PropertyInfo data={searchData} />
            <BlockchainProvenance records={searchData.provenance} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <CadastralMap data={searchData.mapData} />
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-500 uppercase">
        <div className="flex gap-8">
          <div><span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>NODE: HCM-01 (ACTIVE)</div>
          <div>KHỐI MỚI NHẤT:<br/><span className="text-gray-900 font-bold">#18,429,103</span></div>
          <div>TỐC ĐỘ MẠNG:<br/><span className="text-gray-900 font-bold">12MS</span></div>
        </div>
        <div className="text-right">PHÁT TRIỂN BỞI CỤC CÔNG NGHỆ THÔNG TIN & DỮ LIỆU TÀI NGUYÊN MÔI TRƯỜNG</div>
      </div>
    </div>
  );
}
