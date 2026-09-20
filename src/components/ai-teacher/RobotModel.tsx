import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { RobotState } from './types';

interface RobotModelProps {
  state: RobotState;
  speakingIntensity?: number;
}

/* =========================================================
   SLEEK FUTURISTIC HUMANOID ANDROID - MATERIALS
   ========================================================= */
const materials = {
  // Ultra-smooth Arctic White Pearl Ceramic Armor
  armorWhite: new THREE.MeshPhysicalMaterial({
    color: '#F8FAFC',
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
  }),

  // Sleek Obsidian Titanium Accent / Undersuit
  titaniumDark: new THREE.MeshStandardMaterial({
    color: '#0F172A',
    roughness: 0.35,
    metalness: 0.85,
  }),

  // Polished Chrome / Platinum Joints
  chromeSilver: new THREE.MeshStandardMaterial({
    color: '#CBD5E1',
    roughness: 0.1,
    metalness: 0.95,
  }),

  // Glossy Smoked Visor Glass
  tintedVisor: new THREE.MeshPhysicalMaterial({
    color: '#030712',
    roughness: 0.05,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  }),

  // Dynamic Neon LEDs
  cyanNeon: new THREE.MeshStandardMaterial({
    color: '#38BDF8',
    emissive: '#0EA5E9',
    emissiveIntensity: 4.5,
    toneMapped: false,
  }),

  greenNeon: new THREE.MeshStandardMaterial({
    color: '#34D399',
    emissive: '#10B981',
    emissiveIntensity: 4.5,
    toneMapped: false,
  }),

  amberNeon: new THREE.MeshStandardMaterial({
    color: '#FBBF24',
    emissive: '#F59E0B',
    emissiveIntensity: 4.0,
    toneMapped: false,
  }),

  orangeNeon: new THREE.MeshStandardMaterial({
    color: '#FB923C',
    emissive: '#EA580C',
    emissiveIntensity: 4.2,
    toneMapped: false,
  }),

  roseNeon: new THREE.MeshStandardMaterial({
    color: '#FB7185',
    emissive: '#F43F5E',
    emissiveIntensity: 4.0,
    toneMapped: false,
  }),

  purpleNeon: new THREE.MeshStandardMaterial({
    color: '#C084FC',
    emissive: '#A855F7',
    emissiveIntensity: 4.2,
    toneMapped: false,
  }),
};

function getActiveNeon(state: RobotState) {
  switch (state) {
    case 'success':
      return materials.greenNeon;
    case 'error':
      return materials.roseNeon;
    case 'confused':
      return materials.orangeNeon;
    case 'correcting':
    case 'listening':
      return materials.amberNeon;
    case 'thinking':
      return materials.purpleNeon;
    default:
      return materials.cyanNeon;
  }
}

/* =========================================================
   SLEEK HUMANOID HEAD & EMOTIVE FACE
   ========================================================= */
function HumanoidHead({ state, speakingIntensity = 0 }: { state: RobotState; speakingIntensity?: number }) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const micLedRef = useRef<THREE.Mesh>(null);

  const activeNeon = getActiveNeon(state);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;

    // Organic head micro-motions
    if (headRef.current) {
      if (state === 'listening') {
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.03 - 0.04;
        headRef.current.rotation.x = Math.sin(t * 1.2) * 0.02 + 0.03;
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.02;
      } else if (state === 'thinking') {
        headRef.current.rotation.y = 0.06 + Math.sin(t * 1.2) * 0.03;
        headRef.current.rotation.x = -0.03 + Math.sin(t * 1.5) * 0.02;
      } else if (state === 'speaking') {
        headRef.current.rotation.x = Math.sin(t * 4.5) * 0.03 + (speakingIntensity * 0.04);
        headRef.current.rotation.y = Math.sin(t * 2.2) * 0.03;
        headRef.current.rotation.z = Math.sin(t * 1.8) * 0.01;
      } else if (state === 'confused') {
        headRef.current.rotation.z = 0.08;
        headRef.current.rotation.y = -0.04;
      } else {
        headRef.current.rotation.y = Math.sin(t * 0.6) * 0.02;
        headRef.current.rotation.x = Math.sin(t * 0.5) * 0.015;
      }
    }

    // Blinking animation
    const blinkCycle = t % 4.0;
    const isBlinking = blinkCycle > 3.85 && blinkCycle < 4.0;
    const eyeScaleY = isBlinking ? 0.1 : 1.0;

    if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;

    // Speaking Lip-sync
    if (mouthRef.current) {
      if (state === 'speaking') {
        mouthRef.current.scale.y = 0.6 + Math.abs(Math.sin(t * 9)) * 0.9;
        mouthRef.current.scale.x = 0.95 + Math.sin(t * 5) * 0.15;
      } else if (state === 'success') {
        mouthRef.current.scale.y = 1.3;
        mouthRef.current.scale.x = 1.2;
      } else {
        mouthRef.current.scale.y = 1.0;
        mouthRef.current.scale.x = 1.0;
      }
    }

    // Mic pulsing
    if (micLedRef.current && state === 'listening') {
      const pulse = 1.0 + Math.sin(t * 8) * 0.25;
      micLedRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={headRef} position={[0, 0.95, 0]}>
      {/* 1. Main Humanoid Cranium (Clean, sleek, unified human skull silhouette) */}
      <Sphere args={[0.22, 36, 36]} scale={[0.88, 1.15, 0.95]} position={[0, 0.02, 0]}>
        <primitive object={materials.armorWhite} attach="material" />
      </Sphere>

      {/* Rear Obsidian Carbon Shell (Stylized hair/crest) */}
      <Sphere args={[0.222, 32, 32]} scale={[0.89, 1.16, 0.9]} position={[0, 0.04, -0.04]}>
        <primitive object={materials.titaniumDark} attach="material" />
      </Sphere>

      {/* Sleek Neon Crown Light Strip */}
      <Torus args={[0.2, 0.004, 16, 36, Math.PI * 0.8]} rotation={[-Math.PI * 0.35, 0, 0]} position={[0, 0.14, 0.02]}>
        <primitive object={activeNeon} attach="material" />
      </Torus>

      {/* 2. Sleek Curved Visor Faceplate (Seamless panoramic dark cyber visor) */}
      <Sphere args={[0.195, 32, 32]} scale={[0.84, 0.85, 0.55]} position={[0, 0.01, 0.11]}>
        <primitive object={materials.tintedVisor} attach="material" />
      </Sphere>

      {/* 3. Expressive Glowing Eyes */}
      <mesh ref={leftEyeRef} position={[-0.07, 0.045, 0.21]}>
        <capsuleGeometry args={[0.015, 0.028, 16, 16]} />
        <primitive object={activeNeon} attach="material" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.07, 0.045, 0.21]}>
        <capsuleGeometry args={[0.015, 0.028, 16, 16]} />
        <primitive object={activeNeon} attach="material" />
      </mesh>

      {/* Subtle Glowing Eyebrow Accents */}
      <group position={[0, 0.095, 0.205]}>
        <RoundedBox args={[0.045, 0.005, 0.005]} radius={0.002} position={[-0.07, 0, 0]} rotation={[0, 0, 0.08]}>
          <primitive object={activeNeon} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.045, 0.005, 0.005]} radius={0.002} position={[0.07, 0, 0]} rotation={[0, 0, -0.08]}>
          <primitive object={activeNeon} attach="material" />
        </RoundedBox>
      </group>

      {/* 4. Emotive Digital Smile / Mouth */}
      <group ref={mouthRef} position={[0, -0.06, 0.21]}>
        <Torus args={[0.042, 0.005, 12, 24, Math.PI * 0.7]} rotation={[0, 0, -Math.PI * 0.85]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
      </group>

      {/* 5. Minimalist Audio Headset & Microphone */}
      {/* Right Ear Audio Node + Boom Mic */}
      <group position={[0.2, 0.02, 0]}>
        <Cylinder args={[0.045, 0.045, 0.02, 24]} rotation={[0, 0, Math.PI / 2]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>
        <Torus args={[0.038, 0.004, 16, 24]} rotation={[0, Math.PI / 2, 0]} position={[0.012, 0, 0]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
        {/* Sleek Mic Boom */}
        <group position={[0.01, -0.03, 0.03]}>
          <mesh position={[-0.04, -0.05, 0.12]} rotation={[0.4, -0.3, 0.2]}>
            <cylinderGeometry args={[0.003, 0.003, 0.15, 12]} />
            <primitive object={materials.chromeSilver} attach="material" />
          </mesh>
          <Sphere ref={micLedRef} args={[0.007, 12, 12]} position={[-0.075, -0.09, 0.17]}>
            <primitive object={materials.cyanNeon} attach="material" />
          </Sphere>
        </group>
      </group>

      {/* Left Ear Audio Node */}
      <group position={[-0.2, 0.02, 0]}>
        <Cylinder args={[0.045, 0.045, 0.02, 24]} rotation={[0, 0, Math.PI / 2]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>
        <Torus args={[0.038, 0.004, 16, 24]} rotation={[0, Math.PI / 2, 0]} position={[-0.012, 0, 0]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
      </group>

      {/* 6. Humanoid Articulated Neck */}
      <group position={[0, -0.26, 0]}>
        <Cylinder args={[0.065, 0.08, 0.14, 24]} position={[0, 0.01, 0]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>
        <Torus args={[0.072, 0.005, 16, 24]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <primitive object={materials.chromeSilver} attach="material" />
        </Torus>
        <Torus args={[0.078, 0.005, 16, 24]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
      </group>
    </group>
  );
}

/* =========================================================
   SLEEK HUMANOID TORSO & UPPER BODY (Realistic Anatomical Proportion)
   ========================================================= */
function HumanoidTorso({ state }: { state: RobotState }) {
  const activeNeon = getActiveNeon(state);

  return (
    <group position={[0, 0.42, 0]}>
      {/* 1. Clavicle & Upper Chest (Natural anatomical shoulder connection) */}
      <group position={[0, 0.16, 0]}>
        {/* Upper Chest Armor */}
        <RoundedBox args={[0.46, 0.18, 0.24]} radius={0.06} position={[0, 0.02, 0.02]}>
          <primitive object={materials.armorWhite} attach="material" />
        </RoundedBox>

        {/* Clavicle Neon Light Accent */}
        <group position={[0, 0.08, 0.14]}>
          <RoundedBox args={[0.16, 0.006, 0.006]} radius={0.002} position={[-0.11, 0, 0]} rotation={[0, 0, 0.05]}>
            <primitive object={activeNeon} attach="material" />
          </RoundedBox>
          <RoundedBox args={[0.16, 0.006, 0.006]} radius={0.002} position={[0.11, 0, 0]} rotation={[0, 0, -0.05]}>
            <primitive object={activeNeon} attach="material" />
          </RoundedBox>
        </group>
      </group>

      {/* 2. Glotvia AI Core Chest Emblem (Seamless Circular Arc Reactor) */}
      <group position={[0, 0.16, 0.145]}>
        <Cylinder args={[0.055, 0.055, 0.015, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>
        <Torus args={[0.045, 0.004, 16, 32]} position={[0, 0, 0.009]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
        {/* Stylized 'G' Core */}
        <group position={[0, 0, 0.01]} scale={[0.3, 0.3, 0.3]}>
          <Torus args={[0.09, 0.02, 16, 24, Math.PI * 1.5]} rotation={[0, 0, Math.PI * 0.75]}>
            <primitive object={materials.armorWhite} attach="material" />
          </Torus>
          <Sphere args={[0.025, 12, 12]} position={[0, 0, 0.01]}>
            <primitive object={activeNeon} attach="material" />
          </Sphere>
        </group>
      </group>

      {/* 3. Tapered Humanoid Ribcage & Abdomen (Athletic V-Shape) */}
      <group position={[0, -0.08, 0]}>
        {/* Core under-suit */}
        <Cylinder args={[0.2, 0.16, 0.24, 24]} scale={[1.15, 1.0, 0.8]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>

        {/* Abdominal armor plates */}
        <RoundedBox args={[0.26, 0.08, 0.08]} radius={0.02} position={[0, 0.04, 0.09]}>
          <primitive object={materials.armorWhite} attach="material" />
        </RoundedBox>
        <RoundedBox args={[0.22, 0.07, 0.08]} radius={0.02} position={[0, -0.05, 0.08]}>
          <primitive object={materials.armorWhite} attach="material" />
        </RoundedBox>
      </group>

      {/* 4. Waist & Base Ring */}
      <group position={[0, -0.26, 0]}>
        <Cylinder args={[0.18, 0.22, 0.08, 24]} scale={[1.2, 1.0, 0.8]}>
          <primitive object={materials.titaniumDark} attach="material" />
        </Cylinder>
        <Torus args={[0.2, 0.006, 16, 32]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 0.8, 1]} position={[0, 0.01, 0]}>
          <primitive object={activeNeon} attach="material" />
        </Torus>
      </group>
    </group>
  );
}

/* =========================================================
   SLEEK HUMANOID RIGHT ARM (Natural Instructor Gestures)
   ========================================================= */
function HumanoidRightArm({ state }: { state: RobotState }) {
  const armRef = useRef<THREE.Group>(null);
  const handRef = useRef<THREE.Group>(null);
  const activeNeon = getActiveNeon(state);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;

    if (armRef.current) {
      if (state === 'speaking') {
        armRef.current.rotation.x = 0.15 + Math.sin(t * 3.5) * 0.06;
        armRef.current.rotation.z = -0.1 + Math.sin(t * 2.5) * 0.04;
      } else if (state === 'success') {
        armRef.current.rotation.x = 0.3 + Math.sin(t * 4.0) * 0.04;
        armRef.current.rotation.z = -0.18;
      } else {
        armRef.current.rotation.x = 0.06 + Math.sin(t * 1.5) * 0.02;
        armRef.current.rotation.z = -0.05;
      }
    }

    if (handRef.current && state === 'speaking') {
      handRef.current.rotation.y = Math.sin(t * 3.5) * 0.15;
    }
  });

  return (
    <group position={[-0.28, 0.58, 0]}>
      {/* 1. Shoulder Deltoid Cap (Smooth anatomical shoulder form) */}
      <Sphere args={[0.075, 24, 24]} scale={[1.0, 1.2, 0.95]} position={[-0.02, 0, 0]}>
        <primitive object={materials.armorWhite} attach="material" />
      </Sphere>
      <Torus args={[0.065, 0.004, 16, 24]} rotation={[0, Math.PI / 2, 0]} position={[-0.04, 0, 0]}>
        <primitive object={activeNeon} attach="material" />
      </Torus>

      {/* 2. Upper Arm & Forearm */}
      <group ref={armRef} position={[-0.02, -0.06, 0]}>
        {/* Upper Arm Bicep */}
        <RoundedBox args={[0.07, 0.2, 0.07]} radius={0.025} position={[0, -0.09, 0]}>
          <primitive object={materials.armorWhite} attach="material" />
        </RoundedBox>

        {/* Elbow Joint */}
        <Sphere args={[0.038, 16, 16]} position={[0, -0.2, 0]}>
          <primitive object={materials.chromeSilver} attach="material" />
        </Sphere>

        {/* Forearm (Tapered naturally forward) */}
        <group position={[0, -0.21, 0]} rotation={[-0.55, 0.15, -0.15]}>
          <RoundedBox args={[0.065, 0.18, 0.065]} radius={0.02} position={[0, -0.09, 0]}>
            <primitive object={materials.armorWhite} attach="material" />
          </RoundedBox>

          {/* Wrist Trim */}
          <Torus args={[0.032, 0.003, 12, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
            <primitive object={activeNeon} attach="material" />
          </Torus>

          {/* 3. Articulated Humanoid Hand */}
          <group ref={handRef} position={[0, -0.2, 0]}>
            {/* Palm */}
            <RoundedBox args={[0.048, 0.055, 0.018]} radius={0.006} position={[0, -0.025, 0]}>
              <primitive object={materials.armorWhite} attach="material" />
            </RoundedBox>

            {/* Expressive Fingers */}
            {[-0.016, -0.005, 0.005, 0.016].map((xOff, idx) => (
              <RoundedBox key={idx} args={[0.008, 0.042, 0.008]} radius={0.002} position={[xOff, -0.06, 0]}>
                <primitive object={materials.armorWhite} attach="material" />
              </RoundedBox>
            ))}

            {/* Thumb */}
            <group position={[0.026, -0.015, 0.005]} rotation={[0, 0, -0.5]}>
              <RoundedBox args={[0.009, 0.032, 0.009]} radius={0.002} position={[0.01, -0.008, 0]}>
                <primitive object={materials.armorWhite} attach="material" />
              </RoundedBox>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* =========================================================
   SLEEK HUMANOID LEFT ARM (Natural Relaxed Posture)
   ========================================================= */
function HumanoidLeftArm({ state }: { state: RobotState }) {
  const activeNeon = getActiveNeon(state);

  return (
    <group position={[0.28, 0.58, 0]}>
      {/* Shoulder Deltoid */}
      <Sphere args={[0.075, 24, 24]} scale={[1.0, 1.2, 0.95]} position={[0.02, 0, 0]}>
        <primitive object={materials.armorWhite} attach="material" />
      </Sphere>
      <Torus args={[0.065, 0.004, 16, 24]} rotation={[0, Math.PI / 2, 0]} position={[0.04, 0, 0]}>
        <primitive object={activeNeon} attach="material" />
      </Torus>

      {/* Upper Arm hanging naturally */}
      <group position={[0.02, -0.06, 0]} rotation={[0.04, 0, 0.06]}>
        <RoundedBox args={[0.07, 0.2, 0.07]} radius={0.025} position={[0, -0.09, 0]}>
          <primitive object={materials.armorWhite} attach="material" />
        </RoundedBox>

        {/* Elbow */}
        <Sphere args={[0.038, 16, 16]} position={[0, -0.2, 0]}>
          <primitive object={materials.chromeSilver} attach="material" />
        </Sphere>

        {/* Forearm */}
        <group position={[0, -0.21, 0]} rotation={[-0.3, -0.08, 0.08]}>
          <RoundedBox args={[0.065, 0.18, 0.065]} radius={0.02} position={[0, -0.09, 0]}>
            <primitive object={materials.armorWhite} attach="material" />
          </RoundedBox>

          {/* Left Hand */}
          <group position={[0, -0.2, 0]}>
            <RoundedBox args={[0.046, 0.052, 0.018]} radius={0.006} position={[0, -0.025, 0]}>
              <primitive object={materials.armorWhite} attach="material" />
            </RoundedBox>
            {[-0.014, -0.004, 0.004, 0.014].map((xOff, idx) => (
              <RoundedBox key={idx} args={[0.008, 0.045, 0.008]} radius={0.002} position={[xOff, -0.06, 0]}>
                <primitive object={materials.armorWhite} attach="material" />
              </RoundedBox>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}

/* =========================================================
   COMPLETE SLEEK HUMANOID MODEL EXPORT
   ========================================================= */
export const RobotModel: React.FC<RobotModelProps> = ({ state, speakingIntensity = 0 }) => {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;
    if (rootRef.current) {
      // Natural human breathing rhythm
      const breath = Math.sin(t * 1.6) * 0.008;
      rootRef.current.position.y = -0.15 + breath;
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.15, 0]}>
      <HumanoidHead state={state} speakingIntensity={speakingIntensity} />
      <HumanoidTorso state={state} />
      <HumanoidRightArm state={state} />
      <HumanoidLeftArm state={state} />
    </group>
  );
};
