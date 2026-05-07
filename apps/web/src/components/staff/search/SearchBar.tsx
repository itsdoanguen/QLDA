import { Input, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

export default function SearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">TÌM KIẾM THỬA ĐẤT</div>
      <div className="flex gap-4">
        <Input 
          size="large" 
          prefix={<SearchOutlined className="text-gray-400" />} 
          placeholder="Tìm kiếm theo Số tờ / Số thửa hoặc Mã hồ sơ (VD: Tờ 12 - Thửa 45)..."
          className="flex-1 !bg-gray-50"
        />
        <Button size="large" type="primary" className="!bg-[#0052cc] px-8" onClick={onSearch}>
          <FilterOutlined /> Truy vấn
        </Button>
      </div>
    </div>
  );
}
