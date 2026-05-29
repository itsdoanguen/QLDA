import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, SwapOutlined, BankOutlined, FileTextOutlined, SplitCellsOutlined, CloudUploadOutlined, BranchesOutlined, ArrowRightOutlined } from '@ant-design/icons';

const services = [
  { id: 'chuyen-nhuong', category: 'chuyen-quyen', title: 'Đăng ký Chuyển nhượng', desc: 'Mua bán / Tặng cho - Thay đổi chủ sở hữu thửa đất hiện tại.', days: 15, icon: <SwapOutlined />, dev: false },
  { id: 'the-chap', category: 'tai-chinh', title: 'Đăng ký Thế chấp', desc: 'Vay vốn ngân hàng hoặc xóa thế chấp (Giải chấp) tài sản.', days: 3, icon: <BankOutlined />, dev: true },
  { id: 'cap-doi', category: 'cap-moi', title: 'Cấp đổi / Cấp lại GCN', desc: 'Sổ cũ rách, nhòe hoặc bị mất cần cấp lại giấy chứng nhận mới.', days: 7, icon: <FileTextOutlined />, dev: true },
  { id: 'tach-thua', category: 'chuyen-quyen', title: 'Tách thửa / Hợp thửa', desc: 'Chia nhỏ thửa đất hiện tại hoặc gộp nhiều mảnh đất kề nhau.', days: 15, icon: <SplitCellsOutlined />, dev: true },
  { id: 'tai-len', category: 'cap-moi', title: 'Tải lên tài sản số', desc: 'Chuyển loại đất (ví dụ: đất nông nghiệp sang đất ở đô thị) và số hóa quyền sở hữu lên nền tảng Blockchain.', days: 20, icon: <CloudUploadOutlined />, dev: false },
  { id: 'thua-ke', category: 'chuyen-quyen', title: 'Khai nhận Thừa kế', desc: 'Cập nhật chủ sở hữu mới theo di chúc hoặc quy định pháp luật.', days: 15, icon: <BranchesOutlined />, dev: true },
];

const tabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'chuyen-quyen', label: 'Chuyển quyền & Biến động' },
  { id: 'cap-moi', label: 'Cấp mới & Cấp đổi' },
  { id: 'tai-chinh', label: 'Tài chính & Thế chấp' },
];

export function ServiceSelection({ onNext }: { onNext: (serviceId: string) => void }) {
  const [selected, setSelected] = useState('tai-len');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) || srv.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || srv.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="animate-fade-in">
      <h2 className="text-[28px] font-bold text-gray-900 mb-2">Chọn Loại hình Dịch vụ Đất đai</h2>
      <p className="text-gray-500 mb-8 text-base">Vui lòng chọn loại dịch vụ cần thực hiện để tiếp tục quy trình hồ sơ của bạn.</p>
      
      <div className="mb-6">
        <Input 
          size="large" 
          prefix={<SearchOutlined className="text-gray-400 mr-2" />} 
          placeholder="Nhập từ khóa dịch vụ (vd: Bán nhà, Tách sổ...)"
          className="rounded-lg border-gray-300 py-3 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 mb-8 text-sm">
        <span className="text-gray-500 font-medium">Gợi ý nhanh:</span>
        {['Chuyển nhượng', 'Thế chấp', 'Tách thửa', 'Cấp đổi'].map(tag => (
          <span 
            key={tag} 
            onClick={() => setSearchQuery(tag)}
            className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-8 border-b border-gray-200 mb-8 text-sm font-medium">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 cursor-pointer transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-[#0c56d0] text-[#0c56d0]' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {filteredServices.map(srv => (
          <div 
            key={srv.id}
            onClick={() => !srv.dev && setSelected(srv.id)}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selected === srv.id 
                ? 'border-[#0c56d0] bg-blue-50/50 shadow-sm' 
                : 'border-gray-100 bg-white hover:border-gray-300 cursor-pointer shadow-sm hover:shadow-md'
            } ${srv.dev ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs font-mono">{srv.days < 10 ? `0${srv.days}` : srv.days} ngày</span>
              </div>
              {selected === srv.id ? (
                <span className="bg-[#0c56d0] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Đang chọn</span>
              ) : srv.dev ? (
                <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Đang phát triển</span>
              ) : null}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-colors ${selected === srv.id ? 'bg-[#0c56d0] text-white' : 'bg-blue-50 text-[#0c56d0]'}`}>
              {srv.icon}
            </div>
            <h3 className={`font-bold text-lg mb-2 transition-colors ${selected === srv.id ? 'text-[#0c56d0]' : 'text-gray-900'}`}>{srv.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{srv.desc}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-8 flex justify-end">
        <Button 
          type="primary" 
          size="large" 
          className="bg-[#0c56d0] hover:bg-blue-700 px-8 font-bold flex items-center gap-2 h-12 rounded-lg text-base shadow-md"
          onClick={() => onNext(selected)}
        >
          Tiếp tục: Tải hồ sơ <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}
