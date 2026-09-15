import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface TornadoSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const TornadoScene: React.FC<TornadoSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const vortexGroupRef = useRef<THREE.Group>(null);
  const debrisInstRef = useRef<THREE.InstancedMesh>(null);
  const zincSheetsRef = useRef<THREE.Group>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);

  const debrisCount = 140;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Multi-tier tornado vortex particle data
  const particles = useMemo(() => {
    return Array.from({ length: debrisCount }).map((_, i) => {
      const height = (i / debrisCount) * 7.5;
      const radiusAtHeight = 0.5 + height * 0.5;
      const startAngle = Math.random() * Math.PI * 2;
      return {
        height,
        radiusAtHeight,
        angle: startAngle,
        angularSpeed: 4.0 + Math.random() * 3.5,
        radialJitter: Math.random() * 0.4,
        scale: Math.random() * 0.2 + 0.08
      };
    });
  }, [debrisCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Tornado wandering path on the ground
    if (vortexGroupRef.current) {
      if (isSimulating) {
        vortexGroupRef.current.position.x = Math.sin(t * 0.6) * 2.0;
        vortexGroupRef.current.position.z = Math.cos(t * 0.5) * 1.5;
        vortexGroupRef.current.rotation.y = t * 6.5;
      } else {
        vortexGroupRef.current.position.set(0, 0, 0);
      }
    }

    // Swirling debris funnel
    if (debrisInstRef.current && isSimulating) {
      particles.forEach((p, i) => {
        p.angle += p.angularSpeed * 0.03;
        const currentR = p.radiusAtHeight + Math.sin(t * 5 + i) * p.radialJitter;
        const x = Math.cos(p.angle) * currentR;
        const z = Math.sin(p.angle) * currentR;
        const y = p.height - 2.0;

        dummy.position.set(x, y, z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.rotation.set(t * 4 + i, t * 2, p.angle);
        dummy.updateMatrix();
        debrisInstRef.current!.setMatrixAt(i, dummy.matrix);
      });
      debrisInstRef.current.instanceMatrix.needsUpdate = true;
    }

    // Flying zinc roof sheets tumbling in air
    if (zincSheetsRef.current && isSimulating) {
      zincSheetsRef.current.rotation.y = t * 4;
      zincSheetsRef.current.position.y = 1.0 + Math.sin(t * 2) * 0.5;
    }

    // Occasional lightning flash
    if (lightningLightRef.current) {
      lightningLightRef.current.intensity = isSimulating && Math.random() > 0.93 ? 9 : 0;
    }
  });

  return (
    <group>
      {/* High-Visibility Storm Lighting */}
      <ambientLight intensity={1.4} />
      <hemisphereLight args={['#c4b5fd', '#312e81', 1.2]} />
      <directionalLight position={[6, 12, 6]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight position={[-6, 8, -4]} intensity={1.4} color="#818cf8" />
      <pointLight ref={lightningLightRef} position={[0, 7, 0]} color="#ffffff" distance={25} />
      <pointLight position={[4, 3, 3]} intensity={2.5} color="#8b5cf6" />

      {/* 1. Ground Terrain & Suburb Street */}
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <boxGeometry args={[20, 0.4, 18]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.98, 2.5]}>
        <boxGeometry args={[20, 0.05, 3.5]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* 2. Swirling Tornado Vortex */}
      <group ref={vortexGroupRef}>
        {/* Outer Translucent Funnel Shell */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[3.4, 7.5, 32, 1, true]} />
          <meshStandardMaterial
            color="#a78bfa"
            transparent
            opacity={0.5}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Dense Inner Vortex Core */}
        <mesh position={[0, 1.8, 0]}>
          <coneGeometry args={[1.8, 7.5, 24, 1, true]} />
          <meshStandardMaterial
            color="#7c3aed"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Instanced Swirling Debris & Dust Particles */}
        <instancedMesh ref={debrisInstRef} args={[undefined, undefined, debrisCount]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#ddd6fe"
            roughness={0.4}
            emissive="#8b5cf6"
            emissiveIntensity={1.2}
          />
        </instancedMesh>
      </group>

      {/* 3. Flying Zinc Roof Sheets (Atap Seng Beterbangan) */}
      <group ref={zincSheetsRef} position={[0, 1.5, 0]}>
        {[-1.8, 0.8, 1.6].map((zx, i) => (
          <mesh key={`zinc-${i}`} position={[zx, i * 0.8, Math.sin(i) * 1.5]} rotation={[0.4 * i, 0.8 * i, 0]}>
            <boxGeometry args={[1.4, 0.02, 0.8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 4. Reinforced Brick House with Interior Safe Room */}
      <group position={[4.2, -0.9, 1.2]}>
        {/* Exterior Walls (Reinforced Masonry) */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.4, 2.4, 3.2]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
        </mesh>
        {/* Exterior Windows (Warning: Danger Area!) */}
        <mesh position={[1.72, 0.4, 0]}>
          <boxGeometry args={[0.05, 1.0, 1.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>

        {/* Reinforced Interior Safe Room (Windowless Center Room) */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.6, 2.0, 1.6]} />
          <meshStandardMaterial color="#6d28d9" emissive="#8b5cf6" emissiveIntensity={2.0} />
        </mesh>

        {/* Heavy Reinforced Concrete Flat Roof */}
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[3.6, 0.25, 3.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        {/* Interactive Shelter Button */}
        <Html position={[0, 2.7, 0]} center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('INTERIOR_SHELTER');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-[0_0_20px_rgba(147,51,234,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>BERLINDUNG DI RUANGAN DALAM!</span>
          </button>
        </Html>
      </group>
    </group>
  );
};
