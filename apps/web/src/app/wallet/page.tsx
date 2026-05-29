"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spin, Collapse, Tag, Space, Modal, Alert, App } from "antd";
import { ArrowLeftOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";

interface WalletStatus {
  walletAddress: string;
  status: string;
  isManaged: boolean;
  linkedAt: string;
}

interface WalletDetails {
  walletAddress: string;
  balanceETH: string;
  balanceWEI: string;
  txCount: number;
  isContract: boolean;
  contractName?: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Bước 1: Lấy trạng thái ví
      const statusRes = await api.get("/wallet/status");
      const activeWallet = statusRes.data.activeWallet ?? null;
      setWalletStatus(activeWallet);
      setRecoveryRequests(statusRes.data.recoveryRequests || []);

      // Bước 2: Chỉ lấy chi tiết ví nếu đã có ví active
      if (activeWallet) {
        try {
          const detailsRes = await api.get("/wallet/details");
          // BE có thể trả về null nếu không tìm thấy ví
          setWalletDetails(detailsRes.data ?? null);
        } catch (detailErr: any) {
          // Không ảnh hưởng đến trạng thái chính — log cảnh báo
          console.warn("Could not fetch wallet details:", detailErr?.response?.data?.message || detailErr?.message);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch wallet data:", err);
      const errorMsg =
        err?.response?.data?.message || err?.message || "Không thể tải dữ liệu ví";
      setError(errorMsg);
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWalletData();
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleRequestRecovery = async () => {
    if (!walletStatus) return;
    
    setIsRecovering(true);
    try {
      await api.post("/wallet/recovery-request", {
        oldWalletAddress: walletStatus.walletAddress,
      });
      message.success("Đã gửi yêu cầu cấp lại ví thành công! Đang chờ phê duyệt.");
      setShowRecoveryModal(false);
      fetchWalletData();
    } catch (err: any) {
      console.error("Recovery request failed:", err);
      message.error(err?.response?.data?.message || err?.message || "Lỗi khi gửi yêu cầu khôi phục");
    } finally {
      setIsRecovering(false);
    }
  };

  const hasPendingRecovery = recoveryRequests.some(r => r.status === 'Pending');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="!text-[#4b5563] hover:!text-[#0b57d0]"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Ví của tôi</h1>
              <p className="text-[14px] text-[#6b7280] mt-1">Xem trạng thái và chi tiết ví blockchain</p>
            </div>
          </div>
          <Space>
            <Button
              icon={showHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowHidden(!showHidden)}
              className="!rounded-sm !border-[#d1d5db] !text-[#374151] hover:!text-[#0b57d0] hover:!border-[#0b57d0]"
            >
              {showHidden ? "Ẩn thông tin" : "Hiện thông tin"}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              className="!rounded-sm !border-[#d1d5db] !text-[#374151] hover:!text-[#0b57d0] hover:!border-[#0b57d0]"
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <p className="text-red-700 font-medium">Lỗi: {error}</p>
          </Card>
        )}

        {/* Wallet Status Card */}
        {walletStatus && (
          <Card className="mb-6 border-[#e1e2e4] rounded-md shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">Địa chỉ ví</p>
                <p className="text-[14px] font-mono text-[#111827] mt-2 break-all">
                  {showHidden ? walletStatus.walletAddress : walletStatus.walletAddress.substring(0, 6) + "..." + walletStatus.walletAddress.substring(38)}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">Trạng thái</p>
                <div className="mt-2">
                  <Tag color={walletStatus.status === "Active" ? "green" : "red"}>{walletStatus.status}</Tag>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">Loại ví</p>
                <p className="text-[14px] text-[#111827] mt-2">
                  {walletStatus.isManaged ? "Ví được quản lý" : "Ví ngoài"}
                </p>
              </div>
              <div>
                <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">Ngày tạo</p>
                <p className="text-[14px] text-[#111827] mt-2">
                  {walletStatus.linkedAt ? new Date(walletStatus.linkedAt).toLocaleDateString("vi-VN") : "N/A"}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-[#e1e2e4] flex justify-end">
              <Button 
                danger 
                icon={<ExclamationCircleOutlined />} 
                onClick={() => setShowRecoveryModal(true)}
                disabled={hasPendingRecovery}
              >
                {hasPendingRecovery ? "Đang có yêu cầu chờ duyệt..." : "Báo mất / Xin cấp lại ví"}
              </Button>
            </div>
          </Card>
        )}

        {/* Wallet Details (Collapsible) */}
        {walletDetails && (
          <Card className="border-[#e1e2e4] rounded-md shadow-sm">
            <Collapse
              items={[
                {
                  key: "1",
                  label: <span className="font-semibold text-[#111827]">Chi tiết nâng cao</span>,
                  children: (
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div>
                        <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                          Số dư (ETH)
                        </p>
                        <p className="text-[14px] font-mono text-[#111827] mt-2">
                          {showHidden ? walletDetails.balanceETH : "***"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                          Số dư (WEI)
                        </p>
                        <p className="text-[14px] font-mono text-[#111827] mt-2">
                          {showHidden ? walletDetails.balanceWEI : "***"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                          Số giao dịch
                        </p>
                        <p className="text-[14px] text-[#111827] mt-2">{walletDetails.txCount}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                          Loại tài khoản
                        </p>
                        <p className="text-[14px] text-[#111827] mt-2">
                          {walletDetails.isContract ? "Hợp đồng" : "Tài khoản EOA"}
                        </p>
                      </div>
                      {walletDetails.contractName && (
                        <div>
                          <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                            Tên hợp đồng
                          </p>
                          <p className="text-[14px] text-[#111827] mt-2">{walletDetails.contractName}</p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {/* No Data State */}
        {!walletStatus && !error && (
          <Card className="border-dashed border-[#e1e2e4] bg-[#f9fafb]">
            <div className="text-center py-8">
              <p className="text-[#6b7280] font-medium">Chưa có dữ liệu ví</p>
              <p className="text-[13px] text-[#9ca3af] mt-2">Hệ thống đang tạo ví cho bạn</p>
            </div>
          </Card>
        )}

        {/* Recovery Modal */}
        <Modal
          title="Yêu cầu cấp lại ví (Khôi phục ví)"
          open={showRecoveryModal}
          onOk={handleRequestRecovery}
          onCancel={() => setShowRecoveryModal(false)}
          confirmLoading={isRecovering}
          okText="Xác nhận cấp lại"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Alert
            title="Cảnh báo an toàn"
            description="Tính năng này dành cho trường hợp bạn làm mất thiết bị hoặc nghi ngờ bị lộ khóa bí mật. Khi bạn xác nhận, hệ thống sẽ gửi yêu cầu lên Lãnh đạo Sở để xin cấp ví mới. Sau khi được duyệt, TẤT CẢ sổ đỏ (NFT) của bạn sẽ được ép chuyển sang ví mới tự động."
            type="warning"
            showIcon
            className="mb-4"
          />
          <p className="text-[#374151]">Địa chỉ ví hiện tại của bạn sẽ bị vô hiệu hóa:</p>
          <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm break-all">{walletStatus?.walletAddress}</p>
        </Modal>
      </div>
    </div>
  );
}
