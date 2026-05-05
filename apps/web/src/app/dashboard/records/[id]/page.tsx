import { RecordDetailPage } from "@/components/pages/records/detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecordDetailPage id={id} />;
}
