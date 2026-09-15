import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface EarthquakeSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const EarthquakeScene: React.FC<EarthquakeSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const roomGroupRef = useRef<THREE.Group>(null);
  const ceilingLampRef = useRef<THREE.Group>(null);
  const booksRef = useRef<THREE.Group>(null);
  const wallClockRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);

  // Ceiling dust particles falling during earthquake
  const dustCount = 40;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dustParticles = useMemo(() => {
    return Array.from({ length: dustCount }).map(() => ({
      x: (Math.random() - 0.5) * 8,
      y: Math.random() * 4 + 1,
      z: (Math.random() - 0.5) * 8,
      speed: Math.random() * 0.04 + 0.02
    }));
  }, [dustCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (isSimulating && roomGroupRef.current) {
      // Natural earthquake vibrations
      const shakeX = Math.sin(t * 32) * 0.06 + Math.cos(t * 19) * 0.03;
      const shakeZ = Math.cos(t * 28) * 0.06 + Math.sin(t * 16) * 0.02;
      roomGroupRef.current.position.x = shakeX;
      roomGroupRef.current.position.z = shakeZ;
      roomGroupRef.current.rotation.z = Math.sin(t * 18) * 0.01;
    } else if (roomGroupRef.current) {
      roomGroupRef.current.position.set(0, 0, 0);
      roomGroupRef.current.rotation.set(0, 0, 0);
    }

    // Swinging overhead lamp
    if (ceilingLampRef.current) {
      ceilingLampRef.current.rotation.z = isSimulating ? Math.sin(t * 8) * 0.35 : 0;
      ceilingLampRef.current.rotation.x = isSimulating ? Math.cos(t * 7) * 0.25 : 0;
    }

    // Falling books & items jitter
    if (booksRef.current && isSimulating) {
      booksRef.current.position.y = -0.55 + Math.abs(Math.sin(t * 14)) * 0.04;
      booksRef.current.rotation.z = Math.sin(t * 12) * 0.2;
    }

    // Clock swinging on wall
    if (wallClockRef.current && isSimulating) {
      wallClockRef.current.rotation.z = Math.sin(t * 10) * 0.15;
    }

    // Falling plaster dust
    if (dustRef.current) {
      if (isSimulating) {
        dustParticles.forEach((p, i) => {
          p.y -= p.speed;
          if (p.y < 0) p.y = 4.8;
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(0.04, 0.04, 0.04);
          dummy.updateMatrix();
          dustRef.current!.setMatrixAt(i, dummy.matrix);
        });
        dustRef.current.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* High-Quality Classroom Illumination */}
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 1.3]} />
      <directionalLight position={[6, 12, 6]} intensity={2.4} color="#ffffff" castShadow />
      <directionalLight position={[-8, 6, 2]} intensity={1.8} color="#bae6fd" />

      {/* Emergency Swinging Lamp Light */}
      <pointLight
        position={[0, 4.2, 0]}
        intensity={isSimulating ? 3.5 + Math.sin(Date.now() * 0.03) * 1.5 : 2.5}
        color={isSimulating ? '#fef08a' : '#ffffff'}
        distance={16}
      />

      {/* Classroom Container */}
      <group ref={roomGroupRef} position={[0, -1.2, 0]}>

        {/* 1. SOLID CEILING with Acoustic Grid & Fluorescent Panels */}
        <group position={[0, 5.0, 0]}>
          {/* Main Ceiling Slab (Closes the top completely - NO MORE BLACK VOID) */}
          <mesh>
            <boxGeometry args={[14.2, 0.2, 12.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </mesh>
          {/* Ceiling Grid Beams */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[14.1, 0.05, 12.1]} />
            <meshStandardMaterial color="#e2e8f0" wireframe />
          </mesh>
          {/* 4 Inset Fluorescent LED Light Fixtures */}
          {[-2.5, 2.5].map((lx, i) => (
            <group key={`led-row-${i}`}>
              {[-1.8, 1.8].map((lz, j) => (
                <mesh key={`led-${i}-${j}`} position={[lx, -0.11, lz]}>
                  <boxGeometry args={[1.6, 0.04, 0.8]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={isSimulating ? (Math.sin(Date.now() * 0.02 + i) > 0.2 ? 1.5 : 0.3) : 1.2}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* 2. FLOOR: Classroom Vinyl Tiles with Border */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[14, 0.1, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Floor Baseboard Trim */}
        <mesh position={[0, 0.05, -4.85]}>
          <boxGeometry args={[13.8, 0.1, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* 3. BACK WALL (Front of Classroom) */}
        <mesh position={[0, 2.5, -4.9]}>
          <boxGeometry args={[14, 5.0, 0.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
        </mesh>
        {/* Lower Wall Accent Band (Indonesian School Blue) */}
        <mesh position={[0, 0.65, -4.82]}>
          <boxGeometry args={[14, 1.3, 0.04]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        </mesh>

        {/* 4. CHALKBOARD (FIXED: Proper Green Board with Wooden Frame Around Edge) */}
        <group position={[0, 2.8, -4.75]}>
          {/* Green Chalkboard Surface */}
          <mesh>
            <boxGeometry args={[7.2, 2.5, 0.06]} />
            <meshStandardMaterial color="#065f46" roughness={0.4} />
          </mesh>

          {/* Real Hollow Wooden Frame (4 distinct border bars, NOT a solid box!) */}
          {/* Top Frame */}
          <mesh position={[0, 1.28, 0.04]}>
            <boxGeometry args={[7.4, 0.1, 0.06]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>
          {/* Bottom Frame & Chalk Tray */}
          <mesh position={[0, -1.28, 0.08]}>
            <boxGeometry args={[7.4, 0.12, 0.15]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          {/* Left Frame */}
          <mesh position={[-3.65, 0, 0.04]}>
            <boxGeometry args={[0.1, 2.66, 0.06]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>
          {/* Right Frame */}
          <mesh position={[3.65, 0, 0.04]}>
            <boxGeometry args={[0.1, 2.66, 0.06]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>

          {/* Chalkboard Educational Text in 3D */}
          <Text
            position={[0, 0.7, 0.04]}
            fontSize={0.24}
            color="#fef08a"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            SIMULASI GEMPA BUMI: DROP, COVER, HOLD ON!
          </Text>
          <Text
            position={[0, 0.2, 0.04]}
            fontSize={0.16}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
          >
            1. Merunduk (Drop)  |  2. Berlindung di Bawah Meja  |  3. Pegang Kaki Meja
          </Text>
          <Text
            position={[0, -0.35, 0.04]}
            fontSize={0.14}
            color="#a7f3d0"
            anchorX="center"
            anchorY="middle"
          >
            Jauhi Kaca Jendela • Jangan Gunakan Lift • Tetap Tenang
          </Text>

          {/* Chalk Sticks & Eraser on Tray */}
          <mesh position={[-1.2, -1.22, 0.1]}>
            <boxGeometry args={[0.3, 0.06, 0.08]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.6, -1.22, 0.1]}>
            <boxGeometry args={[0.3, 0.06, 0.08]} />
            <meshStandardMaterial color="#fef08a" />
          </mesh>
          <mesh position={[0.5, -1.2, 0.1]}>
            <boxGeometry args={[0.5, 0.08, 0.12]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        </group>

        {/* 5. INDONESIAN FLAG & POSTERS above Chalkboard */}
        <group position={[0, 4.4, -4.75]}>
          {/* Garuda / National Emblem Banner */}
          <mesh position={[-2.5, 0, 0]}>
            <boxGeometry args={[1.2, 0.8, 0.03]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[-2.5, -0.4, 0]}>
            <boxGeometry args={[1.2, 0.02, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-2.5, -0.2, 0]}>
            <boxGeometry args={[1.2, 0.4, 0.035]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Text position={[-2.5, 0, 0.03]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle">
            INDONESIA
          </Text>

          {/* Safety Poster on Right */}
          <mesh position={[2.5, 0, 0]}>
            <boxGeometry args={[1.2, 0.8, 0.03]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <Text position={[2.5, 0.15, 0.03]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle">
            SIAGA BENCANA
          </Text>
          <Text position={[2.5, -0.15, 0.03]} fontSize={0.09} color="#fef08a" anchorX="center" anchorY="middle">
            BNPB CALL: 117
          </Text>
        </group>

        {/* 6. WALL CLOCK (Centered above chalkboard, proper orientation) */}
        <group ref={wallClockRef} position={[0, 4.4, -4.72]}>
          {/* Clock Outer Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          {/* Clock Face White */}
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* Clock Hands */}
          <mesh position={[0, 0.06, 0.05]}>
            <boxGeometry args={[0.03, 0.16, 0.01]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.05, 0, 0.05]}>
            <boxGeometry args={[0.14, 0.03, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* 7. LEFT WALL with Daylight Windows */}
        <group position={[-6.9, 2.5, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 5.0, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Lower accent band */}
          <mesh position={[0.04, -1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 1.3, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>

          {/* Realistic Window Insets */}
          {[-2.6, 1.8].map((wz, i) => (
            <group key={`win-${i}`} position={[0.12, 0.4, wz]} rotation={[0, Math.PI / 2, 0]}>
              {/* Glass with Daylight Glow */}
              <mesh>
                <boxGeometry args={[2.8, 2.2, 0.05]} />
                <meshStandardMaterial
                  color="#7dd3fc"
                  emissive="#38bdf8"
                  emissiveIntensity={0.6}
                  roughness={0.1}
                />
              </mesh>
              {/* Window Frame Mullions */}
              <mesh position={[0, 0, 0.04]}>
                <boxGeometry args={[2.9, 0.08, 0.05]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.04]}>
                <boxGeometry args={[0.08, 2.3, 0.05]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* 8. RIGHT WALL with Classroom Door */}
        <group position={[6.9, 2.5, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 5.0, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          {/* Lower accent band */}
          <mesh position={[-0.04, -1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 1.3, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>

          {/* Classroom Door (Exit) */}
          <group position={[-0.08, -0.6, -3.2]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[1.4, 2.8, 0.06]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            {/* Door Window Glass */}
            <mesh position={[0, 0.6, 0.02]}>
              <boxGeometry args={[0.7, 0.9, 0.05]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.7} />
            </mesh>
            {/* Door Handle */}
            <mesh position={[-0.5, 0, 0.05]}>
              <boxGeometry args={[0.12, 0.04, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            {/* Green Exit Sign */}
            <mesh position={[0, 1.7, 0.03]}>
              <boxGeometry args={[1.0, 0.35, 0.04]} />
              <meshStandardMaterial color="#15803d" emissive="#16a34a" emissiveIntensity={0.8} />
            </mesh>
            <Text position={[0, 1.7, 0.06]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle">
              JALUR EVAKUASI →
            </Text>
          </group>
        </group>

        {/* 9. TEACHER'S DESK & PODIUM */}
        <group position={[0, 0.45, -3.3]}>
          {/* Main Wooden Top */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[2.8, 0.1, 1.4]} />
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </mesh>
          {/* Front Privacy Panel */}
          <mesh position={[0, 0.05, -0.6]}>
            <boxGeometry args={[2.6, 0.7, 0.04]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          {/* Desk Sides */}
          {[-1.25, 1.25].map((tx, i) => (
            <mesh key={`tleg-${i}`} position={[tx, 0.05, 0]}>
              <boxGeometry args={[0.1, 0.7, 1.2]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
          {/* Teacher's Laptop */}
          <mesh position={[0.5, 0.53, 0]}>
            <boxGeometry args={[0.55, 0.03, 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0.5, 0.72, -0.18]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.55, 0.35, 0.03]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>
          {/* Book Stack */}
          <mesh position={[-0.8, 0.56, 0.2]}>
            <boxGeometry args={[0.4, 0.12, 0.5]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>

        {/* 10. STUDENT DESKS & CHAIRS (Clean, Proportional, Well-Aligned) */}
        {[-2.7, 0, 2.7].map((colX, colIdx) => (
          <group key={`col-${colIdx}`}>
            {[-1.3, 1.1].map((rowZ, rowIdx) => {
              const isCenterShelterDesk = colIdx === 1 && rowIdx === 0;

              return (
                <group key={`desk-${colIdx}-${rowIdx}`} position={[colX, 0, rowZ]}>
                  {/* Desk Top */}
                  <mesh position={[0, 0.72, 0]} castShadow>
                    <boxGeometry args={[1.6, 0.08, 0.95]} />
                    <meshStandardMaterial
                      color={isCenterShelterDesk ? '#f59e0b' : '#d97706'}
                      roughness={0.4}
                    />
                  </mesh>
                  {/* Under-desk Book Tray Shelf */}
                  <mesh position={[0, 0.55, 0]}>
                    <boxGeometry args={[1.4, 0.04, 0.75]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.6} />
                  </mesh>
                  {/* 4 Metal Legs */}
                  {[
                    [-0.7, -0.38],
                    [0.7, -0.38],
                    [-0.7, 0.38],
                    [0.7, 0.38]
                  ].map(([lx, lz], legIdx) => (
                    <mesh key={`leg-${legIdx}`} position={[lx, 0.36, lz]}>
                      <cylinderGeometry args={[0.03, 0.03, 0.72]} />
                      <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
                    </mesh>
                  ))}

                  {/* Student Chair (Facing blackboard / -z direction) */}
                  <group position={[0, 0, 0.78]}>
                    {/* Chair Seat */}
                    <mesh position={[0, 0.44, 0]}>
                      <boxGeometry args={[0.85, 0.06, 0.75]} />
                      <meshStandardMaterial color="#0284c7" roughness={0.4} />
                    </mesh>
                    {/* Chair Backrest (at rear +z of seat) */}
                    <mesh position={[0, 0.82, 0.32]}>
                      <boxGeometry args={[0.85, 0.5, 0.06]} />
                      <meshStandardMaterial color="#0284c7" roughness={0.4} />
                    </mesh>
                    {/* Chair 4 Metal Legs */}
                    {[
                      [-0.36, -0.28],
                      [0.36, -0.28],
                      [-0.36, 0.28],
                      [0.36, 0.28]
                    ].map(([cx, cz], ci) => (
                      <mesh key={`cleg-${ci}`} position={[cx, 0.22, cz]}>
                        <cylinderGeometry args={[0.02, 0.02, 0.44]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
                      </mesh>
                    ))}
                  </group>

                  {/* Highlighting on Central Shelter Desk */}
                  {isCenterShelterDesk && (
                    <group position={[0, 0.02, 0]}>
                      {/* Floor Safety Pulsing Marker */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[1.1, 1.25, 32]} />
                        <meshBasicMaterial
                          color="#f59e0b"
                          transparent
                          opacity={0.7}
                          side={THREE.DoubleSide}
                        />
                      </mesh>

                      {/* Interactive Button positioned neatly ON the shelter desk */}
                      <Html position={[0, 1.05, 0]} center distanceFactor={8}>
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            if (onActionClick) onActionClick('DROP_COVER_HOLD');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] shadow-[0_0_20px_rgba(245,158,11,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
                        >
                          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                          <span>BERLINDUNG DI BAWAH MEJA!</span>
                        </button>
                      </Html>
                    </group>
                  )}
                </group>
              );
            })}
          </group>
        ))}

        {/* 11. SCATTERED / FALLING BOOKS during earthquake */}
        <group ref={booksRef} position={[0, 0, 0]}>
          <mesh position={[-1.8, 0.06, 0.2]} rotation={[0, 0.5, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.5]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
          <mesh position={[1.8, 0.06, -0.4]} rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.5]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.4} />
          </mesh>
          <mesh position={[0.2, 0.06, 2.2]} rotation={[0, 0.8, 0]}>
            <boxGeometry args={[0.45, 0.09, 0.55]} />
            <meshStandardMaterial color="#10b981" roughness={0.4} />
          </mesh>
        </group>

        {/* 12. SWINGING OVERHEAD LAMP (Properly attached to ceiling) */}
        <group ref={ceilingLampRef} position={[0, 4.9, 0]}>
          {/* Ceiling Junction Box */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Suspension Cord */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Lamp Shade */}
          <mesh position={[0, -1.2, 0]}>
            <coneGeometry args={[0.55, 0.3, 24]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={isSimulating ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* 13. CEILING DUST PARTICLES */}
        <instancedMesh ref={dustRef} args={[undefined, undefined, dustCount]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
        </instancedMesh>
      </group>
    </group>
  );
};
