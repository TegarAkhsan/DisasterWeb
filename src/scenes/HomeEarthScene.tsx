import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface HomeEarthSceneProps {
  onSelectDisaster?: (id: string) => void;
}

export const HomeEarthScene: React.FC<HomeEarthSceneProps> = () => {
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  // Indonesian Archipelago procedurally placed islands (Sumatra, Java, Kalimantan, Sulawesi, Papua, Bali-Nusa Tenggara)
  const islands = useMemo(() => [
    { name: 'Sumatra', pos: [-1.4, 0.3, 2.2] as [number, number, number], rot: [0.3, -0.6, 0.4] as [number, number, number], scale: [0.9, 0.1, 0.35] as [number, number, number] },
    { name: 'Jawa', pos: [-0.6, -0.2, 2.4] as [number, number, number], rot: [0.1, 0.1, -0.1] as [number, number, number], scale: [0.8, 0.08, 0.25] as [number, number, number] },
    { name: 'Kalimantan', pos: [-0.7, 0.5, 2.3] as [number, number, number], rot: [0.2, 0.3, 0] as [number, number, number], scale: [0.7, 0.12, 0.6] as [number, number, number] },
    { name: 'Sulawesi', pos: [0.1, 0.3, 2.4] as [number, number, number], rot: [0.1, 0.8, 0.2] as [number, number, number], scale: [0.5, 0.1, 0.5] as [number, number, number] },
    { name: 'Bali-Nusa Tenggara', pos: [0.2, -0.3, 2.4] as [number, number, number], rot: [0.1, 0.2, 0] as [number, number, number], scale: [0.6, 0.06, 0.18] as [number, number, number] },
    { name: 'Maluku', pos: [0.7, 0.2, 2.3] as [number, number, number], rot: [0, 0.5, 0] as [number, number, number], scale: [0.4, 0.08, 0.3] as [number, number, number] },
    { name: 'Papua', pos: [1.3, -0.1, 2.1] as [number, number, number], rot: [-0.1, -0.4, -0.2] as [number, number, number], scale: [1.0, 0.1, 0.55] as [number, number, number] },
  ], []);

  // Ring of Fire hotspots
  const ringHotspots = useMemo(() => [
    { pos: [-1.6, 0.2, 2.15] as [number, number, number], color: '#ef4444', label: 'Megathrust Sumatra' },
    { pos: [-0.5, -0.3, 2.35] as [number, number, number], color: '#f59e0b', label: 'Sunda Arc / Merapi' },
    { pos: [0.1, 0.4, 2.35] as [number, number, number], color: '#ef4444', label: 'Sesar Palu-Koro' },
    { pos: [1.2, 0.0, 2.15] as [number, number, number], color: '#06b6d4', label: 'Palung New Guinea' }
  ], []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.05;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = -t * 0.02;
    }
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 8, 10]} intensity={1.8} color="#e0f2fe" />
      <pointLight position={[-10, -5, -5]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[0, 5, 5]} intensity={1.2} color="#06b6d4" distance={15} />

      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <group ref={earthRef}>
          {/* Base Globe (Deep Ocean Navy/Cyan) */}
          <mesh>
            <sphereGeometry args={[2.5, 64, 64]} />
            <meshStandardMaterial
              color="#021f3d"
              roughness={0.6}
              metalness={0.3}
              emissive="#03274f"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Glowing Continent Latitudes & Meridian Rings */}
          <mesh>
            <sphereGeometry args={[2.51, 24, 24]} />
            <meshBasicMaterial
              color="#0ea5e9"
              wireframe
              transparent
              opacity={0.12}
            />
          </mesh>

          {/* Indonesian Archipelago Floating Landmasses */}
          <group position={[0, 0, 0]}>
            {islands.map((island, idx) => (
              <group key={idx} position={island.pos} rotation={island.rot} scale={island.scale}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial
                    color="#10b981"
                    roughness={0.7}
                    emissive="#059669"
                    emissiveIntensity={0.4}
                  />
                </mesh>
                <mesh position={[0, 0.4, 0]} scale={[0.8, 0.8, 0.8]}>
                  <coneGeometry args={[0.3, 0.6, 4]} />
                  <meshStandardMaterial color="#047857" emissive="#065f46" emissiveIntensity={0.5} />
                </mesh>
              </group>
            ))}

            {/* Active Ring of Fire Hotspots Pulsing */}
            {ringHotspots.map((spot, i) => (
              <group key={`spot-${i}`} position={spot.pos}>
                <mesh>
                  <sphereGeometry args={[0.07, 16, 16]} />
                  <meshStandardMaterial
                    color={spot.color}
                    emissive={spot.color}
                    emissiveIntensity={2.5}
                  />
                </mesh>
                <mesh scale={[1.8, 1.8, 1.8]}>
                  <ringGeometry args={[0.08, 0.12, 16]} />
                  <meshBasicMaterial color={spot.color} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Atmosphere Inner Glow */}
          <mesh ref={atmosphereRef} scale={1.08}>
            <sphereGeometry args={[2.5, 48, 48]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.18}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>

        {/* Outer Orbital Hologram Ring */}
        <group ref={ringGroupRef} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[3.8, 0.015, 16, 100]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 3]}>
            <torusGeometry args={[4.2, 0.01, 16, 100]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
          </mesh>
        </group>
      </Float>

      {/* Cyber/Cosmic Sparkles */}
      <Sparkles
        count={250}
        scale={12}
        size={3}
        speed={0.4}
        opacity={0.35}
        color="#38bdf8"
      />
      <Sparkles
        count={80}
        scale={10}
        size={4}
        speed={0.8}
        opacity={0.5}
        color="#ef4444"
      />
    </group>
  );
};
