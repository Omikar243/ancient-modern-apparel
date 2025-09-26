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
  const heightScale = measurements.height / 170;
  const shoulderWidth = measurements.shoulders / 40;

  // Humanoid proportions scaled by measurements and body type
  const torsoHeight = heightScale * 0.4;
  const legHeight = heightScale * 0.45;
  const armLength = heightScale * 0.35;
  const hipScale = 1 + (bodyType.hourglass / 100) * 0.15;
  const athleticSlim = 1 - (bodyType.athletic / 100) * 0.08;

  return (
    <group>
      {/* Head */}
      <mesh position={[0, heightScale * 0.85, 0]}>
        <sphereGeometry args={[heightScale * 0.1, 16, 16]} />
        <meshStandardMaterial color="peachpuff" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, heightScale * 0.5, 0]}>
        <cylinderGeometry args={[shoulderWidth * 0.15 * athleticSlim, torsoHeight, 8, 16]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>

      {/* Hips/Lower body */}
      <mesh position={[0, heightScale * 0.25, 0]}>
        <cylinderGeometry args={[shoulderWidth * 0.2 * hipScale, heightScale * 0.2, 8, 16]} />
        <meshStandardMaterial color="lightcoral" />
      </mesh>

      {/* Legs */}
      <mesh position={[-shoulderWidth * 0.1, heightScale * 0.1, 0]}>
        <cylinderGeometry args={[heightScale * 0.05, legHeight, 8, 16]} />
        <meshStandardMaterial color="darkblue" />
      </mesh>
      <mesh position={[shoulderWidth * 0.1, heightScale * 0.1, 0]}>
        <cylinderGeometry args={[heightScale * 0.05, legHeight, 8, 16]} />
        <meshStandardMaterial color="darkblue" />
      </mesh>

      {/* Arms */}
      <mesh position={[-shoulderWidth * 0.2, heightScale * 0.6, 0]}>
        <cylinderGeometry args={[heightScale * 0.04, armLength, 8, 16]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      <mesh position={[shoulderWidth * 0.2, heightScale * 0.6, 0]}>
        <cylinderGeometry args={[heightScale * 0.04, armLength, 8, 16]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
    </group>
  )
}

export default function CanvasWrapper({ measurements, bodyType }: { measurements: Measurements; bodyType: BodyType }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas 
        style={{ width: '100%', height: '100%' }} 
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{ alpha: false, antialias: true }}
      >
        <color attach="background" args={['#f0f0f0']} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />
        <Avatar3D measurements={measurements} bodyType={bodyType} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={1}
          maxDistance={5}
        />
      </Canvas>
    </div>
  )
}