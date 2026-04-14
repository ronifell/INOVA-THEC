"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const PARTICLE_COUNT = 400;
const GRID_SEGMENTS_X = 200;
const GRID_SEGMENTS_Y = 100;

const mouseNDC = new THREE.Vector2(0, 0);

if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

function SnowFrostParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const themeColor = useStore((s) => s.themeColor);

  const [positions, opacities, seeds] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const opa = new Float32Array(PARTICLE_COUNT);
    const sd = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 20 - 5;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      opa[i] = Math.random() * 0.45 + 0.15;
      sd[i] = Math.random() * 1000.0;
    }
    return [pos, opa, sd];
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uAccent: { value: new THREE.Color(themeColor) },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float aOpacity;
        attribute float aSeed;
        varying float vOpacity;
        varying float vSeed;
        varying float vDistToMouse;
        uniform float uTime;
        uniform vec2 uMouse;

        void main() {
          vec3 pos = position;

          vec2 screenPos = pos.xy / vec2(25.0, 15.0);
          float dist = distance(screenPos, uMouse);
          vDistToMouse = dist;

          float repulse = max(0.0, 1.0 - dist / 0.6) * 1.5;
          vec2 dir = normalize(screenPos - uMouse + 0.001);
          pos.xy += dir * repulse;

          pos.x += sin(uTime * 0.55 + aSeed * 0.01 + pos.y * 0.12) * 0.12;
          pos.z += sin(uTime * 0.3 + pos.x * 0.5) * 0.25;

          vOpacity = aOpacity;
          vSeed = aSeed;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float rep = repulse;
          gl_PointSize = max(2.5, (3.2 + rep * 3.5) * (110.0 / -mvPosition.z));
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uAccent;
        uniform float uTime;
        varying float vOpacity;
        varying float vDistToMouse;
        varying float vSeed;

        float snowflakeShape(vec2 uv, float detail) {
          float ang = atan(uv.y, uv.x);
          float r = length(uv) * 2.0;

          float arms = abs(cos(ang * 3.0));
          float dendrite = smoothstep(0.52, 0.0, r) * (0.15 + 0.85 * pow(arms, 0.65));

          float inner = smoothstep(0.12, 0.04, r);
          float branches = abs(sin(ang * 6.0 + detail)) * smoothstep(0.38, 0.12, r) * smoothstep(0.1, 0.22, r);

          float core = smoothstep(0.14, 0.02, r);

          float flake = clamp(dendrite * 0.85 + branches * 0.45 + core * 0.9, 0.0, 1.0);
          float soft = smoothstep(0.55, 0.0, r) * 0.35;
          return flake + soft;
        }

        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);
          float rot = vSeed * 0.00628318 + uTime * (0.15 + fract(vSeed * 0.001) * 0.2);
          float c = cos(rot);
          float s = sin(rot);
          p = mat2(c, -s, s, c) * p;

          float detail = uTime * 0.4 + vSeed * 0.02;
          float shape = snowflakeShape(p, detail);

          if (shape < 0.02) discard;

          float nearMouse = smoothstep(0.75, 0.0, vDistToMouse);

          vec3 frostCore = vec3(0.93, 0.97, 1.0);
          vec3 frostMid = vec3(0.78, 0.9, 0.98);
          vec3 frostEdge = vec3(0.62, 0.82, 0.95);
          vec3 col = mix(frostEdge, frostMid, shape);
          col = mix(col, frostCore, pow(shape, 0.5));

          vec3 acc = uAccent;
          col = mix(col, mix(col, acc * 0.55 + vec3(0.5), 0.35), nearMouse * 0.55);

          float a = shape * vOpacity * (0.28 + nearMouse * 0.42);
          a *= 0.85 + 0.15 * sin(uTime * 2.0 + vSeed * 0.01);

          gl_FragColor = vec4(col, a);
        }
      `,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    shaderMaterial.uniforms.uAccent.value.set(themeColor);
  }, [themeColor, shaderMaterial]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();

    shaderMaterial.uniforms.uTime.value = t;
    shaderMaterial.uniforms.uMouse.value.set(mouseNDC.x, mouseNDC.y);

    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3 + 1] -= 0.0065;
      arr[i * 3] +=
        Math.sin(t * 0.5 + i * 0.07) * 0.004 +
        Math.cos(t * 0.31 + arr[i * 3 + 2] * 0.2) * 0.003;
      if (arr[i * 3 + 1] < -15) {
        arr[i * 3 + 1] = 15;
        arr[i * 3] = (Math.random() - 0.5) * 50;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          args={[opacities, 1]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[seeds, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
    </points>
  );
}

function ReactiveGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  const themeColor = useStore((s) => s.themeColor);

  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      60,
      36,
      GRID_SEGMENTS_X,
      GRID_SEGMENTS_Y
    );
    return { geometry: geo };
  }, []);

  const gridMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      wireframe: true,
      uniforms: {
        uColor: { value: new THREE.Color(themeColor) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform vec2 uMouse;
        uniform float uTime;
        varying float vDistToMouse;
        varying float vElevation;

        void main() {
          vec3 pos = position;

          vec2 screenPos = pos.xy / vec2(30.0, 18.0);
          float dist = distance(screenPos, uMouse);
          vDistToMouse = dist;

          float wave = sin(pos.x * 0.3 + uTime * 0.5) * 0.2
                     + sin(pos.y * 0.4 + uTime * 0.3) * 0.15;

          float repulse = max(0.0, 1.0 - dist / 0.5);
          float elevation = repulse * repulse * 4.0 + wave;
          pos.z += elevation;
          vElevation = elevation;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vDistToMouse;
        varying float vElevation;

        void main() {
          float nearMouse = smoothstep(1.0, 0.0, vDistToMouse);
          float baseAlpha = 0.07;
          float alpha = baseAlpha + nearMouse * 0.4 + vElevation * 0.05;

          vec3 col = mix(uColor * 0.6, uColor * 1.4, nearMouse);
          col += vec3(1.0) * vElevation * 0.06;

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    gridMaterial.uniforms.uColor.value.set(themeColor);
  }, [themeColor, gridMaterial]);

  useFrame(({ clock }) => {
    gridMaterial.uniforms.uTime.value = clock.getElapsedTime();
    gridMaterial.uniforms.uMouse.value.set(mouseNDC.x, mouseNDC.y);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={gridMaterial}
      rotation={[-0.6, 0, 0]}
      position={[0, -4, -5]}
    />
  );
}

function HexagonalAccents() {
  const themeColor = useStore((s) => s.themeColor);
  const groupRef = useRef<THREE.Group>(null);

  const hexagons = useMemo(() => {
    const items: { x: number; y: number; z: number; scale: number; speed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 18,
        z: -10 - Math.random() * 5,
        scale: 0.3 + Math.random() * 0.6,
        speed: 0.2 + Math.random() * 0.5,
      });
    }
    return items;
  }, []);

  const hexGeo = useMemo(() => new THREE.CircleGeometry(1, 6), []);

  const color = useMemo(() => new THREE.Color(themeColor), [themeColor]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const hex = hexagons[i];
      child.position.y = hex.y + Math.sin(t * hex.speed + i) * 0.5;
      child.rotation.z = t * hex.speed * 0.3;
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(t * hex.speed + i * 2) * 0.02;
    });
  });

  return (
    <group ref={groupRef}>
      {hexagons.map((hex, i) => (
        <mesh
          key={i}
          geometry={hexGeo}
          position={[hex.x, hex.y, hex.z]}
          scale={hex.scale}
        >
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(new THREE.Color("#0F172A"), 1);
  }, [gl]);

  return (
    <>
      <SnowFrostParticles />
      <ReactiveGrid />
      <HexagonalAccents />
    </>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0" style={{ zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 55 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
