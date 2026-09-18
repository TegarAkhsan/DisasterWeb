import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import {
  ShieldCheck, AlertTriangle, XCircle,
  CheckCircle2, ArrowRight, Wind, ShieldAlert, Zap
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TORNADO SCENE — Realistic Organic Funnel & Physics Simulation
//
// Features:
//   • Organic procedural swaying funnel cloud (vertex-deformed hyperbolic shape)
//   • Dual-sheath vortex (dense inner core + counter-rotating outer dust sheath)
//   • Top Supercell Wall Cloud disk & swirling ground dust bowl (touchdown debris)
//   • Upward helical spiral particle trajectory (leaves, dust, zinc roof sheets)
//   • Suburb environment with asphalt road, sidewalks, power poles, damaged trees & houses
//   • 3 Hazard Zones: ZONA BAHAYA (Jalur Funnel), ZONA WASPADA (Angin Kencang), ZONA AMAN (Ruang Dalam)
//   • Interactive Interior Safe Room shelter button with +50 XP reward
//   • Phase-aware storm instruction panel, camera shake & atmospheric lightning
//   • Aftermath educational debrief panel explaining Tornado physics & Fujita scale
// ─────────────────────────────────────────────────────────────────────────────

interface TornadoSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

// ── Phase definitions ─────────────────────────────────────────────────────────
const PHASES = [
  'CALM_BEFORE_STORM',
  'APPROACHING_WALL_CLOUD',
  'HIGH_WINDS_AND_HAIL',
  'TORNADO_TOUCHDOWN',
  'VIOLENT_DEBRIS_SWIRL',
  'DISSIPATING',
  'AFTERMATH'
] as const;
type Phase = typeof PHASES[number];
const PHASE_TIMES = [0, 5, 11, 19, 30, 44, 56];

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

// ─────────────────────────────────────────────────────────────────────────────
// Inner 3D component — has access to useThree / useFrame
// ─────────────────────────────────────────────────────────────────────────────
interface SceneInnerProps extends TornadoSceneProps {
  onPhaseChange: (phase: Phase) => void;
  onSheltered: () => void;
  hasSheltered: boolean;
}

const TornadoSceneInner: React.FC<SceneInnerProps> = ({
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
  const lastPhase   = useRef<Phase>('CALM_BEFORE_STORM');
  const shakeOffset = useRef(new THREE.Vector3());
  const camOrigin   = useRef(new THREE.Vector3());

  // ── Mesh refs ──────────────────────────────────────────────────────────────
  const vortexGroupRef    = useRef<THREE.Group>(null);
  const innerFunnelMeshRef = useRef<THREE.Mesh>(null);
  const outerFunnelMeshRef = useRef<THREE.Mesh>(null);
  const wallCloudMeshRef  = useRef<THREE.Mesh>(null);
  const groundDustRef     = useRef<THREE.InstancedMesh>(null);
  const flyingDebrisRef   = useRef<THREE.InstancedMesh>(null);
  const zincSheetsRef     = useRef<THREE.Group>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const treesGroupRef     = useRef<THREE.Group>(null);

  // Reset clock on simulation toggle
  useEffect(() => {
    if (isSimulating && !prevSim.current) {
      simTime.current = 0;
      phaseIndex.current = 0;
      onPhaseChange('CALM_BEFORE_STORM');
    }
    prevSim.current = isSimulating;
  }, [isSimulating, onPhaseChange]);

  // Save initial camera position for shake
  useEffect(() => {
    camOrigin.current.copy(camera.position);
  }, [camera]);

  // ── Procedural Hyperbolic Funnel Geometries ─────────────────────────────────
  // High-density cylinder geometry for organic vertex warping
  const { innerFunnelGeom, outerFunnelGeom, origInnerPos, origOuterPos } = useMemo(() => {
    // Inner core geometry (narrower, dense)
    const innerGeom = new THREE.CylinderGeometry(4.2, 0.35, 8.5, 36, 40, true);
    innerGeom.translate(0, 4.25, 0);
    const origInner = innerGeom.attributes.position.clone();

    // Outer sheath geometry (wider, translucent)
    const outerGeom = new THREE.CylinderGeometry(5.2, 0.65, 8.8, 36, 40, true);
    outerGeom.translate(0, 4.4, 0);
    const origOuter = outerGeom.attributes.position.clone();

    return {
      innerFunnelGeom: innerGeom,
      outerFunnelGeom: outerGeom,
      origInnerPos: origInner,
      origOuterPos: origOuter
    };
  }, []);

  // ── Upward Spiral Particle Setup ───────────────────────────────────────────
  const dustCount = 240;
  const debrisCount = 140;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Swirling dust bowl particles (rise upward in helical spiral, then reset to ground)
  const dustParticles = useMemo(() => {
    return Array.from({ length: dustCount }).map((_, i) => {
      return {
        y: Math.random() * 8.0,
        angle: Math.random() * Math.PI * 2,
        radialOffset: (Math.random() - 0.5) * 0.6,
        riseSpeed: 1.2 + Math.random() * 2.0,
        spinSpeed: 5.0 + Math.random() * 4.0,
        scale: Math.random() * 0.28 + 0.08
      };
    });
  }, [dustCount]);

  // Flying structural debris (wood planks, metal, trash)
  const debrisParticles = useMemo(() => {
    return Array.from({ length: debrisCount }).map((_, i) => {
      return {
        y: Math.random() * 7.5,
        angle: Math.random() * Math.PI * 2,
        radialOffset: (Math.random() - 0.5) * 0.8,
        riseSpeed: 1.8 + Math.random() * 2.5,
        spinSpeed: 6.0 + Math.random() * 5.0,
        scale: Math.random() * 0.35 + 0.12,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotSpeedX: (Math.random() - 0.5) * 10.0,
        rotSpeedY: (Math.random() - 0.5) * 10.0
      };
    });
  }, [debrisCount]);

  // Hazard rings on ground
  const dangerRingGeom  = useMemo(() => new THREE.RingGeometry(0.1, 3.2, 48), []);
  const cautionRingGeom = useMemo(() => new THREE.RingGeometry(3.3, 5.5, 48), []);
  const safeRingGeom    = useMemo(() => new THREE.RingGeometry(5.6, 7.8, 48), []);

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
        if (p === 'TORNADO_TOUCHDOWN' || p === 'VIOLENT_DEBRIS_SWIRL') {
          soundEngine.playEarthquakeRumble(3);
        }
      }
    }

    const currentPhase = PHASES[phaseIndex.current];
    const isTouchdown = currentPhase === 'TORNADO_TOUCHDOWN' || currentPhase === 'VIOLENT_DEBRIS_SWIRL';
    const isWindy = currentPhase !== 'CALM_BEFORE_STORM' && currentPhase !== 'AFTERMATH';

    // 2. Deform Tornado Funnel Vertices (Organic Serpentine Sway & Non-Linear Profile)
    if (innerFunnelMeshRef.current && outerFunnelMeshRef.current) {
      const innerPos = innerFunnelGeom.attributes.position;
      const outerPos = outerFunnelGeom.attributes.position;

      // Animate vertices of inner core
      for (let i = 0; i < innerPos.count; i++) {
        const x0 = origInnerPos.getX(i);
        const y0 = origInnerPos.getY(i);
        const z0 = origInnerPos.getZ(i);

        const h = Math.max(0, Math.min(1, y0 / 8.5)); // height fraction 0..1
        const rScale = 0.2 + 0.8 * Math.pow(h, 1.6);  // hyperbolic funnel expansion profile

        // Serpentine organic sway along height
        const swayX = Math.sin(t * 2.4 + h * 2.8) * 0.55 * h;
        const swayZ = Math.cos(t * 1.9 + h * 2.2) * 0.40 * h;

        // Differential spin speed (faster at narrow base, slower at top)
        const spinAngle = t * (9.0 - 5.5 * h);
        const cosA = Math.cos(spinAngle);
        const sinA = Math.sin(spinAngle);

        const rx = (x0 * cosA - z0 * sinA) * rScale + swayX;
        const rz = (x0 * sinA + z0 * cosA) * rScale + swayZ;

        innerPos.setXYZ(i, rx, y0 - 2.0, rz);
      }
      innerPos.needsUpdate = true;

      // Animate vertices of outer sheath (counter-sway & wider)
      for (let i = 0; i < outerPos.count; i++) {
        const x0 = origOuterPos.getX(i);
        const y0 = origOuterPos.getY(i);
        const z0 = origOuterPos.getZ(i);

        const h = Math.max(0, Math.min(1, y0 / 8.8));
        const rScale = 0.22 + 0.78 * Math.pow(h, 1.5);

        const swayX = Math.sin(t * 2.1 + h * 3.1 + 0.5) * 0.65 * h;
        const swayZ = Math.cos(t * 1.7 + h * 2.5 + 0.5) * 0.48 * h;

        const spinAngle = -t * (7.5 - 4.5 * h);
        const cosA = Math.cos(spinAngle);
        const sinA = Math.sin(spinAngle);

        const rx = (x0 * cosA - z0 * sinA) * rScale + swayX;
        const rz = (x0 * sinA + z0 * cosA) * rScale + swayZ;

        outerPos.setXYZ(i, rx, y0 - 2.0, rz);
      }
      outerPos.needsUpdate = true;
    }

    // 3. Tornado Funnel Group Wandering & Scale
    if (vortexGroupRef.current) {
      if (isWindy) {
        // Path wandering along the ground
        const pathX = Math.sin(t * 0.40) * 2.6 + Math.sin(t * 0.85) * 0.7;
        const pathZ = Math.cos(t * 0.32) * 1.8 - 1.0;
        
        const targetScaleY = currentPhase === 'APPROACHING_WALL_CLOUD' ? 0.35 : 1.0;
        vortexGroupRef.current.scale.y = lerp(vortexGroupRef.current.scale.y, targetScaleY, delta * 2.0);
        vortexGroupRef.current.position.x = pathX;
        vortexGroupRef.current.position.z = pathZ;
      } else {
        vortexGroupRef.current.position.set(0, 0, 0);
      }
    }

    // 4. Wall Cloud Supercell Spin
    if (wallCloudMeshRef.current) {
      wallCloudMeshRef.current.rotation.y = t * 0.4;
    }

    // 5. Upward Helical Particles (Ground Dust & Debris)
    if (groundDustRef.current && isWindy) {
      const speedMult = isTouchdown ? 1.6 : 0.9;
      dustParticles.forEach((p) => {
        p.y += delta * p.riseSpeed * speedMult;
        if (p.y > 7.8) p.y = 0.1; // reset to ground

        p.angle += delta * p.spinSpeed * speedMult;

        const h = p.y / 8.0;
        const radiusAtH = (0.3 + 3.2 * Math.pow(h, 1.5)) + p.radialOffset;
        const x = Math.cos(p.angle) * radiusAtH;
        const z = Math.sin(p.angle) * radiusAtH;

        dummy.position.set(x, p.y - 2.0, z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.rotation.set(t * 3.0, p.angle, 0);
        dummy.updateMatrix();
        groundDustRef.current!.setMatrixAt(dustParticles.indexOf(p), dummy.matrix);
      });
      groundDustRef.current.instanceMatrix.needsUpdate = true;
    }

    if (flyingDebrisRef.current && isTouchdown) {
      debrisParticles.forEach((p) => {
        p.y += delta * p.riseSpeed * 1.4;
        if (p.y > 7.5) p.y = 0.2;

        p.angle += delta * p.spinSpeed * 1.3;
        p.rotX += delta * p.rotSpeedX;
        p.rotY += delta * p.rotSpeedY;

        const h = p.y / 8.0;
        const radiusAtH = (0.5 + 3.6 * Math.pow(h, 1.4)) + p.radialOffset;
        const x = Math.cos(p.angle) * radiusAtH;
        const z = Math.sin(p.angle) * radiusAtH;

        dummy.position.set(x, p.y - 2.0, z);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.rotation.set(p.rotX, p.rotY, p.angle);
        dummy.updateMatrix();
        flyingDebrisRef.current!.setMatrixAt(debrisParticles.indexOf(p), dummy.matrix);
      });
      flyingDebrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // 6. Flying Zinc Roof Sheets (Atap Seng Beterbangan)
    if (zincSheetsRef.current) {
      if (isTouchdown) {
        zincSheetsRef.current.rotation.y = t * 4.8;
        zincSheetsRef.current.position.y = 1.0 + Math.sin(t * 2.8) * 0.9;
      } else {
        zincSheetsRef.current.position.y = -0.5;
      }
    }

    // 7. Trees Bending under Violent Wind Field
    if (treesGroupRef.current) {
      const bendAmount = isTouchdown ? 0.38 : isWindy ? 0.16 : 0;
      treesGroupRef.current.children.forEach((tree, idx) => {
        tree.rotation.z = Math.sin(t * 8.5 + idx) * bendAmount * 0.35 - bendAmount;
      });
    }

    // 8. Atmospheric Lightning Flashes
    if (lightningLightRef.current) {
      const isFlash = isWindy && Math.random() > 0.94;
      lightningLightRef.current.intensity = isFlash ? 14 : 0;
    }

    // 9. Camera Shake during Violent Touchdown
    if (isTouchdown) {
      const intensity = currentPhase === 'VIOLENT_DEBRIS_SWIRL' ? 0.14 : 0.07;
      shakeOffset.current.set(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
      camera.position.copy(camOrigin.current).add(shakeOffset.current);
    } else {
      camera.position.lerp(camOrigin.current, delta * 3.0);
    }
  });

  return (
    <group>
      {/* ── Storm Environment Lighting ────────────────────────────────────── */}
      <ambientLight intensity={1.0} color="#64748b" />
      <hemisphereLight args={['#a78bfa', '#0f172a', 1.4]} />
      <directionalLight position={[8, 14, 6]} intensity={2.2} color="#f8fafc" castShadow />
      <directionalLight position={[-8, 6, -6]} intensity={1.6} color="#6366f1" />
      
      {/* Lightning Flash Point Light */}
      <pointLight ref={lightningLightRef} position={[0, 8, 0]} color="#e0e7ff" distance={40} />
      <pointLight position={[3, 2, 2]} intensity={2.2} color="#7c3aed" />

      {/* Atmospheric Storm Fog */}
      <fog attach="fog" args={['#0f172a', 8, 30]} />

      {/* ── 1. Ground Terrain & Suburb Street ──────────────────────────────── */}
      {/* Main Ground Surface */}
      <mesh position={[0, -2.1, 0]} receiveShadow>
        <boxGeometry args={[26, 0.4, 22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Green Lawn Margins */}
      <mesh position={[-6, -1.88, 0]}>
        <boxGeometry args={[10, 0.05, 20]} />
        <meshStandardMaterial color="#365314" roughness={0.7} />
      </mesh>
      <mesh position={[6, -1.88, 0]}>
        <boxGeometry args={[10, 0.05, 20]} />
        <meshStandardMaterial color="#365314" roughness={0.7} />
      </mesh>

      {/* Asphalt Street & Road Line */}
      <mesh position={[0, -1.87, 0]}>
        <boxGeometry args={[3.8, 0.06, 22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      {/* Yellow Center Road Line */}
      <mesh position={[0, -1.83, 0]}>
        <boxGeometry args={[0.15, 0.02, 20]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>

      {/* ── 2. Hazard Zones Rendered on Ground ────────────────────────────── */}
      <group position={[0, -1.82, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* ZONA BAHAYA (Funnel Direct Path) */}
        <mesh geometry={dangerRingGeom}>
          <meshBasicMaterial color="#ef4444" transparent opacity={0.38} side={THREE.DoubleSide} />
        </mesh>
        {/* ZONA WASPADA (High Wind Field) */}
        <mesh geometry={cautionRingGeom}>
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.28} side={THREE.DoubleSide} />
        </mesh>
        {/* ZONA AMAN (Lateral Margin) */}
        <mesh geometry={safeRingGeom}>
          <meshBasicMaterial color="#22c55e" transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3D Hazard Zone Labels */}
      <Html position={[0, -1.2, -1.0]} center distanceFactor={14}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/90 border border-red-500/80 text-red-300 text-[10px] font-black tracking-wide shadow-lg backdrop-blur-sm pointer-events-none select-none">
          <XCircle className="w-3 h-3 text-red-400" />
          <span>ZONA BAHAYA — JALUR TORNADO</span>
        </div>
      </Html>

      <Html position={[5.2, -1.2, 1.5]} center distanceFactor={14}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-[10px] font-black tracking-wide shadow-lg backdrop-blur-sm pointer-events-none select-none">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>ZONA AMAN — BANTERAS / RUANG DALAM</span>
        </div>
      </Html>

      {/* ── 3. Organic Procedural Tornado Funnel ─────────────────────────── */}
      <group ref={vortexGroupRef} position={[0, 0, -1.0]}>
        {/* Top Supercell Wall Cloud Disk */}
        <mesh ref={wallCloudMeshRef} position={[0, 6.4, 0]}>
          <cylinderGeometry args={[6.5, 5.0, 1.2, 32]} />
          <meshStandardMaterial
            color="#1e1b4b"
            roughness={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Inner Violent Condensed Core Funnel */}
        <mesh ref={innerFunnelMeshRef} geometry={innerFunnelGeom}>
          <meshStandardMaterial
            color="#312e81"
            roughness={0.4}
            metalness={0.1}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outer Translucent Sheath (Counter-Swinging) */}
        <mesh ref={outerFunnelMeshRef} geometry={outerFunnelGeom}>
          <meshStandardMaterial
            color="#64748b"
            roughness={0.6}
            transparent
            opacity={0.35}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Touchdown Dust Bowl (Swirling Ground Cloud) */}
        <mesh position={[0, -1.8, 0]}>
          <cylinderGeometry args={[3.2, 1.2, 0.6, 24]} />
          <meshStandardMaterial
            color="#475569"
            transparent
            opacity={0.65}
            roughness={0.9}
          />
        </mesh>

        {/* Instanced Upward Helical Ground Dust Particles */}
        <instancedMesh ref={groundDustRef} args={[undefined, undefined, dustCount]}>
          <dodecahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial
            color="#cbd5e1"
            roughness={0.5}
            emissive="#6366f1"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </instancedMesh>

        {/* Instanced Flying Structural Debris */}
        <instancedMesh ref={flyingDebrisRef} args={[undefined, undefined, debrisCount]}>
          <boxGeometry args={[0.35, 0.35, 0.35]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.7}
            metalness={0.2}
          />
        </instancedMesh>
      </group>

      {/* ── 4. Flying Zinc Roof Sheets ────────────────────────────────────── */}
      <group ref={zincSheetsRef} position={[0, 1.5, 0]}>
        {[-2.2, 0.5, 1.8].map((zx, i) => (
          <mesh key={`zinc-${i}`} position={[zx, i * 0.9, Math.sin(i * 2) * 1.8]} rotation={[0.5 * i, 0.9 * i, 0]}>
            <boxGeometry args={[1.5, 0.02, 0.9]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* ── 5. Environment Props: Trees & Power Poles ────────────────────── */}
      <group ref={treesGroupRef}>
        {[-7, -5, 5, 7].map((tx, i) => (
          <group key={`tree-${i}`} position={[tx, -1.8, (i % 2 === 0 ? -4 : 4)]}>
            {/* Trunk */}
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 2.0, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 2.2, 0]}>
              <sphereGeometry args={[0.9, 12, 12]} />
              <meshStandardMaterial color="#1a2e05" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Power Poles along Street */}
      {[-8, 0, 8].map((px, i) => (
        <group key={`pole-${i}`} position={[px, -1.8, -2.5]}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 3.6, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 3.4, 0]}>
            <boxGeometry args={[1.2, 0.08, 0.08]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}

      {/* ── 6. Reinforced Brick House with Interior Safe Room ─────────────── */}
      <group position={[5.2, -0.9, 1.5]}>
        {/* Main Exterior Wall Structure */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.6, 2.5, 3.4]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>

        {/* Windows (DANGER AREA - Glass Shatters!) */}
        <mesh position={[1.82, 0.5, 0]}>
          <boxGeometry args={[0.05, 1.1, 1.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.8} />
        </mesh>

        {/* Reinforced Windowless Interior Safe Room (Bathroom/Basement Core) */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.8, 2.1, 1.8]} />
          <meshStandardMaterial color="#581c87" emissive="#7c3aed" emissiveIntensity={1.5} />
        </mesh>

        {/* Heavy Reinforced Concrete Flat Roof */}
        <mesh position={[0, 1.75, 0]}>
          <boxGeometry args={[3.8, 0.3, 3.6]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>

        {/* ── Interactive Shelter Target Button ──────────────────────────── */}
        <Html position={[0, 2.8, 0]} center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('INTERIOR_SHELTER');
              onSheltered();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-xs shadow-2xl transition-all border-2 pointer-events-auto cursor-pointer ${
              hasSheltered
                ? 'bg-emerald-600 text-white border-emerald-300 scale-105 shadow-[0_0_25px_rgba(34,197,94,0.8)]'
                : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-200 hover:scale-105 shadow-[0_0_25px_rgba(147,51,234,0.8)] animate-pulse'
            }`}
          >
            {hasSheltered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>BERDASARKAN REKOMENDASI: DALAM RUANG AMAN!</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>MASUK RUANG DALAM (TANPA JENDELA)! (+50 XP)</span>
              </>
            )}
          </button>
        </Html>
      </group>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Outer Component with State & HTML Overlays
// ─────────────────────────────────────────────────────────────────────────────
export const TornadoScene: React.FC<TornadoSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('CALM_BEFORE_STORM');
  const [hasSheltered, setHasSheltered] = useState(false);

  const handleSheltered = useCallback(() => {
    setHasSheltered(true);
  }, []);

  // Reset shelter status when sim restarts
  useEffect(() => {
    if (currentPhase === 'CALM_BEFORE_STORM') {
      setHasSheltered(false);
    }
  }, [currentPhase]);

  // Phase educational content mapping
  const phaseUI: Record<Phase, { icon: React.ReactNode; color: string; title: string; desc: string }> = {
    CALM_BEFORE_STORM: {
      icon: <Wind className="w-4 h-4 text-sky-400" />,
      color: 'border-sky-500/40 bg-sky-950/80',
      title: 'KONDISI AWAL — ANGIN TENANG',
      desc: 'Cuaca mendung gelap. Pantau peringatan dini cuaca dari BMKG.',
    },
    APPROACHING_WALL_CLOUD: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/80',
      title: 'AWAN DINDING GELAP MENDEKAT',
      desc: 'Awan berputar tebal dan kilatan petir terlihat di ufuk barat.',
    },
    HIGH_WINDS_AND_HAIL: {
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
      color: 'border-orange-500/40 bg-orange-950/80',
      title: 'ANGIN KENCANG & HUJAN ES',
      desc: 'Segera cari perlindungan! Jauhi jendela kaca dan benda beratap seng.',
    },
    TORNADO_TOUCHDOWN: {
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/50 bg-red-950/85 animate-pulse',
      title: 'FUNNEL TORNADO MENYENTUH TANAH!',
      desc: 'Bahaya utama! Pusaran angin berkecepatan tinggi menyapu permukaan tanah.',
    },
    VIOLENT_DEBRIS_SWIRL: {
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/60 bg-purple-950/90 animate-pulse',
      title: 'PUSARAN DEBRIS SANGAT BERBAHAYA',
      desc: 'Puing atap seng dan kayu terbangan. Tiurepkan diri di ruang paling dalam tanpa jendela!',
    },
    DISSIPATING: {
      icon: <Wind className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-950/80',
      title: 'PUSARAN ANGIN MELEMAH',
      desc: 'Tornado mulai terangkat kembali ke awan. Tetap berada di ruang aman.',
    },
    AFTERMATH: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-600/60 bg-emerald-950/80',
      title: 'PASCA ANGIN PUTING BELIUNG',
      desc: 'Tornado telah berlalu. Waspadai kabel listrik putus dan puing tajam di luar.',
    },
  };

  const ui = phaseUI[currentPhase];

  return (
    <group>
      {/* ── 3D Scene Inner ──────────────────────────────────────────────── */}
      <TornadoSceneInner
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
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-purple-950/95 border-2 border-purple-400/80 backdrop-blur-md shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                <CheckCircle2 className="w-10 h-10 text-purple-400" />
                <div className="text-purple-200 font-black text-sm tracking-wider">PERLINDUNGAN BERHASIL! +50 XP</div>
                <div className="text-purple-300 text-[11px] text-center max-w-[210px] leading-relaxed">
                  Anda terlindung di ruangan dalam tanpa jendela dari pecahan kaca dan debris terbang!
                </div>
              </div>
            </div>
          )}

          {/* ── Hazard zone legend (bottom-right) ────────────────────────────── */}
          {currentPhase !== 'CALM_BEFORE_STORM' && (
            <div className="absolute bottom-24 right-4 z-30 pointer-events-none select-none">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/85 border border-slate-700/60 backdrop-blur-md shadow-xl">
                <div className="text-slate-400 text-[9px] font-bold tracking-widest mb-1">ZONA RISIKO TORNADO</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <span className="text-red-300 text-[10px] font-semibold">ZONA BAHAYA — Pusaran Funnel</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
                  <span className="text-amber-300 text-[10px] font-semibold">ZONA WASPADA — Angin Kencang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                  <span className="text-green-300 text-[10px] font-semibold">ZONA AMAN — Ruangan Dalam Tembok</span>
                </div>
                <div className="mt-1 border-t border-slate-700/50 pt-1.5">
                  <div className="flex items-center gap-1.5 text-purple-300 text-[9px]">
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-bold">Kunci: Jauhi jendela, lindungi kepala!</span>
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  FISIKA ANGIN PUTING BELIUNG
                </div>
                <div className="space-y-1.5">
                  {[
                    { icon:'🌀', text:'Pusaran terjadi akibat benturan udara panas lembap & udara dingin kencang.' },
                    { icon:'💨', text:'Perbedaan tekanan udara ekstrem menciptakan gaya hisap vertikal kuat.' },
                    { icon:'🪟', text:'Bahaya terbesar korban jiwa berasal dari pecahan kaca & puing berkecepatan tinggi.' },
                    { icon:'🏠', text:'Ruang tengah/kamar mandi tanpa jendela adalah area paling aman di dalam rumah.' },
                    { icon:'⚠️', text:'Hindari berlindung di bawah jembatan/pohon tinggi karena rawan tumbang.' },
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
