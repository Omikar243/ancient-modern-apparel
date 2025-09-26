"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

interface BodyType {
  hourglass: number;
  athletic: number;
}

function Avatar3D({ measurements, bodyType }: { measurements: Measurements; bodyType: BodyType }) {
  // Simple box geometry representing the avatar, scaled by measurements
  const heightScale = measurements.height / 170; // Normalize to default 170cm
  const shoulderWidth = measurements.shoulders / 40; // Normalize to default 40cm

  return (
    <group>
      <mesh position={[0, -heightScale / 2, 0]}>
        <boxGeometry args={[shoulderWidth * 0.5, heightScale, 0.3]} />
        <meshStandardMaterial color="peachpuff" />
      </mesh>
    </group>
  )
}

export default function CanvasWrapper({ measurements, bodyType }: { measurements: Measurements; bodyType: BodyType }) {
  return (
    <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Avatar3D measurements={measurements} bodyType={bodyType} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  )
}