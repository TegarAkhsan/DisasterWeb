import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';
import {
  ShieldCheck, AlertTriangle, XCircle,
  CheckCircle2, ArrowRight, RotateCcw,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// LANDSLIDE SCENE — Phase 3: Educational Interaction & Polish
//
// Adds on top of Phase 2:
//   • Three hazard zones rendered as ring meshes on the terrain
//   • Educational HTML labels (Html component) per zone
//   • Evacuation target in Safe Zone with XP reward
//   • Phase-aware instruction panel (Html overlay)
//   • Camera shake during SLOPE_FAILURE and LANDSLIDE phases
//   • Aftermath feedback panel with landslide physics explanation
//   • Visual success flash when user picks correct evacuation route
//
// Phase progression (auto):
//   0  STABLE        t <  4 s
//   1  HEAVY_RAIN    t <  9 s
//   2  SATURATION    t < 15 s
//   3  CRACKING      t < 22 s
//   4  SLOPE_FAILURE t < 30 s   — camera shake begins
//   5  LANDSLIDE     t < 48 s   — evacuation button highlighted
//   6  AFTERMATH     t ≥ 48 s   — aftermath debrief panel
// ─────────────────────────────────────────────────────────────────────────────

interface LandslideSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

// ── Phase definitions ─────────────────────────────────────────────────────────
const PHASES = ['STABLE','HEAVY_RAIN','SATURATION','CRACKING','SLOPE_FAILURE','LANDSLIDE','AFTERMATH'] as const;
type Phase = typeof PHASES[number];
const PHASE_TIMES = [0, 4, 9, 15, 22, 30, 48];

// ── Terrain height (pure) ─────────────────────────────────────────────────────
function terrainHeight(x: number, z: number): number {
  let raw = 0;
  if (z > -1.0) {
    raw = Math.sin(x * 0.7 + z * 0.5) * 0.035;
  } else if (z > -4.5) {
    const t = (-z - 1.0) / 3.5;
    raw = t * 0.40 + Math.sin(x * 1.4 + z * 1.1) * 0.07 * t;
  } else {
    const t = Math.min(1.0, (-z - 4.5) / 8.5);
    raw = 0.40 + 5.0 * Math.pow(t, 0.68)
        + Math.sin(x * 0.36 + 0.7) * 0.30 * t
        + Math.sin(x * 2.0 + z * 1.6) * 0.10 * t
        + Math.cos(x * 1.3 - z * 2.2) * 0.065 * t
        + Math.floor(t * 3.5) * 0.10;
  }
  return raw - 2.0;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function smoothstep(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c); }

// ─────────────────────────────────────────────────────────────────────────────
// Inner 3D component — has access to useThree / useFrame
// ─────────────────────────────────────────────────────────────────────────────
interface SceneInnerProps extends LandslideSceneProps {
  onPhaseChange: (phase: Phase) => void;
  onEvacuated: () => void;
  hasEvacuated: boolean;
}

const LandslideSceneInner: React.FC<SceneInnerProps> = ({
  isSimulating = true,
  onActionClick,
  onPhaseChange,
  onEvacuated,
  hasEvacuated,
}) => {
  const { camera } = useThree();

  // ── Simulation clock ───────────────────────────────────────────────────────
  const simTime      = useRef(0);
  const phaseIndex   = useRef(0);
  const prevSim      = useRef(isSimulating);
  const lastPhase    = useRef<Phase>('STABLE');
  const shakeOffset  = useRef(new THREE.Vector3());
  const camOrigin    = useRef(new THREE.Vector3());

  // ── Mesh refs ──────────────────────────────────────────────────────────────
  const rainRef        = useRef<THREE.InstancedMesh>(null);
  const chunkRef       = useRef<THREE.InstancedMesh>(null);
  const fallingRockRef = useRef<THREE.InstancedMesh>(null);
  const debrisRef      = useRef<THREE.InstancedMesh>(null);
  const waterRef       = useRef<THREE.InstancedMesh>(null);
  const trunkRef       = useRef<THREE.InstancedMesh>(null);
  const cLowRef        = useRef<THREE.InstancedMesh>(null);
  const cHighRef       = useRef<THREE.InstancedMesh>(null);
  const staticRockRef  = useRef<THREE.InstancedMesh>(null);

  const crackMeshRef   = useRef<THREE.Mesh>(null);
  const mudFlowRef     = useRef<THREE.Mesh>(null);
  const buriedRoadRef  = useRef<THREE.Mesh>(null);

  // Hazard zone ring refs (opacity/scale animated)
  const dangerRingRef  = useRef<THREE.Mesh>(null);
  const cautionRingRef = useRef<THREE.Mesh>(null);
  const safeRingRef    = useRef<THREE.Mesh>(null);

  const ambientRef     = useRef<THREE.AmbientLight>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ── Counts ─────────────────────────────────────────────────────────────────
  const RAIN_COUNT   = 260;
  const CHUNK_COUNT  = 6;
  const FROCK_COUNT  = 18;
  const DEBRIS_COUNT = 28;
  const WATER_COUNT  = 12;
  const TREE_COUNT   = 26;
  const SROCK_COUNT  = 32;

  // ── Terrain geometry ───────────────────────────────────────────────────────
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(38, 28, 90, 65);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const n   = pos.count;
    const colBuf = new Float32Array(n * 3);
    const cGravel  = new THREE.Color('#334155');
    const cMoss    = new THREE.Color('#166534');
    const cGrass   = new THREE.Color('#16a34a');
    const cDkGrass = new THREE.Color('#15803d');
    const cClay    = new THREE.Color('#78350f');
    const cRock    = new THREE.Color('#52525b');
    const cDkRock  = new THREE.Color('#44403c');
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const vx = pos.getX(i); const vz = pos.getZ(i);
      let raw = 0;
      if (vz > -1.0) { raw = Math.sin(vx * 0.7 + vz * 0.5) * 0.035; }
      else if (vz > -4.5) { const t = (-vz-1)/3.5; raw = t*0.4+Math.sin(vx*1.4+vz*1.1)*0.07*t; }
      else {
        const t = Math.min(1, (-vz-4.5)/8.5);
        raw = 0.40+5.0*Math.pow(t,0.68)+Math.sin(vx*0.36+0.7)*0.30*t+Math.sin(vx*2+vz*1.6)*0.10*t+Math.cos(vx*1.3-vz*2.2)*0.065*t+Math.floor(t*3.5)*0.10;
      }
      pos.setY(i, raw - 2.0);
      if (vz > -1.0) { col.lerpColors(cGravel, cMoss, Math.max(0,Math.min(1,Math.sin(vx*0.85+vz*0.65)*0.4+0.35))); }
      else if (vz > -4.5) { col.lerpColors(cMoss, cGrass, 0.55); }
      else {
        const t2 = Math.min(1, (-vz-4.5)/8.5);
        if (raw>4.6) { col.lerpColors(cRock, cDkRock, Math.max(0,Math.sin(vx*2.3+vz*1.7)*0.5+0.5)); }
        else if (raw>3.2) { col.lerpColors(cClay, cRock, Math.min(1,(raw-3.2)*0.72)); }
        else if (raw>1.7) { col.lerpColors(cGrass, cDkGrass, Math.max(0,Math.min(1,Math.sin(vx*1.7+vz*2)*0.35+0.6))); }
        else { col.lerpColors(cMoss, cGrass, Math.min(1,t2*0.65)); }
      }
      colBuf[i*3]=col.r; colBuf[i*3+1]=col.g; colBuf[i*3+2]=col.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colBuf, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // ── Shared geometries ──────────────────────────────────────────────────────
  const geoTrunk  = useMemo(() => new THREE.CylinderGeometry(0.065, 0.10, 0.9, 7), []);
  const geoCLow   = useMemo(() => new THREE.ConeGeometry(0.58, 1.02, 7), []);
  const geoCHigh  = useMemo(() => new THREE.ConeGeometry(0.40, 0.84, 7), []);
  const geoSRock  = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const geoChunk  = useMemo(() => new THREE.BoxGeometry(1, 0.6, 0.9), []);
  const geoFRock  = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const geoDebris = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const geoWater  = useMemo(() => new THREE.PlaneGeometry(0.6, 2.5, 1, 8), []);
  const geoFndn   = useMemo(() => new THREE.BoxGeometry(2.4, 0.12, 2.0), []);
  const geoWalls  = useMemo(() => new THREE.BoxGeometry(2.2, 1.12, 1.8), []);
  const geoRoof   = useMemo(() => new THREE.CylinderGeometry(0.02, 1.02, 2.44, 3), []);
  const geoWin    = useMemo(() => new THREE.BoxGeometry(0.48, 0.38, 0.05), []);
  const geoDoor   = useMemo(() => new THREE.BoxGeometry(0.40, 0.72, 0.05), []);
  // Hazard zone rings
  const geoDangerRing  = useMemo(() => new THREE.RingGeometry(7.2, 8.8, 48), []);
  const geoCautionRing = useMemo(() => new THREE.RingGeometry(9.4, 10.6, 48), []);
  const geoSafeRing    = useMemo(() => new THREE.RingGeometry(4.0, 5.2, 48), []);

  // ── Shared materials ───────────────────────────────────────────────────────
  const matTerrain = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.02 }), []);
  const matTrunk   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.95 }), []);
  const matCLow    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.90 }), []);
  const matCHigh   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.85 }), []);
  const matSRock   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.92, metalness: 0.04 }), []);
  const matChunk   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5c3317', roughness: 0.95 }), []);
  const matFRock   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#44403c', roughness: 0.88, metalness: 0.06 }), []);
  const matDebris  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b4423', roughness: 0.97 }), []);
  const matWater   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.72, side: THREE.DoubleSide }), []);
  const matFndn    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.82 }), []);
  const matDoor    = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.72 }), []);
  const matWin     = useMemo(() => new THREE.MeshStandardMaterial({ color: '#bfdbfe', emissive: new THREE.Color('#fbbf24'), emissiveIntensity: 0.90, roughness: 0.12 }), []);
  const matCrack   = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7f1d1d', emissive: new THREE.Color('#ef4444'), emissiveIntensity: 0.0, roughness: 1.0 }), []);

  // Hazard zone ring materials — translucent, flat on ground
  const matDanger  = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: 0.30, side: THREE.DoubleSide, depthWrite: false }), []);
  const matCaution = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }), []);
  const matSafe    = useMemo(() => new THREE.MeshBasicMaterial({ color: '#22c55e', transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }), []);

  // ── Scatter data ───────────────────────────────────────────────────────────
  const treeData = useMemo(() => {
    const items: { x:number; z:number; s:number; ry:number; onSlope:boolean }[] = [];
    for (let i = 0; i < TREE_COUNT; i++) {
      const x = Math.sin(i*2.8+0.5)*8.5+Math.cos(i*5.3)*4.0;
      const z = -5.0-Math.abs(Math.sin(i*3.7))*7.5;
      const s = 0.72+Math.abs(Math.sin(i*6.1))*0.52;
      if (Math.abs(x)<14.5 && z>-13.5) items.push({ x, z, s, ry:i*1.31, onSlope: z<-6&&Math.abs(x)<8 });
    }
    return items;
  }, []);

  const sRockData = useMemo(() => {
    const items: { x:number; z:number; s:number; rx:number; ry:number }[] = [];
    for (let i = 0; i < SROCK_COUNT; i++) {
      const x = Math.sin(i*4.1+1.2)*11+Math.cos(i*2.7)*4.5;
      const z = -1.2-Math.abs(Math.sin(i*3.2))*10.5;
      const s = 0.06+Math.abs(Math.sin(i*9.3))*0.23;
      if (Math.abs(x)<15.5 && z>-13.5) items.push({ x, z, s, rx:i*2.1, ry:i*3.7 });
    }
    return items;
  }, []);

  // ── Mutable simulation state ───────────────────────────────────────────────
  const rainPtcl = useMemo(() => Array.from({ length: RAIN_COUNT }, (_,i) => ({
    x: Math.sin(i*3.71)*15, y: (i/RAIN_COUNT)*13+1, z: Math.cos(i*2.93)*11,
    speed: 0.13+Math.abs(Math.sin(i*7.3))*0.19, drift: 0.022+Math.abs(Math.sin(i*4.1))*0.018,
  })), []);

  const chunks = useMemo(() => Array.from({ length: CHUNK_COUNT }, (_,i) => {
    const ox = Math.sin(i*2.1+0.4)*3.5; const oz = -6.0-i*1.2;
    return { ox, oz, oy: terrainHeight(ox,oz)+0.4, x:ox, y:terrainHeight(ox,oz)+0.4, z:oz,
      vx:0, vy:0, vz:0, mass:0.8+Math.abs(Math.sin(i*3.7))*0.4, scale:0.9+Math.abs(Math.sin(i*5.2))*0.5,
      rx:0, ry:i*0.9, rz:0, vrx:Math.sin(i*2.3)*0.01, vrz:Math.cos(i*1.7)*0.008,
      dirX:Math.sin(i*1.4)*0.3, dirZ:0.7+Math.abs(Math.sin(i*3.1))*0.3, settled:false };
  }), []);

  const fallingRocks = useMemo(() => Array.from({ length: FROCK_COUNT }, (_,i) => {
    const ox = Math.sin(i*5.1+0.8)*6; const oz = -5-Math.abs(Math.sin(i*2.9))*6;
    return { ox, oz, oy:terrainHeight(ox,oz)+0.3, x:ox, y:terrainHeight(ox,oz)+0.3, z:oz,
      vx:Math.sin(i*3.1)*0.04, vy:0, vz:0.05+Math.abs(Math.sin(i*7.2))*0.08,
      mass:0.15+Math.abs(Math.sin(i*4.4))*0.15, scale:0.04+Math.abs(Math.sin(i*6.7))*0.18,
      rx:0, ry:i*1.7, rz:0, vrx:Math.sin(i*4.7)*0.08, vry:Math.cos(i*3.2)*0.06, vrz:Math.sin(i*2.1)*0.05,
      startDelay:(i/FROCK_COUNT)*8.0, settled:false };
  }), []);

  const debrisPtcl = useMemo(() => Array.from({ length: DEBRIS_COUNT }, (_,i) => {
    const ox = Math.sin(i*2.9+1.2)*7; const oz = -4-Math.abs(Math.sin(i*3.6))*5;
    return { ox, oz, oy:terrainHeight(ox,oz)+0.2, x:ox, y:terrainHeight(ox,oz)+0.2, z:oz,
      vx:Math.sin(i*5.3)*0.035, vy:0, vz:0.03+Math.abs(Math.sin(i*4.1))*0.06,
      scale:0.08+Math.abs(Math.sin(i*7.8))*0.16, rx:0, ry:i*2.3, rz:0,
      vrx:Math.sin(i*6.2)*0.06, vrz:Math.cos(i*4.8)*0.04,
      startDelay:(i/DEBRIS_COUNT)*10.0, settled:false };
  }), []);

  const waterPtcl = useMemo(() => Array.from({ length: WATER_COUNT }, (_,i) => ({
    x:Math.sin(i*3.1)*5, z:-3-Math.abs(Math.sin(i*2.7))*6, vy:0.018+Math.abs(Math.sin(i*5.2))*0.012,
  })), []);

  const houses = useMemo(() => [
    { x:-6.0, z:5.6, rot: 0.16, wall:'#d4a27a', roof:'#b45309' },
    { x:-2.2, z:6.0, rot: 0.02, wall:'#c9b99a', roof:'#92400e' },
    { x: 2.0, z:5.4, rot:-0.12, wall:'#d6b080', roof:'#b91c1c' },
  ], []);

  // ── Init InstancedMesh matrices ────────────────────────────────────────────
  useEffect(() => {
    const initTree = (mesh: THREE.InstancedMesh | null, yOff: number) => {
      if (!mesh) return;
      treeData.forEach((t, i) => {
        dummy.position.set(t.x, terrainHeight(t.x, t.z)+yOff*t.s, t.z);
        dummy.rotation.set(0, t.ry, 0); dummy.scale.setScalar(t.s); dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    initTree(trunkRef.current, 0.45);
    initTree(cLowRef.current,  1.08);
    initTree(cHighRef.current, 1.74);

    if (staticRockRef.current) {
      sRockData.forEach((r,i) => {
        dummy.position.set(r.x, terrainHeight(r.x,r.z)+r.s*0.55, r.z);
        dummy.rotation.set(r.rx, r.ry, 0); dummy.scale.setScalar(r.s); dummy.updateMatrix();
        staticRockRef.current!.setMatrixAt(i, dummy.matrix);
      });
      staticRockRef.current.instanceMatrix.needsUpdate = true;
    }

    if (chunkRef.current) {
      chunks.forEach((c,i) => {
        dummy.position.set(c.ox, c.oy, c.oz);
        dummy.rotation.set(0, c.ry, 0); dummy.scale.setScalar(c.scale); dummy.updateMatrix();
        chunkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      chunkRef.current.instanceMatrix.needsUpdate = true;
    }

    const hideAll = (mesh: THREE.InstancedMesh | null, count: number) => {
      if (!mesh) return;
      for (let i = 0; i < count; i++) {
        dummy.position.set(0,-100,0); dummy.scale.setScalar(0.01); dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    hideAll(fallingRockRef.current, FROCK_COUNT);
    hideAll(debrisRef.current, DEBRIS_COUNT);
    hideAll(waterRef.current, WATER_COUNT);

    // Capture camera's initial position for shake restoration
    camOrigin.current.copy(camera.position);
  }, [treeData, sRockData, chunks, dummy, camera]);

  // ── Main useFrame ──────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!isSimulating) return;

    simTime.current += delta;
    const t = simTime.current;

    let pi = 0;
    for (let i = PHASE_TIMES.length - 1; i >= 0; i--) { if (t >= PHASE_TIMES[i]) { pi = i; break; } }
    phaseIndex.current = pi;
    const phase = PHASES[pi];

    // Notify parent of phase change
    if (phase !== lastPhase.current) {
      lastPhase.current = phase;
      onPhaseChange(phase);
    }

    const phaseStart = PHASE_TIMES[pi];
    const phaseEnd   = PHASE_TIMES[pi+1] ?? PHASE_TIMES[pi]+999;
    const phaseT     = Math.min(1, (t-phaseStart)/(phaseEnd-phaseStart));

    // ── Rain ────────────────────────────────────────────────────────────────
    const rainI = phase==='STABLE'?0.3 : phase==='HEAVY_RAIN'?lerp(0.3,1.0,phaseT) :
                  phase==='AFTERMATH'?0.15 : 1.0;
    if (rainRef.current) {
      rainPtcl.forEach((r,i) => {
        r.y -= r.speed*(1+rainI*1.5); r.x += r.drift*rainI;
        if (r.y<-2.5) r.y=12; if (r.x>15) r.x-=30;
        dummy.position.set(r.x,r.y,r.z); dummy.rotation.set(0,0,-0.20-rainI*0.12);
        dummy.scale.set(1,rainI,1); dummy.updateMatrix();
        rainRef.current!.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Ambient darkening ───────────────────────────────────────────────────
    if (ambientRef.current) {
      const ti = phase==='STABLE'?0.62 : phase==='HEAVY_RAIN'?lerp(0.62,0.35,phaseT) :
                 phase==='SATURATION'||phase==='CRACKING'?0.30 :
                 phase==='SLOPE_FAILURE'?0.25 : phase==='LANDSLIDE'?0.22 : 0.50;
      ambientRef.current.intensity += (ti - ambientRef.current.intensity)*0.02;
    }

    // ── Camera shake (SLOPE_FAILURE + LANDSLIDE) ───────────────────────────
    const shakeAmp = phase==='SLOPE_FAILURE' ? 0.025*phaseT :
                     phase==='LANDSLIDE'     ? 0.055*(1-phaseT*0.5) : 0;
    if (shakeAmp > 0) {
      const sx = (Math.sin(t*43.7)*Math.cos(t*17.3)) * shakeAmp;
      const sy = (Math.cos(t*37.1)*Math.sin(t*23.9)) * shakeAmp * 0.6;
      camera.position.x = camOrigin.current.x + sx;
      camera.position.y = camOrigin.current.y + sy;
    } else {
      // Restore camera smoothly
      camera.position.x += (camOrigin.current.x - camera.position.x) * 0.15;
      camera.position.y += (camOrigin.current.y - camera.position.y) * 0.15;
    }

    // ── Water flow ──────────────────────────────────────────────────────────
    const showWater = phase==='SATURATION'||phase==='CRACKING'||phase==='SLOPE_FAILURE'||phase==='LANDSLIDE'||phase==='AFTERMATH';
    if (waterRef.current) {
      if (showWater) {
        const flowOp = phase==='SATURATION'?phaseT*0.6 : phase==='AFTERMATH'?0.3 : 0.7;
        (matWater as THREE.MeshStandardMaterial).opacity = flowOp;
        waterPtcl.forEach((w,i) => {
          const flowZ = ((w.z + t*w.vy*8) % 6) - 6 + 1;
          const gy = terrainHeight(w.x, flowZ)+0.03;
          const ang = flowZ<-4.5?0.45:flowZ<-1?0.15:0;
          dummy.position.set(w.x,gy,flowZ); dummy.rotation.set(-Math.PI/2+ang,0,0);
          dummy.scale.set(1,1,1); dummy.updateMatrix();
          waterRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        for (let i=0;i<WATER_COUNT;i++) {
          dummy.position.set(0,-100,0); dummy.scale.setScalar(0.01); dummy.updateMatrix();
          waterRef.current!.setMatrixAt(i, dummy.matrix);
        }
      }
      waterRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Crack ───────────────────────────────────────────────────────────────
    if (crackMeshRef.current) {
      const mat = matCrack as THREE.MeshStandardMaterial;
      if (phase==='CRACKING') {
        mat.emissiveIntensity = 0.4+Math.sin(t*4)*0.3;
        crackMeshRef.current.scale.set(phaseT,1,lerp(0.5,1,phaseT));
        crackMeshRef.current.visible = true;
      } else if (phase==='SLOPE_FAILURE'||phase==='LANDSLIDE') {
        mat.emissiveIntensity = 0.8+Math.sin(t*8)*0.2;
        crackMeshRef.current.visible = true;
        crackMeshRef.current.scale.set(1,1,1);
        if (phase==='LANDSLIDE') crackMeshRef.current.position.z += phaseT*0.015;
      } else { crackMeshRef.current.visible = false; }
    }

    // ── Hazard zone ring pulse ──────────────────────────────────────────────
    const zoneVisible = phase!=='STABLE';
    const pulse = 0.75+Math.sin(t*2.5)*0.25;
    if (dangerRingRef.current) {
      dangerRingRef.current.visible = zoneVisible;
      if (zoneVisible) (matDanger as THREE.MeshBasicMaterial).opacity = 0.22*pulse + (phase==='LANDSLIDE'?0.12:0);
    }
    if (cautionRingRef.current) {
      cautionRingRef.current.visible = zoneVisible && phase!=='HEAVY_RAIN';
      if (zoneVisible) (matCaution as THREE.MeshBasicMaterial).opacity = 0.18*pulse;
    }
    if (safeRingRef.current) {
      safeRingRef.current.visible = zoneVisible;
      const safePulse = hasEvacuated ? 0.9+Math.sin(t*6)*0.1 : 0.75+Math.sin(t*2)*0.25;
      if (zoneVisible) (matSafe as THREE.MeshBasicMaterial).opacity = (hasEvacuated?0.45:0.22)*safePulse;
    }

    // ── Soil chunks ─────────────────────────────────────────────────────────
    const inChunkPhase = phase==='SLOPE_FAILURE'||phase==='LANDSLIDE'||phase==='AFTERMATH';
    if (chunkRef.current) {
      if (inChunkPhase) {
        const GRAVITY = 9.8*delta;
        const SLOPE_A = 4.5*delta;
        chunks.forEach((c,i) => {
          if (!c.settled) {
            if (phase==='SLOPE_FAILURE') {
              const ct = smoothstep(phaseT);
              c.vz += ct*0.8/c.mass*delta; c.vx += ct*0.3*c.dirX/c.mass*delta;
            } else if (phase==='LANDSLIDE') {
              c.vz += SLOPE_A*c.dirZ/c.mass; c.vx += SLOPE_A*c.dirX*0.4/c.mass;
              c.rx += c.vrx/c.mass; c.rz += c.vrz/c.mass;
            }
            c.x += c.vx; c.z += c.vz;
            const gy = terrainHeight(c.x, c.z);
            if (c.y > gy+c.scale*0.5) { c.vy -= GRAVITY/c.mass; c.y += c.vy; }
            else { c.y = gy+c.scale*0.3; c.vy = 0; c.vx *= 0.92; c.vz *= 0.92; }
            if (c.z>3.0 && Math.abs(c.vz)<0.002 && Math.abs(c.vx)<0.002) { c.settled=true; c.vx=c.vz=c.vy=0; }
          }
          if (phase==='AFTERMATH') { c.vx*=0.88; c.vz*=0.88; if (Math.abs(c.vx)+Math.abs(c.vz)<0.0005) c.settled=true; }
          dummy.position.set(c.x,c.y,c.z); dummy.rotation.set(c.rx,c.ry,c.rz); dummy.scale.setScalar(c.scale); dummy.updateMatrix();
          chunkRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        chunks.forEach((c,i) => {
          c.x=c.ox; c.y=c.oy; c.z=c.oz; c.vx=c.vy=c.vz=0; c.rx=c.rz=0; c.settled=false;
          dummy.position.set(c.x,c.y,c.z); dummy.rotation.set(0,c.ry,0); dummy.scale.setScalar(c.scale); dummy.updateMatrix();
          chunkRef.current!.setMatrixAt(i, dummy.matrix);
        });
      }
      chunkRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Falling rocks ────────────────────────────────────────────────────────
    if (fallingRockRef.current) {
      const inActive = phase==='SLOPE_FAILURE'||phase==='LANDSLIDE'||phase==='AFTERMATH';
      const phaseElap = t - PHASE_TIMES[Math.max(4,pi)];
      const GRAVITY = 9.8*delta;
      fallingRocks.forEach((r,i) => {
        if (!inActive) { dummy.position.set(0,-100,0); dummy.scale.setScalar(0.01); dummy.updateMatrix(); fallingRockRef.current!.setMatrixAt(i,dummy.matrix); return; }
        const active = phaseElap >= r.startDelay;
        if (!active) { dummy.position.set(r.ox,r.oy,r.oz); dummy.rotation.set(0,r.ry,0); dummy.scale.setScalar(r.scale); dummy.updateMatrix(); fallingRockRef.current!.setMatrixAt(i,dummy.matrix); return; }
        if (!r.settled) {
          const lt = phaseElap - r.startDelay;
          r.vz += 0.08/r.mass*delta*Math.min(lt*2,1);
          r.rx+=r.vrx; r.ry+=r.vry; r.rz+=r.vrz;
          r.x+=r.vx; r.z+=r.vz;
          const gy = terrainHeight(r.x,r.z);
          if (r.y > gy+r.scale) { r.vy -= GRAVITY*0.5; r.y += r.vy; if (r.y<gy+r.scale) { r.y=gy+r.scale; r.vy=-r.vy*0.35; } }
          else { r.y=gy+r.scale*0.5; r.vx*=0.85; r.vz*=0.88; }
          if (phase==='AFTERMATH'||(r.z>5&&Math.abs(r.vz)<0.003)) r.settled=true;
        }
        dummy.position.set(r.x,r.y,r.z); dummy.rotation.set(r.rx,r.ry,r.rz); dummy.scale.setScalar(r.scale); dummy.updateMatrix();
        fallingRockRef.current!.setMatrixAt(i,dummy.matrix);
      });
      fallingRockRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Debris ──────────────────────────────────────────────────────────────
    if (debrisRef.current) {
      const inA = phase==='LANDSLIDE'||phase==='AFTERMATH';
      const pe = phase==='LANDSLIDE' ? t-PHASE_TIMES[5] : 999;
      debrisPtcl.forEach((d,i) => {
        if (!inA) { dummy.position.set(0,-100,0); dummy.scale.setScalar(0.01); dummy.updateMatrix(); debrisRef.current!.setMatrixAt(i,dummy.matrix); return; }
        const active = pe >= d.startDelay;
        if (!active) { dummy.position.set(d.ox,d.oy,d.oz); dummy.rotation.set(0,d.ry,0); dummy.scale.setScalar(d.scale); dummy.updateMatrix(); debrisRef.current!.setMatrixAt(i,dummy.matrix); return; }
        if (!d.settled) {
          d.vz+=0.04*delta; d.vx*=0.995; d.rx+=d.vrx; d.rz+=d.vrz; d.x+=d.vx; d.z+=d.vz;
          d.y=terrainHeight(d.x,d.z)+d.scale*0.4; d.vx*=0.94; d.vz*=0.94;
          if (phase==='AFTERMATH'||(d.z>4.5&&Math.abs(d.vz)<0.002)) d.settled=true;
        }
        dummy.position.set(d.x,d.y,d.z); dummy.rotation.set(d.rx,d.ry,d.rz); dummy.scale.setScalar(d.scale); dummy.updateMatrix();
        debrisRef.current!.setMatrixAt(i,dummy.matrix);
      });
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // ── Mud flow & buried road ────────────────────────────────────────────
    if (mudFlowRef.current) {
      const active = phase==='LANDSLIDE'||phase==='AFTERMATH';
      mudFlowRef.current.visible = active;
      if (active) {
        const mp = phase==='LANDSLIDE'?smoothstep(phaseT):1;
        mudFlowRef.current.scale.set(lerp(0.1,1,mp),1,lerp(0.05,1,mp));
        (mudFlowRef.current.material as THREE.MeshStandardMaterial).opacity = lerp(0,0.92,mp);
      }
    }
    if (buriedRoadRef.current) {
      buriedRoadRef.current.visible = phase==='AFTERMATH';
      if (phase==='AFTERMATH') buriedRoadRef.current.scale.set(lerp(0.1,1,smoothstep(phaseT)),1,lerp(0.1,1,smoothstep(phaseT)));
    }

    // ── Tree lean ───────────────────────────────────────────────────────────
    const lean = phase==='CRACKING'?phaseT*0.08 : phase==='SLOPE_FAILURE'?0.08+phaseT*0.15 :
                 phase==='LANDSLIDE'?0.23+phaseT*0.25 : phase==='AFTERMATH'?0.48 : 0;
    if (trunkRef.current && cLowRef.current && cHighRef.current) {
      treeData.forEach((tr,i) => {
        const tl = tr.onSlope ? lean : lean*0.2;
        const gy = terrainHeight(tr.x,tr.z);
        ([[ trunkRef.current!, 0.45 ], [ cLowRef.current!, 1.08 ], [ cHighRef.current!, 1.74 ]] as [THREE.InstancedMesh,number][]).forEach(([m,y]) => {
          dummy.position.set(tr.x,gy+y*tr.s,tr.z); dummy.rotation.set(tl,tr.ry,0); dummy.scale.setScalar(tr.s); dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
        });
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
      cLowRef.current.instanceMatrix.needsUpdate  = true;
      cHighRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // ── Reset on simulate toggle ───────────────────────────────────────────────
  useEffect(() => {
    if (isSimulating && !prevSim.current) {
      simTime.current = 0; phaseIndex.current = 0;
      chunks.forEach(c => { c.x=c.ox; c.y=c.oy; c.z=c.oz; c.vx=c.vy=c.vz=0; c.rx=c.rz=0; c.settled=false; });
      fallingRocks.forEach(r => { r.x=r.ox; r.y=r.oy; r.z=r.oz; r.vx=r.vy=r.vz=0; r.rx=r.ry=r.rz=0; r.settled=false; });
      debrisPtcl.forEach(d => { d.x=d.ox; d.y=d.oy; d.z=d.oz; d.vx=d.vy=d.vz=0; d.rx=d.rz=0; d.settled=false; });
      camOrigin.current.copy(camera.position);
    }
    prevSim.current = isSimulating;
  }, [isSimulating, chunks, fallingRocks, debrisPtcl, camera]);

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <group>
      <fog attach="fog" args={['#1e293b', 18, 48]} />

      {/* ── LIGHTING ─────────────────────────────────────────────────────── */}
      <ambientLight ref={ambientRef} intensity={0.62} color="#94a3b8" />
      <hemisphereLight args={['#64748b', '#1c0f07', 0.85]} />
      <directionalLight position={[-11,18,6]} intensity={1.55} color="#d1d5db"
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={1} shadow-camera-far={60}
        shadow-camera-left={-22} shadow-camera-right={22}
        shadow-camera-top={22} shadow-camera-bottom={-22} />
      <directionalLight position={[9,8,-6]} intensity={0.42} color="#78716c" />
      <pointLight position={[-4,-1.3,5.2]} intensity={2.2} color="#fbbf24" distance={12} decay={2} />
      <pointLight position={[1,3.8,-9]}   intensity={1.1} color="#bae6fd" distance={20} decay={2} />

      {/* ── TERRAIN ──────────────────────────────────────────────────────── */}
      <mesh geometry={terrainGeo} material={matTerrain} receiveShadow castShadow />

      {/* ━━━ HAZARD ZONE RINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* DANGER ZONE — main slide path, centre-slope */}
      <mesh ref={dangerRingRef} geometry={geoDangerRing} material={matDanger}
        position={[0, terrainHeight(0,-3.5)+0.15, -3.5]} rotation={[-Math.PI/2,0,0]} visible={false} />

      {/* CAUTION ZONE — margin band */}
      <mesh ref={cautionRingRef} geometry={geoCautionRing} material={matCaution}
        position={[0, terrainHeight(0,-3.5)+0.12, -3.5]} rotation={[-Math.PI/2,0,0]} visible={false} />

      {/* SAFE ZONE — lateral high ground to the left */}
      <mesh ref={safeRingRef} geometry={geoSafeRing} material={matSafe}
        position={[-10, terrainHeight(-10,2)+0.15, 2]} rotation={[-Math.PI/2,0,0]} visible={false} />

      {/* ── DANGER ZONE LABEL ─────────────────────────────────────────────── */}
      <group position={[0, terrainHeight(0,-3)+1.2, -3]}>
        <Html center distanceFactor={10}>
          <div className="px-2.5 py-1 rounded-lg bg-red-900/85 border border-red-500/70 backdrop-blur-sm text-center pointer-events-none select-none">
            <div className="text-red-300 font-black text-[10px] tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block"/>
              ZONA BAHAYA LONGSOR
            </div>
          </div>
        </Html>
      </group>

      {/* ── CAUTION ZONE LABEL ───────────────────────────────────────────── */}
      <group position={[9.5, terrainHeight(9.5,-3)+0.8, -3]}>
        <Html center distanceFactor={10}>
          <div className="px-2 py-0.5 rounded-lg bg-amber-900/80 border border-amber-500/60 backdrop-blur-sm text-center pointer-events-none select-none">
            <div className="text-amber-300 font-bold text-[9px] tracking-wider">⚠ ZONA WASPADA</div>
          </div>
        </Html>
      </group>

      {/* ── SAFE ZONE LABEL & EVACUATION TARGET ──────────────────────────── */}
      <group position={[-10, terrainHeight(-10,2)+0.9, 2]}>
        <Html center distanceFactor={9}>
          <div className="flex flex-col items-center gap-1.5 pointer-events-none select-none">
            <div className="px-2.5 py-1 rounded-lg bg-green-900/85 border border-green-500/70 backdrop-blur-sm text-center">
              <div className="text-green-300 font-black text-[10px] tracking-widest">✓ ZONA AMAN</div>
            </div>
          </div>
        </Html>
      </group>

      {/* ── SOIL CRACK ───────────────────────────────────────────────────── */}
      <mesh ref={crackMeshRef} position={[0, terrainHeight(0,-6.5)+0.08, -6.5]} visible={false}>
        <boxGeometry args={[9.0, 0.12, 0.22]} />
        <primitive object={matCrack} attach="material" />
      </mesh>

      {/* ── MUD FLOW ─────────────────────────────────────────────────────── */}
      <mesh ref={mudFlowRef} position={[0, terrainHeight(0,-1.5)+0.18, -1.5]} rotation={[0.35,0,0]} visible={false}>
        <boxGeometry args={[10, 0.45, 6.5]} />
        <meshStandardMaterial color="#3d1a08" roughness={0.98} transparent opacity={0} />
      </mesh>

      {/* ── BURIED ROAD ──────────────────────────────────────────────────── */}
      <mesh ref={buriedRoadRef} position={[0,-1.88,3.2]} visible={false}>
        <boxGeometry args={[10, 0.25, 3.2]} />
        <meshStandardMaterial color="#4a2009" roughness={0.96} />
      </mesh>

      {/* ── MOUNTAIN ROAD ────────────────────────────────────────────────── */}
      <mesh position={[0,-1.968,3.6]} receiveShadow>
        <boxGeometry args={[30,0.055,4.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.72} />
      </mesh>
      {Array.from({length:14},(_,i)=>(
        <mesh key={`rd-${i}`} position={[(i-6.5)*2,-1.935,3.6]}>
          <boxGeometry args={[0.85,0.012,0.10]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
      ))}
      <mesh position={[0,-1.99,5.8]}>
        <boxGeometry args={[30,0.04,1.2]} />
        <meshStandardMaterial color="#374151" roughness={0.85} />
      </mesh>
      <mesh position={[0,-1.965,1.5]}>
        <boxGeometry args={[30,0.08,0.22]} />
        <meshStandardMaterial color="#6b7280" roughness={0.75} />
      </mesh>

      {/* ── INSTANCED TREES ──────────────────────────────────────────────── */}
      <instancedMesh ref={trunkRef} args={[geoTrunk,matTrunk,treeData.length]} castShadow />
      <instancedMesh ref={cLowRef}  args={[geoCLow, matCLow, treeData.length]} castShadow />
      <instancedMesh ref={cHighRef} args={[geoCHigh,matCHigh,treeData.length]} castShadow />

      {/* ── STATIC ROCKS ─────────────────────────────────────────────────── */}
      <instancedMesh ref={staticRockRef} args={[geoSRock,matSRock,sRockData.length]} castShadow receiveShadow />

      {/* ── SIMULATION ELEMENTS ──────────────────────────────────────────── */}
      <instancedMesh ref={chunkRef}      args={[geoChunk, matChunk, CHUNK_COUNT]}  castShadow />
      <instancedMesh ref={fallingRockRef} args={[geoFRock, matFRock, FROCK_COUNT]} castShadow />
      <instancedMesh ref={debrisRef}     args={[geoDebris,matDebris,DEBRIS_COUNT]} castShadow />
      <instancedMesh ref={waterRef}      args={[geoWater, matWater, WATER_COUNT]} />

      {/* ── HOUSES ───────────────────────────────────────────────────────── */}
      {houses.map((h,i)=>(
        <group key={`h-${i}`} position={[h.x,-1.97,h.z]} rotation={[0,h.rot,0]}>
          <mesh geometry={geoFndn}  material={matFndn} position={[0,0.06,0]} receiveShadow />
          <mesh geometry={geoWalls} position={[0,0.68,0]} castShadow>
            <meshStandardMaterial color={h.wall} roughness={0.76} />
          </mesh>
          <mesh geometry={geoRoof} position={[0,1.44,0]} rotation={[0,0,Math.PI/2]} castShadow>
            <meshStandardMaterial color={h.roof} roughness={0.80} />
          </mesh>
          <mesh geometry={geoWin}  material={matWin}  position={[0.52,0.70,0.92]} />
          <mesh geometry={geoWin}  material={matWin}  position={[1.12,0.70,0]}   rotation={[0,Math.PI/2,0]} />
          <mesh geometry={geoDoor} material={matDoor} position={[-0.42,0.42,0.92]} />
        </group>
      ))}

      {/* ── UTILITY POLES ────────────────────────────────────────────────── */}
      {([-8,-2.5,3.5] as number[]).map((px,i)=>(
        <group key={`pole-${i}`} position={[px,-1.97,0.8]}>
          <mesh position={[0,1.4,0]}>
            <cylinderGeometry args={[0.05,0.07,2.8,8]} />
            <meshStandardMaterial color="#78716c" roughness={0.80} />
          </mesh>
          <mesh position={[0,2.75,0]}>
            <boxGeometry args={[0.55,0.05,0.06]} />
            <meshStandardMaterial color="#57534e" roughness={0.80} />
          </mesh>
        </group>
      ))}

      {/* ── RAIN ─────────────────────────────────────────────────────────── */}
      <instancedMesh ref={rainRef} args={[undefined,undefined,RAIN_COUNT]}>
        <cylinderGeometry args={[0.015,0.015,0.62]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.45} />
      </instancedMesh>

      {/* ━━━ EVACUATION BUTTON — always visible, highlights on LANDSLIDE ━━━ */}
      <group position={[-10, terrainHeight(-10,2)+1.4, 2]}>
        <Html center distanceFactor={8}>
          <button
            id="landslide-evac-btn"
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('ESCAPE_PERPENDICULAR');
              onEvacuated();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-400 hover:to-green-500 text-slate-950 font-black text-xs shadow-[0_0_22px_rgba(132,204,22,0.85)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping flex-shrink-0" />
            LARI MENYAMPING — ZONA AMAN!
          </button>
        </Html>
      </group>

    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Outer wrapper — manages React UI state (phase label, evacuation feedback, etc.)
// Keeps useThree-dependent logic inside LandslideSceneInner
// ─────────────────────────────────────────────────────────────────────────────
export const LandslideScene: React.FC<LandslideSceneProps> = ({
  isSimulating = true,
  onActionClick,
}) => {
  const [currentPhase, setCurrentPhase] = useState<Phase>('STABLE');
  const [hasEvacuated, setHasEvacuated] = useState(false);

  // Reset on new simulation run
  useEffect(() => {
    if (isSimulating) setHasEvacuated(false);
  }, [isSimulating]);

  const handleEvacuated = useCallback(() => {
    if (!hasEvacuated) setHasEvacuated(true);
  }, [hasEvacuated]);

  // ── Phase-aware UI config ──────────────────────────────────────────────────
  const phaseUI: Record<Phase, { icon: React.ReactNode; color: string; title: string; desc: string }> = {
    STABLE: {
      icon: <ShieldCheck className="w-4 h-4 text-blue-300" />,
      color: 'border-blue-500/50 bg-blue-950/70',
      title: 'KONDISI STABIL',
      desc: 'Lereng dalam kondisi normal. Perhatikan curah hujan dan kondisi tanah di sekitar Anda.',
    },
    HEAVY_RAIN: {
      icon: <AlertTriangle className="w-4 h-4 text-sky-300" />,
      color: 'border-sky-500/50 bg-sky-950/70',
      title: 'HUJAN DERAS',
      desc: 'Hujan intensitas tinggi meresap ke dalam tanah. Air melemahkan ikatan antar partikel tanah.',
    },
    SATURATION: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-300" />,
      color: 'border-amber-500/50 bg-amber-950/70',
      title: 'TANAH JENUH AIR',
      desc: 'Pori-pori tanah penuh air. Berat tanah bertambah drastis, kekuatan geser (shear strength) menurun.',
    },
    CRACKING: {
      icon: <AlertTriangle className="w-4 h-4 text-orange-300 animate-pulse" />,
      color: 'border-orange-500/60 bg-orange-950/75',
      title: '⚠ RETAKAN MUNCUL',
      desc: 'Lereng mulai retak! Ini tanda bahaya utama. SEGERA keluar dari area ini ke zona aman lateral.',
    },
    SLOPE_FAILURE: {
      icon: <XCircle className="w-4 h-4 text-red-400 animate-pulse" />,
      color: 'border-red-500/70 bg-red-950/80',
      title: '🚨 LERENG RUNTUH',
      desc: 'Massa tanah bergerak! Jangan lari menuruni bukit — Anda akan tersapu. Lari MENYAMPING tegak lurus dari jalur longsor!',
    },
    LANDSLIDE: {
      icon: <XCircle className="w-4 h-4 text-red-300 animate-bounce" />,
      color: 'border-red-600/80 bg-red-950/90',
      title: '🔴 LONGSOR AKTIF',
      desc: 'LONGSOR TERJADI! Tekan tombol di Zona Aman untuk menyelamatkan diri ke sisi lateral sekarang!',
    },
    AFTERMATH: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-300" />,
      color: 'border-emerald-600/60 bg-emerald-950/70',
      title: 'PASCA LONGSOR',
      desc: 'Longsor berhenti. Jalan tertutup lumpur. Hindari area ini hingga tim ahli geologi menyatakan aman.',
    },
  };

  const ui = phaseUI[currentPhase];

  return (
    <group>
      {/* ── 3D scene (inner component) ─────────────────────────────────── */}
      <LandslideSceneInner
        isSimulating={isSimulating}
        onActionClick={onActionClick}
        onPhaseChange={setCurrentPhase}
        onEvacuated={handleEvacuated}
        hasEvacuated={hasEvacuated}
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

          {/* ── Evacuation success feedback ───────────────────────────────────── */}
          {hasEvacuated && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none select-none animate-bounce">
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-green-900/95 border-2 border-green-400/80 backdrop-blur-md shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
                <div className="text-green-300 font-black text-sm tracking-wider">EVAKUASI BERHASIL! +50 XP</div>
                <div className="text-green-200 text-[11px] text-center max-w-[200px] leading-relaxed">
                  Anda berhasil lari menyamping tegak lurus dari jalur longsor ke Zona Aman!
                </div>
              </div>
            </div>
          )}

          {/* ── Hazard zone legend (bottom-right) ────────────────────────────── */}
          {currentPhase !== 'STABLE' && (
            <div className="absolute bottom-24 right-4 z-30 pointer-events-none select-none">
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/85 border border-slate-700/60 backdrop-blur-md shadow-xl">
                <div className="text-slate-400 text-[9px] font-bold tracking-widest mb-1">ZONA RISIKO</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                  <span className="text-red-300 text-[10px] font-semibold">ZONA BAHAYA — Jalur Longsor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
                  <span className="text-amber-300 text-[10px] font-semibold">ZONA WASPADA — Margin Aman</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                  <span className="text-green-300 text-[10px] font-semibold">ZONA AMAN — Sisi Lateral</span>
                </div>
                <div className="mt-1 border-t border-slate-700/50 pt-1.5">
                  <div className="flex items-center gap-1.5 text-lime-300 text-[9px]">
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-bold">Arah evakuasi: MENYAMPING, bukan menuruni lereng!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Aftermath educational debrief ─────────────────────────────────── */}
          {currentPhase === 'AFTERMATH' && (
            <div className="absolute bottom-24 left-4 z-30 pointer-events-none select-none max-w-[260px]">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-600/60 backdrop-blur-md shadow-2xl">
                <div className="text-white font-black text-[11px] tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  PENJELASAN FISIKA LONGSOR
                </div>
                <div className="space-y-1.5">
                  {[
                    { icon:'💧', text:'Hujan deras menjenuhkan pori-pori tanah, meningkatkan berat massa.' },
                    { icon:'🔩', text:'Tekanan air pori (pore pressure) mengurangi gaya gesek antar partikel tanah.' },
                    { icon:'⬇', text:'Gaya gravitasi akhirnya melampaui kekuatan geser tanah → longsor.' },
                    { icon:'↔', text:'Evakuasi MENYAMPING karena debris bergerak ke arah bawah lereng.' },
                    { icon:'🚧', text:'Infrastruktur di jalur longsor (jalan, rumah) tidak bisa bertahan.' },
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
