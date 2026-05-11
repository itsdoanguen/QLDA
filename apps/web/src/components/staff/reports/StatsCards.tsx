import { BlockOutlined, DatabaseOutlined, FolderOpenOutlined } from '@ant-design/icons';

interface StatsCardsProps {
  data: {
    nodes: string;
    nodesGrowth: string;
    nfts: string;
    nftsGrowth: string;
    records: string;
    recordsGrowth: string;
  };
}

export default function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 relative shadow-sm">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">BLOCKCHAIN NODES</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-3xl font-bold text-gray-900 leading-none">{data.nodes}</div>
          <div className="text-green-500 text-xs font-bold leading-none pb-0.5">{data.nodesGrowth}</div>
        </div>
        <div className="text-[11px] text-gray-400 mt-2">Tổng số Block hiện tại</div>
        <BlockOutlined className="absolute top-5 right-5 text-xl text-[#0052cc]" />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 relative shadow-sm">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">NFT TÀI SẢN</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-3xl font-bold text-gray-900 leading-none">{data.nfts}</div>
          <div className="text-green-500 text-xs font-bold leading-none pb-0.5">{data.nftsGrowth}</div>
        </div>
        <div className="text-[11px] text-gray-400 mt-2">Tổng số chứng nhận đã Mint</div>
        <DatabaseOutlined className="absolute top-5 right-5 text-xl text-[#0052cc]" />
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 relative shadow-sm">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">HỒ SƠ HỆ THỐNG</div>
        <div className="flex items-end gap-2 mb-1">
          <div className="text-3xl font-bold text-gray-900 leading-none">{data.records}</div>
          <div className="text-green-500 text-xs font-bold leading-none pb-0.5">{data.recordsGrowth}</div>
        </div>
        <div className="text-[11px] text-gray-400 mt-2">Hồ sơ đất đai & cư dân</div>
        <FolderOpenOutlined className="absolute top-5 right-5 text-xl text-[#0052cc]" />
      </div>
    </div>
  );
}
