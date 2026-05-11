import { LinkOutlined, CopyOutlined } from '@ant-design/icons';

interface ProvenanceRecord {
  id: number;
  title: string;
  status?: string;
  date: string;
  details?: string;
  txHash?: string;
  type: string;
  italic?: boolean;
}

interface BlockchainProvenanceProps {
  records: ProvenanceRecord[];
}

export default function BlockchainProvenance({ records }: BlockchainProvenanceProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <LinkOutlined className="text-[#0052cc]" />
          Lịch sử biến động (Blockchain Provenance)
        </div>
        <div className="text-[#0052cc] text-xs font-bold cursor-pointer">Xuất bản ghi</div>
      </div>
      <div className="p-6">
        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
          {records.map((record) => (
            <div key={record.id} className="relative pl-6">
              <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1 ${record.type === 'primary' ? 'bg-[#0052cc]' : 'bg-gray-300'}`}></div>
              <div className="flex items-center gap-2 mb-1">
                <div className="font-bold text-gray-900">{record.title}</div>
                {record.status && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">{record.status}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">{record.date}</div>
              
              {record.details && (
                <div className={`text-sm text-gray-700 mb-3 ${record.italic ? 'italic text-gray-600' : ''}`}>
                  {record.details}
                </div>
              )}
              
              {record.txHash && (
                <div className="bg-gray-50 border border-gray-200 rounded p-2 flex justify-between items-center text-xs text-gray-500">
                  TxHash: {record.txHash}
                  <CopyOutlined className="cursor-pointer hover:text-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
