"use client";

import { Canvas } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import { OrbitControls, useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three-stdlib";

interface Avatar3DPreviewProps {
  uploadProgress: number; // 0-4
  gender: "male" | "female";
}

// Helper for ceramic material
const CeramicMaterial = ({ opacity = 1, color = "#E8E8E8" }: { opacity?: number, color?: string }) => (
  <meshStandardMaterial
    color={color}
    roughness={0.8} // Matte
    metalness={0.0} // Ceramic
    transparent={opacity < 1}
    opacity={opacity}
  />
);

function MaleAvatarFBX({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState(false);
  const opacity = 0.5 + (progress / 4) * 0.5; // Start at 0.5 visibility

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      '/models/male.fbx',
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim;
        fbx.scale.setScalar(scale);
        
        fbx.position.sub(center.multiplyScalar(scale));
        fbx.position.y = 0;
        
        // Apply ceramic material to all meshes
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!mesh.userData.originalMat) {
              mesh.userData.originalMat = mesh.material;
            }
            mesh.material = new THREE.MeshStandardMaterial({
              color: "#E0E0E0",
              roughness: 0.8,
              metalness: 0.0,
            });
          }
        });
        
        setModel(fbx);
      },
      undefined,
      (error) => {
        console.log('Male FBX model not found, using fallback geometry');
        setLoadError(true);
      }
    );
  }, []);

  // Apply opacity when model or progress changes
  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.opacity = opacity;
            mesh.material.transparent = opacity < 1;
          }
        }
      });
    }
  }, [model, opacity]);

  if (loadError) {
    return <MaleAvatar progress={progress} />;
  }

  if (!model) {
    return (
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <CeramicMaterial opacity={0.3} color="#d4b5a0" />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function FemaleAvatarFBX({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loadError, setLoadError] = useState(false);
  const opacity = 0.5 + (progress / 4) * 0.5;

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      '/models/female.fbx',
      (fbx) => {
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim;
        fbx.scale.setScalar(scale);
        
        fbx.position.sub(center.multiplyScalar(scale));
        fbx.position.y = 0;
        
        // Apply ceramic material to all meshes
        fbx.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (!mesh.userData.originalMat) {
              mesh.userData.originalMat = mesh.material;
            }
            mesh.material = new THREE.MeshStandardMaterial({
              color: "#E0E0E0",
              roughness: 0.8,
              metalness: 0.0,
            });
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        
        setModel(fbx);
      },
      undefined,
      (error) => {
        console.log('Female FBX model not found, using fallback geometry');
        setLoadError(true);
      }
    );
  }, []);
  // Apply opacity when model or progress changes
  useEffect(() => {
    if (model) {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.opacity = opacity;
            mesh.material.transparent = opacity < 1;
          }
        }
      });
    }
  }, [model, opacity]);

  if (loadError) {
    return <FemaleAvatar progress={progress} />;
  }

  if (!model) {
    return (
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.5, 1.8, 0.3]} />
        <CeramicMaterial opacity={0.3} color="#e8c9b8" />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function MaleAvatar({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const opacity = 0.5 + (progress / 4) * 0.5;
  const ceramicProps = { opacity, color: "#E0E0E0" };

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.13, 32, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.15, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Upper Body */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.45, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Hips/Lower Body */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.13, 0.2, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Shoulders/Arms (A-Pose) */}
      <group position={[0, 1.25, 0]}>
         {/* Left Shoulder */}
         <mesh position={[-0.22, -0.05, 0]} rotation={[0, 0, 0.4]} castShadow receiveShadow>
            <capsuleGeometry args={[0.06, 0.15, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         {/* Right Shoulder */}
         <mesh position={[0.22, -0.05, 0]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
            <capsuleGeometry args={[0.06, 0.15, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         
         {/* Left Arm */}
         <mesh position={[-0.35, -0.4, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
            <capsuleGeometry args={[0.05, 0.5, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         {/* Right Arm */}
         <mesh position={[0.35, -0.4, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
            <capsuleGeometry args={[0.05, 0.5, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
      </group>

      {/* Legs */}
      <group position={[0, 0.75, 0]}>
        {/* Left Leg */}
        <mesh position={[-0.1, -0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.85, 32]} />
          <CeramicMaterial {...ceramicProps} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.1, -0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.85, 32]} />
          <CeramicMaterial {...ceramicProps} />
        </mesh>
      </group>
    </group>
  );
}

function FemaleAvatar({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const opacity = 0.5 + (progress / 4) * 0.5;
  const ceramicProps = { opacity, color: "#E0E0E0" };

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.15, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Upper Body (Waist defined) */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.10, 0.35, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Hips/Lower Body */}
      <mesh position={[0, 0.88, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.10, 0.15, 0.25, 32]} />
        <CeramicMaterial {...ceramicProps} />
      </mesh>

      {/* Shoulders/Arms (A-Pose) */}
      <group position={[0, 1.28, 0]}>
         {/* Left Shoulder */}
         <mesh position={[-0.18, -0.05, 0]} rotation={[0, 0, 0.4]} castShadow receiveShadow>
            <capsuleGeometry args={[0.05, 0.12, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         {/* Right Shoulder */}
         <mesh position={[0.18, -0.05, 0]} rotation={[0, 0, -0.4]} castShadow receiveShadow>
            <capsuleGeometry args={[0.05, 0.12, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         
         {/* Left Arm */}
         <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
            <capsuleGeometry args={[0.04, 0.5, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
         {/* Right Arm */}
         <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
            <capsuleGeometry args={[0.04, 0.5, 4, 16]} />
            <CeramicMaterial {...ceramicProps} />
         </mesh>
      </group>

      {/* Legs */}
      <group position={[0, 0.75, 0]}>
        {/* Left Leg */}
        <mesh position={[-0.09, -0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.9, 32]} />
          <CeramicMaterial {...ceramicProps} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.09, -0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.06, 0.045, 0.9, 32]} />
          <CeramicMaterial {...ceramicProps} />
        </mesh>
      </group>
    </group>
  );
}

export default function Avatar3DPreview({ uploadProgress, gender }: Avatar3DPreviewProps) {
  return (
    <div className="w-full h-full bg-white">
      <Canvas
        camera={{ position: [0, 1.2, 3.5], fov: 45 }}
        gl={{ 
          alpha: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        shadows
      >
        <color attach="background" args={["#FFFFFF"]} />
        
        {/* 3-Point Lighting Setup */}
        {/* Key Light - Main source, strong, casting shadows */}
        <spotLight 
          position={[4, 4, 4]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1.5} 
          color="#ffffff" 
          castShadow 
          shadow-bias={-0.0001}
        />
        
        {/* Fill Light - Softer, opposite side, blueish tint for cool fill */}
        <pointLight position={[-4, 2, 4]} intensity={0.5} color="#e0f2fe" />
        
        {/* Rim Light - Back light, creates separation */}
        <spotLight position={[0, 4, -4]} intensity={1.5} color="#ffffff" />

        {/* Additional soft environment light */}
        <ambientLight intensity={0.2} />

        {/* Floor shadows */}
        <ContactShadows 
          resolution={1024} 
          scale={10} 
          blur={2.5} 
          opacity={0.4} 
          far={1}
          color="#000000"
        />

        <group position={[0, -0.9, 0]}>
          {gender === "male" ? (
            <MaleAvatarFBX progress={uploadProgress} />
          ) : (
            <FemaleAvatarFBX progress={uploadProgress} />
          )}
        </group>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.6} // Stop before going below ground
          autoRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}