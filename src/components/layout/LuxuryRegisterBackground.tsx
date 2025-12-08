"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

// --- Gold Silk Ribbon Component ---
function Ribbon({ count = 20, width = 0.4, length = 10, color = "#FFD700" }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const noise3D = useMemo(() => createNoise3D(), []);

    // Create a strip geometry
    // Width segments = 1, Height segments = 50 for smooth curve
    const geometry = useMemo(() => new THREE.PlaneGeometry(width, length, 1, 50), [width, length]);

    // Custom shader material for silky look
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.3,
            metalness: 0.8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
    }, [color]);

    // Initial positions
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 15;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 5 - 2; // Keep slightly behind
            const speed = 0.2 + Math.random() * 0.5;
            temp.push({ x, y, z, speed, offset: Math.random() * 100 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        const time = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            // Gentle floating movement
            let { x, y, z, speed, offset } = particle;

            // Calculate flow using noise
            const noiseX = noise3D(x * 0.1, time * 0.1 + offset, z * 0.1) * 2;
            const noiseY = noise3D(y * 0.1, z * 0.1, time * 0.1 + offset) * 2;
            const noiseRot = noise3D(z * 0.1, x * 0.1, time * 0.2) * Math.PI;

            dummy.position.set(x + noiseX, y + noiseY, z);
            dummy.rotation.set(noiseRot * 0.5, noiseRot, noiseRot * 0.2);

            // Scale variation
            const scale = 1 + Math.sin(time * speed + offset) * 0.2;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[geometry, material, count]} />
    );
}

// --- Abstract Brushed Gold Ring Component ---
function GoldRing({ position, scale = 1, rotationSpeed = 0.5 }: { position: [number, number, number], scale?: number, rotationSpeed?: number }) {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x += 0.002 * rotationSpeed;
            mesh.current.rotation.y += 0.005 * rotationSpeed;
            mesh.current.rotation.z += 0.001 * rotationSpeed;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={mesh} position={position} scale={[scale, scale, scale]}>
                <torusGeometry args={[3, 0.05, 16, 100]} />
                <meshStandardMaterial
                    color="#C5A059"
                    roughness={0.4}
                    metalness={0.9}
                />
            </mesh>
        </Float>
    );
}

export default function LuxuryRegisterBackground() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-neutral-50">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#FFF5E1" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#FFD700" />
                <Environment preset="studio" />

                {/* Floating Elements */}
                <Ribbon count={15} width={0.3} length={8} color="#E5C77F" />

                {/* Abstract Rings */}
                <GoldRing position={[-4, 2, -5]} scale={1.2} rotationSpeed={0.8} />
                <GoldRing position={[5, -3, -8]} scale={1.5} rotationSpeed={0.6} />
                <GoldRing position={[0, 0, -10]} scale={2} rotationSpeed={0.3} />

                {/* Fog for depth */}
                <fog attach="fog" args={['#ffffff', 5, 25]} />
            </Canvas>
            {/* Overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
        </div>
    );
}
