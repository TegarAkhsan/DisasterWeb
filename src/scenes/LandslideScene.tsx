import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface LandslideSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const LandslideScene: React.FC<LandslideSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const slidingWedgeRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const mudDebrisRef = useRef<THREE.Group>(null);

  const rainCount = 180;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const raindrops = useMemo(() => {
    return Array.from({ length: rainCount }).map(() => ({
      x: (Math.random() - 0.5) * 16,
      y: Math.random() * 8 + 1,
      z: (Math.random() - 0.5) * 14,
      speed: Math.random() * 0.16 + 0.12
    }));
  }, [rainCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Sliding soil displacement
    if (slidingWedgeRef.current) {
      if (isSimulating) {
        const slideProgress = (Math.sin(t * 0.7) + 1) * 0.5;
        slidingWedgeRef.current.position.x = 0.8 - slideProgress * 1.6;
        slidingWedgeRef.current.position.y = 0.6 - slideProgress * 1.8;
        slidingWedgeRef.current.position.z = -1.2 + slideProgress * 2.2;
        slidingWedgeRef.current.rotation.x = slideProgress * 0.3;
      } else {
        slidingWedgeRef.current.position.set(0.8, 0.6, -1.2);
        slidingWedgeRef.current.rotation.set(0, 0, 0);
      }
    }

    if (mudDebrisRef.current && isSimulating) {
      mudDebrisRef.current.position.y = (Math.sin(t * 1.2) + 1) * 0.05;
    }

    // Heavy monsoon rain falling
    if (rainRef.current) {
      raindrops.forEach((r, i) => {
        r.y -= r.speed;
        if (r.y < -2.2) r.y = 8.0;
        dummy.position.set(r.x, r.y, r.z);
        dummy.updateMatrix();
        rainRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* High-Visibility Mountain Weather Lighting */}
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#bae6fd', '#3f3f46', 1.3]} />
      <directionalLight position={[-6, 14, 6]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight position={[6, 8, -4]} intensity={1.4} color="#93c5fd" />
      <pointLight position={[3, 4, 2]} intensity={2.5} color="#84cc16" />

      {/* 1. Valley Floor & Mountain Road */}
      <mesh position={[0, -2.3, 0]} receiveShadow>
        <boxGeometry args={[20, 0.4, 18]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* Mountain Road Asphalt Strip */}
      <mesh position={[0, -2.05, 3.8]}>
        <boxGeometry args={[20, 0.1, 2.5]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Road Yellow Center Line */}
      <mesh position={[0, -1.99, 3.8]}>
        <boxGeometry args={[20, 0.01, 0.15]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* 2. Terraced Hill Slope (Terasering Pertanian) */}
      <group position={[0, 0.2, -2.5]}>
        {/* Tier 1 (Lowest Terraced Ridge) */}
        <mesh position={[0, -1.2, 1.2]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[14, 1.8, 4.5]} />
          <meshStandardMaterial color="#65a30d" roughness={0.7} />
        </mesh>
        {/* Tier 2 (Mid Terraced Ridge) */}
        <mesh position={[0, 0.2, 0]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[13, 2.4, 4.5]} />
          <meshStandardMaterial color="#4d7c0f" roughness={0.7} />
        </mesh>
        {/* Tier 3 (Upper Hill Crest) */}
        <mesh position={[0, 1.8, -1.5]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[12, 2.8, 4.5]} />
          <meshStandardMaterial color="#365314" roughness={0.8} />
        </mesh>

        {/* Tensile Fracture (Retakan Tanah Tapal Kuda) */}
        <mesh position={[0, 2.9, -1.8]} rotation={[0.45, 0, 0]}>
          <boxGeometry args={[9.5, 0.12, 0.25]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} />
        </mesh>
      </group>

      {/* 3. Sliding Soil & Rock Mass (Material Longsoran) */}
      <group ref={slidingWedgeRef} position={[0.8, 0.6, -1.2]}>
        {/* Displaced Saturated Clay Soil */}
        <mesh rotation={[0.45, 0, 0]}>
          <boxGeometry args={[5.2, 3.2, 3.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
        {/* Tumbling Boulders */}
        <group ref={mudDebrisRef}>
          <mesh position={[-1.0, 1.4, 0.8]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
          <mesh position={[1.2, 0.8, 1.1]}>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
          <mesh position={[0.2, -0.2, 1.6]}>
            <dodecahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color="#52525b" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* 4. Slope Stabilization: Bronjong Kawat (Gabion Wall) & Vetiver Grass */}
      <group position={[-4.0, -1.5, 0.8]}>
        {/* Gabion Wire Cage with Stones */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[3.8, 1.2, 1.1]} />
          <meshStandardMaterial color="#cbd5e1" wireframe roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[3.7, 1.1, 1.0]} />
          <meshStandardMaterial color="#64748b" roughness={0.85} />
        </mesh>
        {/* Vetiver Grass Plugs (Paku Bumi Alami) */}
        {[-1.3, -0.4, 0.4, 1.3].map((vx, i) => (
          <mesh key={`vet-${i}`} position={[vx, 1.35, 0]}>
            <coneGeometry args={[0.4, 1.1, 6]} />
            <meshStandardMaterial color="#84cc16" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* 5. Rain Particle System */}
      <instancedMesh ref={rainRef} args={[undefined, undefined, rainCount]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.65} />
      </instancedMesh>

      {/* 6. Perpendicular Safe Evacuation Route Indicator */}
      <group position={[-5.2, -0.8, 3.8]}>
        <Html center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('ESCAPE_PERPENDICULAR');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(132,204,22,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <span>LARI MENYAMPING DARI JALUR LONGSOR!</span>
          </button>
        </Html>
      </group>
    </group>
  );
};
