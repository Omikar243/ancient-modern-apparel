import CatalogDetailClient from "./CatalogDetailClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function GarmentDetailPage({ params }: Props) {
  const { id } = await params;
  return <CatalogDetailClient params={{ id }} />;
}