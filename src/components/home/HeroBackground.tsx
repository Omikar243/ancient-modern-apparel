"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Environment, Float } from "@react-three/drei";

function FloatingFabric() {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Create a custom geometry that we can animate
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(20, 10, 64, 64);
  }, []);

  const originalPositions = useMemo(() => {
    return geometry.attributes.position.array.slice();
  }, [geometry]);

  useFrame((state) => {
    if (!mesh.current) return;

    const time = state.clock.getElapsedTime();
    const positions = mesh.current.geometry.attributes.position;
    const array = positions.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];
      
      // Calculate wave movement
      // Combine multiple sine waves for more organic fabric-like movement
      const wave1 = 0.5 * Math.sin(x * 0.5 + time * 0.5);
      const wave2 = 0.3 * Math.cos(y * 0.3 + time * 0.4);
      const wave3 = 0.2 * Math.sin((x + y) * 0.5 + time * 0.2);
      
      // Mouse interaction effect (if we had mouse position access here easily, 
      // but for background, automated flowing is better + camera movement)
      
      array[i + 2] = wave1 + wave2 + wave3;
    }
    
    positions.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh 
        ref={mesh} 
        position={[0, 0, -2]} 
        rotation={[-Math.PI / 6, 0, 0]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <primitive object={geometry} />
        <meshPhysicalMaterial 
          color="#A89F91" // Primary color from design system
          roughness={0.4}
          metalness={0.1}
          transparent={true}
          opacity={0.15}
          side={THREE.DoubleSide}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
}

function MouseCameraControl() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    // Smoothly interpolate camera position based on mouse
    camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, 6), 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Particles() {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial color="#A89F91" transparent opacity={0.4} />
    </instancedMesh>
  );
}

export function HeroBackground() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10 opacity-60">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#A89F91" />
        <FloatingFabric />
        <Particles />
        <MouseCameraControl />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
