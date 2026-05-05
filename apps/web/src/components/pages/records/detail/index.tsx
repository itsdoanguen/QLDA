"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Select, Upload, Button, App, Modal, Tag } from "antd";
import { InboxOutlined, InfoCircleOutlined, UserOutlined, SendOutlined, SaveOutlined } from "@ant-design/icons";
import { api } from "@/utils/api";
import type { UploadProps } from "antd";
import dynamic from "next/dynamic";

const MapPolygonPicker = dynamic(() => import("@/components/shared/MapPolygonPicker"), { ssr: false });

const { Dragger } = Upload;
const { Option } = Select;
const { TextArea } = Input;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  Draft: { label: "Bản nháp", color: "default" },
  Submitted: { label: "Đang chờ duyệt", color: "processing" },
  CB_APPROVED: { label: "Đã duyệt (Cán bộ)", color: "cyan" },
  "Needs Supplement": { label: "Cần bổ sung", color: "warning" },
  Rejected: { label: "Từ chối", color: "error" },
  Minted: { label: "Trên Blockchain", color: "success" },
};

export function RecordDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  
  const { message } = App.useApp();

  const handleCancelPreview = () => setPreviewOpen(false);

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching record with ID:", id);
      try {
        setLoading(true);
        const profileRes = await api.get("/auth/profile");
        setProfile(profileRes.data);

        const recordRes = await api.get(`/land-records/${id}`);
        setRecord(recordRes.data);
      } catch (error: any) {
        console.error("Failed to fetch data for ID:", id, error);
        message.error("Không thể tải thông tin hồ sơ");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, message, router]);

  useEffect(() => {
    if (record && !loading) {
      console.log("Populating form for status:", record.status);
      form.setFieldsValue({
        plotNumber: record.plotNumber,
        parcelNumber: record.parcelNumber,
        area: record.area,
        address: record.address,
        landType: record.landType,
        gpsCoordinates: record.gpsCoordinates,
      });

      if (record.files && record.files.length > 0) {
        setFileList(record.files.map((f: any) => ({
          uid: f.id.toString(),
          name: f.fileName,
          status: "done",
          url: `https://gateway.pinata.cloud/ipfs/${f.ipfsCid}`,
          response: f,
        })));
      }
    }
  }, [record, loading, form]);

  const isEditable = record?.status === "Draft" || record?.status === "Needs Supplement";
  console.log("Record status:", record?.status, "isEditable:", isEditable);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    fileList,
    listType: "picture",
    disabled: !isEditable,
    onPreview: handlePreview,
    customRequest: async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append("file", file as File);

      try {
        const response = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
        
        const fileData = response.data;
        onSuccess?.(fileData, file as any);
        
        setFileList((prev) => 
          prev.map((f) => {
            if (f.uid === (file as any).uid) {
              return { ...f, status: 'done', response: fileData, url: fileData.ipfsCid ? `https://gateway.pinata.cloud/ipfs/${fileData.ipfsCid}` : '' };
            }
            return f;
          })
        );
        message.success(`${(file as File).name} tải lên thành công.`);
      } catch (error: any) {
        console.error("Upload error", error);
        onError?.(error);
        setFileList((prev) => prev.map((f) => f.uid === (file as any).uid ? { ...f, status: 'error' } : f));
        message.error(`${(file as File).name} tải lên thất bại.`);
      }
    },
    onChange(info) {
      setFileList(info.fileList);
    },
    beforeUpload: (file) => {
      const isAllowed = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf";
      if (!isAllowed) message.error("Chỉ cho phép tải lên file JPG, PNG, hoặc PDF!");
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) message.error("File phải nhỏ hơn 5MB!");
      return isAllowed && isLt5M;
    },
    onRemove: (file) => {
      if (!isEditable) return false;
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    }
  };

  const getPayload = (values: any) => {
    const fileIds = fileList
      .filter((f) => f.status === 'done' && f.response?.id)
      .map((f) => f.response.id);

    return {
      address: values.address,
      area: Number(values.area),
      plotNumber: values.plotNumber,
      parcelNumber: values.parcelNumber,
      landType: values.landType,
      gpsCoordinates: values.gpsCoordinates,
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    };
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setDrafting(true);
      const payload = getPayload(values);
      await api.put(`/land-records/${id}`, payload);
      message.success("Cập nhật bản thảo thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      if (error.errorFields) {
        message.warning("Vui lòng điền các trường bắt buộc trước khi lưu");
      } else {
        message.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu bản thảo");
      }
    } finally {
      setDrafting(false);
    }
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = getPayload(values);
      // Update draft first
      await api.put(`/land-records/${id}`, payload);
      // Submit for review
      await api.post(`/land-records/${id}/submit`);
      
      message.success("Nộp hồ sơ xét duyệt thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Submit error", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi nộp hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-[#6b7280]">Đang tải dữ liệu hồ sơ...</div>
      </div>
    );
  }

  const statusObj = STATUS_MAP[record?.status] || STATUS_MAP.Draft;

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold leading-[40px] tracking-[-0.02em] text-[#191c1e] mb-2">
            Hồ Sơ Đất Đai #{id}
          </h1>
          <div className="flex items-center gap-3">
            <Tag color={statusObj.color} className="!text-[13px] !font-medium !px-3 !py-1">
              {statusObj.label}
            </Tag>
            <span className="text-[14px] text-[#434654]">
              Cập nhật lần cuối: {new Date(record?.updatedAt).toLocaleString("vi-VN")}
            </span>
          </div>
        </div>
      </header>

      {record?.reviewReason && (
        <div className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-lg flex gap-4">
          <InfoCircleOutlined className="text-orange-500 text-lg mt-0.5" />
          <div>
            <h4 className="text-[14px] font-semibold text-orange-800 mb-1">Ghi chú từ cán bộ:</h4>
            <p className="text-[13px] text-orange-700 leading-relaxed font-medium">
              {record.reviewReason}
            </p>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        disabled={!isEditable}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#c3c6d6] p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-semibold leading-[24px]">Tài liệu đính kèm</h3>
                <span className="text-[12px] font-medium tracking-[0.02em] text-[#003d9b] uppercase">Bản quét gốc</span>
              </div>
              
              <Form.Item name="files" className="mb-0">
                <Dragger {...uploadProps} className="!bg-[#fcfdff] hover:!border-[#0c56d0] !rounded-xl !border-2 !border-[#c3c6d6]">
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className="!text-[#737685] !text-4xl" />
                  </p>
                  <p className="ant-upload-text !text-[#191c1e] !font-medium !text-[14px]">
                    Tải lên hoặc quét 'Sổ đỏ'
                  </p>
                  <p className="ant-upload-hint !text-[#737685] !text-[12px]">
                    Định dạng hỗ trợ: PDF, JPG, PNG (Max 5MB)
                  </p>
                </Dragger>
              </Form.Item>

              <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handleCancelPreview}
              >
                <img alt="preview" style={{ width: "100%" }} src={previewImage} />
              </Modal>
            </div>

            <div className="bg-[#f0f4ff] border border-[#d6e4ff] p-4 rounded-lg flex gap-4">
              <InfoCircleOutlined className="text-[#0c56d0] text-lg mt-0.5" />
              <p className="text-[12px] text-[#0040a2] leading-relaxed font-medium">
                Đảm bảo rằng bản quét rõ nét, không bị mất góc và hiển thị đầy đủ con dấu pháp lý để hệ thống có thể lưu trữ minh bạch.
              </p>
            </div>
          </div>

          {/* Right Column: Form Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-[#c3c6d6] p-8 rounded-lg">
              <h3 className="text-[18px] font-semibold leading-[24px] mb-6 text-[#191c1e]">
                Thông tin chi tiết thửa đất
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <Form.Item
                  name="plotNumber"
                  label={<span className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase">Số tờ bản đồ</span>}
                >
                  <Input
                    className="!rounded !border-[#c3c6d6] hover:!border-[#0052cc] focus:!border-[#0052cc] focus:!shadow-none !p-3 !text-[14px]"
                    placeholder="Nhập số tờ..."
                  />
                </Form.Item>

                <Form.Item
                  name="parcelNumber"
                  label={<span className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase">Số thửa đất</span>}
                >
                  <Input
                    className="!rounded !border-[#c3c6d6] hover:!border-[#0052cc] focus:!border-[#0052cc] focus:!shadow-none !p-3 !text-[14px]"
                    placeholder="Nhập số thửa..."
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="area"
                label={<span className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase">Diện tích <span className="text-[#ba1a1a]">*</span></span>}
                rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
              >
                <InputNumber
                  size="large"
                  className="w-full !rounded !border-[#c3c6d6] hover:!border-[#0052cc] focus:!border-[#0052cc] focus:!shadow-none !text-[14px]"
                  suffix={<span className="text-[#737685] text-[12px] font-bold">m²</span>}
                  placeholder="Ví dụ: 125.5"
                  min={0}
                  step={0.1}
                />
              </Form.Item>

              <Form.Item
                name="address"
                label={<span className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase">Địa chỉ thửa đất <span className="text-[#ba1a1a]">*</span></span>}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <TextArea
                  className="!rounded !border-[#c3c6d6] hover:!border-[#0052cc] focus:!border-[#0052cc] focus:!shadow-none !p-3 !text-[14px]"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  rows={2}
                />
              </Form.Item>

              <Form.Item
                name="landType"
                label={<span className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase">Loại đất</span>}
              >
                <Select
                  placeholder="Chọn loại đất"
                  className="!h-12 [&_.ant-select-selector]:!rounded [&_.ant-select-selector]:!border-[#c3c6d6] hover:[&_.ant-select-selector]:!border-[#0052cc]"
                >
                  <Option value="Đất ở tại đô thị">Đất ở tại đô thị</Option>
                  <Option value="Đất ở tại nông thôn">Đất ở tại nông thôn</Option>
                  <Option value="Đất nông nghiệp">Đất nông nghiệp</Option>
                  <Option value="Đất thương mại, dịch vụ">Đất thương mại, dịch vụ</Option>
                </Select>
              </Form.Item>

              <div className="pt-6 border-t border-[#f3f4f6]">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium tracking-[0.02em] text-[#434654] uppercase mb-2 block">
                    Thông tin chủ sở hữu (Hiển thị)
                  </label>
                  <Input
                    prefix={<UserOutlined className="text-[#737685] mr-2" />}
                    value={profile?.fullName || ""}
                    disabled
                    className="!rounded !border-[#c3c6d6] !bg-[#f3f4f6] !text-[#434654] !p-3 !text-[14px]"
                  />
                  <div className="text-[12px] text-[#737685] mt-2">
                    Lưu ý: Thông tin chủ sở hữu được liên kết tự động qua tài khoản định danh VNeID của bạn.
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white border border-[#c3c6d6] rounded-lg overflow-hidden relative">
              <div className="p-4 border-b border-[#e1e2e4] bg-[#f8f9fb]">
                <h4 className="text-[14px] font-semibold text-[#191c1e]">Xác nhận tọa độ địa lý</h4>
                <p className="text-[12px] text-[#737685]">Click trên bản đồ để vẽ ranh giới thửa đất</p>
              </div>
              <Form.Item name="gpsCoordinates" className="mb-0">
                <MapPolygonPicker disabled={!isEditable} />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Floating Footer */}
        <footer className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-white border-t border-[#e1e2e4] px-8 py-4 z-40 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 text-[12px] font-medium text-[#737685]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> 
              Hệ thống trực tuyến
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              type="default"
              onClick={() => router.push("/dashboard")}
              className="!px-6 !h-10 !border-[#c3c6d6] !text-[#191c1e] !font-medium !rounded-lg hover:!bg-[#f8f9fb]"
            >
              Quay lại
            </Button>
            
            {isEditable && (
              <>
                <Button
                  type="default"
                  onClick={handleSaveDraft}
                  loading={drafting}
                  className="!px-6 !h-10 !border-[#003d9b] !text-[#003d9b] !font-medium !rounded-lg hover:!bg-[#f0f4ff]"
                >
                  <SaveOutlined />
                  Cập nhật bản thảo
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="!px-8 !h-10 !bg-[#0052cc] !text-white !font-bold !rounded-lg hover:!bg-[#0040a2] shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  <SendOutlined />
                  Nộp hồ sơ
                </Button>
              </>
            )}
          </div>
        </footer>
      </Form>
    </div>
  );
}
