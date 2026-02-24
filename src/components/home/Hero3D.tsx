"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface Hero3DProps {
  gender?: "male" | "female";
}

// Procedural Fallback Avatars (Copied from Avatar3DPreview for standalone usage)
function MaleAvatarFallback({ visible }: { visible: boolean }) {
  // Always visible with minimum 0.4 opacity, fully opaque at 4 photos
  const opacity = 0.8;
  
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
        opacity={0.3}
      />
    ),
    []
  );

  if (!visible) return null;

  return (
    <group scale={[1.1, 1.1, 1.1]} position={[0, -1.2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        {material}
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        {wireMaterial}
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
        {material}
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.15, 0.14, 0.7, 16]} />
        {material}
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.15, 0.72, 16]} />
        {wireMaterial}
      </mesh>

      {/* Shoulders */}
      <mesh position={[-0.2, 1.15, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
        {material}
      </mesh>
      <mesh position={[0.2, 1.15, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
        {material}
      </mesh>

      {/* Hips */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        {material}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.82, 12]} />
        {wireMaterial}
      </mesh>
      
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.8, 12]} />
        {material}
      </mesh>
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.82, 12]} />
        {wireMaterial}
      </mesh>

      {/* Arms */}
      <mesh position={[-0.26, 1.0, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>
      <mesh position={[0.26, 1.0, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.05, 0.045, 0.55, 12]} />
        {material}
      </mesh>
    </group>
  );
}

function FemaleAvatarFallback({ visible }: { visible: boolean }) {
  const opacity = 0.8;

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
        opacity={0.3}
      />
    ),
    []
  );

  if (!visible) return null;

  return (
    <group scale={[1.1, 1.1, 1.1]} position={[0, -1.2, 0]}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        {material}
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        {wireMaterial}
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.12, 12]} />
        {material}
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.11, 0.1, 0.4, 16]} />
        {material}
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.13, 0.3, 16]} />
        {material}
      </mesh>
      
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.12, 0.11, 0.42, 16]} />
        {wireMaterial}
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.11, 0.14, 0.32, 16]} />
        {wireMaterial}
      </mesh>

      {/* Shoulders */}
      <mesh position={[-0.15, 1.15, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
        {material}
      </mesh>
      <mesh position={[0.15, 1.15, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
        {material}
      </mesh>

      {/* Hips */}
      <mesh position={[0, 0.4, 0]} scale={[1.15, 0.8, 1]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        {material}
      </mesh>

      {/* Legs */}
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.8, 12]} />
        {material}
      </mesh>
      <mesh position={[-0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.82, 12]} />
        {wireMaterial}
      </mesh>
      
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.8, 12]} />
        {material}
      </mesh>
      <mesh position={[0.08, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.82, 12]} />
        {wireMaterial}
      </mesh>

      {/* Arms */}
      <mesh position={[-0.2, 1.0, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.045, 0.04, 0.55, 12]} />
        {material}
      </mesh>
      <mesh position={[0.2, 1.0, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.045, 0.04, 0.55, 12]} />
        {material}
      </mesh>
    </group>
  );
}

function HeroModel({ gender }: { gender: "male" | "female" }) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [wireframeModel, setWireframeModel] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Reset error state when gender changes
  useEffect(() => {
    setLoadError(false);
    setModel(null);
  }, [gender]);

  useEffect(() => {
    const loader = new FBXLoader();
    const path = gender === "male" ? '/models/male.fbx' : '/models/female.fbx';
    
    loader.load(
      path,
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.2 / maxDim; // Slightly larger for hero
        fbx.scale.setScalar(scale);
        
        fbx.position.sub(center.multiplyScalar(scale));
        fbx.position.y = -1; // Position lower for hero view

        // Base shaded material
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshStandardMaterial({
              color: gender === "male" ? "#d4b5a0" : "#e8c9b8",
              roughness: 0.4,
              metalness: 0.3,
            });
          }
        });

        // Create a separate wireframe clone
        const wireClone = fbx.clone();
        wireClone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshBasicMaterial({
              color: gender === "male" ? "#10b981" : "#ec4899",
              wireframe: true,
              transparent: true,
              opacity: 0.1,
            });
          }
        });

        setModel(fbx);
        setWireframeModel(wireClone);
        setLoadError(false);
      },
      undefined,
      (error) => {
        console.log(`${gender} FBX model not found for hero, falling back to procedural`);
        setLoadError(true);
      }
    );
  }, [gender]);

  if (loadError) {
    return gender === "male" ? <MaleAvatarFallback visible={true} /> : <FemaleAvatarFallback visible={true} />;
  }

  if (!model) {
    // Show fallback while loading too, to avoid empty flicker
    return gender === "male" ? <MaleAvatarFallback visible={true} /> : <FemaleAvatarFallback visible={true} />;
  }

  return (
    <group ref={groupRef}>
      {model && <primitive object={model} />}
      {/* Wireframe overlay effect for "tech" feel */}
      {wireframeModel && <primitive object={wireframeModel} />}
    </group>
  );
}

export function Hero3D() {
  const [activeGender, setActiveGender] = useState<"male" | "female">("female");

  // Toggle gender every few seconds for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGender(prev => prev === "female" ? "male" : "female");
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        className="cursor-move"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#A89F91" />
        
        {/* Dynamic colored lights based on gender */}
        <pointLight 
          position={[2, 2, 2]} 
          intensity={0.8} 
          color={activeGender === "male" ? "#10b981" : "#ec4899"} 
        />
        
        <HeroModel gender={activeGender} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>
      
      {/* Interactive Toggle Overlay */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-10">
        <button 
          onClick={() => setActiveGender("female")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            activeGender === "female" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "bg-background/50 text-muted-foreground backdrop-blur hover:bg-background/80"
          }`}
        >
          Female
        </button>
        <button 
          onClick={() => setActiveGender("male")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            activeGender === "male" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "bg-background/50 text-muted-foreground backdrop-blur hover:bg-background/80"
          }`}
        >
          Male
        </button>
      </div>
    </div>
  );
}