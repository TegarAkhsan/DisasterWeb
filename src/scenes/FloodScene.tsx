import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface FloodSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const FloodScene: React.FC<FloodSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const debrisCarRef = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.PointLight>(null);
  const rescueBoatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Rising flood level
    if (waterRef.current) {
      if (isSimulating) {
        waterRef.current.position.y = -1.1 + Math.min(1.2, (Math.sin(t * 0.4) + 1) * 0.6);
      } else {
        waterRef.current.position.y = -1.9;
      }
    }

    // Car floating and drifting in water current
    if (debrisCarRef.current && isSimulating) {
      debrisCarRef.current.position.x = -1.5 + Math.sin(t * 0.6) * 0.4;
      debrisCarRef.current.rotation.y = 0.2 + Math.sin(t * 0.3) * 0.15;
      debrisCarRef.current.rotation.z = Math.sin(t * 0.8) * 0.08;
      debrisCarRef.current.position.y = (waterRef.current?.position.y || -1.1) + 0.35;
    }

    // Rescue boat bobbing
    if (rescueBoatRef.current && isSimulating) {
      rescueBoatRef.current.position.y = (waterRef.current?.position.y || -1.1) + 0.4;
      rescueBoatRef.current.rotation.z = Math.sin(t * 1.5) * 0.05;
    }

    // Power pole sparking
    if (sparkRef.current) {
      sparkRef.current.intensity = isSimulating ? (Math.random() > 0.8 ? 6 : 0.4) : 0;
    }
  });

  return (
    <group>
      {/* High-Visibility Daytime Lighting */}
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#bae6fd', '#64748b', 1.3]} />
      <directionalLight position={[6, 14, 8]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight position={[-6, 8, -4]} intensity={1.4} color="#93c5fd" />
      <pointLight ref={sparkRef} position={[-3.2, 1.2, -2.0]} color="#38bdf8" distance={10} />

      {/* 1. Submerged Urban Road & Sidewalks */}
      {/* Road Base */}
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <boxGeometry args={[18, 0.4, 16]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      {/* Sidewalk Curbs */}
      <mesh position={[0, -1.95, 3.5]}>
        <boxGeometry args={[18, 0.2, 1.5]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* 2. Rising Murky Urban Floodwater */}
      <mesh ref={waterRef} position={[0, -1.2, 0]}>
        <boxGeometry args={[18.2, 1.8, 16.2]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.12}
          metalness={0.35}
          transparent
          opacity={0.86}
          emissive="#0369a1"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 3. Indonesian Two-Story House (Safe Vertical Evacuation) */}
      <group position={[3.0, -0.6, -1.2]}>
        {/* Ground Floor (Submerged) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.8, 2.4, 3.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Ground Floor Entrance Door & Windows */}
        <mesh position={[0, -0.2, 1.72]}>
          <boxGeometry args={[0.9, 1.6, 0.05]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>

        {/* Second Floor (Safe Zone Above Water Level) */}
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[3.8, 1.8, 3.4]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.4} />
        </mesh>
        {/* 2nd Floor Balcony Railing */}
        <mesh position={[0, 1.4, 1.8]}>
          <boxGeometry args={[3.6, 0.8, 0.1]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Balcony Door */}
        <mesh position={[0, 2.0, 1.72]}>
          <boxGeometry args={[1.0, 1.6, 0.05]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>

        {/* Terracotta Tile Roof */}
        <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[3.1, 1.4, 4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>

        {/* Interactive 2nd Floor Safe Evacuation Point */}
        <Html position={[0, 2.8, 1.8]} center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('VERTICAL_EVACUATION');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-[0_0_20px_rgba(37,99,235,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
            <span>EVAKUASI KE LANTAI 2!</span>
          </button>
        </Html>
      </group>

      {/* 4. Electrical Power Pole (Hazard: Korsleting Listrik) */}
      <group position={[-3.2, -0.4, -2.0]}>
        {/* Concrete Pole */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 4.2]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {/* Crossarms with Insulators */}
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[1.6, 0.1, 0.1]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {[-0.6, 0.6].map((ix, i) => (
          <mesh key={`insul-${i}`} position={[ix, 3.35, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}

        {/* Yellow Electric MCB Circuit Breaker Box */}
        <mesh position={[0.2, 0.9, 0]}>
          <boxGeometry args={[0.3, 0.45, 0.22]} />
          <meshStandardMaterial color="#eab308" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>

        {/* Interactive MCB Power Cutoff Prompt */}
        <Html position={[0.2, 1.6, 0]} center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('SHUTOFF_MCB');
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-[0_0_15px_rgba(245,158,11,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border border-white pointer-events-auto"
          >
            <span>⚡ MATIKAN MCB LISTRIK!</span>
          </button>
        </Html>
      </group>

      {/* 5. Floating Car (Sedan drifting in current) */}
      <group ref={debrisCarRef} position={[-1.5, -0.6, 1.0]}>
        {/* Car Body Lower */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.0, 0.7, 1.1]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Car Cabin Roof */}
        <mesh position={[-0.1, 0.55, 0]}>
          <boxGeometry args={[1.2, 0.5, 0.95]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
        {/* Headlights */}
        <mesh position={[1.02, 0.1, -0.35]}>
          <boxGeometry args={[0.05, 0.15, 0.2]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* 6. Rubber Inflatable Rescue Boat (Perahu Karet BNPB/Basarnas) */}
      <group ref={rescueBoatRef} position={[-2.5, -0.6, 3.8]} rotation={[0, -0.3, 0]}>
        <mesh>
          <torusGeometry args={[1.0, 0.22, 12, 24]} />
          <meshStandardMaterial color="#ea580c" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[1.8, 0.05, 1.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
};
