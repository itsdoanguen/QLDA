"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Button, Select, App, Spin, Space } from "antd";
import { ArrowLeftOutlined, SearchOutlined, EnvironmentOutlined, IdcardOutlined, SendOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";
import { debounce } from "lodash";

const { Option } = Select;

export function CreateTransactionPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const [buyerInfo, setBuyerInfo] = useState<{ id: number; fullName: string; vneidNumber: string } | null>(null);
  const [searchingBuyer, setSearchingBuyer] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchMintedRecords = async () => {
      try {
        const res = await api.get("/land-records");
        // Only Minted records can be traded
        const mintedRecords = res.data.filter((r: any) => r.status === "Minted");
        setRecords(mintedRecords);
      } catch (error) {
        console.error("Failed to fetch records:", error);
        message.error("Không thể tải danh sách tài sản.");
      } finally {
        setLoading(false);
      }
    };
    fetchMintedRecords();
  }, [message]);

  const handleRecordChange = (recordId: string) => {
    const record = records.find((r) => r.id === recordId);
    setSelectedRecord(record);
    if (record) {
      form.setFieldsValue({ tokenId: record.tokenId });
    }
  };

  const handleSearchBuyer = async () => {
    const vneid = form.getFieldValue("buyerVneid");
    if (!vneid) {
      message.warning("Vui lòng nhập số Căn cước công dân.");
      return;
    }
    
    setSearchingBuyer(true);
    setBuyerInfo(null);
    try {
      const res = await api.get(`/auth/users/lookup?vneid=${vneid}`);
      setBuyerInfo(res.data);
      form.setFieldsValue({ buyerId: res.data.id });
      message.success(`Tìm thấy người dùng: ${res.data.fullName}`);
    } catch (error: any) {
      console.error("Lookup error:", error);
      message.error(error.response?.data?.message || "Không tìm thấy người dùng trong hệ thống.");
      form.setFieldsValue({ buyerId: null });
    } finally {
      setSearchingBuyer(false);
    }
  };

  const handleCreateTransaction = async (values: any) => {
    if (!buyerInfo) {
      message.error("Vui lòng xác thực người nhận chuyển nhượng (Bên Mua) trước khi tạo giao dịch.");
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/transactions", {
        tokenId: values.tokenId,
        buyerId: buyerInfo.id,
        salePrice: Number(values.salePrice),
      });
      message.success("Khởi tạo bản nháp giao dịch thành công!");
      router.push(`/dashboard/transactions/${res.data.id}`);
    } catch (error: any) {
      console.error("Failed to create transaction:", error);
      message.error(error.response?.data?.message || "Khởi tạo giao dịch thất bại.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div 
          className="text-[#0c56d0] text-sm font-medium flex items-center gap-2 cursor-pointer hover:underline mb-4 w-fit"
          onClick={() => router.push('/dashboard/transactions')}
        >
          <ArrowLeftOutlined /> Quay lại danh sách giao dịch
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">
          Khởi tạo giao dịch chuyển nhượng
        </h1>
        <p className="text-[15px] text-[#4b5563]">
          Chọn tài sản bạn muốn chuyển nhượng và thông tin bên nhận (Bên mua) để tạo hợp đồng nháp.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateTransaction}
        requiredMark={false}
      >
        <div className="bg-white border border-[#e1e2e4] rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-[#e1e2e4]">
            <h3 className="text-lg font-bold text-gray-900 mb-6">1. Chọn tài sản chuyển nhượng (Sổ đỏ số)</h3>
            
            <Form.Item
              name="recordId"
              label={<span className="text-[13px] font-bold text-gray-700 uppercase">Tài sản của bạn trên Blockchain</span>}
              rules={[{ required: true, message: "Vui lòng chọn tài sản cần chuyển nhượng" }]}
            >
              <Select
                size="large"
                placeholder="Chọn mảnh đất để giao dịch..."
                onChange={handleRecordChange}
                className="w-full"
              >
                {records.map((r) => (
                  <Option key={r.id} value={r.id}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Token #{r.tokenId || "Đang xử lý"} - {r.address || "Chưa cập nhật địa chỉ"}
                      </span>
                      <span className="text-gray-500 text-sm">{r.area} m²</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Hidden Token ID field to submit */}
            <Form.Item name="tokenId" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="buyerId" hidden rules={[{ required: true, message: "Thiếu Buyer ID" }]}>
              <Input />
            </Form.Item>

            {/* Selected Record Preview */}
            {selectedRecord && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <EnvironmentOutlined className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-gray-900 mb-1">{selectedRecord.address}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase">Tờ bản đồ</div>
                        <div className="font-semibold text-gray-900">{selectedRecord.plotNumber || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase">Thửa đất</div>
                        <div className="font-semibold text-gray-900">{selectedRecord.parcelNumber || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase">Diện tích</div>
                        <div className="font-semibold text-gray-900">{selectedRecord.area} m²</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase">Loại đất</div>
                        <div className="font-semibold text-gray-900">{selectedRecord.landType || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!selectedRecord && records.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-2">
                <p className="text-yellow-800 text-sm mb-0">Bạn hiện không có tài sản nào đã được số hóa trên Blockchain (Trạng thái: Minted) để có thể giao dịch.</p>
              </div>
            )}
          </div>

          <div className="p-6 border-b border-[#e1e2e4]">
            <h3 className="text-lg font-bold text-gray-900 mb-6">2. Thông tin Bên nhận chuyển nhượng (Bên Mua)</h3>
            
            <Form.Item
              label={<span className="text-[13px] font-bold text-gray-700 uppercase">Số Căn cước công dân (VNeID) của Bên Mua</span>}
              required
            >
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name="buyerVneid"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập CCCD bên mua" }]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập số CCCD gồm 12 chữ số..."
                    prefix={<IdcardOutlined className="text-gray-400 mr-2" />}
                    onChange={() => {
                      // Reset verified state if user changes the input
                      if (buyerInfo) {
                        setBuyerInfo(null);
                        form.setFieldsValue({ buyerId: null });
                      }
                    }}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      handleSearchBuyer();
                    }}
                  />
                </Form.Item>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={handleSearchBuyer}
                  loading={searchingBuyer}
                  className="bg-gray-800 hover:bg-gray-700"
                >
                  <SearchOutlined /> Kiểm tra
                </Button>
              </Space.Compact>
            </Form.Item>

            {buyerInfo && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-green-800 font-semibold">Đã xác minh danh tính người nhận:</div>
                  <div className="text-green-900 text-lg font-bold">{buyerInfo.fullName}</div>
                </div>
                <div className="text-green-700 font-mono text-sm bg-green-100 px-3 py-1 rounded-md">
                  ID: {buyerInfo.vneidNumber}
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">3. Giá trị giao dịch</h3>
            
            <Form.Item
              label={<span className="text-[13px] font-bold text-gray-700 uppercase">Giá chuyển nhượng thỏa thuận (VND)</span>}
              required
            >
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item
                  name="salePrice"
                  noStyle
                  rules={[{ required: true, message: "Vui lòng nhập giá trị hợp đồng" }]}
                >
                  <InputNumber
                    style={{ width: "calc(100% - 65px)" }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                    placeholder="Ví dụ: 1,500,000,000"
                    className="!border-gray-300 !text-[15px]"
                    size="large"
                    min={0}
                  />
                </Form.Item>
                <Button size="large" className="bg-gray-50 text-gray-500 font-medium border-gray-300" style={{ width: "65px", cursor: 'default' }}>
                  VND
                </Button>
              </Space.Compact>
            </Form.Item>
            
            <p className="text-sm text-gray-500 mt-2">
              Lưu ý: Mức giá này sẽ được dùng để làm cơ sở tính thuế thu nhập cá nhân và lệ phí trước bạ.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            size="large"
            onClick={() => router.push("/dashboard/transactions")}
            className="!rounded-lg !px-6 !font-medium"
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={creating}
            disabled={!selectedRecord || !buyerInfo}
            className="!bg-[#0c56d0] hover:!bg-blue-700 !rounded-lg !px-8 !font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <SendOutlined /> Tạo hợp đồng giao dịch
          </Button>
        </div>
      </Form>
    </div>
  );
}
