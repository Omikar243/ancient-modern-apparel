"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const fragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying float vElevation;

// Noise functions for organic gold pattern
float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 4

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    // Colors
    vec3 redColor = vec3(0.45, 0.05, 0.1); // Deep Royal Red
    vec3 goldColor = vec3(1.0, 0.8, 0.2);  // Bright Gold
    
    // Generate Pattern
    vec2 st = vUv * 4.0; // Scale pattern
    float n = fbm(st + vec2(0.0, uTime * 0.05)); // Slowly moving pattern
    
    // Create Gold Veins
    float vein = smoothstep(0.45, 0.55, n) - smoothstep(0.55, 0.65, n);
    float goldMix = vein + step(0.7, n) * 0.5; // Veins + some patches
    
    // Lighting / Sheen
    float light = 0.8 + vElevation * 0.4; // Highlight peaks
    float sheen = pow(max(0.0, vElevation), 3.0) * 0.5; // Specular on peaks
    
    // Mix
    vec3 finalColor = mix(redColor, goldColor, goldMix * 0.6);
    finalColor *= light;
    finalColor += sheen * vec3(1.0, 0.9, 0.8); // Add whitish-gold sheen
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // WIND & PHYSICS
    // Main billowing waves
    float bigWave = sin(pos.x * 0.5 + uTime * 0.7) * sin(pos.y * 0.5 + uTime * 0.6) * 1.5;
    
    // Secondary ripples
    float ripples = sin(pos.x * 2.0 - uTime * 1.5) * 0.2;
    float diagonal = sin((pos.x + pos.y) * 1.0 + uTime) * 0.3;
    
    // Mouse Interaction (Simple distance influence)
    // Assuming mouse is mapped roughly to world space or just creates local disturbance based on UV
    float dist = distance(uv - 0.5, uMouse * 0.5); // Rough approximation
    float mouseWave = smoothstep(0.5, 0.0, dist) * sin(uTime * 10.0) * 0.5;

    float elevation = bigWave + ripples + diagonal;
    
    pos.z += elevation;
    
    // Subtle rotation for wind effect
    pos.x += sin(uTime * 0.5) * 0.2;
    
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

function HugeCloth() {
  const mesh = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
    }),
    []
  );

  useFrame((state) => {
    if (mesh.current) {
      (mesh.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
      // Pass normalized mouse coordinates
      (mesh.current.material as THREE.ShaderMaterial).uniforms.uMouse.value.lerp(mouse, 0.1);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -8]} rotation={[-0.1, 0, 0]}>
      {/* Huge plane to cover background */}
      <planeGeometry args={[40, 40, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#1a0505]"> 
      {/* Deep dark red background fallback */}
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 45 }} 
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <HugeCloth />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}