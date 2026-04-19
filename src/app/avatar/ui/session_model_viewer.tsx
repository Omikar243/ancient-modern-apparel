"use client";

import CanvasWrapper from "../CanvasWrapper";

export default function SessionModelViewer({
  measurements,
}: {
  measurements: {
    height: number;
    bust: number;
    waist: number;
    hips: number;
    shoulders: number;
  };
}) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden">
      <CanvasWrapper
        measurements={measurements}
        bodyType={{ hourglass: 50, athletic: 50 }}
        skinTone="#d9b38c"
      />
    </div>
  );
}
