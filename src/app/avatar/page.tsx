import { Suspense } from "react";

import Upload4Views from "./ui/upload_4_views";

export default function AvatarPage() {
  return (
    <Suspense fallback={null}>
      <Upload4Views />
    </Suspense>
  );
}
