"use client";

import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Environment, Float, shaderMaterial } from "@react-three/drei";

// --- Ribbon Shader Material ---
const RibbonMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#C41E3A"), // Matte Red
    uMouse: new THREE.Vector2(0, 0),
    uHoverState: 0,
    uClickTime: -1000,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying float vElevation;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHoverState;
    uniform float uClickTime;

    // Simplex 3D Noise 
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // 1. WIND SIMULATION (Low frequency, graceful)
      float time = uTime * 0.4; // Slow movement
      
      // Wind direction influence (Mouse X roughly steers wind)
      float windDir = uMouse.x * 0.5; 
      
      // Main undulation
      float noise = snoise(vec2(pos.x * 0.1 + time, pos.y * 0.2 + time)) * 2.0;
      
      // "Drag" physics: Trail behind (Offset phase based on X)
      float drag = -pos.x * 0.15;
      
      float elevation = sin(pos.x * 0.5 + time + drag) * 1.0 
                      + cos(pos.y * 0.3 + time) * 0.5;
      
      // Apply noise and wind direction
      elevation += noise;
      elevation += pos.x * windDir * 0.2; // Tilt with wind

      // 2. BUTTON HOVER (Turbulence / Attraction)
      if (uHoverState > 0.0) {
        // High frequency flutter
        float flutter = sin(pos.x * 10.0 + uTime * 15.0) * 0.1;
        elevation += flutter * uHoverState;
        
        // Magnetic pull towards mouse (Screen space approximation)
        // Map mouse (-1 to 1) to world space roughly (assuming view width ~20)
        vec2 target = uMouse * 10.0; 
        float dist = distance(pos.xy, target);
        float attraction = smoothstep(8.0, 0.0, dist); // Reach out
        
        // Deform z towards camera (or towards mouse z-plane)
        pos.z += attraction * 2.0 * uHoverState;
        pos.y += (target.y - pos.y) * attraction * 0.1 * uHoverState; // Slight y pull
      }

      // 3. CLICK SHOCKWAVE
      float timeSinceClick = uTime - uClickTime;
      if (timeSinceClick >= 0.0 && timeSinceClick < 2.0) {
         vec2 clickTarget = uMouse * 10.0; 
         float waveDist = distance(pos.xy, clickTarget);
         
         // Ripple expanding outward
         float wavePhase = waveDist * 2.0 - timeSinceClick * 15.0;
         float waveAmp = exp(-timeSinceClick * 3.0) * 2.0; // Decay
         float wave = sin(wavePhase) * waveAmp * smoothstep(0.0, 2.0, waveDist); // Don't distort center too wildly
         
         elevation += wave;
      }

      pos.z += elevation;
      vElevation = elevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vElevation;

    void main() {
      // Matte finish - no specular, soft diffuse look
      // Use elevation for pseudo-lighting/shadows to show form
      
      float lighting = smoothstep(-2.0, 2.0, vElevation);
      vec3 shadowColor = uColor * 0.6;
      vec3 lightColor = uColor * 1.1;
      
      vec3 finalColor = mix(shadowColor, lightColor, lighting);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ RibbonMaterial });

// --- Ribbon Component ---
function Ribbon({ mouseRef, hoverStateRef, clickTimeRef }: any) {
  const materialRef = useRef<any>();

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uMouse = mouseRef.current;
      // Smooth transition for hover state
      materialRef.current.uHoverState = THREE.MathUtils.lerp(
        materialRef.current.uHoverState, 
        hoverStateRef.current, 
        0.1
      );
      materialRef.current.uClickTime = clickTimeRef.current;
    }
  });

  return (
    <mesh position={[0, 0, -2]} rotation={[0, 0, Math.PI / 12]}>
      {/* Long strip geometry with enough segments for smooth deformation */}
      <planeGeometry args={[30, 3, 120, 30]} />
      {/* @ts-ignore */}
      <ribbonMaterial ref={materialRef} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// Helper to sync click time with shader clock
function ClickBridge({ clickTrigger, clickTimeRef }: any) {
   useFrame(({ clock }) => {
      if (clickTrigger.current.active) {
         clickTimeRef.current = clock.getElapsedTime();
         clickTrigger.current.active = false;
      }
   });
   return null;
}

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
        yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10 - (scroll * 0.02),
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
      dummy.scale.set(scale * 0.1, scale * 4, scale * 0.1); // Long thin threads

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
        color="#FFECE1" 
        emissive="#D4AF37"
        emissiveIntensity={0.4}
        transparent 
        opacity={0.9} 
        roughness={0.15}
        metalness={0.9}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

function BackgroundScene({ scrollY, mouseRef, hoverStateRef, clickTimeRef }: any) {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#fff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#C9B8B0" />
      <FashionThreads scrollY={scrollY} />
      <Ribbon mouseRef={mouseRef} hoverStateRef={hoverStateRef} clickTimeRef={clickTimeRef} />
      <Environment preset="city" />
    </>
  );
}

export function GlobalBackground() {
  const scrollY = useRef(0);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const hoverStateRef = useRef(0);
  const clickTimeRef = useRef(-1000);
  const clickTrigger = useRef({ active: false });
  
  useEffect(() => {
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Check for button hover
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button') || target.closest('a') || target.getAttribute('role') === 'button';
      hoverStateRef.current = isInteractive ? 1.0 : 0.0;
    };

    const handleClick = () => {
      clickTrigger.current.active = true;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none bg-background transition-colors duration-700">
      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-transparent to-background/5 z-0" />
      
      <Canvas 
        camera={{ position: [0, 0, 20], fov: 50 }} 
        dpr={[1, 2]} 
        gl={{ alpha: true, antialias: true }}
      >
        <ClickBridge clickTrigger={clickTrigger} clickTimeRef={clickTimeRef} />
        <BackgroundScene 
          scrollY={scrollY} 
          mouseRef={mouseRef} 
          hoverStateRef={hoverStateRef} 
          clickTimeRef={clickTimeRef} 
        />
      </Canvas>
    </div>
  );
}