import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import {
  ShieldCheck, AlertTriangle, XCircle,
  CheckCircle2, ArrowRight, Activity, ShieldAlert, Zap, Globe
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// EARTHQUAKE SCENE — High-Realism Seismic Simulation & Process Education
//
// Features:
//   • Ultra-Smooth Organic Wave Physics: Damped harmonic multi-frequency motion (no rigid jitter)
//   • Immersive Under-The-Desk Crouch Camera View: Smooth camera transition to under-the-desk POV
//     when user performs "DROP, COVER, HOLD ON"
//   • Chronological Educational Flow: Shows HOW tectonic earthquakes occur FIRST
//     (Stress Accumulation -> Fault Rupture -> P-Wave -> Violent S-Wave -> Mitigation)
//   • Dynamic room shake, swinging overhead lamp, sliding books & jittering desks
//   • Wall cracking, flickering fluorescent ceiling panels & emergency strobe
//   • Instanced falling plaster dust & concrete debris chunks from ceiling grid
//   • 3 Risk Zones: ZONA BAHAYA (Dekat Kaca Jendela), ZONA WASPADA (Area Terbuka), ZONA AMAN (Bawah Meja)
// ─────────────────────────────────────────────────────────────────────────────

interface EarthquakeSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

// ── Phase definitions (Chronological: Process first, then Mitigation) ──────
const PHASES = [
  'STABLE_CLASSROOM',
  'TECTONIC_STRESS_BUILDUP',
  'HYPOCENTER_ENERGY_RELEASE',
  'P_WAVE_TREMORS',
  'S_WAVE_VIOLENT_SHAKE',
  'STRUCTURAL_CRACKING',
  'AFTERMATH'
] as const;
type Phase = typeof PHASES[number];
const PHASE_TIMES = [0, 5, 12, 20, 28, 42, 54];

// ─────────────────────────────────────────────────────────────────────────────
// Inner 3D component — has access to useThree / useFrame
// ─────────────────────────────────────────────────────────────────────────────
interface SceneInnerProps extends EarthquakeSceneProps {
  onPhaseChange: (phase: Phase) => void;
  onSheltered: () => void;
  hasSheltered: boolean;
}

const EarthquakeSceneInner: React.FC<SceneInnerProps> = ({
  isSimulating = true,
  onActionClick,
  onPhaseChange,
  onSheltered,
  hasSheltered,
}) => {
  const { camera } = useThree();

  // ── Simulation refs ────────────────────────────────────────────────────────
  const simTime     = useRef(0);
  const phaseIndex  = useRef(0);
  const prevSim     = useRef(isSimulating);
  const lastPhase   = useRef<Phase>('STABLE_CLASSROOM');
  const shakeOffset = useRef(new THREE.Vector3());
  const camOrigin   = useRef(new THREE.Vector3());

  // Smooth Interpolation Targets for Room & Camera
  const targetRoomPos = useRef(new THREE.Vector3(0, -1.85, 0));
  const targetRoomRot = useRef(new THREE.Euler(0, 0, 0));
  const crouchCamPos  = useRef(new THREE.Vector3(0, -1.25, -0.6));
  const crouchCamLook = useRef(new THREE.Vector3(0, -0.5, -3.8));

  // ── Mesh refs ──────────────────────────────────────────────────────────────
  const roomGroupRef    = useRef<THREE.Group>(null);
  const ceilingLampRef  = useRef<THREE.Group>(null);
  const booksRef        = useRef<THREE.Group>(null);
  const wallClockRef    = useRef<THREE.Group>(null);
  const dustRef         = useRef<THREE.InstancedMesh>(null);
  const debrisRef       = useRef<THREE.InstancedMesh>(null);
  const wallCrackRef    = useRef<THREE.Group>(null);
  const emergencyLight  = useRef<THREE.PointLight>(null);

  // Reset clock on simulation toggle
  useEffect(() => {
    if (isSimulating && !prevSim.current) {
      simTime.current = 0;
      phaseIndex.current = 0;
      onPhaseChange('STABLE_CLASSROOM');
    }
    prevSim.current = isSimulating;
  }, [isSimulating, onPhaseChange]);

  // Save initial camera position for overview
  useEffect(() => {
    camOrigin.current.copy(camera.position);
  }, [camera]);

  // ── Instanced Dust & Falling Debris Data Setup ─────────────────────────────
  const dustCount = 80;
  const debrisCount = 35;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Falling plaster dust particles
  const dustParticles = useMemo(() => {
    return Array.from({ length: dustCount }).map(() => ({
      x: (Math.random() - 0.5) * 11.0,
      y: Math.random() * 4.5 + 0.5,
      z: (Math.random() - 0.5) * 9.0,
      speed: Math.random() * 0.05 + 0.02,
      scale: Math.random() * 0.06 + 0.02
    }));
  }, [dustCount]);

  // Falling concrete plaster debris chunks
  const debrisParticles = useMemo(() => {
    return Array.from({ length: debrisCount }).map(() => ({
      x: (Math.random() - 0.5) * 10.0,
      y: Math.random() * 4.8 + 1.0,
      z: (Math.random() - 0.5) * 8.5,
      speed: Math.random() * 0.12 + 0.06,
      rotSpeedX: (Math.random() - 0.5) * 6.0,
      rotSpeedY: (Math.random() - 0.5) * 6.0,
      scale: Math.random() * 0.14 + 0.04
    }));
  }, [debrisCount]);

  // ── Frame Animation Loop ───────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!isSimulating) return;

    simTime.current += delta;
    const t = simTime.current;

    // 1. Evaluate current phase
    let newPhaseIdx = 0;
    for (let i = PHASE_TIMES.length - 1; i >= 0; i--) {
      if (t >= PHASE_TIMES[i]) {
        newPhaseIdx = i;
        break;
      }
    }

    if (newPhaseIdx !== phaseIndex.current) {
      phaseIndex.current = newPhaseIdx;
      const p = PHASES[newPhaseIdx];
      if (p !== lastPhase.current) {
        lastPhase.current = p;
        onPhaseChange(p);
        if (p === 'S_WAVE_VIOLENT_SHAKE' || p === 'STRUCTURAL_CRACKING') {
          soundEngine.playEarthquakeRumble(4);
        }
      }
    }

    const currentPhase = PHASES[phaseIndex.current];
    const isPWave = currentPhase === 'P_WAVE_TREMORS';
    const isSWave = currentPhase === 'S_WAVE_VIOLENT_SHAKE' || currentPhase === 'STRUCTURAL_CRACKING';
    const isQuaking = isPWave || isSWave;

    // 2. Ultra-Smooth Seismic Vibration Physics (Multi-harmonic wave blending + Damped Lerp)
    if (roomGroupRef.current) {
      if (isSWave) {
        // High-realism S-Wave: multi-harmonic smooth wave synthesis
        const wave1 = Math.sin(t * 12.5) * 0.075;
        const wave2 = Math.cos(t * 18.2) * 0.045;
        const wave3 = Math.sin(t * 28.0) * 0.025;

        const targetX = wave1 + wave2 + wave3;
        const targetY = Math.abs(Math.sin(t * 14.0) * Math.cos(t * 10.0)) * 0.03;
        const targetZ = Math.cos(t * 14.5) * 0.065 + Math.sin(t * 22.1) * 0.035;

        targetRoomPos.current.set(targetX, -1.85 + targetY, targetZ);
        targetRoomRot.current.set(
          Math.cos(t * 11.0) * 0.012,
          0,
          Math.sin(t * 14.0) * 0.018
        );
      } else if (isPWave) {
        // Smooth P-Wave compression vibration
        const waveP = Math.sin(t * 28.0) * 0.022;
        targetRoomPos.current.set(waveP, -1.85, Math.cos(t * 26.0) * 0.018);
        targetRoomRot.current.set(0, 0, 0);
      } else {
        // Completely STABLE during initial process phases & aftermath
        targetRoomPos.current.set(0, -1.85, 0);
        targetRoomRot.current.set(0, 0, 0);
      }

      // Smooth lerp room movement for organic earth feeling
      roomGroupRef.current.position.lerp(targetRoomPos.current, delta * 14.0);
      roomGroupRef.current.rotation.x = THREE.MathUtils.lerp(roomGroupRef.current.rotation.x, targetRoomRot.current.x, delta * 12.0);
      roomGroupRef.current.rotation.z = THREE.MathUtils.lerp(roomGroupRef.current.rotation.z, targetRoomRot.current.z, delta * 12.0);
    }

    // 3. Dynamic Swinging Overhead Lamp Physics
    if (ceilingLampRef.current) {
      if (isSWave) {
        const lampZ = Math.sin(t * 7.5) * 0.42 + Math.cos(t * 13.0) * 0.12;
        const lampX = Math.cos(t * 6.5) * 0.32 + Math.sin(t * 11.0) * 0.10;
        ceilingLampRef.current.rotation.z = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.z, lampZ, delta * 8.0);
        ceilingLampRef.current.rotation.x = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.x, lampX, delta * 8.0);
      } else if (isPWave) {
        const lampZ = Math.sin(t * 5.0) * 0.10;
        ceilingLampRef.current.rotation.z = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.z, lampZ, delta * 6.0);
        ceilingLampRef.current.rotation.x = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.x, 0, delta * 6.0);
      } else {
        ceilingLampRef.current.rotation.z = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.z, 0, delta * 4.0);
        ceilingLampRef.current.rotation.x = THREE.MathUtils.lerp(ceilingLampRef.current.rotation.x, 0, delta * 4.0);
      }
    }

    // 4. Jittering Books & Items Sliding off Desks
    if (booksRef.current) {
      if (isSWave) {
        booksRef.current.position.y = -0.55 + Math.abs(Math.sin(t * 16)) * 0.07;
        booksRef.current.rotation.z = Math.sin(t * 12) * 0.30;
        booksRef.current.position.x = Math.sin(t * 8) * 0.10;
      } else {
        booksRef.current.position.set(0, 0, 0);
        booksRef.current.rotation.set(0, 0, 0);
      }
    }

    // 5. Wall Clock Swinging on Wall
    if (wallClockRef.current) {
      if (isQuaking) {
        wallClockRef.current.rotation.z = Math.sin(t * 10) * (isSWave ? 0.28 : 0.06);
      } else {
        wallClockRef.current.rotation.z = 0;
      }
    }

    // 6. Wall Cracks Expansion during Structural Cracking Phase
    if (wallCrackRef.current) {
      const isCracking = currentPhase === 'STRUCTURAL_CRACKING' || currentPhase === 'AFTERMATH';
      wallCrackRef.current.visible = isCracking;
    }

    // 7. Instanced Ceiling Plaster Dust & Falling Debris
    if (dustRef.current && isQuaking) {
      const mult = isSWave ? 2.0 : 0.8;
      dustParticles.forEach((p, i) => {
        p.y -= p.speed * mult;
        if (p.y < 0.1) p.y = 4.8;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    }

    if (debrisRef.current && isSWave) {
      debrisParticles.forEach((p, i) => {
        p.y -= p.speed * 1.5;
        if (p.y < 0.1) p.y = 4.9;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.rotation.set(t * p.rotSpeedX, t * p.rotSpeedY, 0);
        dummy.updateMatrix();
        debrisRef.current!.setMatrixAt(i, dummy.matrix);
      });
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // 8. Emergency Red Strobe Light Flashing
    if (emergencyLight.current) {
      emergencyLight.current.intensity = isSWave ? (Math.sin(t * 14) > 0 ? 5.0 : 0.5) : 0;
    }

    // 9. Camera View & Room Shake Handling
    if (hasSheltered) {
      // Under-the-desk crouch view when user clicks shelter button
      const crouchX = (isSWave ? Math.sin(t * 22) * 0.02 : 0);
      const crouchY = -0.85 + (isSWave ? Math.abs(Math.cos(t * 18)) * 0.015 : 0);
      const crouchZ = -1.6;

      crouchCamPos.current.set(crouchX, crouchY, crouchZ);
      camera.position.lerp(crouchCamPos.current, delta * 4.0);
      camera.lookAt(0, -0.2, -4.5);
    }
    // When not sheltered, OrbitControls handles camera position freely without frame hijacking!
  });

  return (
    <group>
      {/* ── High-Quality Classroom Lighting & Emergency Strobe ───────────── */}
      <ambientLight intensity={1.3} color="#f8fafc" />
      <hemisphereLight args={['#ffffff', '#cbd5e1', 1.2]} />
      <directionalLight position={[6, 12, 6]} intensity={2.2} color="#ffffff" castShadow />
      <directionalLight position={[-8, 6, 2]} intensity={1.6} color="#bae6fd" />

      {/* Emergency Red Flashing Alarm Point Light */}
      <pointLight ref={emergencyLight} position={[0, 4.2, -1.5]} color="#ef4444" distance={20} />

      {/* Emergency Swinging Lamp Yellow Spotlight */}
      <pointLight
        position={[0, 4.2, -1.5]}
        intensity={isSimulating ? 3.5 + Math.sin(Date.now() * 0.03) * 1.5 : 2.5}
        color={isSimulating ? '#fef08a' : '#ffffff'}
        distance={16}
      />

      {/* Classroom Container (Positioned at spacious wide-angle perspective Z = -1.5) */}
      <group ref={roomGroupRef} position={[0, -1.2, -1.5]}>

        {/* ── 1. SOLID CEILING with Acoustic Grid & Fluorescent Panels ──────── */}
        <group position={[0, 5.0, 0]}>
          {/* Main Ceiling Slab */}
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
                    emissiveIntensity={isSimulating ? (Math.sin(Date.now() * 0.02 + i) > 0.1 ? 1.6 : 0.2) : 1.2}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* ── 2. FLOOR: Classroom Vinyl Tiles with Border ───────────────────── */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[14, 0.1, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Floor Baseboard Trim */}
        <mesh position={[0, 0.05, -4.85]}>
          <boxGeometry args={[13.8, 0.1, 0.08]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* ── 3. BACK WALL (Front of Classroom) ─────────────────────────────── */}
        <mesh position={[0, 2.5, -4.9]}>
          <boxGeometry args={[14, 5.0, 0.2]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
        </mesh>
        {/* Lower Wall Accent Band (Indonesian School Blue) */}
        <mesh position={[0, 0.65, -4.82]}>
          <boxGeometry args={[14, 1.3, 0.04]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        </mesh>

        {/* ── Dynamic Structural Wall Cracks ────────────────────────────────── */}
        <group ref={wallCrackRef} position={[0, 2.5, -4.78]} visible={false}>
          {/* Main Diagonal Fracture Crack */}
          <mesh position={[-2.2, 0.8, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[3.2, 0.04, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
          <mesh position={[2.8, -0.4, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[2.8, 0.03, 0.02]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* ── 4. CHALKBOARD with Educational Guidance ──────────────────────── */}
        <group position={[0, 2.8, -4.75]}>
          {/* Green Chalkboard Surface */}
          <mesh>
            <boxGeometry args={[7.2, 2.5, 0.06]} />
            <meshStandardMaterial color="#065f46" roughness={0.4} />
          </mesh>

          {/* Wooden Frame */}
          <mesh position={[0, 1.28, 0.04]}>
            <boxGeometry args={[7.4, 0.1, 0.06]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>
          <mesh position={[0, -1.28, 0.08]}>
            <boxGeometry args={[7.4, 0.12, 0.15]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          <mesh position={[-3.65, 0, 0.04]}>
            <boxGeometry args={[0.1, 2.66, 0.06]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} />
          </mesh>
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
          >
            FISIKA TEKTONIK & GEMPA BUMI
          </Text>
          <Text
            position={[0, 0.2, 0.04]}
            fontSize={0.16}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
          >
            Tekanan Lempeng → Patahan Hiposentrum → Gelombang P & S → Guncangan
          </Text>
          <Text
            position={[0, -0.35, 0.04]}
            fontSize={0.14}
            color="#a7f3d0"
            anchorX="center"
            anchorY="middle"
          >
            Mitigasi Utama: Drop, Cover, Hold On di bawah Meja Kokoh
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

        {/* ── 5. INDONESIAN FLAG & SAFETY POSTERS ──────────────────────────── */}
        <group position={[0, 4.4, -4.75]}>
          {/* Garuda Banner */}
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

          {/* Safety Poster */}
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

        {/* ── 6. WALL CLOCK ─────────────────────────────────────────────────── */}
        <group ref={wallClockRef} position={[0, 4.4, -4.72]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.05, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.33, 0.33, 0.02, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.06, 0.05]}>
            <boxGeometry args={[0.03, 0.16, 0.01]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.05, 0, 0.05]}>
            <boxGeometry args={[0.14, 0.03, 0.01]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* ── 7. LEFT WALL with Daylight Windows (ZONA BAHAYA) ──────────────── */}
        <group position={[-6.9, 2.5, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 5.0, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          <mesh position={[0.04, -1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 1.3, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>

          {/* Window Insets */}
          {[-2.6, 1.8].map((wz, i) => (
            <group key={`win-${i}`} position={[0.12, 0.4, wz]} rotation={[0, Math.PI / 2, 0]}>
              <mesh>
                <boxGeometry args={[2.8, 2.2, 0.05]} />
                <meshStandardMaterial
                  color="#7dd3fc"
                  emissive="#38bdf8"
                  emissiveIntensity={0.6}
                  roughness={0.1}
                />
              </mesh>
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

        {/* 3D Hazard Label near Windows */}
        <Html position={[-6.2, 0.8, -0.4]} center distanceFactor={14}>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500/80 text-red-300 text-[9px] font-black tracking-wide shadow-lg backdrop-blur-sm pointer-events-none select-none">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>ZONA BAHAYA — PECAHAN KACA JENDELA</span>
          </div>
        </Html>

        {/* ── 8. RIGHT WALL with Classroom Door (Evacuation Exit) ─────────── */}
        <group position={[6.9, 2.5, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 5.0, 0.2]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
          </mesh>
          <mesh position={[-0.04, -1.85, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[12, 1.3, 0.04]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>

          {/* Classroom Door */}
          <group position={[-0.08, -0.6, -3.2]} rotation={[0, -Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[1.4, 2.8, 0.06]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.6, 0.02]}>
              <boxGeometry args={[0.7, 0.9, 0.05]} />
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.5, 0, 0.05]}>
              <boxGeometry args={[0.12, 0.04, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.7, 0.03]}>
              <boxGeometry args={[1.0, 0.35, 0.04]} />
              <meshStandardMaterial color="#15803d" emissive="#16a34a" emissiveIntensity={0.8} />
            </mesh>
            <Text position={[0, 1.7, 0.06]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle">
              JALUR EVAKUASI →
            </Text>
          </group>
        </group>

        {/* ── 9. TEACHER'S DESK & PODIUM ───────────────────────────────────── */}
        <group position={[0, 0.45, -3.3]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[2.8, 0.1, 1.4]} />
            <meshStandardMaterial color="#b45309" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.05, -0.6]}>
            <boxGeometry args={[2.6, 0.7, 0.04]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          {[-1.25, 1.25].map((tx, i) => (
            <mesh key={`tleg-${i}`} position={[tx, 0.05, 0]}>
              <boxGeometry args={[0.1, 0.7, 1.2]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
          {/* Laptop */}
          <mesh position={[0.5, 0.53, 0]}>
            <boxGeometry args={[0.55, 0.03, 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0.5, 0.72, -0.18]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.55, 0.35, 0.03]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* ── 10. STUDENT DESKS & CHAIRS with Interactive Shelter Target ───── */}
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
                  {/* Under-desk Shelf */}
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

                  {/* Student Chair */}
                  <group position={[0, 0, 0.78]}>
                    <mesh position={[0, 0.44, 0]}>
                      <boxGeometry args={[0.85, 0.06, 0.75]} />
                      <meshStandardMaterial color="#0284c7" roughness={0.4} />
                    </mesh>
                    <mesh position={[0, 0.82, 0.32]}>
                      <boxGeometry args={[0.85, 0.5, 0.06]} />
                      <meshStandardMaterial color="#0284c7" roughness={0.4} />
                    </mesh>
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

                  {/* Highlighting & Interactive Button on Central Shelter Desk */}
                  {isCenterShelterDesk && (
                    <group position={[0, 0.02, 0]}>
                      {/* Floor Safety Pulsing Marker */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[1.1, 1.35, 32]} />
                        <meshBasicMaterial
                          color="#22c55e"
                          transparent
                          opacity={0.8}
                          side={THREE.DoubleSide}
                        />
                      </mesh>

                      {/* Interactive Shelter Target Button */}
                      <Html position={[0, 1.05, 0]} center distanceFactor={8}>
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            if (onActionClick) onActionClick('DROP_COVER_HOLD');
                            onSheltered();
                          }}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-black text-xs shadow-2xl transition-all border-2 pointer-events-auto cursor-pointer ${
                            hasSheltered
                              ? 'bg-emerald-600 text-white border-emerald-300 scale-105 shadow-[0_0_25px_rgba(34,197,94,0.8)]'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-200 hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse'
                          }`}
                        >
                          {hasSheltered ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>BERLINDUNG DI BAWAH MEJA (AMAN)!</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
                              <span>DROP, COVER, HOLD ON! (+50 XP)</span>
                            </>
                          )}
                        </button>
                      </Html>
                    </group>
                  )}
                </group>
              );
            })}
          </group>
        ))}

        {/* ── 11. SCATTERED / FALLING BOOKS ─────────────────────────────────── */}
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

        {/* ── 12. SWINGING OVERHEAD LAMP ────────────────────────────────────── */}
        <group ref={ceilingLampRef} position={[0, 4.9, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.2]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <coneGeometry args={[0.55, 0.3, 24]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fef08a"
              emissiveIntensity={isSimulating ? 2.5 : 1.2}
            />
          </mesh>
        </group>

        {/* ── 13. INSTANCED CEILING PLASTER DUST PARTICLES ─────────────────── */}
        <instancedMesh ref={dustRef} args={[undefined, undefined, dustCount]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.65} />
        </instancedMesh>

        {/* ── 14. INSTANCED FALLING CONCRETE PLASTER DEBRIS CHUNKS ──────────── */}
        <instancedMesh ref={debrisRef} args={[undefined, undefined, debrisCount]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.7} />
        </instancedMesh>

      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Outer Component with State & HTML Overlays
// ─────────────────────────────────────────────────────────────────────────────
export const EarthquakeScene: React.FC<EarthquakeSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('STABLE_CLASSROOM');
  const [hasSheltered, setHasSheltered] = useState(false);

  const handleSheltered = useCallback(() => {
    setHasSheltered(true);
  }, []);

  // Reset shelter status when sim restarts
  useEffect(() => {
    if (currentPhase === 'STABLE_CLASSROOM') {
      setHasSheltered(false);
    }
  }, [currentPhase]);

  // Phase educational content mapping (Chronological: Process first, then Mitigation)
  const phaseUI: Record<Phase, { icon: React.ReactNode; color: string; title: string; desc: string }> = {
    STABLE_CLASSROOM: {
      icon: <Activity className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-950/80',
      title: 'KONDISI NORMAL — SEBELUM GEMPA',
      desc: 'Ruang kelas dalam keadaan tenang. Lempeng tektonik bumi secara konstan saling bergeser di kedalaman tanah.',
    },
    TECTONIC_STRESS_BUILDUP: {
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-950/80',
      title: 'PROSES 1: AKUMULASI TEKANAN TEKTONIK',
      desc: 'Lempeng bumi terus mendorong. Energi potensial terkumpul di garis patahan sesar (fault line) hingga melampaui batas batuan.',
    },
    HYPOCENTER_ENERGY_RELEASE: {
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/80',
      title: 'PROSES 2: PATAHAN SESAR & PELEPASAN ENERGI',
      desc: 'Batuan patah mendadak di hiposentrum! Pelepasan energi dahsyat merambat ke permukaan sebagai gelombang seismik.',
    },
    P_WAVE_TREMORS: {
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
      color: 'border-orange-500/40 bg-orange-950/80',
      title: 'PROSES 3: GELOMBANG P (PRIMER) TIBA',
      desc: 'Gelombang kompresi tercepat tiba lebih dulu. Lampu & meja bergetar halus. Ini sinyal peringatan awal gempa!',
    },
    S_WAVE_VIOLENT_SHAKE: {
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/50 bg-red-950/85 animate-pulse',
      title: 'PROSES 4: GELOMBANG S (SEKUNDER) HEBAT!',
      desc: 'Guncangan melintang merusak menghantam! SEGERA LAKUKAN DROP, COVER, HOLD ON di bawah meja kokoh!',
    },
    STRUCTURAL_CRACKING: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/50 bg-amber-950/85 animate-pulse',
      title: 'PROSES 5: KERUSAKAN STRUKTUR & PLASTER JATUH',
      desc: 'Dinding retak & puing plafon berjatuhan. Tetap terlindung di bawah meja kokoh hingga guncangan mereda!',
    },
    AFTERMATH: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-600/60 bg-emerald-950/80',
      title: 'PASCA GEMPA — EVAKUASI KE OUTDOOR',
      desc: 'Guncangan mereda. Berjalan tenang menyusuri Jalur Evakuasi menuju Titik Kumpul Aman di lapangan terbuka.',
    },
  };

  const ui = phaseUI[currentPhase];

  return (
    <group>
      {/* ── 3D Scene Inner ──────────────────────────────────────────────── */}
      <EarthquakeSceneInner
        isSimulating={isSimulating}
        onActionClick={onActionClick}
        onPhaseChange={setCurrentPhase}
        onSheltered={handleSheltered}
        hasSheltered={hasSheltered}
      />

      {/* ── HTML OVERLAYS wrapped inside <Html> for R3F Canvas ───────────── */}
      <Html fullscreen style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full relative pointer-events-none">
          {/* ── Phase instruction panel (top-centre) ─────────────────────────── */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none max-w-xs w-full px-4">
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border backdrop-blur-md shadow-2xl ${ui.color} transition-all duration-700`}>
              <div className="flex-shrink-0 mt-0.5">{ui.icon}</div>
              <div>
                <div className="text-white font-black text-[11px] tracking-wider mb-0.5">{ui.title}</div>
                <div className="text-slate-200 text-[10px] leading-relaxed">{ui.desc}</div>
              </div>
            </div>
          </div>

          {/* ── Evacuation success feedback popup ───────────────────────────── */}
          {hasSheltered && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none select-none animate-bounce">
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-amber-950/95 border-2 border-amber-400/80 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.6)]">
                <CheckCircle2 className="w-10 h-10 text-amber-400" />
                <div className="text-amber-200 font-black text-sm tracking-wider">MITIGASI BERHASIL! +50 XP</div>
                <div className="text-amber-300 text-[11px] text-center max-w-[210px] leading-relaxed">
                  Kamera telah berada di bawah meja! Anda terlindung dari benda berjatuhan (DROP, COVER, HOLD ON).
                </div>
              </div>
            </div>
          )}

          {/* ── Hazard zone legend (bottom-right) ────────────────────────────── */}
          {currentPhase !== 'STABLE_CLASSROOM' && (
            <div className="absolute bottom-24 right-4 z-30 pointer-events-none select-none">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/85 border border-slate-700/60 backdrop-blur-md shadow-xl">
                <div className="text-slate-400 text-[9px] font-bold tracking-widest mb-1">ZONA RISIKO RUANG KELAS</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <span className="text-red-300 text-[10px] font-semibold">ZONA BAHAYA — Dekat Kaca Jendela</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
                  <span className="text-amber-300 text-[10px] font-semibold">ZONA WASPADA — Area Terbuka Plafon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                  <span className="text-green-300 text-[10px] font-semibold">ZONA AMAN — Bawah Meja Siswa Kokoh</span>
                </div>
                <div className="mt-1 border-t border-slate-700/50 pt-1.5">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[9px]">
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-bold">Prinsip Utama: Drop, Cover, Hold On!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Aftermath educational debrief (bottom-left) ─────────────────── */}
          {currentPhase === 'AFTERMATH' && (
            <div className="absolute bottom-24 left-4 z-30 pointer-events-none select-none max-w-[260px]">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-600/60 backdrop-blur-md shadow-2xl">
                <div className="text-white font-black text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  FISIKA GELOMBANG SEISMIK GEMPA
                </div>
                <div className="space-y-1.5">
                  {[
                    { icon:'🌍', text:'Geseran lempeng tektonik menumpuk energi hingga batuan patah di hiposentrum.' },
                    { icon:'⚡', text:'Gelombang P (Primer) tiba paling cepat melalui getaran kompresi.' },
                    { icon:'〰️', text:'Gelombang S (Sekunder) menciptakan guncangan melintang paling merusak.' },
                    { icon:'🛡️', text:'Berlindung di bawah meja melindungi kepala dari puing & plaster yang runtuh.' },
                    { icon:'🚪', text:'Setelah guncangan berhenti, segera keluar menuju titik kumpul terbuka.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[10px] flex-shrink-0">{item.icon}</span>
                      <span className="text-slate-300 text-[9px] leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
