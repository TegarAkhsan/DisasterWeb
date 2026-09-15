import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface VolcanoSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const VolcanoScene: React.FC<VolcanoSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  // Animation Refs
  const ashPlumeRef = useRef<THREE.InstancedMesh>(null);
  const mushroomRef = useRef<THREE.InstancedMesh>(null);
  const pyroclasticRef = useRef<THREE.InstancedMesh>(null);
  const lavaSparksRef = useRef<THREE.InstancedMesh>(null);
  const lavaLakeRef = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const sirenLightRef = useRef<THREE.PointLight>(null);
  const lightningLightRef = useRef<THREE.PointLight>(null);
  const lightningMeshRef = useRef<THREE.Group>(null);
  const krbPulseRef = useRef<THREE.Mesh>(null);

  const plumeCount = 45;
  const mushroomCount = 55;
  const pyroclasticCount = 30;
  const sparkCount = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. PROCEDURAL STRATOVOLCANO TERRAIN GEOMETRY (Realistic Merapi/Semeru profile)
  const mountainGeometry = useMemo(() => {
    const size = 26;
    const segments = 64;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

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
        // Deep sunken caldera crater bowl
        const t = r / craterRadius;
        y = 1.4 + Math.pow(t, 2) * 1.5;
      } else if (r <= craterLip) {
        // Jagged crater rim peak
        const t = (r - craterRadius) / (craterLip - craterRadius);
        y = 3.25 + Math.sin(t * Math.PI) * 0.35 + Math.sin(angle * 8) * 0.15;
      } else {
        // Natural exponential stratovolcano slope
        const dist = r - craterLip;
        const baseHeight = 3.35 * Math.exp(-0.3 * dist);
        // Radiating volcanic ridges & drainage gullies (rusuk gunung)
        const ridges = Math.sin(angle * 7) * 0.32 * Math.exp(-0.18 * dist);
        // Rocky noise for realistic andesite boulders
        const noise = (Math.sin(x * 1.6 + z * 1.1) * 0.12 + Math.cos(x * 1.1 - z * 1.6) * 0.08) * Math.min(1.0, r / 1.5);
        // Carved Lahar river valley on southeast slope (angle ~ 0.8 rad)
        let laharGorge = 0;
        const angleDiff = Math.abs(angle - 0.85);
        if (angleDiff < 0.38 && dist > 0.4) {
          laharGorge = -0.38 * Math.cos((angleDiff / 0.38) * (Math.PI / 2));
        }

        y = Math.max(0, baseHeight + ridges + noise + laharGorge);
      }

      // Height offset so base is at y = -2.1
      pos.setY(i, y - 2.1);

      // Realistic vertex coloration based on height, slope & terrain zones
      const finalH = y;
      const color = new THREE.Color();

      if (r < craterRadius) {
        // Caldera interior wall
        color.lerpColors(cMagmaGlow, cAshCharcoal, r / craterRadius);
      } else if (finalH > 2.7) {
        // Summit crags & sulfur vents
        if (Math.sin(angle * 6) > 0.55) {
          color.copy(cSulfurYellow);
        } else {
          color.copy(cAshCharcoal);
        }
      } else if (finalH > 1.5) {
        // Dark andesite volcanic rock & loose scree
        const t = (finalH - 1.5) / 1.2;
        color.lerpColors(cVolcanicSoil, cBasaltRock, t);
      } else if (finalH > 0.6) {
        // Mountain pine forest transition
        const t = (finalH - 0.6) / 0.9;
        color.lerpColors(cLushDark, cVolcanicSoil, t);
      } else {
        // Foothill savanna & tropical greenery
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

  // 2. High-Velocity Ash Column Particles (Throat Jet)
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

  // 3. Billowing Umbrella Mushroom Cap (Payung Awan Panas Troposfer)
  const mushroomParticles = useMemo(() => {
    return Array.from({ length: mushroomCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3.2;
      return {
        angle,
        radius,
        baseRadius: radius,
        y: 5.5 + Math.random() * 3.0,
        speedY: 0.01 + Math.random() * 0.015,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0.8 + Math.random() * 0.8
      };
    });
  }, [mushroomCount]);

  // 4. Pyroclastic Flow (Awan Panas Guguran / Wedhus Gembel) on Southeast Slope
  const pyroclasticParticles = useMemo(() => {
    return Array.from({ length: pyroclasticCount }).map((_, i) => {
      const dist = 1.2 + (i / pyroclasticCount) * 5.0;
      const angle = 0.85 + (Math.random() - 0.5) * 0.25;
      return {
        dist,
        angle,
        speed: 0.03 + Math.random() * 0.02,
        scale: 0.4 + (i / pyroclasticCount) * 0.7,
        rotSpeed: (Math.random() - 0.5) * 0.04
      };
    });
  }, [pyroclasticCount]);

  // 5. Ballistic Molten Lava Bombs (Bom Vulkanik & Lontaran Pijar)
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

  // Animation Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Glowing Lava Lake Pulsing Intensity
    if (lavaLakeRef.current) {
      const mat = lavaLakeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isSimulating ? 3.5 + Math.sin(t * 8) * 1.5 : 1.2;
      }
    }

    // Emergency Camp Flashing Strobe
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = 1.5 + Math.sin(t * 14) * 1.5;
    }

    // Volcanic Lightning Flash (Petir Vulkanik di dalam awan abu)
    if (lightningLightRef.current && lightningMeshRef.current) {
      const isFlashing = isSimulating && Math.sin(t * 16) > 0.88 && Math.sin(t * 3.7) > 0.3;
      lightningLightRef.current.intensity = isFlashing ? 12 : 0;
      lightningMeshRef.current.visible = isFlashing;
      if (isFlashing) {
        lightningMeshRef.current.rotation.y = t * 5;
      }
    }

    // Flag Waving Animation
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 4.5) * 0.3;
    }

    // KRB Zone Boundary Pulse
    if (krbPulseRef.current) {
      const mat = krbPulseRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(t * 3) * 0.25;
      }
    }

    // Ash Throat Column Animation
    if (ashPlumeRef.current && isSimulating) {
      plumeParticles.forEach((p, i) => {
        p.y += p.speedY;
        p.x += p.driftX;
        p.z += p.driftZ;

        if (p.y > 6.0) {
          p.y = 1.2 + Math.random() * 0.3;
          p.x = (Math.random() - 0.5) * 0.3;
          p.z = (Math.random() - 0.5) * 0.3;
        }

        const currentScale = p.baseScale * (1.0 + (p.y - 1.2) * 0.4);
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.set(currentScale, currentScale, currentScale);
        dummy.rotation.set(0, t * 0.2 + i, 0);
        dummy.updateMatrix();
        ashPlumeRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ashPlumeRef.current.instanceMatrix.needsUpdate = true;
    }

    // Umbrella Mushroom Cloud Billowing & Expanding
    if (mushroomRef.current && isSimulating) {
      mushroomParticles.forEach((m, i) => {
        m.angle += m.rotSpeed;
        m.y += m.speedY;
        const currentRadius = m.baseRadius + (m.y - 5.5) * 0.4;
        const mx = Math.cos(m.angle) * currentRadius;
        const mz = Math.sin(m.angle) * currentRadius;

        if (m.y > 9.2) {
          m.y = 5.5 + Math.random() * 0.5;
        }

        dummy.position.set(mx, m.y, mz);
        dummy.scale.set(m.scale, m.scale * 0.75, m.scale);
        dummy.rotation.set(0, m.angle, 0);
        dummy.updateMatrix();
        mushroomRef.current!.setMatrixAt(i, dummy.matrix);
      });
      mushroomRef.current.instanceMatrix.needsUpdate = true;
    }

    // Pyroclastic Density Flow (Wedhus Gembel) Rolling down slope
    if (pyroclasticRef.current && isSimulating) {
      pyroclasticParticles.forEach((pf, i) => {
        pf.dist += pf.speed;
        if (pf.dist > 7.5) {
          pf.dist = 1.3;
        }

        const px = Math.cos(pf.angle) * pf.dist;
        const pz = Math.sin(pf.angle) * pf.dist;
        // Slope height calculation
        const py = Math.max(-1.8, 2.8 * Math.exp(-0.35 * (pf.dist - 1.3)) - 1.8);

        dummy.position.set(px, py + 0.3, pz);
        const curScale = pf.scale * (1.0 + pf.dist * 0.2);
        dummy.scale.set(curScale, curScale * 0.8, curScale);
        dummy.rotation.set(t * 0.3 + i, pf.angle, 0);
        dummy.updateMatrix();
        pyroclasticRef.current!.setMatrixAt(i, dummy.matrix);
      });
      pyroclasticRef.current.instanceMatrix.needsUpdate = true;
    }

    // Ballistic Lava Bombs Falling along Parabolic Trajectories
    if (lavaSparksRef.current && isSimulating) {
      sparks.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.z += s.vz;
        s.vy += s.gravity;

        if (s.y < -1.8) {
          s.x = (Math.random() - 0.5) * 0.3;
          s.y = 1.3;
          s.z = (Math.random() - 0.5) * 0.3;
          s.vx = (Math.random() - 0.5) * 0.15;
          s.vy = 0.14 + Math.random() * 0.18;
          s.vz = (Math.random() - 0.5) * 0.15;
        }

        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(s.scale, s.scale, s.scale);
        dummy.rotation.set(t * 3 + i, t * 2, 0);
        dummy.updateMatrix();
        lavaSparksRef.current!.setMatrixAt(i, dummy.matrix);
      });
      lavaSparksRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Dramatic Volcanic Night Atmosphere Lighting */}
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#fed7aa', '#0f172a', 1.1]} />
      {/* Moon / High Atmospheric Light */}
      <directionalLight position={[10, 18, 10]} intensity={2.0} color="#e0f2fe" castShadow />
      {/* Fiery Magma Crater Point Light */}
      <pointLight position={[0, 1.8, 0]} intensity={isSimulating ? 8.0 : 3.0} color="#ff4500" distance={26} />
      {/* Secondary Glow on Eruption Column */}
      <pointLight position={[0, 5.0, 0]} intensity={isSimulating ? 4.5 : 1.5} color="#ea580c" distance={20} />
      {/* Lava Flow Slope Light */}
      <pointLight position={[1.8, -0.4, 2.2]} intensity={3.0} color="#f97316" distance={10} />
      {/* Volcanic Lightning Flash Light */}
      <pointLight ref={lightningLightRef} position={[0, 6.8, 0]} intensity={0} color="#7dd3fc" distance={35} />
      {/* Emergency Camp Beacon */}
      <pointLight ref={sirenLightRef} position={[-7.5, -0.9, 4.0]} intensity={2.0} color="#f59e0b" distance={8} />

      {/* 2. REALISTIC PROCEDURAL STRATOVOLCANO MESH with Vertex Shading */}
      <mesh geometry={mountainGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* 3. Caldera Magma Lake (Danau Kawah Magma Mendidih di Puncak) */}
      <group position={[0, -0.65, 0]}>
        <mesh ref={lavaLakeRef}>
          <cylinderGeometry args={[0.92, 0.92, 0.1, 24]} />
          <meshStandardMaterial
            color="#ea580c"
            emissive="#ef4444"
            emissiveIntensity={3.5}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
        {/* Magma Crust Basalt Patches floating on lava lake */}
        {[-0.35, 0.35, 0.0].map((cx, i) => (
          <mesh key={`crust-${i}`} position={[cx, 0.06, (i - 1) * 0.3]} rotation={[0, i * 1.2, 0]}>
            <boxGeometry args={[0.38, 0.04, 0.32]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 4. Glowing Lava Flow River along Lahar Valley (Lidah Aliran Lava Pijar) */}
      <group position={[0, -2.1, 0]}>
        {/* Main Cascading River */}
        {[
          { x: 0.85, y: 2.1, z: 0.95, sx: 0.5, sy: 0.15, sz: 1.2, rx: 0.55, ry: 0.8 },
          { x: 1.8, y: 1.3, z: 1.85, sx: 0.6, sy: 0.15, sz: 1.5, rx: 0.45, ry: 0.85 },
          { x: 2.9, y: 0.7, z: 2.9, sx: 0.7, sy: 0.12, sz: 1.8, rx: 0.35, ry: 0.85 },
          { x: 4.1, y: 0.25, z: 4.0, sx: 0.85, sy: 0.1, sz: 2.0, rx: 0.25, ry: 0.85 }
        ].map((seg, i) => (
          <mesh
            key={`lava-seg-${i}`}
            position={[seg.x, seg.y, seg.z]}
            rotation={[seg.rx, seg.ry, 0]}
          >
            <boxGeometry args={[seg.sx, seg.sy, seg.sz]} />
            <meshStandardMaterial
              color="#ea580c"
              emissive="#ef4444"
              emissiveIntensity={3.2}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* 5. Pine Trees along Volcano Apron (Pohon Cemara Lereng Gunung) */}
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
            <meshStandardMaterial color="#14532d" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.32, 0.65, 6]} />
            <meshStandardMaterial color="#166534" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 6. Volcanic Lightning 3D Bolts (Petir Vulkanik di Dalam Awan Abu) */}
      <group ref={lightningMeshRef} position={[0, 6.2, 0]} visible={false}>
        {/* Jagged glowing segments */}
        {[
          [-0.2, 0.8, 0],
          [0.3, 0.3, 0.1],
          [-0.1, -0.2, -0.1],
          [0.2, -0.7, 0.2]
        ].map((pt, i) => (
          <mesh key={`bolt-${i}`} position={[pt[0], pt[1], pt[2]]} rotation={[0, 0, (i % 2 === 0 ? 0.35 : -0.35)]}>
            <boxGeometry args={[0.08, 0.65, 0.08]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#7dd3fc"
              emissiveIntensity={8.0}
            />
          </mesh>
        ))}
      </group>

      {/* 7. Eruption Column Particles (Plume Jet & Mushroom Cap) */}
      {/* Ash Jet Column */}
      <instancedMesh ref={ashPlumeRef} args={[undefined, undefined, plumeCount]}>
        <sphereGeometry args={[0.65, 12, 12]} />
        <meshStandardMaterial
          color="#27272a"
          roughness={0.95}
          metalness={0.05}
          transparent
          opacity={0.88}
        />
      </instancedMesh>

      {/* Tropospheric Umbrella Mushroom Cap (Payung Awan Abu) */}
      <instancedMesh ref={mushroomRef} args={[undefined, undefined, mushroomCount]}>
        <sphereGeometry args={[0.9, 14, 14]} />
        <meshStandardMaterial
          color="#3f3f46"
          roughness={0.9}
          metalness={0.05}
          transparent
          opacity={0.85}
        />
      </instancedMesh>

      {/* Pyroclastic Density Current (Awan Panas Guguran / Wedhus Gembel) */}
      <instancedMesh ref={pyroclasticRef} args={[undefined, undefined, pyroclasticCount]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial
          color="#52525b"
          roughness={0.92}
          transparent
          opacity={0.78}
        />
      </instancedMesh>

      {/* Ballistic Glowing Lava Bombs */}
      <instancedMesh ref={lavaSparksRef} args={[undefined, undefined, sparkCount]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#ef4444"
          emissiveIntensity={4.0}
          roughness={0.3}
        />
      </instancedMesh>

      {/* 8. PVMBG KRB (Kawasan Rawan Bencana) Concentric Rings */}
      <group position={[0, -2.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* KRB III (Zona Bahaya Tinggi - Merah, Radius 5 km) */}
        <mesh ref={krbPulseRef}>
          <ringGeometry args={[4.8, 5.05, 48]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
        {/* KRB II (Zona Waspada - Oranye, Radius 8 km) */}
        <mesh>
          <ringGeometry args={[7.2, 7.4, 48]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        {/* KRB I (Zona Relatif Aman - Hijau, Radius >10 km) */}
        <mesh>
          <ringGeometry args={[9.8, 10.0, 48]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* KRB Floating Educational Badge */}
      <group position={[3.6, -1.85, 3.6]} rotation={[0, -0.7, 0]}>
        <Html center distanceFactor={10}>
          <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-black text-[10px] tracking-wider border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.85)] whitespace-nowrap pointer-events-none">
            KRB III (ZONA BAHAYA ALIRAN LAHAR & AWAN PANAS)
          </div>
        </Html>
      </group>

      {/* 9. Authentic Indonesian Emergency Camp (Posko Evakuasi Aman BPBD) */}
      <group position={[-7.8, -2.0, 3.8]}>
        {/* Concrete Safe Assembly Area */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[4.6, 0.1, 3.6]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>

        {/* Large BPBD Emergency Command Tent (Tenda Pleton BNPB / BPBD Oranye) */}
        <group position={[-0.9, 0.1, 0]}>
          {/* Main Tent Walls */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.2, 0.9, 1.8]} />
            <meshStandardMaterial color="#ea580c" roughness={0.75} />
          </mesh>
          {/* Triangular Gable Roof (Atap Pelana Tenda Darurat) */}
          <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 1.25, 2.22, 3]} />
            <meshStandardMaterial color="#f97316" roughness={0.7} />
          </mesh>
          {/* Open Tent Flap Entrance */}
          <mesh position={[0, 0.45, 0.91]}>
            <boxGeometry args={[0.65, 0.8, 0.02]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* BPBD Signboard Banner on Tent Roof */}
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

        {/* BNPB Emergency Ambulance / Rescue Truck */}
        <group position={[1.2, 0.1, 0.2]} rotation={[0, -0.4, 0]}>
          {/* Chassis Lower */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.8, 0.5, 0.9]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Cabin & Windshield */}
          <mesh position={[-0.1, 0.72, 0]}>
            <boxGeometry args={[1.2, 0.45, 0.86]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
          </mesh>
          <mesh position={[0.51, 0.72, 0]}>
            <boxGeometry args={[0.04, 0.35, 0.76]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} />
          </mesh>
          {/* Red Emergency Stripe */}
          <mesh position={[0, 0.35, 0.46]}>
            <boxGeometry args={[1.7, 0.12, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {/* Strobe Light Bar (Rotator Sirine) */}
          <mesh position={[-0.1, 1.0, 0]}>
            <boxGeometry args={[0.3, 0.1, 0.5]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.5} />
          </mesh>
          {/* 4 Wheels */}
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

        {/* High Radio Communication Mast Tower */}
        <group position={[1.9, 0.1, -1.2]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.03, 0.06, 3.2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
          {/* Blinking Red Air Beacon Light */}
          <mesh position={[0, 3.25, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3.0} />
          </mesh>
        </group>

        {/* Indonesian Merah Putih Flagpole */}
        <group position={[-2.0, 0.1, 1.2]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2.4]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
          </mesh>
          {/* Flag waving */}
          <mesh ref={flagRef} position={[0.35, 2.1, 0]}>
            <boxGeometry args={[0.65, 0.4, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.35, 1.9, 0]}>
            <boxGeometry args={[0.65, 0.2, 0.022]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Emergency Medical & Food Logistics Crates */}
        <mesh position={[-1.9, 0.3, -0.8]}>
          <boxGeometry args={[0.6, 0.45, 0.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        <mesh position={[-1.2, 0.25, -0.9]}>
          <boxGeometry args={[0.5, 0.35, 0.5]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>

        {/* Interactive Evacuation Action Button */}
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
      </group>
    </group>
  );
};
