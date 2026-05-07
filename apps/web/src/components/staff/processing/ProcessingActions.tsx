import { Button } from 'antd';
import { SaveOutlined, CloseCircleOutlined, ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';

export default function ProcessingActions() {
  return (
    <div className="flex justify-between items-center w-full">
      <Button icon={<SaveOutlined />} size="large" className="font-bold text-gray-600 hover:text-gray-900 border-gray-300">
        Lưu nháp
      </Button>
      
      <div className="flex gap-4">
        <Button icon={<ExclamationCircleOutlined />} size="large" className="text-orange-500 border-orange-200 hover:border-orange-500 font-bold bg-orange-50 hover:bg-orange-100">
          Yêu cầu bổ sung
        </Button>
        <Button icon={<CloseCircleOutlined />} size="large" danger className="font-bold">
          Từ chối
        </Button>
        <Button icon={<EditOutlined />} size="large" type="primary" className="bg-[#0052cc] hover:bg-blue-700 font-bold px-8 shadow-md">
          Xác nhận & Trình ký (1/3)
        </Button>
      </div>
    </div>
  );
}
