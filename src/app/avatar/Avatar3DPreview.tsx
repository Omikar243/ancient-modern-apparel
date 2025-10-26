"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Avatar3DPreviewProps {
  uploadProgress: number; // 0-4
  gender: "male" | "female";
}

function MaleAvatar({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Progressive building of the avatar based on upload progress
  const opacity = Math.min(progress / 4, 1);
  const heightScale = 0.6 + (progress / 4) * 0.4;

  const material = useMemo(
    () => (
      <meshStandardMaterial
        color="#d4b5a0"
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
        <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
        {material}
      </mesh>

      {/* Torso - broader shoulders for male */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.15, 0.14, 0.7, 16]} />
        {material}
      </mesh>
      {progress >= 2 && (
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.16, 0.15, 0.72, 16]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Shoulders */}
      <mesh position={[-0.2, 1.15, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
        {material}
      </mesh>
      <mesh position={[0.2, 1.15, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
        {material}
      </mesh>

      {/* Hips - narrower for male */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        {material}
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 3 && (
        <mesh position={[-0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Right Leg */}
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 4 && (
        <mesh position={[0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.075, 0.065, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Left Arm */}
      <mesh position={[-0.26, 1.0, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.26, 1.0, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>

      {/* Accent lighting when complete */}
      {progress === 4 && (
        <>
          <pointLight position={[0, 1.5, 0.5]} intensity={0.5} color="#10b981" />
          <pointLight position={[0, 0.5, 0.5]} intensity={0.3} color="#22d3ee" />
        </>
      )}
    </group>
  );
}

function FemaleAvatar({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const opacity = Math.min(progress / 4, 1);
  const heightScale = 0.6 + (progress / 4) * 0.4;

  const material = useMemo(
    () => (
      <meshStandardMaterial
        color="#e8c9b8"
        roughness={0.6}
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
        color="#ec4899"
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
        <sphereGeometry args={[0.14, 16, 16]} />
        {material}
      </mesh>
      {progress >= 1 && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Neck - slimmer */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.12, 12]} />
        {material}
      </mesh>

      {/* Torso - narrower shoulders, defined waist */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.11, 0.1, 0.4, 16]} />
        {material}
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.3, 16]} />
        {material}
      </mesh>
      {progress >= 2 && (
        <>
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.42, 16]} />
            {wireMaterial}
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.11, 0.14, 0.32, 16]} />
            {wireMaterial}
          </mesh>
        </>
      )}

      {/* Shoulders - narrower */}
      <mesh position={[-0.15, 1.15, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
        {material}
      </mesh>
      <mesh position={[0.15, 1.15, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
        {material}
      </mesh>

      {/* Hips - wider for female */}
      <mesh position={[0, 0.4, 0]} scale={[1.15, 0.8, 1]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        {material}
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 3 && (
        <mesh position={[-0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Right Leg */}
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.8, 12]} />
        {material}
      </mesh>
      {progress >= 4 && (
        <mesh position={[0.08, -0.05, 0]}>
          <cylinderGeometry args={[0.07, 0.06, 0.82, 12]} />
          {wireMaterial}
        </mesh>
      )}

      {/* Left Arm - slimmer */}
      <mesh position={[-0.2, 1.0, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.045, 0.04, 0.55, 12]} />
        {material}
      </mesh>

      {/* Right Arm - slimmer */}
      <mesh position={[0.2, 1.0, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.045, 0.04, 0.55, 12]} />
        {material}
      </mesh>

      {/* Accent lighting when complete */}
      {progress === 4 && (
        <>
          <pointLight position={[0, 1.5, 0.5]} intensity={0.5} color="#ec4899" />
          <pointLight position={[0, 0.5, 0.5]} intensity={0.3} color="#a855f7" />
        </>
      )}
    </group>
  );
}

export default function Avatar3DPreview({ uploadProgress, gender }: Avatar3DPreviewProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 2.5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color={gender === "male" ? "#10b981" : "#ec4899"} />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.5} color={gender === "male" ? "#22d3ee" : "#a855f7"} />
        
        {gender === "male" ? (
          <MaleAvatar progress={uploadProgress} />
        ) : (
          <FemaleAvatar progress={uploadProgress} />
        )}

        {/* Interactive Controls - drag to rotate, scroll to zoom, right-click to pan */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}