"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Tag, App, Spin, Steps, Alert, Descriptions, Statistic } from "antd";
import { 
  ArrowLeftOutlined, SwapOutlined, CheckCircleOutlined, SafetyCertificateOutlined,
  CloseCircleOutlined, InfoCircleOutlined, WalletOutlined, DollarCircleOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { api } from "@/utils/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Draft: { label: "Bản nháp", color: "default" },
  Buyer_Signed: { label: "Bên mua đã ký", color: "blue" },
  Seller_Signed: { label: "Bên bán đã ký", color: "cyan" },
  Pending_Tax: { label: "Hoàn tất ký - Chờ thuế", color: "orange" },
  Completed: { label: "Đã chuyển nhượng", color: "green" },
  Cancelled: { label: "Đã hủy", color: "red" },
};

export function TransactionDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [tx, setTx] = useState<any | null>(null);
  const [nft, setNft] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [signing, setSigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [payingTaxId, setPayingTaxId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, txRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get(`/transactions/${id}`)
      ]);
      setProfile(profileRes.data);
      setTx(txRes.data);

      // Fetch NFT details using transaction's tokenId
      try {
        const nftRes = await api.get(`/nft/${txRes.data.tokenId}`);
        setNft(nftRes.data);
      } catch (e) {
        console.warn("Could not load NFT details for tokenId:", txRes.data.tokenId);
      }

      if (txRes.data.status === "Pending_Tax" || txRes.data.status === "Completed") {
        try {
          const taxesRes = await api.get(`/taxes/transaction/${id}`);
          setTaxes(taxesRes.data);
        } catch (e) {
          console.warn("Could not load taxes for transaction");
        }
      }

    } catch (error: any) {
      console.error("Failed to load transaction details:", error);
      message.error(error.response?.data?.message || "Không thể tải chi tiết giao dịch");
      router.push("/dashboard/transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSign = async () => {
    modal.confirm({
      title: "Xác nhận ký tên vào Hợp đồng Giao dịch Đất đai",
      icon: <SafetyCertificateOutlined className="text-[#0c56d0]" />,
      content: (
        <div className="mt-2 text-sm text-gray-500">
          <p>Bằng việc ký xác nhận, bạn đồng ý với các điều khoản chuyển nhượng thửa đất **Token ID #{tx?.tokenId}** với giá trị **{tx?.contractPrice.toLocaleString("vi-VN")} VND**.</p>
          <p className="font-semibold text-red-500 mt-2">Lưu ý: Nếu bạn là chữ ký cuối cùng (chữ ký thứ 2), giao dịch trên mạng lưới Blockchain sẽ được kích hoạt ngay lập tức.</p>
        </div>
      ),
      okText: "Ký xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setSigning(true);
          await api.post(`/transactions/${id}/sign`);
          message.success("Ký xác nhận giao dịch thành công!");
          fetchData();
        } catch (error: any) {
          console.error("Sign transaction failed:", error);
          message.error(error.response?.data?.message || "Ký xác nhận thất bại");
        } finally {
          setSigning(false);
        }
      }
    });
  };

  const handleCancel = async () => {
    modal.confirm({
      title: "Xác nhận hủy bỏ giao dịch",
      icon: <CloseCircleOutlined className="text-red-500" />,
      content: "Bạn có chắc chắn muốn hủy bỏ giao dịch này? Hành động này sẽ mở khóa Sổ đỏ Land NFT trên blockchain để có thể giao dịch lại.",
      okText: "Hủy giao dịch",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setCancelling(true);
          await api.post(`/transactions/${id}/cancel`);
          message.success("Đã hủy bỏ giao dịch thành công!");
          fetchData();
        } catch (error: any) {
          console.error("Cancel transaction failed:", error);
          message.error(error.response?.data?.message || "Hủy giao dịch thất bại");
        } finally {
          setCancelling(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="text-gray-500 font-medium mt-4">Đang tải chi tiết giao dịch...</p>
      </div>
    );
  }

  if (!tx) return null;
  const handlePayTax = async (taxId: number) => {
    try {
      setPayingTaxId(taxId);
      await api.post(`/taxes/pay/${taxId}`);
      message.success("Thanh toán khoản thuế phí thành công!");
      fetchData(); // Reload
    } catch (error: any) {
      console.error("Pay tax failed:", error);
      message.error(error.response?.data?.message || "Thanh toán thất bại");
    } finally {
      setPayingTaxId(null);
    }
  };

  const isBuyer = profile?.id === tx.buyerId;
  const isSeller = profile?.id === tx.sellerId;
  
  // Logic hiển thị nút Ký
  let canUserSign = false;
  if (tx.status === "Draft") {
    canUserSign = isBuyer || isSeller;
  } else if (tx.status === "Buyer_Signed") {
    canUserSign = isSeller; // Buyer đã ký, chỉ Seller mới được ký tiếp
  } else if (tx.status === "Seller_Signed") {
    canUserSign = isBuyer; // Seller đã ký, chỉ Buyer mới được ký tiếp
  }

  const canUserCancel = (tx.status === "Draft" || tx.status === "Buyer_Signed" || tx.status === "Seller_Signed") && (isBuyer || isSeller);

  // Stepper logic
  let activeStep = 0;
  if (tx.status === "Buyer_Signed" || tx.status === "Seller_Signed") activeStep = 1;
  else if (tx.status === "Pending_Tax") activeStep = 2;
  else if (tx.status === "Completed") activeStep = 3;

  const steps = [
    { title: "Khởi tạo", content: "Bản nháp hợp đồng" },
    { title: "Đồng thuận", content: "Ký mua & bán" },
    { title: "Nộp thuế & Sync", content: "Tính phí & Blockchain" },
    { title: "Hoàn tất", content: "Chuyển giao NFT" },
  ];

  return (
    <div className="pb-24 pt-6">
      {/* Header */}
      <div className="mb-8">
        <div 
          className="text-[#0c56d0] text-sm font-semibold flex items-center gap-2 cursor-pointer hover:underline mb-4 w-fit"
          onClick={() => router.push("/dashboard/transactions")}
        >
          <ArrowLeftOutlined /> Danh sách giao dịch
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-2">Chi tiết Giao dịch Chuyển nhượng</h1>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-gray-600">TX-{tx.id.toString().padStart(4, "0")}</span>
              <Tag color={STATUS_MAP[tx.status]?.color || "default"} className="!text-[12px] !font-medium">
                {STATUS_MAP[tx.status]?.label || tx.status}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      {tx.status !== "Cancelled" && (
        <div className="bg-white border border-[#e1e2e4] rounded-xl p-8 mb-8 shadow-sm">
          <Steps current={activeStep} items={steps} titlePlacement="vertical" />
        </div>
      )}

      {tx.status === "Cancelled" && (
        <Alert
          title="Giao dịch đã bị hủy bỏ"
          description="Giao dịch chuyển nhượng này đã được hủy bỏ và Land NFT tương ứng đã được mở khóa trạng thái giao dịch trên Blockchain để có thể tiếp tục giao dịch khác."
          type="error"
          showIcon
          className="mb-8 rounded-xl !p-5"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Information details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Transaction Summary Card */}
          <Card className="border-[#e1e2e4] rounded-xl shadow-sm overflow-hidden text-center" title={<span className="font-bold text-[16px] text-gray-900">Thông tin Hợp đồng</span>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-[12px] font-bold text-gray-500 uppercase mb-2">Bên Bán (Seller)</div>
                <div className="font-bold text-[16px] text-gray-900">{tx.seller?.fullName || `Công dân ID: ${tx.sellerId}`}</div>
                <div className="text-[13px] text-gray-500 mt-1">CCCD: {tx.seller?.vneidNumber || "—"}</div>
                {isSeller && <Tag color="blue" className="mt-2">Là Bạn</Tag>}
              </div>

              <div className="flex flex-col items-center justify-center">
                <SwapOutlined className="text-2xl text-blue-500 mb-2" />
                <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">Giá trị giao dịch</div>
                <div className="font-bold text-[20px] text-[#0c56d0]">
                  {tx.contractPrice.toLocaleString("vi-VN")} VND
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  Ngày tạo: {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-[12px] font-bold text-gray-500 uppercase mb-2">Bên Mua (Buyer)</div>
                <div className="font-bold text-[16px] text-gray-900">{tx.buyer?.fullName || `Công dân ID: ${tx.buyerId}`}</div>
                <div className="text-[13px] text-gray-500 mt-1">CCCD: {tx.buyer?.vneidNumber || "—"}</div>
                {isBuyer && <Tag color="blue" className="mt-2">Là Bạn</Tag>}
              </div>
            </div>
          </Card>

          {/* Land Record NFT Card */}
          {nft ? (
            <Card className="border-[#e1e2e4] rounded-xl shadow-sm overflow-hidden" title={
              <div className="flex justify-between items-center w-full">
                <span className="font-bold text-[16px] text-gray-900">Thông tin Sổ đỏ Kỹ thuật số (Land NFT)</span>
                <Tag color="green" className="font-mono font-bold">#TokenID {nft.tokenId}</Tag>
              </div>
            }>
              <Descriptions column={2} bordered size="middle" className="[&_.ant-descriptions-item-label]:!bg-[#f9fafb] [&_.ant-descriptions-item-label]:!font-bold [&_.ant-descriptions-item-label]:!text-gray-500 [&_.ant-descriptions-item-content]:!text-gray-900">
                <Descriptions.Item label="Số tờ bản đồ" span={1}>{nft.record?.plotNumber || "—"}</Descriptions.Item>
                <Descriptions.Item label="Số thửa đất" span={1}>{nft.record?.parcelNumber || "—"}</Descriptions.Item>
                <Descriptions.Item label="Diện tích" span={2}>{nft.record?.area} m²</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ thửa đất" span={2}>{nft.record?.address || "—"}</Descriptions.Item>
                <Descriptions.Item label="Loại đất" span={2}>{nft.record?.landType || "Đất ở đô thị"}</Descriptions.Item>
                <Descriptions.Item label="Chủ sở hữu hiện tại (Ví)" span={2}>
                  <div className="flex items-center gap-2">
                    <WalletOutlined className="text-gray-400" />
                    <span className="font-mono text-[12px] break-all">{nft.ownerWallet}</span>
                  </div>
                </Descriptions.Item>
              </Descriptions>

              {nft.record?.gpsCoordinates && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <EnvironmentOutlined className="text-[#0c56d0]" />
                    <span className="text-sm font-bold text-gray-700">Ranh giới địa lý thửa đất:</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg font-mono text-[13px] text-gray-600">
                    {nft.record.gpsCoordinates}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="border-[#e1e2e4] rounded-xl shadow-sm bg-gray-50 text-center py-8">
              <InfoCircleOutlined className="text-gray-400 text-3xl mb-3" />
              <p className="text-gray-500 font-medium mb-0">Đang tải thông tin chi tiết Land NFT...</p>
            </Card>
          )}
        </div>

        {/* Right column - Actions & Stepper Detail */}
        <div className="space-y-8">
          {/* Stepper Status Details */}
          <Card className="border-[#e1e2e4] rounded-xl shadow-sm overflow-hidden" title={<span className="font-bold text-[16px] text-gray-900">Trạng thái Ký đồng thuận</span>}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    tx.status === "Buyer_Signed" || tx.status === "Pending_Tax" || tx.status === "Completed"
                      ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    1
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Bên mua (Buyer)</h4>
                    <span className="text-[12px] text-gray-500">Chữ ký Bên mua</span>
                  </div>
                </div>
                {tx.status === "Buyer_Signed" || tx.status === "Pending_Tax" || tx.status === "Completed" ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>ĐÃ KÝ</Tag>
                ) : (
                  <Tag color="default">CHƯA KÝ</Tag>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    tx.status === "Seller_Signed" || tx.status === "Pending_Tax" || tx.status === "Completed"
                      ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    2
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Bên bán (Seller)</h4>
                    <span className="text-[12px] text-gray-500">Chữ ký Bên bán</span>
                  </div>
                </div>
                {tx.status === "Seller_Signed" || tx.status === "Pending_Tax" || tx.status === "Completed" ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>ĐÃ KÝ</Tag>
                ) : (
                  <Tag color="default">CHƯA KÝ</Tag>
                )}
              </div>
            </div>

            {/* Stepper info details on actions */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              {canUserSign && (
                <Button
                  type="primary"
                  size="large"
                  loading={signing}
                  onClick={handleSign}
                  icon={<SafetyCertificateOutlined />}
                  className="w-full !bg-[#0c56d0] hover:!bg-blue-700 !font-bold !h-12 !rounded-lg flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 mb-4"
                >
                  Ký xác nhận giao dịch
                </Button>
              )}

              {canUserCancel && (
                <Button
                  danger
                  size="large"
                  loading={cancelling}
                  onClick={handleCancel}
                  icon={<CloseCircleOutlined />}
                  className="w-full !font-bold !h-12 !rounded-lg flex items-center justify-center gap-2 mb-4"
                >
                  Hủy bỏ giao dịch
                </Button>
              )}

              {!canUserSign && tx.status !== "Cancelled" && tx.status !== "Completed" && tx.status !== "Pending_Tax" && (
                <Alert
                  title="Đang chờ chữ ký đối tác"
                  description="Bạn đã hoàn tất ký xác nhận hoặc không có quyền thao tác trực tiếp trên giao dịch này. Hệ thống đang chờ chữ ký phản hồi của đối tác."
                  type="info"
                  showIcon
                  className="rounded-lg"
                />
              )}

              {tx.status === "Completed" && (
                <Alert
                  title="Giao dịch thành công!"
                  description="Land NFT đã được chuyển nhượng hoàn tất sang tài khoản và ví của Bên mua trên mạng lưới Sepolia Blockchain."
                  type="success"
                  showIcon
                  className="rounded-lg"
                />
              )}
            </div>
          </Card>

          {/* Tax Information details */}
          {(tx.status === "Pending_Tax" || tx.status === "Completed") && (
            <Card className="border-[#e1e2e4] rounded-xl shadow-sm overflow-hidden" title={
              <div className="flex items-center gap-2">
                <DollarCircleOutlined className="text-[#0c56d0]" />
                <span className="font-bold text-[16px] text-gray-900">Chi phí thuế & Phí chuyển nhượng</span>
              </div>
            }>
              <div className="space-y-4">
                {taxes.map((t) => {
                  let label = "";
                  let forBuyer = false;
                  let forSeller = false;

                  if (t.taxType === "TNCN") {
                    label = "Thuế Thu nhập cá nhân (Người Bán)";
                    forSeller = true;
                  } else if (t.taxType === "Registration_Fee") {
                    label = "Lệ phí trước bạ (Người Mua)";
                    forBuyer = true;
                  } else if (t.taxType === "Notary_Fee") {
                    label = "Phí công chứng (Người Mua)";
                    forBuyer = true;
                  }

                  const canPay = t.status === "Unpaid" && ((forBuyer && isBuyer) || (forSeller && isSeller));

                  return (
                    <div key={t.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900 mb-1">{label}</h4>
                        <div className="font-bold text-[16px] text-[#0c56d0]">{Number(t.amount).toLocaleString("vi-VN")} VND</div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <Tag color={t.status === "Paid" ? "success" : "warning"} className="!m-0">
                          {t.status === "Paid" ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
                        </Tag>
                        {canPay && (
                          <Button 
                            type="primary" 
                            size="small"
                            loading={payingTaxId === t.id}
                            onClick={() => handlePayTax(t.id)}
                            className="bg-blue-600 hover:bg-blue-500 font-medium h-7"
                          >
                            Thanh Toán
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {taxes.length === 0 && (
                  <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">Đang tải dữ liệu thuế...</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
