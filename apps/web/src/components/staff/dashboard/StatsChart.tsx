import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

export default function StatsChart({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="shadow-sm border-[#e1e2e4]">
        <Statistic
          title="Tổng hồ sơ gán"
          value={stats?.total || 0}
          prefix={<FileTextOutlined className="text-blue-500 mr-2" />}
        />
      </Card>
      <Card className="shadow-sm border-[#e1e2e4]">
        <Statistic
          title="Đang chờ duyệt"
          value={stats?.submitted || 0}
          styles={{ content: { color: '#faad14' } }}
          prefix={<ClockCircleOutlined className="mr-2" />}
        />
      </Card>
      <Card className="shadow-sm border-[#e1e2e4]">
        <Statistic
          title="Đã phê duyệt"
          value={stats?.approved || 0}
          styles={{ content: { color: '#52c41a' } }}
          prefix={<CheckCircleOutlined className="mr-2" />}
        />
      </Card>
      <Card className="shadow-sm border-[#e1e2e4]">
        <Statistic
          title="Cần bổ sung"
          value={stats?.needsSupplement || 0}
          styles={{ content: { color: '#ff4d4f' } }}
          prefix={<ExclamationCircleOutlined className="mr-2" />}
        />
      </Card>
    </div>
  );
}
