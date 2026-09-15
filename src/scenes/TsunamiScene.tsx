import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../audio/soundEngine';

interface TsunamiSceneProps {
  isSimulating?: boolean;
  onActionClick?: (actionId: string) => void;
}

export const TsunamiScene: React.FC<TsunamiSceneProps> = ({
  isSimulating = true,
  onActionClick
}) => {
  // Animation Refs
  const oceanMeshRef = useRef<THREE.Mesh>(null);
  const foamCrestRef = useRef<THREE.Mesh>(null);
  const sprayRef = useRef<THREE.InstancedMesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const sirenLightRef = useRef<THREE.PointLight>(null);
  const boatRef = useRef<THREE.Group>(null);

  const sprayCount = 75;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 1. PROCEDURAL COASTAL TERRAIN (Sloping Beach, Sandy Shoreline, & Grassy Headland)
  const coastalTerrain = useMemo(() => {
    const geo = new THREE.PlaneGeometry(24, 18, 48, 36);
    geo.rotateX(-Math.PI / 2); // Horizontal plane

    const pos = geo.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const cDeepSeabed = new THREE.Color('#0369a1');
    const cShallowSand = new THREE.Color('#ca8a04');
    const cDryBeach = new THREE.Color('#facc15');
    const cCoastalGrass = new THREE.Color('#15803d');
    const cRockyCliff = new THREE.Color('#475569');

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Coastal elevation profile:
      // z > 1.5: underwater seabed sloping down to deep ocean
      // z = -1.5 to 1.5: sandy beach slope
      // z < -1.5: coastal land & grassy settlement ground
      let y = 0;
      if (z > 1.5) {
        // Sloping seabed into ocean
        y = -1.6 - (z - 1.5) * 0.35;
      } else if (z > -1.5) {
        // Beach incline
        const t = (1.5 - z) / 3.0;
        y = -1.6 + t * 0.55;
      } else {
        // Village coastal flat ground
        y = -1.05 + Math.sin(x * 0.4) * 0.1;
      }

      // Add gentle dunes variation
      y += Math.sin(x * 0.8 + z * 0.5) * 0.08;

      pos.setY(i, y);

      // Vertex color blending based on elevation & zone
      const color = new THREE.Color();
      if (z > 2.0) {
        color.copy(cDeepSeabed);
      } else if (z > 0.5) {
        color.copy(cShallowSand);
      } else if (z > -1.8) {
        color.copy(cDryBeach);
      } else {
        // Grass with occasional rocky outcrops
        if (x > 3.0) {
          color.copy(cRockyCliff);
        } else {
          color.copy(cCoastalGrass);
        }
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 2. PROCEDURAL DYNAMIC OCEAN WATER GEOMETRY (Undulating Surface with Tsunami Wave Front)
  const oceanGeometry = useMemo(() => {
    // 64x48 grid on a 22x14 water plane
    const geo = new THREE.PlaneGeometry(22, 14, 64, 48);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Water spray particles
  const sprayParticles = useMemo(() => {
    return Array.from({ length: sprayCount }).map(() => ({
      x: (Math.random() - 0.5) * 12,
      y: 0.5,
      z: 2.0 + Math.random() * 2.0,
      vx: (Math.random() - 0.5) * 0.04,
      vy: 0.04 + Math.random() * 0.06,
      vz: -0.06 - Math.random() * 0.08,
      gravity: -0.003,
      scale: 0.06 + Math.random() * 0.08
    }));
  }, [sprayCount]);

  // Animation Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Siren Light Strobe
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = 2.0 + Math.sin(t * 12) * 2.0;
    }

    // Flag Waving
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 4.5) * 0.3;
    }

    // Traditional Fishing Boat bobbing/swept by surge
    if (boatRef.current) {
      if (isSimulating) {
        boatRef.current.position.y = -1.2 + Math.sin(t * 1.8) * 0.25;
        boatRef.current.rotation.z = Math.sin(t * 2.2) * 0.15;
        boatRef.current.rotation.x = Math.cos(t * 1.5) * 0.12;
      } else {
        boatRef.current.position.y = -1.4;
        boatRef.current.rotation.z = 0.05;
      }
    }

    // ANIMATE REALISTIC TSUNAMI OCEAN VERTICES
    if (oceanMeshRef.current) {
      const geo = oceanMeshRef.current.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position;
      const count = pos.count;

      // Wave front surge position traveling back and forth in simulation
      // Surge wave crest position along Z: surges from z = 4.5 toward z = -0.5
      const wavePhase = (t * 0.65) % (Math.PI * 2);
      const waveCenterZ = isSimulating ? 1.5 - Math.cos(wavePhase) * 3.0 : 4.0;
      const waveAmplitude = isSimulating ? 2.3 : 0.4;

      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        // Ambient ocean ripples
        let y = Math.sin(x * 1.2 + t * 2.5) * 0.07 + Math.cos(z * 1.4 + t * 2.0) * 0.06;

        // Base ocean elevation (recedes before the wave strikes - air laut surut!)
        const drawback = isSimulating ? -0.4 * Math.max(0, Math.sin(wavePhase)) : 0;
        y += -1.25 + drawback;

        // Towering Tsunami Wave Profile (Asymmetric steep front & gradual trailing swell)
        const distFromCrest = z - waveCenterZ;
        if (distFromCrest > -1.8 && distFromCrest < 3.2) {
          // Steep front face (toward land, distFromCrest < 0)
          let waveProfile = 0;
          if (distFromCrest < 0) {
            waveProfile = Math.cos((distFromCrest / 1.8) * (Math.PI / 2));
          } else {
            // Gradual trailing back swell
            waveProfile = Math.pow(Math.cos((distFromCrest / 3.2) * (Math.PI / 2)), 1.5);
          }
          y += waveProfile * waveAmplitude;
        }

        pos.setY(i, y);
      }

      pos.needsUpdate = true;
      geo.computeVertexNormals();

      // Synchronize White Foam Crest Position with the Tsunami Wave Peak
      if (foamCrestRef.current) {
        foamCrestRef.current.position.z = waveCenterZ - 0.2;
        foamCrestRef.current.position.y = -1.25 + (isSimulating ? waveAmplitude * 0.95 : 0.3);
        foamCrestRef.current.scale.x = 1.0 + Math.sin(t * 5) * 0.05;
      }
    }

    // Water Spray Particle System at the wave crest
    if (sprayRef.current && isSimulating) {
      const wavePhase = (t * 0.65) % (Math.PI * 2);
      const waveCenterZ = 1.5 - Math.cos(wavePhase) * 3.0;

      sprayParticles.forEach((sp, i) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.z += sp.vz;
        sp.vy += sp.gravity;

        if (sp.y < -1.4 || sp.z < -2.0) {
          sp.x = (Math.random() - 0.5) * 11;
          sp.y = 0.6 + Math.random() * 0.4;
          sp.z = waveCenterZ + (Math.random() - 0.5) * 0.5;
          sp.vy = 0.05 + Math.random() * 0.06;
          sp.vz = -0.06 - Math.random() * 0.08;
        }

        dummy.position.set(sp.x, sp.y, sp.z);
        dummy.scale.set(sp.scale, sp.scale, sp.scale);
        dummy.rotation.set(t * 3 + i, t * 2, 0);
        dummy.updateMatrix();
        sprayRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sprayRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Bright Tropical Coastal Lighting */}
      <ambientLight intensity={1.3} />
      <hemisphereLight args={['#38bdf8', '#fef08a', 1.2]} />
      {/* Sun Light casting crisp coastal shadows */}
      <directionalLight position={[-10, 16, 8]} intensity={2.6} color="#ffffff" castShadow />
      <directionalLight position={[10, 10, -6]} intensity={1.3} color="#bae6fd" />
      {/* Ocean Sun Glint Point Light */}
      <pointLight position={[0, 4.0, 3.0]} intensity={2.5} color="#06b6d4" distance={20} />
      {/* Siren Tower Beacon Light */}
      <pointLight ref={sirenLightRef} position={[4.6, 2.8, -2.4]} intensity={2.2} color="#f59e0b" distance={10} />

      {/* 2. REALISTIC SLOPING COASTAL BEACH TERRAIN */}
      <mesh geometry={coastalTerrain} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.8} />
      </mesh>

      {/* 3. DYNAMIC PROCEDURAL UNDULATING OCEAN MESH (Air Laut Bergelombang & Berpendar) */}
      <mesh ref={oceanMeshRef} geometry={oceanGeometry} position={[0, 0, 1.8]}>
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.12}
          metalness={0.25}
          transparent
          opacity={0.86}
          emissive="#0369a1"
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* 4. Frothing White Foam Lip on Wave Crest (Busa Ombak Putih Berbuih) */}
      <mesh ref={foamCrestRef} position={[0, 0.5, 2.0]}>
        <boxGeometry args={[16.5, 0.45, 0.65]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Water Spray Droplets */}
      <instancedMesh ref={sprayRef} args={[undefined, undefined, sprayCount]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>

      {/* 5. Coastal Mitigation: Concrete Breakwater Tetrapods (Pemecah Ombak) */}
      <group position={[-1.2, -1.35, 1.2]}>
        {[-3.0, -1.8, -0.6, 0.6, 1.8].map((tx, i) => (
          <group key={`tetra-${i}`} position={[tx, 0, 0]} rotation={[0.2 * i, 0.4 * i, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.14, 0.22, 0.6, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.12, 0.18, 0.55, 6]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Mangrove Forest Barrier (Sabuk Hijau Bakau Mitigasi Tsunami) */}
      <group position={[-5.8, -1.1, 0.2]}>
        {[
          { x: 0, z: 0, s: 0.9 },
          { x: 0.9, z: -0.6, s: 1.1 },
          { x: -0.7, z: -0.8, s: 0.85 },
          { x: 0.4, z: 0.7, s: 1.0 }
        ].map((mg, i) => (
          <group key={`mg-${i}`} position={[mg.x, 0, mg.z]} scale={[mg.s, mg.s, mg.s]}>
            {/* Stilt Roots (Akar Tunjang Bakau) */}
            {[-0.2, 0.2].map((rx, ri) => (
              <mesh key={`root-${ri}`} position={[rx, 0.25, 0]} rotation={[0, 0, (rx > 0 ? -0.35 : 0.35)]}>
                <cylinderGeometry args={[0.04, 0.06, 0.5]} />
                <meshStandardMaterial color="#451a03" roughness={0.9} />
              </mesh>
            ))}
            {/* Foliage Canopy */}
            <mesh position={[0, 0.75, 0]}>
              <sphereGeometry args={[0.45, 8, 8]} />
              <meshStandardMaterial color="#14532d" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. AUTHENTIC INDONESIAN COASTAL STILT HOUSES (Rumah Panggung Nelayan Nusantara) */}
      {[
        { x: -3.8, z: -1.4, wall: '#78350f', roof: '#b91c1c', rot: 0.1 },
        { x: -1.6, z: -1.9, wall: '#92400e', roof: '#ea580c', rot: -0.08 },
        { x: -3.2, z: -3.2, wall: '#854d0e', roof: '#c2410c', rot: 0.05 }
      ].map((h, i) => (
        <group key={`house-${i}`} position={[h.x, -1.05, h.z]} rotation={[0, h.rot, 0]}>
          {/* Sturdy Timber Foundation Stilts (Tiang Kayu Pancang) */}
          {[
            [-0.7, -0.65],
            [0.7, -0.65],
            [-0.7, 0.65],
            [0.7, 0.65],
            [0, -0.65],
            [0, 0.65]
          ].map(([sx, sz], si) => (
            <mesh key={`stilt-${si}`} position={[sx, 0.4, sz]}>
              <cylinderGeometry args={[0.05, 0.06, 0.8]} />
              <meshStandardMaterial color="#451a03" roughness={0.85} />
            </mesh>
          ))}

          {/* Elevated Timber Floor Deck & Veranda */}
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[1.8, 0.08, 1.6]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Veranda Railing */}
          <mesh position={[0, 1.05, 0.75]}>
            <boxGeometry args={[1.7, 0.35, 0.04]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>

          {/* Wooden House Walls with Traditional Timber Grain */}
          <mesh position={[0, 1.45, -0.15]}>
            <boxGeometry args={[1.6, 1.15, 1.2]} />
            <meshStandardMaterial color={h.wall} roughness={0.65} />
          </mesh>

          {/* Front Entrance Door & Window Shutters */}
          <mesh position={[-0.3, 1.35, 0.46]}>
            <boxGeometry args={[0.35, 0.75, 0.03]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0.35, 1.45, 0.46]}>
            <boxGeometry args={[0.35, 0.45, 0.03]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} />
          </mesh>

          {/* Traditional Pitched Gable Thatched/Tile Roof (Atap Pelana Limasan) */}
          <mesh position={[0, 2.3, -0.15]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 1.1, 1.85, 3]} />
            <meshStandardMaterial color={h.roof} roughness={0.55} />
          </mesh>
          {/* Roof Ridge Beam Cap */}
          <mesh position={[0, 2.85, -0.15]}>
            <boxGeometry args={[1.9, 0.08, 0.08]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>

          {/* Wooden Entrance Ladder / Stairs */}
          <group position={[-0.3, 0.4, 0.95]} rotation={[0.4, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.35, 0.9, 0.04]} />
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
          </group>

          {/* Safety Lifebuoy Ring on Wall */}
          <mesh position={[0.7, 1.5, 0.46]}>
            <torusGeometry args={[0.1, 0.03, 8, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 8. Traditional Indonesian Outrigger Fishing Boat (Perahu Jukung Nelayan) */}
      <group ref={boatRef} position={[-0.6, -1.2, 0.8]} rotation={[0, 0.35, 0]}>
        {/* Canoe Hull */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[2.2, 0.35, 0.5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Cyan & Red Indonesian Racing Stripe */}
        <mesh position={[0, 0.22, 0.26]}>
          <boxGeometry args={[2.1, 0.08, 0.02]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0, 0.12, 0.26]}>
          <boxGeometry args={[2.1, 0.06, 0.02]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* Outrigger Bamboo Booms & Floats */}
        {[-0.6, 0.6].map((bx, bi) => (
          <mesh key={`boom-${bi}`} position={[bx, 0.25, 0.55]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        ))}
        {/* Twin Outrigger Floats (Katir Bambu) */}
        <mesh position={[0, 0.15, 0.95]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.0]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
      </group>

      {/* 9. Coconut Palm Trees along Shore (Pohon Kelapa Pantai) */}
      {[
        { x: -5.2, z: -2.2, h: 2.6, rotZ: -0.15 },
        { x: -0.5, z: -2.6, h: 2.3, rotZ: 0.12 },
        { x: -5.8, z: 1.2, h: 2.8, rotZ: -0.18 }
      ].map((p, i) => (
        <group key={`palm-${i}`} position={[p.x, -1.05, p.z]}>
          {/* Slanted Curved Palm Trunk */}
          <mesh position={[0.1, p.h * 0.45, 0]} rotation={[0, 0, p.rotZ]}>
            <cylinderGeometry args={[0.08, 0.14, p.h, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Palm Fronds Foliage Crown */}
          <group position={[0.1 + p.rotZ * p.h, p.h * 0.9, 0]}>
            {[0, 1, 2, 3, 4, 5].map((f) => (
              <mesh key={`frond-${f}`} rotation={[0.45, (f / 6) * Math.PI * 2, 0.25]}>
                <coneGeometry args={[0.7, 1.4, 5]} />
                <meshStandardMaterial color="#15803d" roughness={0.5} />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* 10. HIGH ELEVATION TSUNAMI EVACUATION HILL & BMKG TEWS SIREN TOWER */}
      <group position={[4.6, -0.6, -2.5]}>
        {/* Mountainous Terraced Evacuation Hill (>20m Safe Zone) */}
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[4.2, 4.8, 12]} />
          <meshStandardMaterial color="#166534" roughness={0.85} />
        </mesh>
        {/* Coastal Rock Headland Crags */}
        <mesh position={[-1.4, -0.2, 1.4]} rotation={[0.3, 0.4, 0]}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>

        {/* Concrete Assembly Platform at Summit */}
        <mesh position={[0, 2.65, 0]}>
          <cylinderGeometry args={[1.4, 1.5, 0.2, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.7} />
        </mesh>

        {/* BMKG / BPBD Tsunami Evacuation Shelter (TES) */}
        <mesh position={[-0.2, 3.2, 0]}>
          <boxGeometry args={[1.5, 0.9, 1.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <mesh position={[-0.2, 3.7, 0]}>
          <boxGeometry args={[1.7, 0.12, 1.6]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Shelter Door */}
        <mesh position={[0.56, 3.1, 0]}>
          <boxGeometry args={[0.02, 0.7, 0.45]} />
          <meshStandardMaterial color="#0369a1" />
        </mesh>

        {/* Official BMKG TEWS Siren Tower (Menara Sirine Tsunami) */}
        <group position={[0.85, 2.7, 0.6]}>
          {/* Lattice Mast */}
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.04, 0.07, 2.0, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.7} />
          </mesh>
          {/* 4 Directional Megaphone Sirens */}
          {[0, 1, 2, 3].map((s) => (
            <mesh key={`siren-${s}`} position={[0, 1.9, 0]} rotation={[0, (s * Math.PI) / 2, 0.2]}>
              <coneGeometry args={[0.12, 0.35, 8]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
          ))}
          {/* Strobe Warning Light at top */}
          <mesh position={[0, 2.15, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={3.0} />
          </mesh>
        </group>

        {/* Indonesian Flagpole */}
        <group position={[-0.9, 2.7, 0.7]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.6]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
          </mesh>
          {/* Merah Putih Flag */}
          <mesh ref={flagRef} position={[0.3, 1.4, 0]}>
            <boxGeometry args={[0.55, 0.35, 0.02]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0.3, 1.22, 0]}>
            <boxGeometry args={[0.55, 0.17, 0.022]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Interactive Evacuation Action Prompt Button */}
        <Html position={[0, 4.3, 0]} center distanceFactor={8}>
          <button
            onClick={() => {
              soundEngine.playClick();
              if (onActionClick) onActionClick('EVACUATE_HILL');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-[0_0_25px_rgba(16,185,129,0.9)] cursor-pointer hover:scale-105 transition-all whitespace-nowrap border-2 border-white pointer-events-auto"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>EVAKUASI KE BUKIT TINGGI (&gt;20 METER)</span>
          </button>
        </Html>
      </group>
    </group>
  );
};
