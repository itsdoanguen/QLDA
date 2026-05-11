import React from 'react';
import { PartitionOutlined } from '@ant-design/icons';

interface BlockchainSyncProps {
  data: {
    field: string;
    value: string;
    highlight?: boolean;
    isTokenId?: boolean;
  }[];
}

export default function BlockchainSync({ data }: BlockchainSyncProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3 m-0">
          <PartitionOutlined className="text-[#0c56d0]" /> Đối soát dữ liệu & Blockchain
        </h3>
        <span className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1 rounded-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Mạng lưới đồng bộ
        </span>
      </div>

      <p className="text-gray-500 text-sm mb-4">Cấu trúc Metadata ERC-721/NFT chuẩn bị khởi tạo trên chuỗi.</p>

      <table className="w-full text-sm text-left font-mono">
        <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200 tracking-wider">
          <tr>
            <th className="px-4 py-3 font-bold">TRƯỜNG DỮ LIỆU</th>
            <th className="px-4 py-3 font-bold">GIÁ TRỊ HASH / DỮ LIỆU GỐC</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 text-gray-500 text-xs">{item.field}</td>
              <td className={`px-4 py-4 text-xs ${item.isTokenId ? 'font-bold text-[#0c56d0]' : 'text-gray-700'}`}>
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
