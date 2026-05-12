import { useState } from 'react';

export default function DocumentViewer({ documents }: { documents: any[] }) {
  const [activeTab, setActiveTab] = useState(documents[0]?.id);

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => setActiveTab(doc.id)}
            className={`pb-3 text-[13px] font-bold cursor-pointer transition-colors ${
              activeTab === doc.id 
                ? 'text-[#0052cc] border-b-2 border-[#0052cc]' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {doc.name}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative shadow-inner p-10">
        {/* Mocking the document image with a placeholder since we don't have real files */}
        <div className="w-[80%] h-[95%] bg-white shadow-md border border-gray-300 flex items-center justify-center text-gray-400 p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <div className="font-medium text-gray-500 mb-2">Bản xem trước tài liệu</div>
            <div className="text-xs text-gray-400 max-w-xs mx-auto">Trong thực tế, hình ảnh này sẽ được tải từ hệ thống lưu trữ (IPFS hoặc local storage) dựa trên tài liệu mà người dân đã tải lên.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
