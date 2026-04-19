import Preview3D from "../ui/preview_3d";

export default async function AvatarSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <Preview3D sessionId={sessionId} />;
}
