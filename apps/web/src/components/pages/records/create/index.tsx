"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, InputNumber, Select, Upload, Button, Space, App, Modal, Image } from "antd";
import { 
  InboxOutlined, DeleteOutlined, InfoCircleOutlined, UserOutlined, SendOutlined,
  CheckOutlined, BookOutlined, CloudUploadOutlined, FileTextOutlined,
  PartitionOutlined, ContainerOutlined, FileDoneOutlined, UploadOutlined, ArrowRightOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { api } from "@/utils/api";
import type { UploadProps } from "antd";
import dynamic from "next/dynamic";
import { ServiceSelection } from "./ServiceSelection";
import { SuccessView } from "./SuccessView";

const MapPolygonPicker = dynamic(() => import("@/components/shared/MapPolygonPicker"), { ssr: false });

const { Dragger } = Upload;
const { Option } = Select;
const { TextArea } = Input;

export function CreateRecordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('tai-len');
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [createdRecordId, setCreatedRecordId] = useState<string>("");
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
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    fileList,
    listType: "picture",
    onPreview: handlePreview,
    customRequest: async ({ file, onSuccess, onError }) => {
      const formData = new FormData();
      formData.append("file", file as File);

      try {
        const response = await api.post("/files/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // Tăng timeout lên 60 giây vì IPFS upload có thể lâu
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
        
        setFileList((prev) => 
          prev.map((f) => {
            if (f.uid === (file as any).uid) {
              return { ...f, status: 'error' };
            }
            return f;
          })
        );
        message.error(`${(file as File).name} tải lên thất bại. ${error.response?.data?.message || ''}`);
      }
    },
    onChange(info) {
      setFileList(info.fileList);
    },
    beforeUpload: (file) => {
      const isAllowed = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf";
      if (!isAllowed) {
        message.error("Chỉ cho phép tải lên file JPG, PNG, hoặc PDF!");
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("File phải nhỏ hơn 5MB!");
      }
      return isAllowed && isLt5M;
    },
    onRemove: (file) => {
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
      await api.post("/land-records", payload);
      message.success("Lưu bản thảo thành công!");
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
      // Create draft first
      const draftRes = await api.post("/land-records", payload);
      const recordId = draftRes.data?.id;

      if (!recordId) throw new Error("Không lấy được ID hồ sơ");

      // Submit for review
      await api.post(`/land-records/${recordId}/submit`);
      
      setCreatedRecordId(recordId);
      message.success("Nộp hồ sơ xét duyệt thành công!");
      setStep(3); // Go to success view
    } catch (error: any) {
      console.error("Submit error", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi nộp hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadForm = () => (
    <div className="animate-fade-in">

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <div className="space-y-6">
          {/* Thông tin thửa đất */}
          <div className="bg-white border border-[#c3c6d6] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[#e1e2e4]">
              <BookOutlined className="text-[#0c56d0] text-lg" />
              <h3 className="text-[16px] font-bold text-[#191c1e] mb-0">Thông tin thửa đất</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-6">
              <Form.Item
                name="plotNumber"
                label={<span className="text-[12px] font-bold text-[#737685] uppercase">SỐ TỜ BẢN ĐỒ</span>}
                className="mb-0"
              >
                <Input
                  className="!rounded !border-[#c3c6d6] hover:!border-[#0c56d0] focus:!border-[#0c56d0] focus:!shadow-none !p-3 !text-[14px]"
                  placeholder="Nhập số tờ bản đồ"
                />
              </Form.Item>

              <Form.Item
                name="parcelNumber"
                label={<span className="text-[12px] font-bold text-[#737685] uppercase">SỐ THỬA ĐẤT</span>}
                className="mb-0"
              >
                <Input
                  className="!rounded !border-[#c3c6d6] hover:!border-[#0c56d0] focus:!border-[#0c56d0] focus:!shadow-none !p-3 !text-[14px]"
                  placeholder="Nhập số thửa đất"
                />
              </Form.Item>

              <Form.Item
                name="area"
                label={<span className="text-[12px] font-bold text-[#737685] uppercase">DIỆN TÍCH (m²)</span>}
                className="mb-0"
                rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
              >
                <InputNumber
                  className="w-full !rounded !border-[#c3c6d6] hover:!border-[#0c56d0] focus:!border-[#0c56d0] focus:!shadow-none !text-[14px]"
                  style={{ padding: '6px 0' }}
                  placeholder="Ví dụ: 125.5"
                  min={0}
                  step={0.1}
                />
              </Form.Item>

              <Form.Item
                name="landType"
                label={<span className="text-[12px] font-bold text-[#737685] uppercase">LOẠI ĐẤT</span>}
                className="mb-0"
                rules={[{ required: true, message: "Vui lòng chọn loại đất" }]}
              >
                <Select
                  className="w-full !h-[46px] [&_.ant-select-selector]:!rounded [&_.ant-select-selector]:!border-[#c3c6d6] [&_.ant-select-selector]:hover:!border-[#0c56d0] [&_.ant-select-selector]:focus:!border-[#0c56d0] [&_.ant-select-selector]:!shadow-none"
                  placeholder="Chọn loại đất"
                >
                  <Option value="LUC">Đất chuyên trồng lúa nước (LUC)</Option>
                  <Option value="LUK">Đất trồng lúa nước còn lại (LUK)</Option>
                  <Option value="BHK">Đất bằng trồng cây hàng năm khác (BHK)</Option>
                  <Option value="NHK">Đất nương rẫy trồng cây hàng năm khác (NHK)</Option>
                  <Option value="CLN">Đất trồng cây lâu năm (CLN)</Option>
                  <Option value="RSX">Đất rừng sản xuất (RSX)</Option>
                  <Option value="RPH">Đất rừng phòng hộ (RPH)</Option>
                  <Option value="RDD">Đất rừng đặc dụng (RDD)</Option>
                  <Option value="NTS">Đất nuôi trồng thủy sản (NTS)</Option>
                  <Option value="LMU">Đất làm muối (LMU)</Option>
                  <Option value="NKH">Đất nông nghiệp khác (NKH)</Option>
                  <Option value="ONT">Đất ở tại nông thôn (ONT)</Option>
                  <Option value="ODT">Đất ở tại đô thị (ODT)</Option>
                  <Option value="TSC">Đất xây dựng trụ sở cơ quan (TSC)</Option>
                  <Option value="TSN">Đất xây dựng trụ sở của tổ chức sự nghiệp (TSN)</Option>
                  <Option value="TMD">Đất thương mại, dịch vụ (TMD)</Option>
                  <Option value="SKC">Đất cơ sở sản xuất phi nông nghiệp (SKC)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="address"
                label={<span className="text-[12px] font-bold text-[#737685] uppercase">ĐỊA CHỈ THỬA ĐẤT</span>}
                className="mb-0 col-span-2"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input
                  className="!rounded !border-[#c3c6d6] hover:!border-[#0c56d0] focus:!border-[#0c56d0] focus:!shadow-none !p-3 !text-[14px]"
                  placeholder="Số nhà, đường, phường/xã..."
                />
              </Form.Item>
            </div>
          </div>

          {/* Danh mục tài lên hồ sơ */}
          <div className="bg-white border border-[#c3c6d6] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[#e1e2e4]">
              <CloudUploadOutlined className="text-[#0c56d0] text-lg" />
              <h3 className="text-[16px] font-bold text-[#191c1e] mb-0">Danh mục tài lên hồ sơ</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Box 1 */}
                <div className="flex items-center justify-between p-4 border border-[#e1e2e4] rounded-lg bg-[#fcfdff]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f4ff] rounded flex items-center justify-center text-[#0c56d0]">
                      <FileTextOutlined className="text-xl" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#191c1e]">Giấy chứng nhận (Sổ đỏ)</div>
                      <div className="text-[12px] text-[#737685]">Định dạng: PDF, JPG</div>
                    </div>
                  </div>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button icon={<UploadOutlined />} className="!text-[12px] !font-medium">Tải lên</Button>
                  </Upload>
                </div>
                
                {/* Box 2 */}
                <div className="flex items-center justify-between p-4 border border-[#e1e2e4] rounded-lg bg-[#fcfdff]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f4ff] rounded flex items-center justify-center text-[#0c56d0]">
                      <PartitionOutlined className="text-xl" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#191c1e]">Sơ đồ thửa đất (VN-2000)</div>
                      <div className="text-[12px] text-[#737685]">Định dạng: JSON, XML</div>
                    </div>
                  </div>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button icon={<UploadOutlined />} className="!text-[12px] !font-medium">Tải lên</Button>
                  </Upload>
                </div>

                {/* Box 3 */}
                <div className="flex items-center justify-between p-4 border border-[#e1e2e4] rounded-lg bg-[#fcfdff]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f4ff] rounded flex items-center justify-center text-[#0c56d0]">
                      <ContainerOutlined className="text-xl" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#191c1e]">Chứng từ thuế</div>
                      <div className="text-[12px] text-[#737685]">Định dạng: PDF</div>
                    </div>
                  </div>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button icon={<UploadOutlined />} className="!text-[12px] !font-medium">Tải lên</Button>
                  </Upload>
                </div>

                {/* Box 4 */}
                <div className="flex items-center justify-between p-4 border border-[#e1e2e4] rounded-lg bg-[#fcfdff]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#f0f4ff] rounded flex items-center justify-center text-[#0c56d0]">
                      <FileDoneOutlined className="text-xl" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#191c1e]">Hợp đồng công chứng</div>
                      <div className="text-[12px] text-[#737685]">Định dạng: PDF</div>
                    </div>
                  </div>
                  <Upload {...uploadProps} showUploadList={false}>
                    <Button icon={<UploadOutlined />} className="!text-[12px] !font-medium">Tải lên</Button>
                  </Upload>
                </div>
              </div>

              {/* Uploaded Files List */}
              {fileList.length > 0 && (
                <div className="mt-6 border-t border-[#e1e2e4] pt-4">
                  <h4 className="text-[13px] font-bold text-[#434654] uppercase mb-3">Tệp đã tải lên</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {fileList.map((file) => (
                      <div key={file.uid} className="flex items-center justify-between p-3 border border-[#e1e2e4] rounded-lg bg-white shadow-sm">
                        <span className="text-[13px] text-[#0c56d0] font-medium truncate max-w-[80%]">{file.name}</span>
                        <Button type="text" icon={<DeleteOutlined />} size="small" className="text-red-500" onClick={() => setFileList(prev => prev.filter(f => f.uid !== file.uid))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons block */}
          <div className="flex items-center justify-end gap-4 py-4 border-t border-[#e1e2e4]">
            <Button
              type="default"
              onClick={() => router.push("/dashboard")}
              className="!px-6 !h-10 !border-[#c3c6d6] !text-[#191c1e] !font-medium !rounded-lg"
            >
              Hủy
            </Button>
            <Button
              type="default"
              onClick={handleSaveDraft}
              loading={drafting}
              className="!px-6 !h-10 !border-[#c3c6d6] !text-[#191c1e] !font-medium !rounded-lg"
            >
              Lưu nháp
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="!px-8 !h-10 !bg-[#0c56d0] !text-white !font-bold !rounded-lg flex items-center gap-2"
            >
              Nộp hồ sơ
              <ArrowRightOutlined />
            </Button>
          </div>

          {/* GIS */}
          <div className="bg-white border border-[#c3c6d6] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#e1e2e4]">
              <div className="flex items-center gap-3">
                <EnvironmentOutlined className="text-[#0c56d0] text-lg" />
                <h3 className="text-[16px] font-bold text-[#191c1e] mb-0">Vị trí & Hình dạng thửa đất (GIS)</h3>
              </div>
              <div className="flex items-center gap-4 text-[12px] font-medium text-[#434654]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0c56d0]"></span> Ranh giới thửa đất
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#737685]"></span> Tọa độ VN-2000
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="border border-[#e1e2e4] rounded-lg overflow-hidden h-[450px]">
                <Form.Item name="gpsCoordinates" className="mb-0 h-full">
                  <MapPolygonPicker />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </Form>
      
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancelPreview}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-24 pt-6">
      {/* Render Steps */}
      {step === 1 && (
        <ServiceSelection 
          onNext={(serviceId) => {
            if (serviceId === 'chuyen-nhuong') {
              router.push('/dashboard/transactions?create=true');
              return;
            }
            setServiceType(serviceId);
            setStep(2);
          }} 
        />
      )}

      {step === 2 && renderUploadForm()}

      {step === 3 && <SuccessView recordId={createdRecordId} profile={profile} />}
    </div>
  );
}
