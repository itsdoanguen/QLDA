"use client";

import { useEffect, useState } from "react";
import { Table, Card, Tag, Button, App, Tooltip, Space } from "antd";
import { FileDoneOutlined, LinkOutlined, SafetyCertificateOutlined, EyeOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";

export default function ReceiptHistoryPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { message, modal } = App.useApp();

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/taxes/receipts/my");
      setReceipts(res.data);
    } catch (error: any) {
      console.error(error);
      message.error("Lỗi khi tải danh sách biên lai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleVerify = async (receiptId: number) => {
    try {
      message.loading({ content: 'Đang xác minh trên Blockchain...', key: 'verify' });
      const res = await api.get(`/taxes/receipts/${receiptId}/verify`);
      message.success({ content: 'Biên lai hợp lệ, tồn tại trên Blockchain!', key: 'verify' });
      
      modal.success({
        title: 'Xác minh Biên lai Hợp lệ',
        content: (
          <div className="mt-4">
            <p>Biên lai số <strong>#{receiptId}</strong> đã được lưu trữ vĩnh viễn và không thể chỉnh sửa.</p>
            <div className="flex flex-col gap-2 mt-4">
              <a href={res.data.ipfsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                <FileDoneOutlined /> Xem file gốc trên IPFS
              </a>
              <a href={res.data.etherscanUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                <SafetyCertificateOutlined /> Xem bản ghi Hash trên Etherscan
              </a>
            </div>
          </div>
        )
      });
    } catch (error: any) {
      message.error({ content: error.response?.data?.message || 'Biên lai chưa được lưu trên blockchain', key: 'verify' });
    }
  };

  const columns = [
    {
      title: "Mã BL",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-mono">#{id}</span>,
    },
    {
      title: "Loại phí / thuế",
      dataIndex: ["tax", "taxType"],
      key: "taxType",
      render: (type: string) => {
        if (type === "TNCN") return <Tag color="orange">Thuế TNCN</Tag>;
        if (type === "Registration_Fee") return <Tag color="blue">Lệ phí trước bạ</Tag>;
        if (type === "Notary_Fee") return <Tag color="purple">Phí công chứng</Tag>;
        return <Tag>{type}</Tag>;
      }
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: string) => <span className="font-bold">{Number(amount).toLocaleString("vi-VN")} VND</span>,
    },
    {
      title: "Ngày nộp",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (date: string) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        status === "Success" ? <Tag color="success">Thành công</Tag> : <Tag color="default">{status}</Tag>
      ),
    },
    {
      title: "Bảo mật",
      key: "security",
      render: (_: any, record: any) => (
        <Space>
          {record.receiptCid ? (
            <Tooltip title="Đã băm và lưu trên IPFS">
              <Tag color="cyan" icon={<LinkOutlined />}>IPFS</Tag>
            </Tooltip>
          ) : null}
          {record.blockchainTxHash ? (
            <Tooltip title="Đã ghi sổ On-chain">
              <Tag color="green" icon={<SafetyCertificateOutlined />}>On-chain</Tag>
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />}
          onClick={() => handleVerify(record.id)}
          disabled={!record.receiptCid || !record.blockchainTxHash}
        >
          Xác minh
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử Biên lai Điện tử</h1>
        <p className="text-gray-500">Xem và xác minh các biên lai nộp thuế/phí đã được lưu trữ vĩnh viễn trên Blockchain.</p>
      </div>

      <Card className="shadow-sm rounded-xl border-gray-200">
        <Table 
          dataSource={receipts} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
