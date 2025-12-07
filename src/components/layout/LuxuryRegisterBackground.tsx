"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

// --- Gold Silk Ribbon Component ---
function Ribbon({ count = 12, width = 0.6, length = 12, color = "#C5A059" }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const noise3D = useMemo(() => createNoise3D(), []);

    // Create a strip geometry with high segment count for smoothness
    const geometry = useMemo(() => new THREE.PlaneGeometry(width, length, 1, 64), [width, length]);

    // Custom material for that premium "Silk" look
    // High metalness + lower roughness gives a sheen. 
    // Side DoubleSide so it looks good twisting.
    const material = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(color),
            roughness: 0.35,
            metalness: 0.6,
            clearcoat: 0.5,
            clearcoatRoughness: 0.4,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            flatShading: false,
        });
    }, [color]);

    // Initial positions
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 18;
            const y = (Math.random() - 0.5) * 12;
            const z = (Math.random() - 0.5) * 6 - 3;
            const speed = 0.15 + Math.random() * 0.3;
            temp.push({ x, y, z, speed, offset: Math.random() * 100 });
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        const time = state.clock.getElapsedTime();

        particles.forEach((particle, i) => {
            let { x, y, z, speed, offset } = particle;

            // Flowing silk motion
            const noiseX = noise3D(x * 0.08, time * 0.15 + offset, z * 0.1) * 2.5;
            const noiseY = noise3D(y * 0.1, z * 0.1, time * 0.1 + offset) * 2;
            // Introduce a twist rotation based on noise
            const noiseRot = noise3D(z * 0.1, x * 0.1, time * 0.15) * Math.PI * 2;

            // Gentle undulation
            const flowingY = y + Math.sin(time * 0.2 + offset) * 0.5;

            dummy.position.set(x + noiseX, flowingY + noiseY, z);

            // Complex rotation to simulate twisting fabric
            dummy.rotation.set(
                noiseRot * 0.3, // X tilt
                noiseRot * 0.8, // Y twist
                noiseRot * 0.2  // Z tilt
            );

            // Subtle breathing scale
            const scale = 1 + Math.sin(time * speed + offset) * 0.15;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[geometry, material, count]} receiveShadow castShadow />
    );
}

// --- Abstract Brushed Gold Ring Component ---
// Using Torus for the ring, with a noise texture bump map if possible, 
// strictly using standard materials here for reliability but tuned params.
function GoldRing({ position, scale = 1, rotationSpeed = 0.5 }: { position: [number, number, number], scale?: number, rotationSpeed?: number }) {
    const mesh = useRef<THREE.Mesh>(null);

    // Randomized initial rotation
    const initialRotation = useMemo(() => [Math.random() * Math.PI, Math.random() * Math.PI, 0], []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = initialRotation[0] + state.clock.getElapsedTime() * 0.1 * rotationSpeed;
            mesh.current.rotation.y = initialRotation[1] + state.clock.getElapsedTime() * 0.15 * rotationSpeed;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
            <mesh ref={mesh} position={position} scale={[scale, scale, scale]} castShadow receiveShadow>
                {/* Thin, elegant torus */}
                <torusGeometry args={[2.5, 0.03, 32, 100]} />
                <meshStandardMaterial
                    color="#D4B458"
                    roughness={0.6} // Brushed look -> higher roughness
                    metalness={1.0}
                />
            </mesh>
        </Float>
    );
}

export default function LuxuryRegisterBackground() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-[#FAFAF8]">
            <Canvas shadows camera={{ position: [0, 0, 12], fov: 40 }} dpr={[1, 2]}>
                {/* Immersive Lighting */}
                <ambientLight intensity={0.4} />
                <spotLight
                    position={[15, 15, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={1.5}
                    color="#FFF5E0"
                    castShadow
                    shadow-bias={-0.0001}
                />
                <pointLight position={[-10, -5, 5]} intensity={0.8} color="#FFD700" />

                {/* Studio Environment for reflections */}
                <Environment preset="city" environmentIntensity={0.6} />

                {/* Floating Elements */}
                <Ribbon count={15} width={0.5} length={10} color="#C5A059" />

                {/* Abstract Rings - scattered composition */}
                <GoldRing position={[-5, 3, -4]} scale={1.2} rotationSpeed={0.7} />
                <GoldRing position={[6, -2, -6]} scale={1.4} rotationSpeed={0.5} />
                <GoldRing position={[0, -5, -8]} scale={1.8} rotationSpeed={0.3} />
                <GoldRing position={[4, 5, -10]} scale={1.0} rotationSpeed={0.6} />

                {/* Soft Contact Shadows for depth grounding if objects get close to "wall" (optional, but adds realism) */}
                {/* <ContactShadows opacity={0.4} scale={30} blur={2} far={10} resolution={256} color="#000000" /> */}

                {/* Fog for depth blending */}
                <fog attach="fog" args={['#FAFAF8', 8, 30]} />
            </Canvas>

            {/* Grain/Texture Overlay for "Hyper-real" filmic look */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        </div>
    );
}
