import React from 'react';
import { CheckCircleFilled, FileTextOutlined, CheckOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export function SuccessView({ recordId = "HS-2024-8912" }) {
  const router = useRouter();

  return (
    <div className="max-w-[1000px] mx-auto pb-24 animate-fade-in">
      {/* Stepper with all steps checked */}
      <div className="flex items-center w-full mb-16 relative px-12 mt-8">
        <div className="flex flex-col items-center flex-1 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#0c56d0] text-white flex items-center justify-center mb-3 shadow-md">
            <CheckOutlined />
          </div>
          <span className="text-xs font-bold text-[#0c56d0] uppercase tracking-wider">Khai báo</span>
        </div>
        <div className="absolute top-5 left-[20%] right-[50%] h-[3px] bg-[#0c56d0] -z-0"></div>
        
        <div className="flex flex-col items-center flex-1 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#0c56d0] text-white flex items-center justify-center mb-3 shadow-md">
            <CheckOutlined />
          </div>
          <span className="text-xs font-bold text-[#0c56d0] uppercase tracking-wider">Tải tệp tin</span>
        </div>
        <div className="absolute top-5 left-[50%] right-[20%] h-[3px] bg-[#0c56d0] -z-0"></div>

        <div className="flex flex-col items-center flex-1 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#0c56d0] text-white flex items-center justify-center mb-3 shadow-md">
            <CheckOutlined />
          </div>
          <span className="text-xs font-bold text-[#0c56d0] uppercase tracking-wider">Ký số & Xác nhận</span>
        </div>
      </div>

      {/* Success Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 py-16 px-8 text-center shadow-sm mb-8">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl text-green-500">
          <CheckCircleFilled />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Nộp hồ sơ thành công</h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto">Hồ sơ của quý khách đã được tiếp nhận và đang trong quá trình thẩm định bởi Cơ quan chức năng.</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Record Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-8 flex items-center gap-3 text-lg">
            <FileTextOutlined className="text-[#0c56d0] text-xl" /> Chi tiết hồ sơ
          </h3>
          <div className="space-y-6 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">Mã hồ sơ</span>
              <span className="bg-blue-50 text-[#0c56d0] font-bold px-3 py-1 rounded text-xs">{recordId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">Loại giao dịch</span>
              <span className="font-bold text-gray-900">Tải lên tài sản số</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">Thời gian nộp</span>
              <span className="font-bold text-gray-900">14:32:05 - 24/05/2024</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-4">
              <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">Người nộp</span>
              <span className="font-bold text-gray-900">Nguyễn Văn A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium uppercase text-xs tracking-wider">Trạng thái</span>
              <span className="font-bold text-orange-500 flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Đang chờ xử lý
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-8 text-lg">Bước tiếp theo</h3>
            <div className="space-y-6 text-base">
              <div className="flex gap-4">
                <span className="font-black text-[#0c56d0]">01.</span>
                <span className="text-gray-700 font-medium">Chuyên viên kiểm tra tính pháp lý của hồ sơ trong vòng <span className="font-bold">3 ngày</span> làm việc.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-black text-[#0c56d0]">02.</span>
                <span className="text-gray-700 font-medium">Thông báo lệ phí sẽ được gửi qua email và tin nhắn SMS.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-black text-[#0c56d0]">03.</span>
                <span className="text-gray-700 font-medium">Nhận kết quả bản điện tử hoặc bản giấy tại trung tâm hành chính.</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-br from-[#0c56d0] to-[#083b94] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2 text-blue-100">
                🎧 Hỗ trợ kỹ thuật
              </div>
              <p className="text-base text-white m-0 leading-relaxed font-medium">
                Mọi thắc mắc vui lòng liên hệ tổng đài <span className="font-bold text-yellow-300">1900 8888</span> hoặc gửi yêu cầu trực tuyến.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 transform rotate-12">
              <div className="w-40 h-40 bg-white rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6">
        <Button size="large" className="font-bold border-gray-300 text-gray-700 px-8 h-14 rounded-xl text-base hover:text-[#0c56d0] hover:border-[#0c56d0]" onClick={() => router.push('/dashboard')}>
          👁 Xem chi tiết hồ sơ
        </Button>
        <Button size="large" type="primary" className="bg-[#0c56d0] hover:bg-blue-700 font-bold px-8 h-14 rounded-xl text-base shadow-md" onClick={() => router.push('/dashboard')}>
          🏠 Về trang chủ
        </Button>
      </div>
    </div>
  );
}
