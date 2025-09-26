import CatalogDetailClient from "./CatalogDetailClient";

interface Props {
  params: {
    id: string;
  };
}

export default function GarmentDetailPage({ params }: Props) {
  return <CatalogDetailClient params={params} />;
}