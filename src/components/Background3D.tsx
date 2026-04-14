"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

function Particles({ count = 600 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const themeColor = useStore((s) => s.themeColor);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const posAttr = mesh.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= delta * 0.3;
      if (arr[i * 3 + 1] < -10) {
        arr[i * 3 + 1] = 10;
        arr[i * 3] = (Math.random() - 0.5) * 30;
      }
    }
    posAttr.needsUpdate = true;
  });

  const color = useMemo(() => new THREE.Color(themeColor), [themeColor]);

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.25}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GridMesh() {
  const mesh = useRef<THREE.Mesh>(null);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const themeColor = useStore((s) => s.themeColor);
  const { viewport } = useThree();

  const onPointerMove = useCallback(
    (e: THREE.Event & { point: THREE.Vector3 }) => {
      mousePos.current.set(
        (e.point.x / viewport.width) * 2,
        (e.point.y / viewport.height) * 2
      );
    },
    [viewport]
  );

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 25, 80, 50);
    return g;
  }, []);

  const originalPositions = useMemo(() => {
    return new Float32Array(geo.attributes.position.array);
  }, [geo]);

  useFrame(() => {
    if (!mesh.current) return;
    const posAttr = mesh.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const mx = mousePos.current.x * 10;
    const my = mousePos.current.y * 6;

    for (let i = 0; i < arr.length / 3; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const dx = ox - mx;
      const dy = oy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - dist / 5);
      arr[i * 3 + 2] = influence * 1.5;
    }
    posAttr.needsUpdate = true;
  });

  const color = useMemo(() => new THREE.Color(themeColor), [themeColor]);

  return (
    <mesh
      ref={mesh}
      geometry={geo}
      rotation={[-0.3, 0, 0]}
      position={[0, -2, -5]}
      onPointerMove={onPointerMove}
    >
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <Particles />
      <GridMesh />
      <ambientLight intensity={0.3} />
    </>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "#0F172A" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
