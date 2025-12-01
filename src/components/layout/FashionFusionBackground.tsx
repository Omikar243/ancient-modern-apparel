"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

function Particles({ count = 2000 }) {
    const mesh = useRef<THREE.Points>(null!);
    const { theme } = useTheme();

    // Generate random particles
    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 15;
            const y = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 15;
            temp[i * 3] = x;
            temp[i * 3 + 1] = y;
            temp[i * 3 + 2] = z;
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Rotate the entire system slowly
        mesh.current.rotation.x = time * 0.05;
        mesh.current.rotation.y = time * 0.03;

        // Wave effect
        const positions = mesh.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];

            // Simple wave motion based on position and time
            // We modify y slightly to create a "breathing" or "floating" fabric effect
            // But since we can't easily update individual particles in a performant way without a shader,
            // we'll stick to global rotation for now, or use a custom shader material if needed.
            // For this implementation, global rotation + camera movement gives a good enough effect.
        }
    });

    // Determine color based on theme or fixed fusion colors
    // Ancient Gold: #D4AF37
    // Modern Neon Blue: #00F3FF
    // We'll use a mix or a neutral that works for both.
    const color = theme === 'dark' ? "#00F3FF" : "#D4AF37";

    return (
        <Points ref={mesh} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={color}
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function Rig() {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();

    useFrame(() => {
        // Parallax effect based on mouse position
        camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, camera.position.z), 0.05);
        camera.lookAt(0, 0, 0);
    });

    return null;
}

export function FashionFusionBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <fog attach="fog" args={['#000', 5, 15]} />
                <ambientLight intensity={0.5} />
                <Particles count={3000} />
                <Rig />
            </Canvas>
        </div>
    );
}
