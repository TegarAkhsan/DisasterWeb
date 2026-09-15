import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

// 0=NORMAL, 1=MAGMA_RISING, 2=PHREATIC, 3=MAGMATIC_RISE, 4=ERUPTION, 5=LAVA_FLOW, 6=POST_ERUPTION
export type EruptionStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Enable local clipping on the WebGL renderer
const EnableClipping: React.FC = () => {
  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
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
  // Animation Refs
  const ashPlumeRef = useRef<THREE.InstancedMesh>(null);
  const mushroomRef = useRef<THREE.InstancedMesh>(null);
  const pyroclasticRef = useRef<THREE.InstancedMesh>(null);
  const lavaSparksRef = useRef<THREE.InstancedMesh>(null);
  const fumaroleRef = useRef<THREE.InstancedMesh>(null);
  const fallingAshRef = useRef<THREE.InstancedMesh>(null);
  const risingMagmaRef = useRef<THREE.InstancedMesh>(null);
  const lavaLakeRef = useRef<THREE.Mesh>(null);
  const lavaDomeRef = useRef<THREE.Mesh>(null);
  const magmaChamberRef = useRef<THREE.Mesh>(null);
  const conduitRef = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const sirenLightRef = useRef<THREE.PointLight>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const lightningMeshRef = useRef<THREE.Group>(null);
  const krbPulseRef = useRef<THREE.Mesh>(null);
  const mountainGroupRef = useRef<THREE.Group>(null);
  const lavaFlowLongRef = useRef<THREE.Group>(null);

  const plumeCount = 45;
  const mushroomCount = 55;
  const pyroclasticCount = 30;
  const sparkCount = 80;
  const fumaroleCount = 25;
  const fallingAshCount = 60;
  const risingMagmaCount = 30;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Clipping plane to cut mountain in half (only show z >= 0 side)
  const clippingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.05), []);

  // Stage-based visibility helpers
  const showCrossSection = eruptionStage >= 0; // always show cross-section for educational value
  const showFumarole = eruptionStage >= 1;
  const showRisingMagma = eruptionStage >= 1;
  const showAshPlume = eruptionStage >= 2;
  const showLavaDome = eruptionStage >= 3;
  const showMushroom = eruptionStage >= 4;
  const showPyroclastic = eruptionStage >= 4;
  const showSparks = eruptionStage >= 4;
  const showLightning = eruptionStage >= 4;
  const showLavaFlowShort = eruptionStage >= 4; // short lava at eruption
  const showLavaFlowLong = eruptionStage >= 5; // long lava reaching lowlands
  const showFallingAsh = eruptionStage >= 6;
  const showEvacuation = eruptionStage >= 3;

  // Ash plume intensity by stage
  const plumeIntensity = eruptionStage === 2 ? 0.35 : eruptionStage === 3 ? 0.6 : eruptionStage >= 4 ? 1.0 : 0;
  const postEruptionDampen = eruptionStage === 6 ? 0.4 : 1.0;

  // Lava lake emissive intensity per stage
  const lavaEmissive = [0.4, 1.2, 2.0, 3.0, 5.0, 4.0, 1.5][eruptionStage] ?? 0.4;

  // Crater fire point light intensity per stage
  const craterLightIntensity = [1.0, 2.5, 4.0, 6.0, 10.0, 7.0, 3.0][eruptionStage] ?? 1.0;

  // Magma chamber glow per stage
  const magmaGlow = [0.3, 1.5, 2.5, 4.0, 6.0, 4.5, 1.0][eruptionStage] ?? 0.3;

  // Conduit magma fill level (0-1, how high magma has risen)
  const conduitFill = [0.0, 0.3, 0.5, 0.85, 1.0, 0.9, 0.4][eruptionStage] ?? 0.0;

  // 1. PROCEDURAL STRATOVOLCANO TERRAIN GEOMETRY
  const mountainGeometry = useMemo(() => {
    const size = 26;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const cLushGreen = new THREE.Color('#166534');
    const cLushDark = new THREE.Color('#14532d');
    const cVolcanicSoil = new THREE.Color('#44403c');
    const cBasaltRock = new THREE.Color('#292524');
    const cAshCharcoal = new THREE.Color('#1c1917');
    const cSulfurYellow = new THREE.Color('#ca8a04');
    const cMagmaGlow = new THREE.Color('#ef4444');

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      const angle = Math.atan2(z, x);

      let y = 0;
      const craterRadius = 1.1;
      const craterLip = 1.38;

      if (r < craterRadius) {
        const t = r / craterRadius;
        y = 1.4 + Math.pow(t, 2) * 1.5;
      } else if (r <= craterLip) {
        const t = (r - craterRadius) / (craterLip - craterRadius);
        y = 3.25 + Math.sin(t * Math.PI) * 0.35 + Math.sin(angle * 8) * 0.15;
      } else {
        const dist = r - craterLip;
        const baseHeight = 3.35 * Math.exp(-0.3 * dist);
        const ridges = Math.sin(angle * 7) * 0.32 * Math.exp(-0.18 * dist);
        const noise = (Math.sin(x * 1.6 + z * 1.1) * 0.12 + Math.cos(x * 1.1 - z * 1.6) * 0.08) * Math.min(1.0, r / 1.5);
        let laharGorge = 0;
        const angleDiff = Math.abs(angle - 0.85);
        if (angleDiff < 0.38 && dist > 0.4) {
          laharGorge = -0.38 * Math.cos((angleDiff / 0.38) * (Math.PI / 2));
        }
        y = Math.max(0, baseHeight + ridges + noise + laharGorge);
      }

      pos.setY(i, y - 2.1);

      const finalH = y;
      const color = new THREE.Color();

      if (r < craterRadius) {
        color.lerpColors(cMagmaGlow, cAshCharcoal, r / craterRadius);
      } else if (finalH > 2.7) {
        if (Math.sin(angle * 6) > 0.55) {
          color.copy(cSulfurYellow);
        } else {
          color.copy(cAshCharcoal);
        }
      } else if (finalH > 1.5) {
        const t = (finalH - 1.5) / 1.2;
        color.lerpColors(cVolcanicSoil, cBasaltRock, t);
      } else if (finalH > 0.6) {
        const t = (finalH - 0.6) / 0.9;
        color.lerpColors(cLushDark, cVolcanicSoil, t);
      } else {
        const t = Math.min(1.0, finalH / 0.6);
        color.lerpColors(cLushGreen, cLushDark, t);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // CROSS-SECTION FACE — Geological layers visible on the cut plane
  const crossSectionGeometry = useMemo(() => {
    // Create a shape that traces the mountain profile from side
    const shape = new THREE.Shape();
    // Start from bottom-left
    shape.moveTo(-13, -2.1);
    // Ground level left
    shape.lineTo(-1.38, -2.1);
    // Left slope going up
    shape.lineTo(-1.38, 1.15); // crater lip height
    // Crater bowl left
    shape.lineTo(-1.1, 1.15);
    shape.lineTo(0, -0.7); // crater bottom
    // Crater bowl right
    shape.lineTo(1.1, 1.15);
    shape.lineTo(1.38, 1.15);
    // Right slope going down
    shape.lineTo(1.38, -2.1);
    // Ground level right
    shape.lineTo(13, -2.1);
    // Close bottom
    shape.lineTo(13, -6.5);
    shape.lineTo(-13, -6.5);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape, 1);
    return geo;
  }, []);

  // Particle arrays
  const plumeParticles = useMemo(() => {
    return Array.from({ length: plumeCount }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.4,
      y: 1.2 + (i / plumeCount) * 4.5,
      z: (Math.random() - 0.5) * 0.4,
      speedY: 0.04 + Math.random() * 0.03,
      driftX: (Math.random() - 0.5) * 0.015,
      driftZ: (Math.random() - 0.5) * 0.015,
      baseScale: 0.35 + (i / plumeCount) * 0.6,
      rotSpeed: (Math.random() - 0.5) * 0.03
    }));
  }, [plumeCount]);

  const mushroomParticles = useMemo(() => {
    return Array.from({ length: mushroomCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3.2;
      return {
        angle, radius, baseRadius: radius,
        y: 5.5 + Math.random() * 3.0,
        speedY: 0.01 + Math.random() * 0.015,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0.8 + Math.random() * 0.8
      };
    });
  }, [mushroomCount]);

  const pyroclasticParticles = useMemo(() => {
    return Array.from({ length: pyroclasticCount }).map((_, i) => {
      const dist = 1.2 + (i / pyroclasticCount) * 5.0;
      const angle = 0.85 + (Math.random() - 0.5) * 0.25;
      return {
        dist, angle,
        speed: 0.03 + Math.random() * 0.02,
        scale: 0.4 + (i / pyroclasticCount) * 0.7,
        rotSpeed: (Math.random() - 0.5) * 0.04
      };
    });
  }, [pyroclasticCount]);

  const sparks = useMemo(() => {
    return Array.from({ length: sparkCount }).map(() => ({
      x: (Math.random() - 0.5) * 0.4,
      y: 1.3,
      z: (Math.random() - 0.5) * 0.4,
      vx: (Math.random() - 0.5) * 0.14,
      vy: 0.14 + Math.random() * 0.18,
      vz: (Math.random() - 0.5) * 0.14,
      gravity: -0.0045,
      scale: 0.07 + Math.random() * 0.14
    }));
  }, [sparkCount]);

  const fumaroleParticles = useMemo(() => {
    return Array.from({ length: fumaroleCount }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.6,
      y: 1.0 + (i / fumaroleCount) * 2.5,
      z: (Math.random() - 0.5) * 0.6,
      speedY: 0.012 + Math.random() * 0.015,
      driftX: (Math.random() - 0.5) * 0.008,
      driftZ: (Math.random() - 0.5) * 0.008,
      baseScale: 0.2 + (i / fumaroleCount) * 0.35,
    }));
  }, [fumaroleCount]);

  const fallingAshParticles = useMemo(() => {
    return Array.from({ length: fallingAshCount }).map(() => ({
      x: (Math.random() - 0.5) * 18,
      y: 4.0 + Math.random() * 6.0,
      z: (Math.random() - 0.5) * 18,
      speedY: -(0.015 + Math.random() * 0.02),
      driftX: (Math.random() - 0.5) * 0.01,
      scale: 0.04 + Math.random() * 0.08,
    }));
  }, [fallingAshCount]);

  // Rising magma particles inside conduit
  const risingMagmaParticles = useMemo(() => {
    return Array.from({ length: risingMagmaCount }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.35,
      y: -4.5 + (i / risingMagmaCount) * 5.0,
      z: 0, // on cross-section plane
      speedY: 0.02 + Math.random() * 0.025,
      scale: 0.08 + Math.random() * 0.12,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, [risingMagmaCount]);

  // Animation Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // === MOUNTAIN SHAKE ===
    if (mountainGroupRef.current) {
      if (eruptionStage === 1) {
        mountainGroupRef.current.position.x = Math.sin(t * 18) * 0.008;
        mountainGroupRef.current.position.z = Math.cos(t * 22) * 0.006;
      } else if (eruptionStage === 2) {
        mountainGroupRef.current.position.x = Math.sin(t * 25) * 0.018;
        mountainGroupRef.current.position.z = Math.cos(t * 30) * 0.014;
      } else if (eruptionStage === 4) {
        mountainGroupRef.current.position.x = Math.sin(t * 35) * 0.035;
        mountainGroupRef.current.position.z = Math.cos(t * 40) * 0.03;
      } else {
        mountainGroupRef.current.position.x = 0;
        mountainGroupRef.current.position.z = 0;
      }
    }

    // === MAGMA CHAMBER PULSING ===
    if (magmaChamberRef.current) {
      const mat = magmaChamberRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulseSpeed = eruptionStage >= 4 ? 6 : eruptionStage >= 1 ? 3 : 1.5;
        mat.emissiveIntensity = magmaGlow + Math.sin(t * pulseSpeed) * (magmaGlow * 0.3);
      }
      // Magma chamber slowly swells when active
      if (eruptionStage >= 1 && eruptionStage <= 4) {
        const swell = 1.0 + Math.sin(t * 1.5) * 0.04;
        magmaChamberRef.current.scale.set(swell, swell * 0.9, swell);
      }
    }

    // === CONDUIT MAGMA GLOW ===
    if (conduitRef.current) {
      const mat = conduitRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = conduitFill * 3.5 + Math.sin(t * 4) * 0.5;
        mat.opacity = 0.3 + conduitFill * 0.65;
      }
      // Scale conduit width slightly based on fill
      const w = 0.85 + conduitFill * 0.25;
      conduitRef.current.scale.x = w;
      conduitRef.current.scale.z = w;
    }

    // Lava Lake Pulsing
    if (lavaLakeRef.current) {
      const mat = lavaLakeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulseMag = eruptionStage >= 4 ? 2.0 : eruptionStage >= 2 ? 0.8 : 0.2;
        const pulseSpeed = eruptionStage >= 4 ? 8 : eruptionStage >= 2 ? 4 : 2;
        mat.emissiveIntensity = lavaEmissive + Math.sin(t * pulseSpeed) * pulseMag;
      }
    }

    // Lava Dome Glow (Stage 3+)
    if (lavaDomeRef.current && showLavaDome) {
      const mat = lavaDomeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const domeGlow = eruptionStage === 3 ? 2.0 : eruptionStage === 4 ? 4.0 : eruptionStage === 5 ? 3.0 : 1.5;
        mat.emissiveIntensity = domeGlow + Math.sin(t * 3) * 0.8;
      }
      if (eruptionStage === 3) {
        const growFactor = 1.0 + Math.sin(t * 0.5) * 0.05;
        lavaDomeRef.current.scale.set(growFactor, growFactor * 0.8, growFactor);
      }
    }

    // Emergency Camp Strobe
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = showEvacuation ? 1.5 + Math.sin(t * 14) * 1.5 : 0.3;
    }

    // Volcanic Lightning
    if (lightningLightRef.current && lightningMeshRef.current) {
      const isFlashing = showLightning && isSimulating && Math.sin(t * 16) > 0.88 && Math.sin(t * 3.7) > 0.3;
      lightningLightRef.current.intensity = isFlashing ? 12 : 0;
      lightningMeshRef.current.visible = isFlashing;
      if (isFlashing) lightningMeshRef.current.rotation.y = t * 5;
    }

    // Flag Waving
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 4.5) * 0.3;
    }

    // KRB Pulse
    if (krbPulseRef.current) {
      const mat = krbPulseRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = eruptionStage >= 3 ? 0.55 + Math.sin(t * 3) * 0.25 : 0.12;
    }

    // === RISING MAGMA INSIDE CONDUIT (Stage 1+) ===
    if (risingMagmaRef.current && isSimulating) {
      if (showRisingMagma && conduitFill > 0) {
        const maxY = -4.5 + conduitFill * 5.8; // how high particles can go
        risingMagmaParticles.forEach((p, i) => {
          p.y += p.speedY * (eruptionStage >= 4 ? 2.0 : 1.0);
          p.x = Math.sin(t * 2 + p.wobble) * 0.12;

          if (p.y > maxY) {
            p.y = -4.5 + Math.random() * 0.5;
          }

          dummy.position.set(p.x, p.y, 0);
          const s = p.scale * (1.0 + (p.y + 4.5) * 0.15);
          dummy.scale.set(s, s, s);
          dummy.rotation.set(t + i, 0, 0);
          dummy.updateMatrix();
          risingMagmaRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        risingMagmaParticles.forEach((_, i) => {
          dummy.position.set(0, -100, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          risingMagmaRef.current!.setMatrixAt(i, dummy.matrix);
        });
      }
      risingMagmaRef.current.instanceMatrix.needsUpdate = true;
    }

    // === FUMAROLE SMOKE (Stage 1+) ===
    if (fumaroleRef.current && isSimulating) {
      if (showFumarole) {
        const speed = eruptionStage === 1 ? 0.6 : eruptionStage === 2 ? 1.0 : 0.3;
        fumaroleParticles.forEach((p, i) => {
          p.y += p.speedY * speed;
          p.x += p.driftX;
          p.z += p.driftZ;
          if (p.y > 3.8) { p.y = 1.0 + Math.random() * 0.3; p.x = (Math.random() - 0.5) * 0.5; p.z = (Math.random() - 0.5) * 0.5; }
          const s = p.baseScale * (1.0 + (p.y - 1.0) * 0.5);
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(s, s, s);
          dummy.rotation.set(0, t * 0.15 + i, 0);
          dummy.updateMatrix();
          fumaroleRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        fumaroleParticles.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); fumaroleRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      fumaroleRef.current.instanceMatrix.needsUpdate = true;
    }

    // === ASH PLUME (Stage 2+) ===
    if (ashPlumeRef.current && isSimulating) {
      if (showAshPlume) {
        const speedMult = plumeIntensity * postEruptionDampen;
        plumeParticles.forEach((p, i) => {
          p.y += p.speedY * speedMult;
          p.x += p.driftX * speedMult;
          p.z += p.driftZ * speedMult;
          const maxH = eruptionStage === 2 ? 3.5 : eruptionStage === 3 ? 4.5 : 6.0;
          if (p.y > maxH) { p.y = 1.2 + Math.random() * 0.3; p.x = (Math.random() - 0.5) * 0.3; p.z = (Math.random() - 0.5) * 0.3; }
          const s = p.baseScale * (1.0 + (p.y - 1.2) * 0.4) * plumeIntensity * postEruptionDampen;
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(s, s, s);
          dummy.rotation.set(0, t * 0.2 + i, 0);
          dummy.updateMatrix();
          ashPlumeRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        plumeParticles.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); ashPlumeRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      ashPlumeRef.current.instanceMatrix.needsUpdate = true;
    }

    // === MUSHROOM CLOUD (Stage 4+) ===
    if (mushroomRef.current && isSimulating) {
      if (showMushroom) {
        mushroomParticles.forEach((m, i) => {
          m.angle += m.rotSpeed * postEruptionDampen;
          m.y += m.speedY * postEruptionDampen;
          const cr = m.baseRadius + (m.y - 5.5) * 0.4;
          const mx = Math.cos(m.angle) * cr;
          const mz = Math.sin(m.angle) * cr;
          if (m.y > 9.2) m.y = 5.5 + Math.random() * 0.5;
          const s = m.scale * postEruptionDampen;
          dummy.position.set(mx, m.y, mz);
          dummy.scale.set(s, s * 0.75, s);
          dummy.rotation.set(0, m.angle, 0);
          dummy.updateMatrix();
          mushroomRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        mushroomParticles.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); mushroomRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      mushroomRef.current.instanceMatrix.needsUpdate = true;
    }

    // === PYROCLASTIC FLOW (Stage 4+) ===
    if (pyroclasticRef.current && isSimulating) {
      if (showPyroclastic) {
        pyroclasticParticles.forEach((pf, i) => {
          pf.dist += pf.speed * postEruptionDampen;
          if (pf.dist > 7.5) pf.dist = 1.3;
          const px = Math.cos(pf.angle) * pf.dist;
          const pz = Math.sin(pf.angle) * pf.dist;
          const py = Math.max(-1.8, 2.8 * Math.exp(-0.35 * (pf.dist - 1.3)) - 1.8);
          const cs = pf.scale * (1.0 + pf.dist * 0.2) * postEruptionDampen;
          dummy.position.set(px, py + 0.3, pz);
          dummy.scale.set(cs, cs * 0.8, cs);
          dummy.rotation.set(t * 0.3 + i, pf.angle, 0);
          dummy.updateMatrix();
          pyroclasticRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        pyroclasticParticles.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); pyroclasticRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      pyroclasticRef.current.instanceMatrix.needsUpdate = true;
    }

    // === BALLISTIC LAVA BOMBS (Stage 4+) ===
    if (lavaSparksRef.current && isSimulating) {
      if (showSparks) {
        sparks.forEach((s, i) => {
          s.x += s.vx * postEruptionDampen;
          s.y += s.vy * postEruptionDampen;
          s.z += s.vz * postEruptionDampen;
          s.vy += s.gravity;
          if (s.y < -1.8) { s.x = (Math.random() - 0.5) * 0.3; s.y = 1.3; s.z = (Math.random() - 0.5) * 0.3; s.vx = (Math.random() - 0.5) * 0.15; s.vy = 0.14 + Math.random() * 0.18; s.vz = (Math.random() - 0.5) * 0.15; }
          dummy.position.set(s.x, s.y, s.z);
          dummy.scale.set(s.scale, s.scale, s.scale);
          dummy.rotation.set(t * 3 + i, t * 2, 0);
          dummy.updateMatrix();
          lavaSparksRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        sparks.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); lavaSparksRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      lavaSparksRef.current.instanceMatrix.needsUpdate = true;
    }

    // === FALLING ASH (Stage 6) ===
    if (fallingAshRef.current && isSimulating) {
      if (showFallingAsh) {
        fallingAshParticles.forEach((p, i) => {
          p.y += p.speedY;
          p.x += p.driftX;
          if (p.y < -2.5) { p.y = 5.0 + Math.random() * 4.0; p.x = (Math.random() - 0.5) * 18; p.z = (Math.random() - 0.5) * 18; }
          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(p.scale, p.scale * 0.3, p.scale);
          dummy.rotation.set(t * 0.5 + i, t * 0.3, t * 0.2 + i * 0.5);
          dummy.updateMatrix();
          fallingAshRef.current!.setMatrixAt(i, dummy.matrix);
        });
      } else {
        fallingAshParticles.forEach((_, i) => { dummy.position.set(0, -100, 0); dummy.scale.set(0, 0, 0); dummy.updateMatrix(); fallingAshRef.current!.setMatrixAt(i, dummy.matrix); });
      }
      fallingAshRef.current.instanceMatrix.needsUpdate = true;
    }

    // === LONG LAVA FLOW PULSE (Stage 5) ===
    if (lavaFlowLongRef.current && showLavaFlowLong) {
      lavaFlowLongRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.emissiveIntensity = 2.5 + Math.sin(t * 3 + i * 0.8) * 1.2;
          }
        }
      });
    }
  });

  return (
    <group>
      <EnableClipping />

      {/* ═══ LIGHTING ═══ */}
      <ambientLight intensity={eruptionStage === 0 ? 1.2 : eruptionStage <= 2 ? 1.0 : eruptionStage === 6 ? 0.5 : 0.9} />
      <hemisphereLight args={[eruptionStage <= 1 ? '#93c5fd' : eruptionStage === 6 ? '#78716c' : '#fed7aa', '#0f172a', eruptionStage <= 1 ? 0.8 : 1.1]} />
      <directionalLight position={[10, 18, 10]} intensity={eruptionStage <= 1 ? 2.5 : eruptionStage === 6 ? 1.2 : 2.0} color={eruptionStage <= 1 ? '#e0f2fe' : eruptionStage === 6 ? '#a8a29e' : '#e0f2fe'} castShadow />
      <pointLight position={[0, 1.8, 0]} intensity={craterLightIntensity} color="#ff4500" distance={26} />
      <pointLight position={[0, 5.0, 0]} intensity={eruptionStage >= 4 ? 4.5 : eruptionStage >= 2 ? 2.0 : 0.5} color="#ea580c" distance={20} />
      <pointLight position={[1.8, -0.4, 2.2]} intensity={showLavaFlowShort ? 3.0 : 0.3} color="#f97316" distance={10} />
      {/* Underground magma glow — lights the cross-section interior */}
      <pointLight position={[0, -4.0, 0]} intensity={magmaGlow * 1.5} color="#ff3300" distance={12} />
      <pointLight position={[0, -2.5, 0]} intensity={conduitFill * 4} color="#ff4500" distance={8} />
      {/* Lava flow lowland light (stage 5) */}
      {showLavaFlowLong && <pointLight position={[6, -1.8, 6]} intensity={5.0} color="#ff4500" distance={15} />}
      {showLavaFlowLong && <pointLight position={[9, -1.8, 8]} intensity={3.0} color="#ea580c" distance={12} />}
      <pointLight ref={lightningLightRef} position={[0, 6.8, 0]} intensity={0} color="#7dd3fc" distance={35} />
      <pointLight ref={sirenLightRef} position={[-7.5, -0.9, 4.0]} intensity={0.3} color="#f59e0b" distance={8} />

      {/* ═══ MOUNTAIN MESH — CLIPPED IN HALF to show cross-section ═══ */}
      <group ref={mountainGroupRef}>
        <mesh geometry={mountainGeometry} receiveShadow castShadow>
          <meshStandardMaterial
            vertexColors
            roughness={0.88}
            metalness={0.12}
            clippingPlanes={showCrossSection ? [clippingPlane] : []}
            clipShadows
          />
        </mesh>
      </group>

      {/* ═══ CROSS-SECTION FACE — Geological layers on the cut plane ═══ */}
      {showCrossSection && (
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          {/* Background fill — dark earth */}
          <mesh position={[0, -4.3, 0]}>
            <planeGeometry args={[26, 5.0]} />
            <meshStandardMaterial color="#1c1917" roughness={0.95} />
          </mesh>

          {/* Layer 1: Topsoil / Humus (very thin green strip near surface) */}
          {/* Drawn as mountain profile shape — simplified as layered boxes */}
          
          {/* Deep Earth Layer — dark basalt/gabbro */}
          <mesh position={[0, -5.5, 0]}>
            <planeGeometry args={[26, 2.5]} />
            <meshStandardMaterial color="#0c0a09" roughness={0.95} />
          </mesh>

          {/* Middle Layer — volcanic rock / andesite */}
          <mesh position={[0, -3.2, 0]}>
            <planeGeometry args={[26, 2.2]} />
            <meshStandardMaterial color="#292524" roughness={0.9} />
          </mesh>

          {/* Upper volcanic layers — stacked lava & pyroclastic deposits */}
          {/* Left slope layers */}
          {[
            { y: -2.1, w: 18, h: 0.4, c: '#44403c' },
            { y: -1.7, w: 12, h: 0.5, c: '#3f3f46' },
            { y: -1.2, w: 8, h: 0.5, c: '#52525b' },
            { y: -0.7, w: 5, h: 0.5, c: '#44403c' },
            { y: -0.2, w: 3.5, h: 0.5, c: '#3f3f46' },
            { y: 0.3, w: 3.0, h: 0.4, c: '#292524' },
            { y: 0.7, w: 2.8, h: 0.45, c: '#27272a' },
          ].map((layer, i) => (
            <mesh key={`layer-${i}`} position={[0, layer.y, 0]}>
              <planeGeometry args={[layer.w, layer.h]} />
              <meshStandardMaterial color={layer.c} roughness={0.85} />
            </mesh>
          ))}

          {/* Alternating red/orange lava flow layers in the deposit stack */}
          {[
            { y: -1.9, w: 14, h: 0.08, c: '#7f1d1d' },
            { y: -1.0, w: 7, h: 0.06, c: '#991b1b' },
            { y: -0.5, w: 4.5, h: 0.06, c: '#7f1d1d' },
            { y: 0.1, w: 3.2, h: 0.05, c: '#991b1b' },
          ].map((lava, i) => (
            <mesh key={`lava-layer-${i}`} position={[0, lava.y, 0]}>
              <planeGeometry args={[lava.w, lava.h]} />
              <meshStandardMaterial color={lava.c} emissive="#7f1d1d" emissiveIntensity={0.3} roughness={0.7} />
            </mesh>
          ))}

          {/* ── MAGMA CHAMBER ── Deep underground reservoir */}
          <mesh ref={magmaChamberRef} position={[0, -4.3, 0]}>
            <circleGeometry args={[1.3, 32]} />
            <meshStandardMaterial
              color="#7f1d1d"
              emissive="#ff3300"
              emissiveIntensity={magmaGlow}
              roughness={0.2}
              transparent
              opacity={0.95}
            />
          </mesh>
          {/* Magma chamber outer glow ring */}
          <mesh position={[0, -4.3, -0.01]}>
            <ringGeometry args={[1.3, 1.7, 32]} />
            <meshStandardMaterial
              color="#451a03"
              emissive="#ea580c"
              emissiveIntensity={magmaGlow * 0.4}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* ── CONDUIT / MAGMA PIPE ── From chamber to crater */}
          <mesh ref={conduitRef} position={[0, -1.5, 0]}>
            <planeGeometry args={[0.45, 5.2]} />
            <meshStandardMaterial
              color="#7f1d1d"
              emissive="#ef4444"
              emissiveIntensity={conduitFill * 3.5}
              roughness={0.3}
              transparent
              opacity={0.3 + conduitFill * 0.65}
            />
          </mesh>
          {/* Conduit wall (left) */}
          <mesh position={[-0.28, -1.5, 0.01]}>
            <planeGeometry args={[0.06, 5.2]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>
          {/* Conduit wall (right) */}
          <mesh position={[0.28, -1.5, 0.01]}>
            <planeGeometry args={[0.06, 5.2]} />
            <meshStandardMaterial color="#1c1917" roughness={0.9} />
          </mesh>

          {/* ── LABELS on cross-section ── */}
          <Html position={[2.2, -4.3, 0.1]} center distanceFactor={9}>
            <div className="px-2 py-0.5 rounded bg-red-900/90 text-orange-200 font-black text-[9px] tracking-wider border border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.5)] whitespace-nowrap pointer-events-none">
              🔥 DAPUR MAGMA
            </div>
          </Html>
          <Html position={[1.0, -1.5, 0.1]} center distanceFactor={9}>
            <div className="px-1.5 py-0.5 rounded bg-slate-900/90 text-orange-300 font-bold text-[8px] tracking-wider border border-slate-700 whitespace-nowrap pointer-events-none">
              PIPA KONDUIT
            </div>
          </Html>
          {eruptionStage >= 1 && (
            <Html position={[0, 0.2, 0.1]} center distanceFactor={9}>
              <div className="px-1.5 py-0.5 rounded bg-red-600/80 text-white font-bold text-[8px] tracking-wider border border-red-400 whitespace-nowrap pointer-events-none animate-pulse">
                ↑ MAGMA NAIK ↑
              </div>
            </Html>
          )}
        </group>
      )}

      {/* ═══ RISING MAGMA PARTICLES inside conduit ═══ */}
      <instancedMesh ref={risingMagmaRef} args={[undefined, undefined, risingMagmaCount]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial
          color="#ff4500"
          emissive="#ff3300"
          emissiveIntensity={5.0}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      {/* ═══ CALDERA MAGMA LAKE ═══ */}
      <group position={[0, -0.65, 0]}>
        <mesh ref={lavaLakeRef}>
          <cylinderGeometry args={[0.92, 0.92, 0.1, 24]} />
          <meshStandardMaterial
            color={eruptionStage >= 3 ? '#ea580c' : eruptionStage >= 1 ? '#b45309' : '#78350f'}
            emissive={eruptionStage >= 3 ? '#ef4444' : eruptionStage >= 1 ? '#dc2626' : '#92400e'}
            emissiveIntensity={lavaEmissive}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {[-0.35, 0.35, 0.0].map((cx, i) => (
          <mesh key={`crust-${i}`} position={[cx, 0.06, (i - 1) * 0.3]} rotation={[0, i * 1.2, 0]}>
            <boxGeometry args={[0.38, 0.04, 0.32]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ═══ LAVA DOME (Stage 3+) ═══ */}
      {showLavaDome && (
        <mesh ref={lavaDomeRef} position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7f1d1d" emissive="#dc2626" emissiveIntensity={2.0} roughness={0.6} metalness={0.15} />
        </mesh>
      )}

      {/* ═══ LAVA FLOW — Short (Stage 4+) ═══ */}
      {showLavaFlowShort && (
        <group position={[0, -2.1, 0]}>
          {[
            { x: 0.85, y: 2.1, z: 0.95, sx: 0.5, sy: 0.15, sz: 1.2, rx: 0.55, ry: 0.8 },
            { x: 1.8, y: 1.3, z: 1.85, sx: 0.6, sy: 0.15, sz: 1.5, rx: 0.45, ry: 0.85 },
            { x: 2.9, y: 0.7, z: 2.9, sx: 0.7, sy: 0.12, sz: 1.8, rx: 0.35, ry: 0.85 },
            { x: 4.1, y: 0.25, z: 4.0, sx: 0.85, sy: 0.1, sz: 2.0, rx: 0.25, ry: 0.85 }
          ].map((seg, i) => (
            <mesh key={`lava-seg-${i}`} position={[seg.x, seg.y, seg.z]} rotation={[seg.rx, seg.ry, 0]}>
              <boxGeometry args={[seg.sx, seg.sy, seg.sz]} />
              <meshStandardMaterial color="#ea580c" emissive="#ef4444" emissiveIntensity={eruptionStage === 6 ? 1.5 : 3.2} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* ═══ LAVA FLOW — LONG reaching lowlands (Stage 5) ═══ */}
      {showLavaFlowLong && (
        <group ref={lavaFlowLongRef} position={[0, -2.1, 0]}>
          {/* Extended lava rivers reaching far into the lowlands */}
          {[
            // Main lava river — continues from short flow down to plains
            { x: 5.2, y: 0.1, z: 5.0, sx: 1.0, sy: 0.12, sz: 2.5, rx: 0.15, ry: 0.85 },
            { x: 6.8, y: 0.05, z: 6.5, sx: 1.3, sy: 0.1, sz: 3.0, rx: 0.08, ry: 0.85 },
            { x: 8.5, y: 0.02, z: 7.8, sx: 1.6, sy: 0.1, sz: 3.5, rx: 0.04, ry: 0.85 },
            { x: 10.2, y: 0.01, z: 9.0, sx: 2.0, sy: 0.08, sz: 4.0, rx: 0.02, ry: 0.85 },
            // Branch lava river — splits to the east
            { x: 6.0, y: 0.08, z: 3.5, sx: 0.8, sy: 0.1, sz: 2.0, rx: 0.1, ry: 0.5 },
            { x: 7.5, y: 0.04, z: 3.0, sx: 1.1, sy: 0.08, sz: 2.5, rx: 0.05, ry: 0.4 },
            { x: 9.2, y: 0.02, z: 2.5, sx: 1.4, sy: 0.08, sz: 3.0, rx: 0.02, ry: 0.35 },
            // Branch lava river — splits south
            { x: 3.5, y: 0.1, z: 6.5, sx: 0.7, sy: 0.1, sz: 2.0, rx: 0.12, ry: 1.1 },
            { x: 4.0, y: 0.05, z: 8.5, sx: 1.0, sy: 0.08, sz: 3.0, rx: 0.05, ry: 1.2 },
            { x: 4.5, y: 0.02, z: 10.5, sx: 1.3, sy: 0.08, sz: 3.5, rx: 0.02, ry: 1.25 },
          ].map((seg, i) => (
            <mesh key={`lava-long-${i}`} position={[seg.x, seg.y, seg.z]} rotation={[seg.rx, seg.ry, 0]}>
              <boxGeometry args={[seg.sx, seg.sy, seg.sz]} />
              <meshStandardMaterial color="#ea580c" emissive="#ff3300" emissiveIntensity={2.5} roughness={0.25} />
            </mesh>
          ))}
          {/* Lava pools at the front — where lava accumulates in low areas */}
          {[
            { x: 10.5, z: 9.5, r: 1.2 },
            { x: 9.5, z: 2.2, r: 0.8 },
            { x: 4.8, z: 11.0, r: 1.0 },
          ].map((pool, i) => (
            <mesh key={`lava-pool-${i}`} position={[pool.x, 0.01, pool.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[pool.r, 16]} />
              <meshStandardMaterial color="#dc2626" emissive="#ff4500" emissiveIntensity={3.0} roughness={0.2} transparent opacity={0.9} />
            </mesh>
          ))}

          {/* "Lava Front" label */}
          <Html position={[10, 0.6, 9.5]} center distanceFactor={10}>
            <div className="px-2 py-0.5 rounded bg-red-700/90 text-orange-100 font-black text-[9px] tracking-wider border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] whitespace-nowrap pointer-events-none animate-pulse">
              🌋 LAVA MENCAPAI DATARAN RENDAH
            </div>
          </Html>
        </group>
      )}

      {/* ═══ PINE TREES ═══ */}
      {[
        { x: -4.5, z: -2.0, s: 1.1 },
        { x: -5.5, z: 0.5, s: 1.2 },
        { x: -4.8, z: 2.5, s: 0.9 },
        { x: 3.5, z: -4.2, s: 1.0 },
        { x: 5.2, z: -2.8, s: 1.2 },
        { x: -2.5, z: 5.5, s: 0.95 },
        { x: 5.8, z: 1.5, s: 1.1 }
      ].map((pt, i) => (
        <group key={`pine-${i}`} position={[pt.x, -1.9, pt.z]} scale={[pt.s, pt.s, pt.s]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 0.7]} />
            <meshStandardMaterial color="#3e2723" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <coneGeometry args={[0.42, 0.8, 6]} />
            <meshStandardMaterial color={eruptionStage >= 6 ? '#44403c' : '#14532d'} roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.32, 0.65, 6]} />
            <meshStandardMaterial color={eruptionStage >= 6 ? '#57534e' : '#166534'} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ═══ VOLCANIC LIGHTNING (Stage 4+) ═══ */}
      <group ref={lightningMeshRef} position={[0, 6.2, 0]} visible={false}>
        {[[-0.2, 0.8, 0], [0.3, 0.3, 0.1], [-0.1, -0.2, -0.1], [0.2, -0.7, 0.2]].map((pt, i) => (
          <mesh key={`bolt-${i}`} position={[pt[0], pt[1], pt[2]]} rotation={[0, 0, (i % 2 === 0 ? 0.35 : -0.35)]}>
            <boxGeometry args={[0.08, 0.65, 0.08]} />
            <meshStandardMaterial color="#ffffff" emissive="#7dd3fc" emissiveIntensity={8.0} />
          </mesh>
        ))}
      </group>

      {/* ═══ PARTICLE SYSTEMS (InstancedMesh) ═══ */}
      <instancedMesh ref={fumaroleRef} args={[undefined, undefined, fumaroleCount]}>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color={eruptionStage <= 1 ? '#d4d4d8' : '#a1a1aa'} roughness={0.95} metalness={0.02} transparent opacity={eruptionStage === 1 ? 0.4 : eruptionStage === 2 ? 0.55 : 0.25} />
      </instancedMesh>

      <instancedMesh ref={ashPlumeRef} args={[undefined, undefined, plumeCount]}>
        <sphereGeometry args={[0.65, 12, 12]} />
        <meshStandardMaterial color={eruptionStage === 2 ? '#71717a' : '#27272a'} roughness={0.95} metalness={0.05} transparent opacity={eruptionStage === 2 ? 0.5 : eruptionStage === 6 ? 0.55 : 0.88} />
      </instancedMesh>

      <instancedMesh ref={mushroomRef} args={[undefined, undefined, mushroomCount]}>
        <sphereGeometry args={[0.9, 14, 14]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.9} metalness={0.05} transparent opacity={eruptionStage === 6 ? 0.5 : 0.85} />
      </instancedMesh>

      <instancedMesh ref={pyroclasticRef} args={[undefined, undefined, pyroclasticCount]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#52525b" roughness={0.92} transparent opacity={0.78} />
      </instancedMesh>

      <instancedMesh ref={lavaSparksRef} args={[undefined, undefined, sparkCount]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ea580c" emissive="#ef4444" emissiveIntensity={4.0} roughness={0.3} />
      </instancedMesh>

      <instancedMesh ref={fallingAshRef} args={[undefined, undefined, fallingAshCount]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#a8a29e" roughness={1.0} transparent opacity={0.6} side={THREE.DoubleSide} />
      </instancedMesh>

      {/* ═══ KRB ZONES ═══ */}
      <group position={[0, -2.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={krbPulseRef}>
          <ringGeometry args={[4.8, 5.05, 48]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={eruptionStage >= 3 ? 0.65 : 0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[7.2, 7.4, 48]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={eruptionStage >= 2 ? 0.45 : 0.1} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[9.8, 10.0, 48]} />
          <meshBasicMaterial color="#10b981" transparent opacity={eruptionStage >= 1 ? 0.35 : 0.08} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {eruptionStage >= 3 && (
        <group position={[3.6, -1.85, 3.6]} rotation={[0, -0.7, 0]}>
          <Html center distanceFactor={10}>
            <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-black text-[10px] tracking-wider border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.85)] whitespace-nowrap pointer-events-none">
              KRB III (ZONA BAHAYA ALIRAN LAHAR & AWAN PANAS)
            </div>
          </Html>
        </group>
      )}

      {/* ═══ EMERGENCY CAMP (Posko Evakuasi) ═══ */}
      <group position={[-7.8, -2.0, 3.8]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[4.6, 0.1, 3.6]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        <group position={[-0.9, 0.1, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.2, 0.9, 1.8]} />
            <meshStandardMaterial color="#ea580c" roughness={0.75} />
          </mesh>
          <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 1.25, 2.22, 3]} />
            <meshStandardMaterial color="#f97316" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.45, 0.91]}>
            <boxGeometry args={[0.65, 0.8, 0.02]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 1.15, 0.55]} rotation={[-0.55, 0, 0]}>
            <boxGeometry args={[1.4, 0.35, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <Html position={[0, 1.16, 0.58]} center distanceFactor={7}>
            <span className="text-[9px] font-black tracking-tighter text-orange-600 whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow">
              POSKO UTAMA BPBD
            </span>
          </Html>
        </group>

        <group position={[1.2, 0.1, 0.2]} rotation={[0, -0.4, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.8, 0.5, 0.9]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, 0.72, 0]}>
            <boxGeometry args={[1.2, 0.45, 0.86]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          <mesh position={[0.51, 0.72, 0]}>
            <boxGeometry args={[0.04, 0.35, 0.76]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.35, 0.46]}>
            <boxGeometry args={[1.7, 0.12, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[-0.1, 1.0, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.5]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={showEvacuation ? 2.5 : 0.5} />
          </mesh>
          {[-0.55, 0.55].map((wx, wi) => (
            <React.Fragment key={`wheels-${wi}`}>
              <mesh position={[wx, 0.15, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
              <mesh position={[wx, 0.15, -0.46]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.16, 0.16, 0.12, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            </React.Fragment>
          ))}
        </group>

        <group position={[1.9, 0.1, -1.2]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.03, 0.06, 3.2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.25, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
          </mesh>
        </group>

        <group position={[-2.0, 0.1, 1.2]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2.4]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
          </mesh>
          <mesh ref={flagRef} position={[0.35, 2.1, 0]}>
            <boxGeometry args={[0.65, 0.4, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.35, 1.9, 0]}>
            <boxGeometry args={[0.65, 0.2, 0.022]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        <mesh position={[-1.9, 0.3, -0.8]}>
          <boxGeometry args={[0.6, 0.45, 0.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        <mesh position={[-1.2, 0.25, -0.9]}>
          <boxGeometry args={[0.5, 0.35, 0.5]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>

        {showEvacuation && (
          <Html position={[0, 2.4, 0]} center distanceFactor={8}>
            <button
              onClick={() => {
                soundEngine.playClick();
                if (onActionClick) onActionClick('EVACUATE_KRB');
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black text-xs shadow-[0_0_25px_rgba(249,115,22,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>EVAKUASI KE POSKO AMAN BPBD (&gt;10 KM)</span>
            </button>
          </Html>
        )}
      </group>
    </group>
  );
};
