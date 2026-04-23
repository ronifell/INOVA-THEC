"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
const PARTICLE_COUNT = 200;

function SnowFrostParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, opacities, seeds, sizeMults] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const opa = new Float32Array(PARTICLE_COUNT);
    const sd = new Float32Array(PARTICLE_COUNT);
    const sz = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 30;
      const z = (Math.random() - 0.5) * 20 - 5;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      opa[i] = Math.random() * 0.45 + 0.15;
      sd[i] = Math.random() * 1000.0;
      /* Pouquíssimos grandes; maioria minúscula */
      const u = Math.random();
      if (u < 0.0035) {
        sz[i] = 7.5 + Math.random() * 9.0;
        opa[i] *= 0.68;
      } else if (u < 0.012) {
        sz[i] = 2.4 + Math.random() * 3.2;
        opa[i] *= 0.82;
      } else if (u < 0.2) {
        sz[i] = 0.85 + Math.random() * 1.1;
      } else {
        sz[i] = 0.16 + Math.random() * 0.58;
      }
    }
    return [pos, opa, sd, sz];
  }, []);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float aOpacity;
        attribute float aSeed;
        attribute float aSizeMult;
        varying float vOpacity;
        varying float vSeed;
        varying float vSizeMult;
        uniform float uTime;

        void main() {
          vec3 pos = position;

          pos.x += sin(uTime * 0.55 + aSeed * 0.01 + pos.y * 0.12) * 0.12;
          pos.z += sin(uTime * 0.3 + pos.x * 0.5) * 0.25;

          vOpacity = aOpacity;
          vSeed = aSeed;
          vSizeMult = aSizeMult;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          float basePx = 2.8 * (110.0 / -mvPosition.z);
          gl_PointSize = clamp(basePx * aSizeMult, 1.2, 220.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying float vOpacity;
        varying float vSeed;
        varying float vSizeMult;

        /* Cristal hexagonal delicado (referência: flocos de gelo cinematográficos) */
        float iceCrystal(vec2 uv, float t, float seed) {
          float r = length(uv) * 2.15;
          float ang = atan(uv.y, uv.x);
          float wobble = sin(seed * 0.01) * 0.08;

          float s6 = 6.2831853 / 6.0;
          float a = mod(ang + wobble + s6 * 0.5, s6) - s6 * 0.5;

          float mainSpoke = smoothstep(0.32, 0.04, abs(a)) * smoothstep(0.02, 0.48, r) * smoothstep(0.52, 0.22, r);
          float tipGlow = smoothstep(0.42, 0.48, r) * smoothstep(0.52, 0.45, r) * (0.4 + 0.6 * abs(cos(ang * 3.0)));

          float sideBranch = abs(sin(ang * 6.0 + t * 0.6 + seed * 0.02));
          sideBranch = smoothstep(0.2, 0.85, sideBranch) * smoothstep(0.18, 0.38, r) * smoothstep(0.46, 0.25, r);

          float lace = abs(sin(ang * 12.0 + seed * 0.03)) * smoothstep(0.28, 0.12, r) * smoothstep(0.1, 0.36, r);

          float hexCore = smoothstep(0.11, 0.02, r) * (0.55 + 0.45 * abs(cos(ang * 3.0 + t * 0.3)));

          float crystal = clamp(
            mainSpoke * 0.95 + sideBranch * 0.55 + lace * 0.4 + hexCore * 0.85 + tipGlow * 0.35,
            0.0, 1.0
          );

          float rim = smoothstep(0.52, 0.38, r) * smoothstep(0.15, 0.5, r);
          crystal = max(crystal, rim * 0.25);

          float softHalo = smoothstep(0.58, 0.2, r) * 0.2;
          return clamp(crystal + softHalo, 0.0, 1.0);
        }

        float hash11(float x) {
          return fract(sin(x * 127.1) * 43758.5453);
        }
        float hash21(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float hash31(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }

        /*
         * Twinkle claramente visível e imprevisível: eventos por “buckets” de tempo + hash.
         * Picos raros (flash) + médios + glitter fino — envelope suave para leitura humana.
         */
        float randomSparkle(vec2 pc, float seed, float t) {
          float off = seed * 0.00037;
          float bucket = floor(t * 3.8 + off * 200.0);
          float pulse = fract(t * 3.8 + off * 200.0);
          float env = smoothstep(0.0, 0.18, pulse) * smoothstep(1.0, 0.82, pulse);

          float hFlash = hash31(vec3(seed * 0.003, bucket, 19.7));
          float hMid = hash31(vec3(pc * 95.0, bucket + seed * 0.0009));
          float hTick = hash21(vec2(bucket * 3.17 + 11.0, seed * 0.004));

          float flash = step(0.84, hFlash) * env * (0.75 + 0.25 * hTick);
          float midTw = step(0.58, hMid) * step(0.45, hash11(bucket + seed * 0.02)) * env * 0.95;
          float glitter = pow(hash21(pc * 520.0 + fract(t * 41.3 + seed * 0.001)), 20.0);

          float pop = step(0.93, hash31(vec3(floor(t * 7.0), seed, pc.x * 200.0))) * env;
          return flash * 1.85 + midTw * 1.1 + glitter * 1.05 + pop * 0.75;
        }

        void main() {
          vec2 p = gl_PointCoord - vec2(0.5);

          /* Queda com arfagem / tombo como floco real: rotação + várias precessões por semente */
          float spinR = mix(0.35, 2.85, hash11(vSeed * 0.001257));
          float dir = sign(hash11(vSeed * 0.003891) - 0.5);
          float wA = 0.55 + hash11(vSeed * 0.00713) * 2.4;
          float wB = 0.62 + hash11(vSeed * 0.00291) * 2.0;
          float wC = 0.28 + hash11(vSeed * 0.00917) * 1.1;
          float tumble =
            fract(vSeed * 0.0103) * 6.2831853
            + uTime * spinR * dir
            + sin(uTime * wA + vSeed * 0.071) * 1.05
            + sin(uTime * wB * 1.37 + vSeed * 0.041) * 0.48
            + sin(uTime * wC * 2.1 + vSeed * 0.029) * 0.32
            + sin(uTime * spinR * 0.41 * dir + vSeed * 0.019) * 0.22;

          float c = cos(tumble);
          float s = sin(tumble);
          p = mat2(c, -s, s, c) * p;

          float detail = uTime * 0.35 + vSeed * 0.015;
          float shape = iceCrystal(p, detail, vSeed);

          if (shape < 0.035) discard;

          vec3 greenCore = vec3(0.86, 1.0, 0.9);
          vec3 greenBright = vec3(0.45, 0.96, 0.62);
          vec3 greenMid = vec3(0.2, 0.82, 0.42);
          vec3 greenDeep = vec3(0.08, 0.55, 0.24);
          vec3 col = mix(greenDeep, greenMid, pow(shape, 0.85));
          col = mix(col, greenBright, pow(shape, 0.45));
          col = mix(col, greenCore, pow(shape, 2.2) * 0.85);

          float spark = randomSparkle(gl_PointCoord, vSeed, uTime);
          float sp = min(spark, 2.4);
          float sparkW = 0.42 + 0.55 * smoothstep(0.12, 1.2, sp);
          vec3 twinkleHue = mix(vec3(0.24, 0.95, 0.46), vec3(0.82, 1.0, 0.88), pow(clamp(sp, 0.0, 1.0), 0.5));
          col += twinkleHue * sp * shape * sparkW * (0.52 + 0.48 * smoothstep(1.5, 16.0, vSizeMult));

          float a = shape * vOpacity;
          a *= 0.42 + 0.38 * shape;
          a += sp * 0.32 * vOpacity * shape;
          a *= 0.94 + 0.06 * hash11(floor(uTime * 11.0 + vSeed * 0.03));
          a = clamp(a, 0.0, 0.97);

          gl_FragColor = vec4(col, a);
        }
      `,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();

    shaderMaterial.uniforms.uTime.value = t;

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
        <bufferAttribute
          attach="attributes-aSizeMult"
          args={[sizeMults, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
    </points>
  );
}

function Scene() {
  const { gl } = useThree();

  useEffect(() => {
    /* Transparent: black + world map are drawn in GlobalBackgroundStack */
    gl.setClearColor(new THREE.Color(0, 0, 0), 0);
  }, [gl]);

  return <SnowFrostParticles />;
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 h-full w-full min-h-0">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 55 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
