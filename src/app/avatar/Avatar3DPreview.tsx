"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface Avatar3DPreviewProps {
  uploadProgress: number; // 0-4
}

function RotatingAvatar({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotate the avatar
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  // Progressive building of the avatar based on upload progress
  const opacity = Math.min(progress / 4, 1);
  const heightScale = 0.6 + (progress / 4) * 0.4; // Grows from 60% to 100% as photos are uploaded

  // Material that becomes more solid as photos are uploaded
  const material = useMemo(
    () => (
      <meshStandardMaterial
        color="#e8e8e8"
        roughness={0.7}
        metalness={0.1}
        transparent={true}
        opacity={opacity}
      />
    ),
    [opacity]
  );

  const wireMaterial = useMemo(
    () => (
      <meshBasicMaterial
        color="#10b981"
        wireframe={true}
        transparent={true}
        opacity={0.3 + opacity * 0.4}
      />
    ),
    [opacity]
  );

  return (
    <group ref={groupRef} scale={[1, heightScale, 1]}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        {material}
      </mesh>
      {progress >= 1 && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Neck */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.12, 12]} />
        {material}
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.7, 16]} />
        {material}
      </mesh>
      {progress >= 2 && (
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.13, 0.16, 0.72, 16]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Hips */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        {material}
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 3 && (
        <mesh position={[-0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.065, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Right Leg */}
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 4 && (
        <mesh position={[0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.065, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Left Arm */}
      <mesh position={[-0.22, 1.0, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.22, 1.0, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>

      {/* Accent particles when all photos uploaded */}
      {progress === 4 && (
        <>
          <pointLight position={[0, 1.5, 0.5]} intensity={0.5} color="#10b981" />
          <pointLight position={[0, 0.5, 0.5]} intensity={0.3} color="#22d3ee" />
        </>
      )}
    </group>
  );
}

export default function Avatar3DPreview({ uploadProgress }: Avatar3DPreviewProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 2.5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#10b981" />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#22d3ee" />
        
        <RotatingAvatar progress={uploadProgress} />
      </Canvas>
    </div>
  );
}
