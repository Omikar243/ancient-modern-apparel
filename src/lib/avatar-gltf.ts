import type { AvatarMeasurements } from "@/lib/avatar-types";

function alignTo4(value: number) {
  return (value + 3) & ~3;
}

function writeFloat32(values: number[]) {
  const buffer = new ArrayBuffer(values.length * 4);
  const view = new DataView(buffer);
  values.forEach((value, index) => view.setFloat32(index * 4, value, true));
  return new Uint8Array(buffer);
}

function writeUint16(values: number[]) {
  const buffer = new ArrayBuffer(values.length * 2);
  const view = new DataView(buffer);
  values.forEach((value, index) => view.setUint16(index * 2, value, true));
  return new Uint8Array(buffer);
}

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function buildBox(width: number, height: number, depth: number, centerY: number) {
  const x = width / 2;
  const y = height / 2;
  const z = depth / 2;

  const positions = [
    -x, centerY - y, -z,
     x, centerY - y, -z,
     x, centerY + y, -z,
    -x, centerY + y, -z,
    -x, centerY - y,  z,
     x, centerY - y,  z,
     x, centerY + y,  z,
    -x, centerY + y,  z,
  ];

  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    3, 2, 6, 3, 6, 7,
    1, 5, 6, 1, 6, 2,
    0, 3, 7, 0, 7, 4,
  ];

  return { positions, indices };
}

export function createAvatarGltf(measurements: AvatarMeasurements) {
  const width = Math.max(0.35, measurements.shoulders / 120);
  const torsoHeight = Math.max(0.7, measurements.height / 200);
  const depth = Math.max(0.18, measurements.waist / 260);
  const legHeight = Math.max(0.8, measurements.height / 150);

  const torso = buildBox(width, torsoHeight, depth, 0.9);
  const legs = buildBox(width * 0.45, legHeight, depth * 0.7, -0.15);

  const torsoVertexCount = torso.positions.length / 3;
  const positions = [...torso.positions, ...legs.positions];
  const indices = [...torso.indices, ...legs.indices.map((index) => index + torsoVertexCount)];

  const positionBytes = writeFloat32(positions);
  const indexBytes = writeUint16(indices);

  const indexOffset = alignTo4(positionBytes.byteLength);
  const totalLength = indexOffset + indexBytes.byteLength;
  const combined = new Uint8Array(totalLength);
  combined.set(positionBytes, 0);
  combined.set(indexBytes, indexOffset);

  const maxX = Math.max(...positions.filter((_, index) => index % 3 === 0));
  const minX = Math.min(...positions.filter((_, index) => index % 3 === 0));
  const maxY = Math.max(...positions.filter((_, index) => index % 3 === 1));
  const minY = Math.min(...positions.filter((_, index) => index % 3 === 1));
  const maxZ = Math.max(...positions.filter((_, index) => index % 3 === 2));
  const minZ = Math.min(...positions.filter((_, index) => index % 3 === 2));

  return JSON.stringify({
    asset: { version: "2.0", generator: "ancient-modern-avatar-mvp" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
            },
            indices: 1,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [0.76, 0.76, 0.79, 1],
          metallicFactor: 0,
          roughnessFactor: 0.85,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
        min: [Math.min(...indices)],
        max: [Math.max(...indices)],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: positionBytes.byteLength,
        target: 34962,
      },
      {
        buffer: 0,
        byteOffset: indexOffset,
        byteLength: indexBytes.byteLength,
        target: 34963,
      },
    ],
    buffers: [
      {
        byteLength: combined.byteLength,
        uri: `data:application/octet-stream;base64,${toBase64(combined)}`,
      },
    ],
  });
}
