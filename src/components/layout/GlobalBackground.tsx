"use client";

import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Environment, Float } from "@react-three/drei";

/**
 * VERTEX SHADER
 * Handles the "Cloth" simulation:
 * - Vertical flow (Sine/Cosine waves along Y)
 * - Simplex Noise for natural irregularities
 * - Interaction (Hover attraction, Click Shockwaves)
 */
const RIBBON_VERTEX_SHADER = `
    varying vec2 vUv;
    varying float vElevation;
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHoverState;
    uniform float uClickTime;
    uniform float uSeed;

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

      // 1. VERTICAL FLOW FLUIDITY
      // We want the ribbon to feel like it's suspended and flowing vertically
      float time = uTime * 0.2; 
      
      // Large vertical undulation - Increased amplitude for "open" flow
      float largeWave = sin(pos.y * 0.1 + time + uSeed) * 4.0;
      
      // Secondary ripples (Twisting effect)
      // Using noise to create non-uniform twists
      float twist = snoise(vec2(pos.y * 0.05 + uSeed, time * 0.5));
      float twistStr = twist * 8.0; // Widened twist
      
      // Apply twist to X based on Z - More spread
      pos.x += largeWave + cos(pos.y * 0.2 + time) * 3.0;
      pos.z += sin(pos.y * 0.15 + time) * 3.0 + twistStr;
      
      // Micro-details (Fabric crumple)
      float detail = snoise(pos.xy * 0.5 + time) * 0.5;
      pos.z += detail;
      
      // 2. MOUSE INTERACTION (Hover)
      // Pull ribbon towards mouse if close
      if (uHoverState > 0.0) {
        vec2 target = uMouse * 15.0; // World space approx
        float d = distance(pos.xy, target);
        float attraction = smoothstep(12.0, 0.0, d); // 1 at center, 0 at 12 units away
        
        // Move towards mouse
        pos.x = mix(pos.x, target.x, attraction * 0.5 * uHoverState);
        pos.y = mix(pos.y, target.y, attraction * 0.3 * uHoverState);
        pos.z += attraction * 5.0 * uHoverState; // Bulge out towards camera
      }
      
      // 3. CLICK SHOCKWAVE
      float tClick = uTime - uClickTime;
      if (tClick >= 0.0 && tClick < 3.0) {
         float waveSpeed = 10.0;
         float dist = distance(pos.xy, uMouse * 15.0);
         
         float wavePhase = dist - tClick * waveSpeed;
         float waveMask = smoothstep(2.0, 0.0, abs(wavePhase)); // Thin wave ring
         float waveDecay = exp(-tClick * 2.0);
         
         pos.z += sin(wavePhase) * waveMask * 4.0 * waveDecay;
      }

      vElevation = pos.z;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
      
      // Simple normal approximation for shading
      vNormal = normalize(vec3(largeWave, 1.0, 1.0)); // Rudimentary
    }`
  ;

/**
 * FRAGMENT SHADER
 * Handles the "Silk" Look:
 * - High contrast lighting (Shiny peaks, dark valleys)
 * - Rim lighting for elegance
 */
const RIBBON_FRAGMENT_SHADER = `
    uniform vec3 uColor;
    varying float vElevation;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // 1. Base Lighting based on elevation
      // High elevation = Light, Low = Shadow
      float lightFactor = smoothstep(-3.0, 4.0, vElevation);
      
      vec3 darkRed = uColor * 0.4;
      vec3 brightRed = uColor * 1.4;
      
      vec3 albedo = mix(darkRed, brightRed, lightFactor);
      
      // 2. Specular / Sheen (Fake anisotropic)
      // Silk reflects light at grazing angles
      vec3 viewDir = normalize(vViewPosition);
      // float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
      
      // We essentially fake the sheen by mapping elevation derivative or just high spots
      float sheen = smoothstep(2.0, 4.5, vElevation);
      albedo += vec3(1.0, 0.8, 0.8) * sheen * 0.3; // Add whiteish-red sheen
      
      gl_FragColor = vec4(albedo, 1.0);
    }
`;

function Ribbon({ mouseRef, hoverStateRef, clickTimeRef }: any) {
  const { viewport } = useThree();

  // Random Parameters created ONCE per mount
  const params = useMemo(() => {
    return {
      seed: Math.random() * 9999,
      // Random X Position: Anywhere within the viewport width
      xPos: (Math.random() - 0.5) * (viewport.width * 0.8),
      // Random Rotation: Slight tilt (-15 to 15 degrees)
      rotation: (Math.random() - 0.5) * (Math.PI / 6)
    };
  }, [viewport.width]); // Re-roll if viewport changes significantly (e.g. resize), mostly stable.

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#8a0000") }, // Deep Crimson Red
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHoverState: { value: 0 },
      uClickTime: { value: -1000 },
      uSeed: { value: params.seed },
    },
    vertexShader: RIBBON_VERTEX_SHADER,
    fragmentShader: RIBBON_FRAGMENT_SHADER,
    side: THREE.DoubleSide,
    // transparent: true, // Opaque for rich silk look
  }), [params.seed]);

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uMouse.value = mouseRef.current;
      material.uniforms.uHoverState.value = THREE.MathUtils.lerp(
        material.uniforms.uHoverState.value,
        hoverStateRef.current,
        1
      );
      material.uniforms.uClickTime.value = clickTimeRef.current;
    }
  });

  return (
    <mesh
      position={[params.xPos, 0, -5]}
      rotation={[0, 0, params.rotation]}
    >
      {/* 
         Geometry:
         Width: 12 (Wider to spread openly)
         Height: 200 (Extremely long)
         Segments: 50x200 (High density for smooth ripples)
      */}
      <planeGeometry args={[12, 200, 50, 200]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ------------------------------------------------------------------
// --- Utilities & Floating Threads (Background particles) ---
// ------------------------------------------------------------------

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
    const handleScroll = () => { scrollY.current = window.scrollY; };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Interaction check
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button') || target.closest('a') || (target.getAttribute && target.getAttribute('role') === 'button');
      hoverStateRef.current = isInteractive ? 1.0 : 0.0;
    };
    const handleClick = () => { clickTrigger.current.active = true; };

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