import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

// 0=NORMAL, 1=MAGMA_RISING, 2=PHREATIC, 3=MAGMATIC_RISE, 4=ERUPTION, 5=LAVA_FLOW, 6=POST_ERUPTION
export type EruptionStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Atmospheric fog setup — broad distant range so scene and smoke are always crystal clear
const SceneSetup: React.FC<{ stage: EruptionStage }> = ({ stage }) => {
  const { scene } = useThree();

  useEffect(() => {
    // Subtle atmospheric distance haze
    const fogColor = stage >= 5
      ? new THREE.Color('#0c0703')
      : stage >= 4
      ? new THREE.Color('#08060c')
      : new THREE.Color('#060810');
    const fogNear = 45;
    const fogFar  = 110;
    scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
    return () => { scene.fog = null; };
  }, [scene, stage]);

  return null;
};

interface VolcanoSceneProps {
  isSimulating?: boolean;
  eruptionStage?: EruptionStage;
  onActionClick?: (actionId: string) => void;
}

export const VolcanoScene: React.FC<VolcanoSceneProps> = ({
  isSimulating = true,
  eruptionStage = 0,
  onActionClick
}) => {
  // ─── REFS ───
  const ashPlumeRef    = useRef<THREE.InstancedMesh>(null);
  const mushroomRef    = useRef<THREE.InstancedMesh>(null);
  const pyroclasticRef = useRef<THREE.InstancedMesh>(null);
  const lavaSparksRef  = useRef<THREE.InstancedMesh>(null);
  const fumaroleRef    = useRef<THREE.InstancedMesh>(null);
  const fallingAshRef  = useRef<THREE.InstancedMesh>(null);
  const risingMagmaRef = useRef<THREE.InstancedMesh>(null);
  const lavaFountainRef= useRef<THREE.InstancedMesh>(null);
  const lavaLakeRef    = useRef<THREE.Mesh>(null);
  const lavaDomeRef    = useRef<THREE.Mesh>(null);
  const magmaChamberRef= useRef<THREE.Mesh>(null);
  const conduitRef     = useRef<THREE.Mesh>(null);
  const flagRef        = useRef<THREE.Mesh>(null);
  const sirenLightRef  = useRef<THREE.PointLight>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const lightningMeshRef  = useRef<THREE.Group>(null);
  const krbPulseRef    = useRef<THREE.Mesh>(null);
  const mountainGroupRef  = useRef<THREE.Group>(null);
  const lavaFlowGroupRef  = useRef<THREE.Group>(null);

  // ─── COUNTS ───
  const plumeCount     = 60;
  const mushroomCount  = 70;
  const pyroCount      = 35;
  const sparkCount     = 100;
  const fumaroleCount  = 30;
  const ashFallCount   = 80;
  const risingCount    = 35;
  const fountainCount  = 60;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // ─── CUTAWAY / X-RAY VIEW MODE ───
  // Default: True for stages 0-2 (Visualizes magma rising inside conduit & magma chamber), False for stages 3-6 (Full Solid Eruption)
  const [userCutawayOverride, setUserCutawayOverride] = useState<boolean | null>(null);
  const autoCutaway = eruptionStage <= 2;
  const showCutaway = userCutawayOverride !== null ? userCutawayOverride : autoCutaway;

  // ─── STAGE FLAGS ───
  const showFumarole     = eruptionStage >= 1;
  const showRisingMagma  = eruptionStage >= 1;
  const showAshPlume     = eruptionStage >= 2;
  const showLavaDome     = eruptionStage >= 3;
  const showMushroom     = eruptionStage >= 4;
  const showPyroclastic  = eruptionStage >= 4;
  const showSparks       = eruptionStage >= 4;
  const showLightning    = eruptionStage >= 4;
  const showFountain     = eruptionStage >= 4;
  const showLavaFlowShort= eruptionStage >= 4;
  const showLavaFlowLong = eruptionStage >= 5;
  const showFallingAsh   = eruptionStage >= 6;
  const showEvacuation   = eruptionStage >= 3;
  const postDampen       = eruptionStage === 6 ? 0.45 : 1.0;

  // ─── INTENSITY TABLES ───
  const lavaEmissive       = [0.6, 1.5, 2.5, 4.0, 7.0, 5.5, 2.0][eruptionStage] ?? 0.6;
  const craterLightInt     = [1.5, 3.0, 5.0, 8.0, 14.0, 10.0, 4.0][eruptionStage] ?? 1.5;
  const magmaGlow          = [0.4, 2.0, 3.5, 5.5, 8.0, 6.0, 1.5][eruptionStage] ?? 0.4;
  const conduitFill        = [0.0, 0.35, 0.65, 0.88, 1.0, 0.95, 0.4][eruptionStage] ?? 0.0;
  const plumeIntensity     = [0, 0, 0.4, 0.7, 1.0, 0.85, 0.5][eruptionStage] ?? 0;

  // ─── MOUNTAIN GEOMETRY ─── realistic stratovolcano, dark rock tones, full 360 solid
  const mountainGeometry = useMemo(() => {
    const size = 28;
    const seg  = 80;
    const geo  = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos  = geo.attributes.position;
    const cnt  = pos.count;
    const cols = new Float32Array(cnt * 3);

    // Realistic dark volcano palette
    const cLowland = new THREE.Color('#1a4a2e'); // dark green lowland
    const cForest  = new THREE.Color('#0f3d22'); // dense forest
    const cSoil    = new THREE.Color('#3b2f2f'); // volcanic soil
    const cBasalt  = new THREE.Color('#1c1412'); // dark basalt rock
    const cAsh     = new THREE.Color('#14100e'); // cold ash / obsidian
    const cSulfur  = new THREE.Color('#5a4a08'); // sulfur deposit (dark)
    const cCrater  = new THREE.Color('#4a0808'); // deep crater interior

    for (let i = 0; i < cnt; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const θ = Math.atan2(z, x);

      const cRad = 1.08;   // crater inner radius
      const cLip = 1.38;   // crater rim

      let y = 0;
      if (r < cRad) {
        // crater bowl — sinks down then up
        y = 1.5 + Math.pow(r / cRad, 2.5) * 1.65;
      } else if (r <= cLip) {
        const t = (r - cRad) / (cLip - cRad);
        y = 3.15 + Math.sin(t * Math.PI) * 0.45 + Math.sin(θ * 11) * 0.15;
      } else {
        const d = r - cLip;
        // Primary slope with realistic exponential falloff
        const base  = 3.25 * Math.exp(-0.27 * d);
        // Ridgelines — subtle 360 degree natural ridges
        const ridge = Math.sin(θ * 7) * 0.32 * Math.exp(-0.14 * d);
        // Micro-noise for rough texture feel
        const n1 = Math.sin(x * 2.1 + z * 1.6) * 0.11;
        const n2 = Math.cos(x * 1.3 - z * 2.0) * 0.08;
        // Front gorge (lava channel on visible slope)
        const gAngle = Math.abs(θ - 0.1); // θ≈0 = pure +x direction
        const gorge  = z > 0 && gAngle < 0.3 && d > 0.4
          ? -0.55 * Math.cos((gAngle / 0.3) * (Math.PI / 2)) * Math.exp(-0.08 * d)
          : 0;
        y = Math.max(0, base + ridge + (n1 + n2) * Math.min(1, r / 3) + gorge);
      }

      pos.setY(i, y - 2.15);

      // Vertex colors — dark & realistic
      const color = new THREE.Color();
      if (r < cRad) {
        // Interior crater — deep dark bowl
        color.lerpColors(cCrater, cAsh, Math.pow(r / cRad, 0.7));
      } else if (r <= cLip) {
        // Crater rim — dark basalt with very slight warmth
        const t = (r - cRad) / (cLip - cRad);
        color.lerpColors(cAsh, cBasalt, t);
      } else {
        const h = y;  // actual height above base
        const s = Math.sin(θ * 6) * 0.5 + 0.5; // directional variation
        if (h > 2.5) {
          // High peak: ash/basalt with tiny sulfur patches
          const sulfurPatch = Math.sin(x * 3.5 + z * 2.8) > 0.75;
          color.lerpColors(cAsh, sulfurPatch ? cSulfur : cBasalt, 0.4);
        } else if (h > 1.4) {
          color.lerpColors(cBasalt, cSoil, (h - 1.4) / 1.1);
        } else if (h > 0.5) {
          color.lerpColors(cSoil, cForest, (h - 0.5) / 0.9);
        } else {
          color.lerpColors(cForest, cLowland, Math.min(1, (0.5 - h) / 0.5));
        }
        // Slight color variation by direction for realism
        color.multiplyScalar(0.85 + s * 0.15);
      }
      cols[i * 3]     = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // ─── PARTICLES — Full 3D radial distribution for 360 degree visibility ───
  const plumeP = useMemo(() => Array.from({ length: plumeCount }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const progress = i / plumeCount;
    const radius = 0.15 + progress * 0.65 + (Math.random() - 0.5) * 0.15;
    return {
      angle,
      radius,
      x: Math.cos(angle) * radius,
      y: 1.2 + progress * 6.0,
      z: Math.sin(angle) * radius,
      vy: 0.045 + Math.random() * 0.035,
      dx: (Math.random() - 0.5) * 0.012,
      dz: (Math.random() - 0.5) * 0.012,
      sc: 0.6 + progress * 0.9,
      rs: (Math.random() - 0.5) * 0.025
    };
  }), [plumeCount]);

  const mushroomP = useMemo(() => Array.from({ length: mushroomCount }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.6 + Math.random() * 3.5;
    return {
      angle,
      radius,
      br: radius,
      y: 5.5 + Math.random() * 3.5,
      vy: 0.01 + Math.random() * 0.012,
      rs: (Math.random() - 0.5) * 0.018,
      sc: 0.8 + Math.random() * 0.7
    };
  }), [mushroomCount]);

  const pyroP = useMemo(() => Array.from({ length: pyroCount }, (_, i) => {
    const dist  = 1.3 + (i / pyroCount) * 6.5;
    const angle = -0.5 + (Math.random() - 0.5) * 0.8; // front slope (z > 0)
    return { dist, angle, sp: 0.025 + Math.random() * 0.02, sc: 0.4 + (i / pyroCount) * 0.55, rs: (Math.random() - 0.5) * 0.04 };
  }), [pyroCount]);

  const sparksP = useMemo(() => Array.from({ length: sparkCount }, () => ({
    x: (Math.random() - 0.5) * 0.4,
    y: 1.4,
    z: (Math.random() - 0.5) * 0.4,
    vx: (Math.random() - 0.5) * 0.22,
    vy: 0.18 + Math.random() * 0.25,
    vz: (Math.random() - 0.5) * 0.22,
    g: -0.0055,
    sc: 0.07 + Math.random() * 0.18
  })), [sparkCount]);

  const fumaroleP = useMemo(() => Array.from({ length: fumaroleCount }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const progress = i / fumaroleCount;
    const radius = 0.12 + progress * 0.35;
    return {
      angle,
      radius,
      x: Math.cos(angle) * radius,
      y: 1.1 + progress * 3.0,
      z: Math.sin(angle) * radius,
      vy: 0.016 + Math.random() * 0.018,
      dx: (Math.random() - 0.5) * 0.008,
      dz: (Math.random() - 0.5) * 0.008,
      sc: 0.45 + progress * 0.65
    };
  }), [fumaroleCount]);

  const ashFallP = useMemo(() => Array.from({ length: ashFallCount }, () => ({
    x: (Math.random() - 0.5) * 24,
    y: 4.5 + Math.random() * 7.5,
    z: (Math.random() - 0.5) * 24,
    vy: -(0.016 + Math.random() * 0.02),
    dx: (Math.random() - 0.5) * 0.01,
    sc: 0.07 + Math.random() * 0.14
  })), [ashFallCount]);

  const risingP = useMemo(() => Array.from({ length: risingCount }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.25;
    return {
      x: Math.cos(angle) * r,
      y: -4.2 + (i / risingCount) * 5.2,
      z: Math.sin(angle) * r,
      vy: 0.025 + Math.random() * 0.03,
      sc: 0.12 + Math.random() * 0.16,
      wb: Math.random() * Math.PI * 2
    };
  }), [risingCount]);

  const fountainP = useMemo(() => Array.from({ length: fountainCount }, () => ({
    x: (Math.random() - 0.5) * 0.4,
    y: 1.2,
    z: (Math.random() - 0.5) * 0.4,
    vx: (Math.random() - 0.5) * 0.12,
    vy: 0.18 + Math.random() * 0.28,
    vz: (Math.random() - 0.5) * 0.12,
    g: -0.006,
    sc: 0.08 + Math.random() * 0.18
  })), [fountainCount]);

  // ─── ANIMATION LOOP ───
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Mountain shake
    if (mountainGroupRef.current) {
      if      (eruptionStage === 1) { mountainGroupRef.current.position.x = Math.sin(t * 20) * 0.009; mountainGroupRef.current.position.z = 0; }
      else if (eruptionStage === 2) { mountainGroupRef.current.position.x = Math.sin(t * 28) * 0.02;  mountainGroupRef.current.position.z = 0; }
      else if (eruptionStage === 4) { mountainGroupRef.current.position.x = Math.sin(t * 38) * 0.04;  mountainGroupRef.current.position.z = Math.cos(t * 45) * 0.03; }
      else                          { mountainGroupRef.current.position.x = 0; mountainGroupRef.current.position.z = 0; }
    }

    // Magma chamber
    if (magmaChamberRef.current) {
      const mat = magmaChamberRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = magmaGlow + Math.sin(t * (eruptionStage >= 4 ? 7 : 3)) * magmaGlow * 0.35;
    }

    // Conduit
    if (conduitRef.current) {
      const mat = conduitRef.current.material as THREE.MeshStandardMaterial;
      if (mat) { mat.emissiveIntensity = conduitFill * 4.5 + Math.sin(t * 5) * 0.6; mat.opacity = 0.35 + conduitFill * 0.6; }
    }

    // Lava lake
    if (lavaLakeRef.current) {
      const mat = lavaLakeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = lavaEmissive + Math.sin(t * (eruptionStage >= 4 ? 10 : 3)) * (eruptionStage >= 4 ? 2.5 : 0.5);
    }

    // Lava dome
    if (lavaDomeRef.current && showLavaDome) {
      const mat = lavaDomeRef.current.material as THREE.MeshStandardMaterial;
      const glow = [2.5, 5.0, 3.5, 2.0][Math.min(3, eruptionStage - 3)] ?? 2.5;
      if (mat) mat.emissiveIntensity = glow + Math.sin(t * 4) * 1.0;
    }

    // Siren
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = showEvacuation ? 2.5 + Math.sin(t * 12) * 2.0 : 0.5;
    }

    // Lightning — 3 independent flash frequencies for natural look
    if (lightningLightRef.current && lightningMeshRef.current) {
      const f1 = showLightning && isSimulating && Math.sin(t * 7.3) > 0.70 && Math.sin(t * 2.1) > -0.1;
      const f2 = showLightning && isSimulating && Math.sin(t * 12.1) > 0.75 && Math.sin(t * 4.7) > 0.0;
      const f3 = showLightning && isSimulating && Math.sin(t * 19.7) > 0.80 && Math.sin(t * 6.9) > 0.15;
      const flash = f1 || f2 || f3;
      lightningLightRef.current.intensity = flash ? 30 + Math.sin(t * 80) * 10 : 0;
      lightningMeshRef.current.visible    = flash;
      if (flash) {
        lightningMeshRef.current.rotation.y = f1 ? 0 : f2 ? Math.PI * 0.7 : Math.PI * 1.4;
        lightningMeshRef.current.position.x = (Math.random() - 0.5) * 2;
        lightningMeshRef.current.position.z = (Math.random() - 0.5) * 2;
      }
    }

    // Flag wave
    if (flagRef.current) flagRef.current.rotation.y = Math.sin(t * 4.5) * 0.35;

    // KRB pulse
    if (krbPulseRef.current) {
      const mat = krbPulseRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = eruptionStage >= 3 ? 0.6 + Math.sin(t * 3.5) * 0.28 : 0.12;
    }

    // Lava flow pulse
    if (lavaFlowGroupRef.current && (showLavaFlowShort || showLavaFlowLong)) {
      lavaFlowGroupRef.current.children.forEach((c, i) => {
        if (c instanceof THREE.Mesh) {
          const m = c.material as THREE.MeshStandardMaterial;
          if (m) m.emissiveIntensity = 3.5 + Math.sin(t * 2.5 + i * 0.7) * 1.5;
        }
      });
    }

    const hideP = (mesh: THREE.InstancedMesh | null, n: number) => {
      if (!mesh) return;
      for (let i = 0; i < n; i++) { dummy.position.set(0, -999, 0); dummy.scale.set(0,0,0); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }
      mesh.instanceMatrix.needsUpdate = true;
    };

    // RISING MAGMA (inside conduit, at z=0 cross-section face)
    if (risingMagmaRef.current) {
      if (showRisingMagma && conduitFill > 0) {
        const maxY = -4.8 + conduitFill * 6.0;
        risingP.forEach((p, i) => {
          p.y += p.vy * (eruptionStage >= 4 ? 2.2 : 1.0);
          p.x  = Math.sin(t * 2.2 + p.wb) * 0.13;
          if (p.y > maxY) p.y = -4.8 + Math.random() * 0.4;
          const s = p.sc * (1.0 + (p.y + 4.8) * 0.12);
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          risingMagmaRef.current!.setMatrixAt(i, dummy.matrix);
        });
        risingMagmaRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(risingMagmaRef.current, risingCount); }
    }

    // FUMAROLE (white/light steam puffs directly from crater)
    if (fumaroleRef.current) {
      if (showFumarole) {
        const sp = eruptionStage === 1 ? 0.6 : eruptionStage === 2 ? 0.95 : 0.35;
        fumaroleP.forEach((p, i) => {
          p.y += p.vy * sp; p.x += p.dx; p.z += p.dz;
          if (p.y > 4.2) { p.y = 1.1 + Math.random() * 0.2; p.x = (Math.random() - 0.5) * 0.25; p.z = (Math.random() - 0.5) * 0.25; }
          const s = p.sc * (1.0 + (p.y - 1.1) * 0.4);
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(s, s, s);
          dummy.rotation.set(0, t * 0.12 + i, 0);
          dummy.updateMatrix();
          fumaroleRef.current!.setMatrixAt(i, dummy.matrix);
        });
        fumaroleRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(fumaroleRef.current, fumaroleCount); }
    }

    // ASH PLUME (thick dark volcanic column from crater bowl)
    if (ashPlumeRef.current) {
      if (showAshPlume) {
        const sm = Math.max(0.35, plumeIntensity * postDampen);
        plumeP.forEach((p, i) => {
          p.y += p.vy * sm; p.x += p.dx * sm; p.z += p.dz * sm;
          const maxH = eruptionStage === 2 ? 3.8 : eruptionStage === 3 ? 5.2 : 7.2;
          if (p.y > maxH) { p.y = 1.2 + Math.random() * 0.2; p.x = (Math.random() - 0.5) * 0.3; p.z = (Math.random() - 0.5) * 0.3; }
          const s = p.sc * (1.0 + (p.y - 1.2) * 0.35) * sm;
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(s, s, s);
          dummy.rotation.set(t * 0.18 + i * 0.1, t * 0.1 + i, 0);
          dummy.updateMatrix();
          ashPlumeRef.current!.setMatrixAt(i, dummy.matrix);
        });
        ashPlumeRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(ashPlumeRef.current, plumeCount); }
    }

    // MUSHROOM CLOUD ANVIL
    if (mushroomRef.current) {
      if (showMushroom) {
        mushroomP.forEach((m, i) => {
          m.angle += m.rs * postDampen; m.y += m.vy * postDampen;
          const cr = m.br + (m.y - 5.5) * 0.35;
          const mx = Math.cos(m.angle) * cr, mz = Math.sin(m.angle) * cr;
          if (m.y > 9.0) m.y = 5.5 + Math.random() * 0.4;
          const s = m.sc * postDampen;
          dummy.position.set(mx, m.y, mz); dummy.scale.set(s, s * 0.7, s);
          dummy.rotation.set(0, m.angle, 0); dummy.updateMatrix();
          mushroomRef.current!.setMatrixAt(i, dummy.matrix);
        });
        mushroomRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(mushroomRef.current, mushroomCount); }
    }

    // PYROCLASTIC FLOW (front slope z > 0)
    if (pyroclasticRef.current) {
      if (showPyroclastic) {
        pyroP.forEach((pf, i) => {
          pf.dist += pf.sp * postDampen;
          if (pf.dist > 7.5) pf.dist = 1.3;
          const px = Math.cos(pf.angle) * pf.dist, pz = Math.sin(pf.angle) * pf.dist;
          const py = Math.max(-2.0, 2.8 * Math.exp(-0.32 * (pf.dist - 1.3)) - 2.0);
          const cs = pf.sc * (1.0 + pf.dist * 0.15) * postDampen;
          dummy.position.set(px, py + 0.3, pz); dummy.scale.set(cs, cs * 0.8, cs);
          dummy.rotation.set(t * 0.25 + i, pf.angle, 0); dummy.updateMatrix();
          pyroclasticRef.current!.setMatrixAt(i, dummy.matrix);
        });
        pyroclasticRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(pyroclasticRef.current, pyroCount); }
    }

    // BALLISTIC LAVA BOMBS
    if (lavaSparksRef.current) {
      if (showSparks) {
        sparksP.forEach((s, i) => {
          s.x += s.vx * postDampen; s.y += s.vy * postDampen; s.z += s.vz * postDampen; s.vy += s.g;
          if (s.y < -2.0) { s.x = (Math.random()-0.5)*0.3; s.y = 1.4; s.z = (Math.random()-0.5)*0.3; s.vx=(Math.random()-0.5)*0.18; s.vy=0.16+Math.random()*0.22; s.vz=(Math.random()-0.5)*0.18; }
          dummy.position.set(s.x, s.y, s.z); dummy.scale.set(s.sc, s.sc, s.sc);
          dummy.rotation.set(t*3+i, t*2, 0); dummy.updateMatrix();
          lavaSparksRef.current!.setMatrixAt(i, dummy.matrix);
        });
        lavaSparksRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(lavaSparksRef.current, sparkCount); }
    }

    // LAVA FOUNTAIN (visible vertical jets from crater)
    if (lavaFountainRef.current) {
      if (showFountain) {
        fountainP.forEach((fp, i) => {
          fp.x += fp.vx; fp.y += fp.vy; fp.z += fp.vz; fp.vy += fp.g;
          if (fp.y < 1.0) { fp.x=(Math.random()-0.5)*0.4; fp.y=1.3; fp.z=(Math.random()-0.5)*0.4; fp.vx=(Math.random()-0.5)*0.12; fp.vy=0.18+Math.random()*0.28; fp.vz=(Math.random()-0.5)*0.12; }
          const bri = Math.max(0.05, fp.vy / 0.3);
          dummy.position.set(fp.x, fp.y, fp.z); dummy.scale.set(fp.sc * bri, fp.sc, fp.sc * bri);
          dummy.rotation.set(t*4+i, 0, 0); dummy.updateMatrix();
          lavaFountainRef.current!.setMatrixAt(i, dummy.matrix);
        });
        lavaFountainRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(lavaFountainRef.current, fountainCount); }
    }

    // FALLING ASH
    if (fallingAshRef.current) {
      if (showFallingAsh) {
        ashFallP.forEach((p, i) => {
          p.y += p.vy; p.x += p.dx;
          if (p.y < -2.8) { p.y = 5.0 + Math.random() * 5.0; p.x = (Math.random()-0.5)*22; p.z = (Math.random()-0.5)*22; }
          dummy.position.set(p.x, p.y, p.z); dummy.scale.set(p.sc, p.sc*0.25, p.sc);
          dummy.rotation.set(t*0.4+i, t*0.25+i*0.5, 0); dummy.updateMatrix();
          fallingAshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        fallingAshRef.current.instanceMatrix.needsUpdate = true;
      } else { hideP(fallingAshRef.current, ashFallCount); }
    }
  });

  // ─── JSX ───
  return (
    <group>
      <SceneSetup stage={eruptionStage} />

      {/* ══ LIGHTS ══ */}
      <ambientLight intensity={eruptionStage === 0 ? 1.3 : eruptionStage === 6 ? 0.55 : eruptionStage >= 4 ? 0.9 : 1.1} />
      <hemisphereLight
        args={[
          eruptionStage <= 1 ? '#93c5fd' : eruptionStage === 6 ? '#78716c' : '#fed7aa',
          '#030712',
          eruptionStage <= 1 ? 0.9 : 1.2
        ]}
      />
      <directionalLight
        position={[12, 20, 14]} intensity={eruptionStage <= 1 ? 2.8 : eruptionStage === 6 ? 1.4 : 2.2}
        color={eruptionStage <= 1 ? '#e0f2fe' : eruptionStage === 6 ? '#a8a29e' : '#fff7ed'}
        castShadow
      />
      {/* Crater glow */}
      <pointLight position={[0, 2.0, 0]}  intensity={craterLightInt} color="#ff4500" distance={30} />
      <pointLight position={[0, 5.5, 0]}  intensity={eruptionStage >= 4 ? 6.0 : eruptionStage >= 2 ? 2.5 : 0.8} color="#ea580c" distance={24} />
      {/* Ground fill on front slope (z > 0) */}
      <pointLight position={[1.5, -0.5, 3.5]} intensity={showLavaFlowShort ? 5.0 : 0.5} color="#ff3300" distance={14} />
      {/* Underground magma light */}
      <pointLight position={[0, -4.2, 0]} intensity={magmaGlow * 1.8} color="#ff2200" distance={14} />
      <pointLight position={[0, -2.5, 0]} intensity={conduitFill * 5}  color="#ff4500" distance={10} />
      {/* Lava flow lowland — FRONT side (z > 0) */}
      {showLavaFlowShort && <pointLight position={[2.5, -1.5, 5.5]} intensity={7.0} color="#ff4500" distance={12} />}
      {showLavaFlowLong  && <pointLight position={[4.0, -1.8, 8.5]} intensity={6.0} color="#ff3300" distance={15} />}
      {showLavaFlowLong  && <pointLight position={[7.0, -1.8, 10.0]} intensity={5.0} color="#ea580c" distance={14} />}
      {showLavaFlowLong  && <pointLight position={[-3.0, -1.8, 9.0]} intensity={4.5} color="#ff6600" distance={12} />}
      {/* Lightning flash */}
      <pointLight ref={lightningLightRef} position={[0, 7.0, 0]} intensity={0} color="#bfdbfe" distance={55} />
      {/* Siren on front (z > 0) */}
      <pointLight ref={sirenLightRef} position={[-7.0, -0.8, 5.5]} intensity={0.5} color="#f59e0b" distance={10} />

      {/* Smoke illumination lights (from sides and crater) so plume is brilliantly visible from side and low angles */}
      <pointLight position={[-4, 4.5, 2]} intensity={eruptionStage >= 2 ? 12 : 2} color="#fdba74" distance={18} />
      <pointLight position={[ 4, 4.5, 2]} intensity={eruptionStage >= 2 ? 12 : 2} color="#fdba74" distance={18} />
      <pointLight position={[ 0, 4.0, -4]} intensity={eruptionStage >= 2 ? 10 : 2} color="#fdba74" distance={18} />

      {/* ══ MOUNTAIN (X-Ray Cutaway in early stages, Solid 360 in eruption stages) ══ */}
      <group ref={mountainGroupRef}>
        <mesh geometry={mountainGeometry} receiveShadow castShadow>
          <meshStandardMaterial
            vertexColors
            roughness={showCutaway ? 0.45 : 0.82}
            metalness={showCutaway ? 0.15 : 0.08}
            transparent={showCutaway}
            opacity={showCutaway ? 0.52 : 1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ══ SOLID EARTH CRUST DIORAMA BASE (thick pedestal under mountain) ══ */}
      <mesh position={[0, -3.42, 0]} receiveShadow>
        <boxGeometry args={[28, 2.55, 28]} />
        <meshStandardMaterial
          color="#1c1917"
          roughness={0.92}
          metalness={0.08}
          transparent={showCutaway}
          opacity={showCutaway ? 0.65 : 1.0}
        />
      </mesh>
      <mesh position={[0, -4.75, 0]}>
        <boxGeometry args={[28.4, 0.4, 28.4]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.96} />
      </mesh>

      {/* ══ 3D UNDERGROUND MAGMA CHAMBER & CONDUIT (Brilliant in Cutaway mode) ══ */}
      {/* Geological strata layers in cutaway mode */}
      {showCutaway && (
        <group position={[0, -1.8, 0.05]}>
          {[
            { y: -2.4, w: 20, h: 0.5, c: '#44403c' },
            { y: -1.8, w: 14, h: 0.5, c: '#3f3f46' },
            { y: -1.2, w:  9, h: 0.5, c: '#52525b' },
            { y: -0.6, w:  6, h: 0.5, c: '#44403c' },
            { y:  0.0, w:  4, h: 0.5, c: '#3f3f46' },
          ].map((l, i) => (
            <mesh key={`strata-${i}`} position={[0, l.y, 0]}>
              <planeGeometry args={[l.w, l.h]} />
              <meshStandardMaterial color={l.c} transparent opacity={0.4} roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}

      {/* Magma Chamber (3D Sphere) */}
      <mesh ref={magmaChamberRef} position={[0, -4.3, 0]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial
          color="#7f1d1d"
          emissive="#ff3300"
          emissiveIntensity={showCutaway ? magmaGlow * 2.8 + 2.0 : magmaGlow}
          roughness={0.15}
        />
      </mesh>

      {/* Conduit Pipe (3D Vertical Cylinder) */}
      <mesh ref={conduitRef} position={[0, -1.8, 0]}>
        <cylinderGeometry args={[0.38, 0.52, 5.0, 20]} />
        <meshStandardMaterial
          color="#7f1d1d"
          emissive="#ef4444"
          emissiveIntensity={showCutaway ? conduitFill * 6.0 + 2.5 : conduitFill * 4.5}
          roughness={0.25}
          transparent
          opacity={showCutaway ? 0.95 : 0.75 + conduitFill * 0.25}
        />
      </mesh>

      {/* RISING MAGMA PARTICLES (inside 3D conduit) */}
      <instancedMesh ref={risingMagmaRef} args={[undefined, undefined, risingCount]} frustumCulled={false}>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial
          color="#ff4500"
          emissive="#ff3300"
          emissiveIntensity={showCutaway ? 8.5 : 6.0}
          roughness={0.15}
        />
      </instancedMesh>

      {/* Cutaway Labels (Dapur Magma & Pipa Konduit) */}
      {showCutaway && (
        <group>
          <Html position={[2.8, -4.3, 0.2]} center distanceFactor={9}>
            <div className="px-2.5 py-1 rounded-xl bg-red-950/95 text-orange-200 font-black text-[10px] tracking-wider border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] whitespace-nowrap pointer-events-none animate-pulse">
              🔥 DAPUR MAGMA (Magma Chamber)
            </div>
          </Html>
          <Html position={[1.8, -1.8, 0.2]} center distanceFactor={9}>
            <div className="px-2 py-0.5 rounded-lg bg-slate-900/95 text-orange-300 font-bold text-[9px] tracking-wider border border-orange-500/70 shadow-[0_0_12px_rgba(249,115,22,0.6)] whitespace-nowrap pointer-events-none">
              🌋 PIPA KONDUIT (Magma Conduit)
            </div>
          </Html>
          {eruptionStage >= 1 && (
            <Html position={[0, 0.1, 0.2]} center distanceFactor={9}>
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[10px] tracking-wider border-2 border-white shadow-[0_0_25px_rgba(239,68,68,0.95)] whitespace-nowrap pointer-events-none animate-bounce">
                ↑ MAGMA NAIK KE PERMUKAAN ↑
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 3D UI Toggle Button for View Mode */}
      <Html position={[0, 4.8, 0]} center distanceFactor={11}>
        <button
          onClick={() => {
            soundEngine.playClick();
            setUserCutawayOverride(!showCutaway);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs shadow-2xl backdrop-blur-xl border-2 transition-all cursor-pointer pointer-events-auto hover:scale-105 ${
            showCutaway
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-white shadow-[0_0_25px_rgba(239,68,68,0.8)]'
              : 'bg-slate-900/95 text-orange-300 border-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.5)] hover:text-white'
          }`}
        >
          <span>{showCutaway ? '🔬 Mode Penampang Dalam (Magma Naik)' : '🌋 Mode Full Gunung 3D'}</span>
          <span className="text-[9px] bg-black/50 text-orange-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            {showCutaway ? 'Ubah ke Full Gunung' : 'Lihat Magma Dalam'}
          </span>
        </button>
      </Html>

      {/* ══ CALDERA LAVA LAKE ══ */}
      <group position={[0, -0.68, 0]}>
        <mesh ref={lavaLakeRef}>
          <cylinderGeometry args={[0.95, 0.95, 0.12, 28]} />
          <meshStandardMaterial
            color={eruptionStage >= 3 ? '#ea580c' : eruptionStage >= 1 ? '#b45309' : '#78350f'}
            emissive={eruptionStage >= 3 ? '#ef4444' : eruptionStage >= 1 ? '#dc2626' : '#92400e'}
            emissiveIntensity={lavaEmissive} roughness={0.15} metalness={0.08}
          />
        </mesh>
        {[-0.35, 0.3, 0.0].map((cx, i) => (
          <mesh key={`crust-${i}`} position={[cx, 0.07, (i - 1) * 0.28]} rotation={[0, i * 1.3, 0]}>
            <boxGeometry args={[0.35, 0.045, 0.28]} />
            <meshStandardMaterial color="#18181b" roughness={0.92} />
          </mesh>
        ))}
      </group>

      {/* LAVA DOME stage 3+ */}
      {showLavaDome && (
        <mesh ref={lavaDomeRef} position={[0, -0.32, 0]}>
          <sphereGeometry args={[0.6, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={2.5} roughness={0.55} metalness={0.1} />
        </mesh>
      )}

      {/* LAVA FOUNTAIN (visible vertical jets from crater) */}
      <instancedMesh ref={lavaFountainRef} args={[undefined, undefined, fountainCount]} renderOrder={5} frustumCulled={false}>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff2200" emissiveIntensity={8.0} roughness={0.08} transparent opacity={0.95} />
      </instancedMesh>

      {/* ══ LAVA FLOW — PointLights illuminate slope with lava glow ══ */}
      {showLavaFlowShort && (
        <group ref={lavaFlowGroupRef}>
          {/* ── PointLights along lava channel — these paint the mountain red/orange ── */}
          <pointLight position={[0.3,  1.5,  0.6]}  color="#ff4500" intensity={20} distance={3.5} />
          <pointLight position={[0.7,  0.6,  1.6]}  color="#ff3800" intensity={22} distance={4.0} />
          <pointLight position={[1.0, -0.3,  2.8]}  color="#ff3000" intensity={22} distance={4.0} />
          <pointLight position={[1.2, -0.9,  4.0]}  color="#ff2800" intensity={20} distance={3.8} />
          <pointLight position={[1.5, -1.4,  5.3]}  color="#ff2000" intensity={18} distance={3.5} />
          {/* ── Small glowing lava blobs — small enough to sit ON the ridge without hiding in terrain ── */}
          {[
            /* x     y_surface_+offset   z     r */
            [ 0.28,  0.85,   0.65,  0.18 ],
            [ 0.60,  0.25,   1.60,  0.20 ],
            [ 0.88, -0.30,   2.60,  0.20 ],
            [ 1.08, -0.75,   3.60,  0.20 ],
            [ 1.25, -1.15,   4.60,  0.20 ],
            [ 1.42, -1.48,   5.60,  0.18 ],
          ].map(([x, y, z, r], i) => (
            <mesh key={`lb-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[r, 8, 6]} />
              <meshStandardMaterial
                color="#ff4500"
                emissive="#ff2200"
                emissiveIntensity={14.0}
                roughness={0.05}
              />
            </mesh>
          ))}
        </group>
      )}




      {/* Long flow — stage 5+: extends to lowland flat ground */}
      {showLavaFlowLong && (
        <group>
          {/* ── PointLights along extended channel ── */}
          <pointLight position={[2.0, -0.8, 7.0]}   color="#ff4500" intensity={14} distance={4.0} />
          <pointLight position={[3.5, -1.2, 9.5]}   color="#ff3500" intensity={16} distance={4.5} />
          <pointLight position={[5.0, -1.4, 12.0]}  color="#ff3000" intensity={18} distance={5.0} />
          <pointLight position={[7.0, -1.5,  8.0]}  color="#ff4000" intensity={14} distance={4.0} />
          <pointLight position={[-2.0,-1.5, 10.0]}  color="#ff4000" intensity={14} distance={4.0} />
          {/* ── Extended main channel sphere chain ── */}

          {[
            /* x      y        z      r */
            [ 2.10,  -1.92,   6.70,  0.34 ],
            [ 2.45,  -1.98,   7.50,  0.36 ],
            [ 2.80,  -2.03,   8.40,  0.38 ],
            [ 3.20,  -2.06,   9.30,  0.40 ],
            [ 3.70,  -2.09,  10.30,  0.42 ],
            [ 4.30,  -2.11,  11.30,  0.44 ],
            [ 5.00,  -2.12,  12.20,  0.45 ],
          ].map(([x, y, z, r], i) => (
            <mesh key={`lsl-${i}`} position={[x, y + r * 0.5, z]}>
              <sphereGeometry args={[r, 10, 8]} />
              <meshStandardMaterial color="#b83208" emissive="#ff4500" emissiveIntensity={3.5} roughness={0.22} />
            </mesh>
          ))}
          {/* ── East branch ── */}
          {[
            [ 3.10,  -1.88,  5.80,  0.30 ],
            [ 4.20,  -2.00,  6.50,  0.32 ],
            [ 5.50,  -2.08,  7.20,  0.34 ],
            [ 7.00,  -2.11,  7.80,  0.36 ],
          ].map(([x, y, z, r], i) => (
            <mesh key={`lse-${i}`} position={[x, y + r * 0.5, z]}>
              <sphereGeometry args={[r, 10, 8]} />
              <meshStandardMaterial color="#b83208" emissive="#ff6500" emissiveIntensity={3.0} roughness={0.22} />
            </mesh>
          ))}
          {/* ── West branch ── */}
          {[
            [ -0.80, -1.88,  7.50,  0.30 ],
            [ -1.50, -2.00,  9.00,  0.32 ],
            [ -2.20, -2.08, 10.50,  0.34 ],
            [ -2.80, -2.11, 12.00,  0.36 ],
          ].map(([x, y, z, r], i) => (
            <mesh key={`lsw-${i}`} position={[x, y + r * 0.5, z]}>
              <sphereGeometry args={[r, 10, 8]} />
              <meshStandardMaterial color="#b83208" emissive="#ff6500" emissiveIntensity={3.0} roughness={0.22} />
            </mesh>
          ))}
          {/* ── Lava pools/lakes at lowland ── */}
          {[
            [  5.0, -2.13, 12.0, 1.4, 5.0 ],
            [  7.5, -2.13,  8.0, 1.0, 4.5 ],
            [ -2.5, -2.13, 12.5, 1.2, 4.8 ],
            [  3.8, -2.13,  9.5, 0.8, 4.2 ],
          ].map(([x, y, z, r, g], i) => (
            <mesh key={`llake-${i}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[r, 22]} />
              <meshStandardMaterial color="#dc2626" emissive="#ff4500" emissiveIntensity={g} roughness={0.08} transparent opacity={0.96} />
            </mesh>
          ))}
          {/* ── Glowing ground cracks ── */}
          {[
            [ 4.0, 7.0, 0.10, 2.5, -0.25 ],
            [ 6.0, 9.0, 0.08, 2.0,  0.15 ],
            [ 2.5, 10.0,0.08, 2.2, -0.60 ],
          ].map(([x, z, w, d, ry], i) => (
            <mesh key={`crack-${i}`} position={[x, -2.12, z]} rotation={[-Math.PI / 2, ry, 0]}>
              <planeGeometry args={[w, d]} />
              <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={7.0} transparent opacity={0.80} />
            </mesh>
          ))}
          <Html position={[5.5, -1.4, 12.0]} center distanceFactor={10}>
            <div className="px-2 py-0.5 rounded bg-red-700/90 text-orange-100 font-black text-[9px] tracking-wider border border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.8)] whitespace-nowrap pointer-events-none animate-pulse">🌋 LAVA MENCAPAI DATARAN RENDAH</div>
          </Html>
        </group>
      )}




      {/* ══ TREES — scattered on front slope (z > 0) ══ */}
      {[
        { x: -5.0, z: 2.5,  s: 1.1 },
        { x: -6.0, z: 1.0,  s: 1.2 },
        { x: -4.5, z: 4.0,  s: 0.9 },
        { x: -3.2, z: 6.0,  s: 1.05 },
        { x: -7.0, z: 5.5,  s: 1.15 },
        { x: -2.5, z: 7.5,  s: 0.95 },
        { x: -7.5, z: 2.8,  s: 1.1  },
        { x: -9.0, z: 4.5,  s: 1.0  },
        { x:  5.0, z: 7.5,  s: 1.05 },
        { x:  7.0, z: 6.0,  s: 1.1  },
        { x:  8.5, z: 4.0,  s: 0.95 },
        { x: -5.5, z: 9.0,  s: 1.0  },
      ].map((pt, i) => {
        const burned = eruptionStage >= 5 && (pt.x > 0 || pt.z > 6);
        const ashColor = eruptionStage >= 6 ? '#44403c' : '#166534';
        return (
          <group key={`tree-${i}`} position={[pt.x, -1.95, pt.z]} scale={[pt.s, pt.s, pt.s]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.07, 0.13, 0.8, 7]} />
              <meshStandardMaterial color={burned ? '#1c1917' : '#3e2723'} roughness={0.92} />
            </mesh>
            {!burned && <>
              <mesh position={[0, 0.9, 0]}><coneGeometry args={[0.52, 0.95, 8]} /><meshStandardMaterial color={ashColor} roughness={0.82} /></mesh>
              <mesh position={[0, 1.38, 0]}><coneGeometry args={[0.38, 0.78, 8]} /><meshStandardMaterial color={eruptionStage >= 6 ? '#57534e' : '#166534'} roughness={0.78} /></mesh>
              <mesh position={[0, 1.78, 0]}><coneGeometry args={[0.24, 0.58, 8]} /><meshStandardMaterial color={eruptionStage >= 6 ? '#6b7280' : '#15803d'} roughness={0.75} /></mesh>
            </>}
            {burned && (
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.04, 0.08, 2.0, 5]} />
                <meshStandardMaterial color="#111827" roughness={0.95} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* ══ LIGHTNING ══ */}
      <group ref={lightningMeshRef} position={[0, 5.5, 0]} visible={false}>
        {[
          { x: 0,    y: 2.4,  z: 0,    rz:  0.18, w: 0.22, h: 2.0 },
          { x: 0.5,  y: 0.9,  z: 0,    rz: -0.48, w: 0.19, h: 1.7 },
          { x:-0.35, y:-0.35, z: 0,    rz:  0.32, w: 0.17, h: 1.4 },
          { x: 0.2,  y:-1.6,  z: 0,    rz: -0.22, w: 0.14, h: 1.2 },
          { x:-0.7,  y: 0.6,  z: 0.25, rz: -0.72, w: 0.12, h: 1.1 },
          { x:-1.2,  y:-0.2,  z: 0.35, rz: -0.5,  w: 0.10, h: 0.9 },
          { x: 0.8,  y: 0.3,  z:-0.25, rz:  0.68, w: 0.12, h: 1.0 },
          { x: 1.3,  y:-0.55, z:-0.35, rz:  0.42, w: 0.09, h: 0.8 },
          { x: 0.1,  y:-0.1,  z: 0.6,  rz:  0.22, w: 0.10, h: 0.9 },
          { x:-0.2,  y: 0.9,  z:-0.65, rz: -0.32, w: 0.09, h: 0.8 },
        ].map((b, i) => (
          <mesh key={`bolt-${i}`} position={[b.x, b.y, b.z]} rotation={[0, 0, b.rz]}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={18.0} roughness={0} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0.25, -2.2, 0]}>
          <sphereGeometry args={[0.45, 14, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#7dd3fc" emissiveIntensity={25.0} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      </group>

      {/* ══ PARTICLE SYSTEMS — frustumCulled={false} ensures continuous 360 visibility ══ */}
      {/* Fumarole — tall visible smoke puffs */}
      <instancedMesh ref={fumaroleRef} args={[undefined, undefined, fumaroleCount]} renderOrder={2} frustumCulled={false}>
        <sphereGeometry args={[0.48, 10, 10]} />
        <meshStandardMaterial
          color={eruptionStage <= 1 ? '#e2e8f0' : '#cbd5e1'}
          emissive="#64748b"
          emissiveIntensity={0.25}
          roughness={0.92}
          transparent
          opacity={eruptionStage === 1 ? 0.88 : eruptionStage === 2 ? 0.92 : 0.68}
        />
      </instancedMesh>

      {/* Ash plume — massive opaque spheres forming thick dark column */}
      <instancedMesh ref={ashPlumeRef} args={[undefined, undefined, plumeCount]} renderOrder={3} frustumCulled={false}>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial
          color={eruptionStage === 2 ? '#64748b' : eruptionStage === 6 ? '#475569' : '#334155'}
          emissive={eruptionStage >= 4 ? '#ea580c' : eruptionStage >= 2 ? '#9a3412' : '#1e293b'}
          emissiveIntensity={eruptionStage >= 4 ? 0.35 : eruptionStage >= 2 ? 0.20 : 0.08}
          roughness={0.88}
          transparent
          opacity={eruptionStage === 2 ? 0.90 : eruptionStage === 6 ? 0.82 : 0.96}
        />
      </instancedMesh>

      {/* Mushroom cloud anvil */}
      <instancedMesh ref={mushroomRef} args={[undefined, undefined, mushroomCount]} renderOrder={4} frustumCulled={false}>
        <sphereGeometry args={[0.75, 10, 10]} />
        <meshStandardMaterial
          color="#475569"
          emissive="#b45309"
          emissiveIntensity={0.22}
          roughness={0.90}
          transparent
          opacity={eruptionStage === 6 ? 0.78 : 0.94}
        />
      </instancedMesh>

      {/* Pyroclastic surge */}
      <instancedMesh ref={pyroclasticRef} args={[undefined, undefined, pyroCount]} renderOrder={3} frustumCulled={false}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial
          color="#4b5563"
          emissive="#ea580c"
          emissiveIntensity={0.28}
          roughness={0.92}
          transparent
          opacity={0.92}
        />
      </instancedMesh>

      {/* Lava bombs */}
      <instancedMesh ref={lavaSparksRef} args={[undefined, undefined, sparkCount]} renderOrder={5} frustumCulled={false}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ea580c" emissive="#ef4444" emissiveIntensity={5.5} roughness={0.22} />
      </instancedMesh>

      {/* Falling ash */}
      <instancedMesh ref={fallingAshRef} args={[undefined, undefined, ashFallCount]} renderOrder={2} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#8a8480" roughness={1.0} transparent opacity={0.7} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* ══ KRB DANGER ZONES ══ */}
      <group position={[0, -2.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={krbPulseRef}>
          <ringGeometry args={[4.9, 5.1, 56]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={eruptionStage >= 3 ? 0.65 : 0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[7.3, 7.5, 56]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={eruptionStage >= 2 ? 0.48 : 0.10} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[9.9, 10.1, 56]} />
          <meshBasicMaterial color="#10b981" transparent opacity={eruptionStage >= 1 ? 0.38 : 0.08} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {eruptionStage >= 3 && (
        <group position={[4.0, -1.88, 4.2]} rotation={[0, -0.6, 0]}>
          <Html center distanceFactor={10}>
            <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-black text-[10px] tracking-wider border border-red-400 shadow-[0_0_14px_rgba(239,68,68,0.9)] whitespace-nowrap pointer-events-none">
              KRB III — ZONA BAHAYA ALIRAN LAHAR &amp; AWAN PANAS
            </div>
          </Html>
        </group>
      )}

      {/* ══ TERRAIN GROUND (front/camera side, z > 0) ══ */}
      <mesh position={[0, -2.18, 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 14, 6, 6]} />
        <meshStandardMaterial
          color={eruptionStage >= 6 ? '#292524' : eruptionStage >= 5 ? '#3a3524' : '#14532d'}
          roughness={0.92}
        />
      </mesh>

      {/* ══ EMERGENCY CAMP (BPBD Posko) — front/camera side ══ */}
      <group position={[-7.5, -2.05, 5.5]}>
        {/* Concrete pad */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[5.0, 0.12, 4.0]} />
          <meshStandardMaterial color="#334155" roughness={0.72} />
        </mesh>

        {/* Main command tent */}
        <group position={[-0.9, 0.12, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[2.4, 1.0, 2.0]} />
            <meshStandardMaterial color="#ea580c" roughness={0.72} />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 1.38, 2.42, 3]} />
            <meshStandardMaterial color="#f97316" roughness={0.68} />
          </mesh>
          <Html position={[0, 1.2, 1.02]} center distanceFactor={7}>
            <span className="text-[9px] font-black tracking-tighter text-orange-600 whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow">POSKO UTAMA BPBD</span>
          </Html>
        </group>

        {/* Ambulance */}
        <group position={[1.3, 0.12, 0.2]} rotation={[0, -0.35, 0]}>
          <mesh position={[0, 0.38, 0]}><boxGeometry args={[1.9, 0.55, 0.95]} /><meshStandardMaterial color="#f8fafc" roughness={0.38} /></mesh>
          <mesh position={[-0.1, 0.78, 0]}><boxGeometry args={[1.3, 0.48, 0.92]} /><meshStandardMaterial color="#e2e8f0" roughness={0.28} /></mesh>
          <mesh position={[0, 0.38, 0.49]}><boxGeometry args={[1.8, 0.14, 0.02]} /><meshStandardMaterial color="#dc2626" /></mesh>
          <mesh position={[-0.1, 1.04, 0]}><boxGeometry args={[0.3, 0.12, 0.52]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={showEvacuation ? 3.0 : 0.5} /></mesh>
          {[-0.58, 0.58].map((wx, wi) => (
            <React.Fragment key={`wheel-${wi}`}>
              <mesh position={[wx, 0.16, 0.49]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.13, 12]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
              <mesh position={[wx, 0.16, -0.49]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.13, 12]} /><meshStandardMaterial color="#1e293b" roughness={0.9} /></mesh>
            </React.Fragment>
          ))}
        </group>

        {/* Radio tower */}
        <group position={[2.0, 0.12, -1.4]}>
          <mesh position={[0, 1.7, 0]}><cylinderGeometry args={[0.035, 0.07, 3.4]} /><meshStandardMaterial color="#94a3b8" metalness={0.82} /></mesh>
          <mesh position={[0, 3.45, 0]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.5} /></mesh>
        </group>

        {/* Flag pole */}
        <group position={[-2.1, 0.12, 1.4]}>
          <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.032, 0.032, 2.5]} /><meshStandardMaterial color="#cbd5e1" metalness={0.72} /></mesh>
          <mesh ref={flagRef} position={[0.35, 2.18, 0]}><boxGeometry args={[0.68, 0.42, 0.022]} /><meshStandardMaterial color="#dc2626" /></mesh>
          <mesh position={[0.35, 1.97, 0]}><boxGeometry args={[0.68, 0.22, 0.024]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>

        {showEvacuation && (
          <Html position={[0, 2.6, 0]} center distanceFactor={8}>
            <button
              onClick={() => { soundEngine.playClick(); if (onActionClick) onActionClick('EVACUATE_KRB'); }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-xs shadow-[0_0_28px_rgba(249,115,22,0.95)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>EVAKUASI KE POSKO AMAN (&gt;10 KM)</span>
            </button>
          </Html>
        )}
      </group>
    </group>
  );
};
