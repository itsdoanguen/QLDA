"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Spin, message, Collapse, Tag } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

interface WalletStatus {
  userId: number;
  walletAddress: string;
  status: string;
  isManaged: boolean;
  createdAt: string;
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
      // Fetch wallet status
      const statusRes = await axios.get("http://localhost:3000/api/v1/wallet/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletStatus(statusRes.data);

      // Fetch wallet details
      const detailsRes = await axios.get("http://localhost:3000/api/v1/wallet/details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletDetails(detailsRes.data);
    } catch (err: any) {
      console.error("Failed to fetch wallet data:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Không thể tải dữ liệu ví";
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
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            className="!rounded-sm !border-[#d1d5db] !text-[#374151] hover:!text-[#0b57d0] hover:!border-[#0b57d0]"
          >
            Làm mới
          </Button>
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
                <p className="text-[14px] font-mono text-[#111827] mt-2 break-all">{walletStatus.walletAddress}</p>
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
                  {new Date(walletStatus.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
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
                        <p className="text-[14px] font-mono text-[#111827] mt-2">{walletDetails.balanceETH}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-[#6b7280] uppercase font-semibold tracking-wider">
                          Số dư (WEI)
                        </p>
                        <p className="text-[14px] font-mono text-[#111827] mt-2">{walletDetails.balanceWEI}</p>
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
      </div>
    </div>
  );
}
