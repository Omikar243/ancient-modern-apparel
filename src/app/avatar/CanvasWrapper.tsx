"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useMemo } from "react"

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

interface Avatar3DProps {
  measurements: Measurements;
  bodyType: BodyType;
  skinTone?: string; // CSS color like "rgb(255, 200, 150)"
}

function Avatar3D({ measurements, bodyType, skinTone = "peachpuff" }: Avatar3DProps) {
  const heightScale = measurements.height / 170;
  const shoulderWidth = measurements.shoulders / 100; // Normalize to scale (avg 40cm -> 0.4)

  // Enhanced proportions using all measurements
  const torsoHeight = heightScale * 0.4;
  const legHeight = heightScale * 0.45;
  const armLength = heightScale * 0.35;

  // Torso: taper from bust to waist
  const bustRadius = measurements.bust / 100; // Normalize
  const waistRadius = measurements.waist / 100;
  const hipRadius = measurements.hips / 100;

  // Deformations
  const hourglassFactor = bodyType.hourglass / 100;
  const athleticFactor = bodyType.athletic / 100;
  const hipScale = hipRadius * (1 + hourglassFactor * 0.2); // Widen hips for hourglass
  const waistScale = waistRadius * (1 - hourglassFactor * 0.1); // Narrow waist
  const slimOverall = 1 - athleticFactor * 0.15; // Slim all widths for athletic

  // Skin material with tone
  const skinMaterial = useMemo(() => (
    <meshStandardMaterial color={skinTone} roughness={0.5} metalness={0} />
  ), [skinTone]);

  // Torso as tapered cylinder (approximate with two cylinders or use cone for better taper)
  const torsoTopRadius = shoulderWidth * 0.15 * slimOverall;
  const torsoBottomRadius = Math.max(bustRadius * 0.3, waistScale * 0.25) * slimOverall;

  return (
    <group scale={[1, heightScale, 1]}>
      {/* Head */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        {skinMaterial}
      </mesh>

      {/* Torso - upper (bust level) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[torsoTopRadius, torsoBottomRadius, torsoHeight * 0.5, 8]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>

      {/* Torso - lower (waist to hips) */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[torsoBottomRadius, hipScale * 0.25, torsoHeight * 0.5, 8]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>

      {/* Hips/Lower body */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[hipScale * 0.3, 16, 8]} /> {/* Rounded hips */}
        <meshStandardMaterial color="lightcoral" />
      </mesh>

      {/* Legs */}
      <mesh position={[-shoulderWidth * 0.1, 0, 0]}>
        <cylinderGeometry args={[0.05 * slimOverall, legHeight, 8, 16]} />
        <meshStandardMaterial color="darkblue" />
      </mesh>
      <mesh position={[shoulderWidth * 0.1, 0, 0]}>
        <cylinderGeometry args={[0.05 * slimOverall, legHeight, 8, 16]} />
        <meshStandardMaterial color="darkblue" />
      </mesh>

      {/* Arms */}
      <mesh position={[-shoulderWidth * 0.2, 0.6, 0]}>
        <cylinderGeometry args={[0.04 * slimOverall, armLength, 8, 16]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
      <mesh position={[shoulderWidth * 0.2, 0.6, 0]}>
        <cylinderGeometry args={[0.04 * slimOverall, armLength, 8, 16]} />
        <meshStandardMaterial color="lightgreen" />
      </mesh>
    </group>
  );
}

export default function CanvasWrapper({ measurements, bodyType, skinTone }: { measurements: Measurements; bodyType: BodyType; skinTone?: string }) {
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
        <Avatar3D measurements={measurements} bodyType={bodyType} skinTone={skinTone} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={1}
          maxDistance={5}
        />
      </Canvas>
    </div>
  );
}