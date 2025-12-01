"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Environment, Float } from "@react-three/drei";

function FashionThreads({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  const count = 150; // Number of threads
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Generate random parameters for each thread
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.001 + Math.random() / 500; // Slower, elegant movement
      const xFactor = -40 + Math.random() * 80;
      const yFactor = -40 + Math.random() * 80;
      const zFactor = -20 + Math.random() * 40;
      // Assign random colors between the two brand colors
      const colorVar = Math.random(); 
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, colorVar });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    const scroll = scrollY.current;
    const scrollFactor = scroll * 0.002; // Influence of scroll on movement

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      
      // Update time for this particle
      t = particle.t += speed;
      
      // Calculate position using Lissajous curves for organic thread-like motion
      // Adding scroll influence to y and rotation
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10 - (scroll * 0.02), // Move up/down with scroll
        zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      
      // Rotate based on time and scroll
      dummy.rotation.set(
        s * 2 + scrollFactor, 
        s * 2 + scrollFactor, 
        s * 2
      );
      
      // Scale pulsates slightly
      const scale = Math.max(0.5, Math.abs(s) * 1.5);
      dummy.scale.set(scale * 0.05, scale * 3, scale * 0.05); // Long thin threads

      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      
      // Update color slightly based on position/scroll could be done here if using instanceColor
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
    // Rotate entire system slowly
    mesh.current.rotation.y = time * 0.05 + scroll * 0.0001;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {/* Cylinder geometry for thread-like appearance */}
      <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
      <meshPhysicalMaterial 
        color="#A89F91" 
        emissive="#C9B8B0"
        emissiveIntensity={0.2}
        transparent 
        opacity={0.6} 
        roughness={0.4}
        metalness={0.6}
      />
    </instancedMesh>
  );
}

function BackgroundScene({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#fff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#C9B8B0" />
      <FashionThreads scrollY={scrollY} />
      <Environment preset="city" />
    </>
  );
}

export function GlobalBackground() {
  const scrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none bg-background transition-colors duration-700">
      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 z-0" />
      
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 50 }} 
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <BackgroundScene scrollY={scrollY} />
      </Canvas>
    </div>
  );
}
