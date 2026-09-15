import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { DisasterId } from '../types/disaster';
import { DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface DisasterMenuSceneProps {
  onSelect: (id: DisasterId) => void;
}

interface MenuNodeProps {
  id: DisasterId;
  angle: number;
  radius: number;
  onSelect: (id: DisasterId) => void;
}

const MenuNode: React.FC<MenuNodeProps> = ({ id, angle, radius, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const data = DISASTERS_DATA[id];

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.8 + angle;
      meshRef.current.rotation.x = Math.sin(t * 0.5 + angle) * 0.3;
      meshRef.current.position.y = Math.sin(t * 2 + angle) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 1.2;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.3}>
        {/* Outer Pulsing Aura Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[1.05, 1.15, 32]} />
          <meshBasicMaterial
            color={hovered ? '#ffffff' : data.color}
            transparent
            opacity={hovered ? 0.9 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 3D Holographic Node Geometry */}
        <mesh
          ref={meshRef}
          scale={hovered ? 1.25 : 1.0}
          onClick={() => {
            soundEngine.playClick();
            onSelect(id);
          }}
          onPointerOver={() => {
            setHovered(true);
            soundEngine.playHover();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color={hovered ? '#ffffff' : data.color}
            wireframe={!hovered}
            roughness={0.2}
            metalness={0.8}
            emissive={data.color}
            emissiveIntensity={hovered ? 2.5 : 1.0}
          />
        </mesh>

        {/* Core Glow Sphere */}
        <mesh scale={hovered ? 0.5 : 0.35}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={data.accentColor} />
        </mesh>

        {/* Disaster Title Text Label */}
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.28}
          color={hovered ? '#ffffff' : '#e2e8f0'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#020617"
        >
          {data.indonesianName}
        </Text>

        <Text
          position={[0, -1.5, 0]}
          fontSize={0.16}
          color={data.accentColor}
          anchorX="center"
          anchorY="middle"
        >
          {data.category}
        </Text>
      </Float>
    </group>
  );
};

export const DisasterMenuScene: React.FC<DisasterMenuSceneProps> = ({ onSelect }) => {
  const centralCoreRef = useRef<THREE.Mesh>(null);
  const ringBeltRef = useRef<THREE.Group>(null);
  const disasters: DisasterId[] = ['EARTHQUAKE', 'TSUNAMI', 'VOLCANO', 'FLOOD', 'LANDSLIDE', 'TORNADO'];
  const radius = 4.2;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (centralCoreRef.current) {
      centralCoreRef.current.rotation.y = t * 0.2;
      centralCoreRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    if (ringBeltRef.current) {
      ringBeltRef.current.rotation.y = -t * 0.05;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#06b6d4" distance={10} />
      <pointLight position={[0, 8, 8]} intensity={1.5} color="#ffffff" />

      {/* Central Holographic Earth Core */}
      <group ref={ringBeltRef}>
        <mesh ref={centralCoreRef}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshStandardMaterial
            color="#0f172a"
            wireframe
            emissive="#0284c7"
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* Circular Orbital Guide Tracks */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.04, radius + 0.04, 64]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.7 - 0.03, radius * 0.7 + 0.03, 64]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* 6 Disaster Orbital Nodes */}
        {disasters.map((id, index) => {
          const angle = (index / disasters.length) * Math.PI * 2;
          return (
            <MenuNode
              key={id}
              id={id}
              angle={angle}
              radius={radius}
              onSelect={onSelect}
            />
          );
        })}
      </group>
    </group>
  );
};
