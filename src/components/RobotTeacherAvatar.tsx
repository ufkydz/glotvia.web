import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Float,
  OrbitControls,
  RoundedBox,
  Sparkles,
  Sphere,
  Torus,
} from '@react-three/drei';
import * as THREE from 'three';
import { Volume2, Mic, Sparkles as SparklesIcon, ThumbsUp, AlertCircle } from 'lucide-react';

/* =========================================================
   GLOTVIA AI TEACHER
   Premium 3D AI Language Teacher (React Three Fiber)
   ========================================================= */

export type RobotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'correct'
  | 'wrong';

export interface RobotTeacherAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  feedbackState?: 'correct' | 'wrong' | null;
  teacherName?: string;
  targetLangName?: string;
  size?: 'sm' | 'md' | 'lg';
  onTapRobot?: () => void;
}

/* =========================================================
   MATERIALS
   ========================================================= */

const materials = {
  body: new THREE.MeshPhysicalMaterial({
    color: '#F7F9FC',
    roughness: 0.18,
    metalness: 0.18,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
  }),

  dark: new THREE.MeshPhysicalMaterial({
    color: '#101827',
    roughness: 0.2,
    metalness: 0.55,
  }),

  glass: new THREE.MeshPhysicalMaterial({
    color: '#C9F4FF',
    roughness: 0.05,
    metalness: 0.05,
    transmission: 0.45,
    transparent: true,
    opacity: 0.8,
  }),

  cyan: new THREE.MeshStandardMaterial({
    color: '#35D9FF',
    emissive: '#35D9FF',
    emissiveIntensity: 3,
  }),

  blue: new THREE.MeshStandardMaterial({
    color: '#4D7CFF',
    emissive: '#315DFF',
    emissiveIntensity: 2.5,
  }),

  orange: new THREE.MeshStandardMaterial({
    color: '#FFB000',
    emissive: '#FF8A00',
    emissiveIntensity: 2,
  }),

  green: new THREE.MeshStandardMaterial({
    color: '#42E8A0',
    emissive: '#20C77B',
    emissiveIntensity: 2,
  }),

  red: new THREE.MeshStandardMaterial({
    color: '#FF5268',
    emissive: '#FF2444',
    emissiveIntensity: 2,
  }),
};

/* =========================================================
   EYE
   ========================================================= */

function RobotEye({
  side,
  state,
}: {
  side: 'left' | 'right';
  state: RobotState;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const eyeColor =
    state === 'correct' || state === 'happy'
      ? '#42E8A0'
      : state === 'wrong'
      ? '#FF5268'
      : state === 'listening'
      ? '#FFB000'
      : '#35D9FF';

  useFrame((clock) => {
    if (!ref.current) return;

    const t = clock.clock.elapsedTime;

    ref.current.scale.y =
      state === 'thinking'
        ? 0.75 + Math.sin(t * 4) * 0.1
        : 1;

    ref.current.position.y =
      2.98 + Math.sin(t * 1.8 + (side === 'left' ? 0 : 0.5)) * 0.015;

    if (state === 'speaking') {
      ref.current.scale.x = 1 + Math.sin(t * 9) * 0.035;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[
        side === 'left' ? -0.38 : 0.38,
        2.98,
        0.59,
      ]}
    >
      <sphereGeometry args={[0.095, 32, 32]} />

      <meshStandardMaterial
        color={eyeColor}
        emissive={eyeColor}
        emissiveIntensity={5}
      />
    </mesh>
  );
}

/* =========================================================
   EYEBROW
   ========================================================= */

function Eyebrow({
  side,
  state,
}: {
  side: 'left' | 'right';
  state: RobotState;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;

    if (state === 'happy' || state === 'correct') {
      ref.current.rotation.z =
        side === 'left' ? -0.15 : 0.15;
    } else if (state === 'wrong') {
      ref.current.rotation.z =
        side === 'left' ? 0.18 : -0.18;
    } else {
      ref.current.rotation.z =
        side === 'left' ? -0.03 : 0.03;
    }
  });

  return (
    <RoundedBox
      ref={ref}
      args={[0.25, 0.035, 0.04]}
      radius={0.02}
      smoothness={4}
      position={[
        side === 'left' ? -0.38 : 0.38,
        3.18,
        0.59,
      ]}
      rotation={[
        0,
        0,
        side === 'left' ? -0.03 : 0.03,
      ]}
      material={materials.dark}
    />
  );
}

/* =========================================================
   MOUTH
   ========================================================= */

function RobotMouth({
  state,
}: {
  state: RobotState;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    if (!ref.current) return;

    const t = clock.clock.elapsedTime;

    if (state === 'speaking') {
      ref.current.scale.y =
        0.7 + Math.abs(Math.sin(t * 8)) * 1.5;

      ref.current.scale.x =
        0.85 + Math.abs(Math.sin(t * 6)) * 0.25;
    } else if (state === 'happy' || state === 'correct') {
      ref.current.scale.y = 0.5;
      ref.current.scale.x = 1.3;
    } else {
      ref.current.scale.y = 0.35;
      ref.current.scale.x = 1;
    }
  });

  return (
    <RoundedBox
      ref={ref}
      args={[0.42, 0.07, 0.025]}
      radius={0.035}
      smoothness={5}
      position={[0, 2.62, 0.61]}
      material={materials.dark}
    />
  );
}

/* =========================================================
   FACE
   ========================================================= */

function RobotFace({
  state,
}: {
  state: RobotState;
}) {
  return (
    <group>
      {/* Face visor */}
      <RoundedBox
        args={[1.35, 1.35, 0.15]}
        radius={0.55}
        smoothness={8}
        position={[0, 2.92, 0.48]}
        material={materials.glass}
      />

      <RobotEye side="left" state={state} />
      <RobotEye side="right" state={state} />

      <Eyebrow side="left" state={state} />
      <Eyebrow side="right" state={state} />

      <RobotMouth state={state} />

      {/* Nose sensor */}
      <Sphere
        args={[0.035, 16, 16]}
        position={[0, 2.8, 0.63]}
        material={materials.cyan}
      />
    </group>
  );
}

/* =========================================================
   HEAD
   ========================================================= */

function RobotHead({
  state,
}: {
  state: RobotState;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((clock) => {
    if (!group.current) return;

    const t = clock.clock.elapsedTime;

    group.current.rotation.y =
      Math.sin(t * 0.7) * 0.04;

    group.current.rotation.z =
      Math.sin(t * 0.45) * 0.015;

    if (state === 'thinking') {
      group.current.rotation.z =
        Math.sin(t * 2) * 0.04;
    }
  });

  return (
    <group ref={group}>
      {/* Main head */}
      <Sphere
        args={[0.85, 64, 64]}
        scale={[0.95, 1.05, 0.85]}
        position={[0, 2.9, 0]}
        material={materials.body}
      />

      <RobotFace state={state} />

      {/* Head ring */}
      <Torus
        args={[0.72, 0.035, 16, 64]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 3.12, 0]}
        material={materials.dark}
      />

      {/* Side ear modules */}
      <group position={[-0.82, 2.92, 0]}>
        <RoundedBox
          args={[0.18, 0.38, 0.32]}
          radius={0.07}
          smoothness={5}
          material={materials.dark}
        />

        <Sphere
          args={[0.065, 20, 20]}
          position={[-0.09, 0, 0]}
          material={materials.cyan}
        />
      </group>

      <group position={[0.82, 2.92, 0]}>
        <RoundedBox
          args={[0.18, 0.38, 0.32]}
          radius={0.07}
          smoothness={5}
          material={materials.dark}
        />

        <Sphere
          args={[0.065, 20, 20]}
          position={[0.09, 0, 0]}
          material={materials.cyan}
        />
      </group>

      {/* Top antenna */}
      <group position={[0, 3.76, 0]}>
        <mesh>
          <cylinderGeometry args={[0.025, 0.025, 0.28, 16]} />
          <primitive object={materials.dark} attach="material" />
        </mesh>

        <Sphere
          args={[0.075, 24, 24]}
          position={[0, 0.17, 0]}
          material={materials.cyan}
        />
      </group>
    </group>
  );
}

/* =========================================================
   SHOULDER
   ========================================================= */

function Shoulder({
  side,
}: {
  side: 'left' | 'right';
}) {
  const x = side === 'left' ? -0.9 : 0.9;

  return (
    <group position={[x, 1.9, 0]}>
      <Sphere
        args={[0.28, 32, 32]}
        scale={[1, 1, 0.9]}
        material={materials.body}
      />

      <Sphere
        args={[0.12, 24, 24]}
        position={[side === 'left' ? -0.12 : 0.12, 0, 0.2]}
        material={materials.cyan}
      />
    </group>
  );
}

/* =========================================================
   ARM
   ========================================================= */

function RobotArm({
  side,
  state,
}: {
  side: 'left' | 'right';
  state: RobotState;
}) {
  const group = useRef<THREE.Group>(null);

  const sign = side === 'left' ? -1 : 1;

  useFrame((clock) => {
    if (!group.current) return;

    const t = clock.clock.elapsedTime;

    if (state === 'speaking') {
      group.current.rotation.z =
        sign * (0.12 + Math.sin(t * 4) * 0.08);
    }

    if (state === 'happy' || state === 'correct') {
      group.current.rotation.z =
        sign * (-0.35 + Math.sin(t * 5) * 0.12);
    }

    if (state === 'idle') {
      group.current.rotation.z =
        sign * Math.sin(t * 1.5) * 0.015;
    }
  });

  return (
    <group
      ref={group}
      position={[
        sign * 0.92,
        1.75,
        0,
      ]}
    >
      {/* Upper arm */}
      <RoundedBox
        args={[0.3, 0.72, 0.3]}
        radius={0.12}
        smoothness={6}
        rotation={[0, 0, sign * 0.15]}
        position={[sign * 0.12, -0.35, 0]}
        material={materials.body}
      />

      {/* Elbow */}
      <Sphere
        args={[0.17, 24, 24]}
        position={[sign * 0.18, -0.75, 0]}
        material={materials.dark}
      />

      {/* Forearm */}
      <RoundedBox
        args={[0.28, 0.62, 0.28]}
        radius={0.1}
        smoothness={6}
        position={[sign * 0.2, -1.1, 0]}
        material={materials.body}
      />

      {/* Wrist */}
      <Torus
        args={[0.13, 0.025, 12, 32]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[sign * 0.2, -1.43, 0]}
        material={materials.cyan}
      />

      {/* Hand */}
      <Sphere
        args={[0.23, 32, 32]}
        scale={[0.85, 1.1, 0.8]}
        position={[sign * 0.2, -1.65, 0]}
        material={materials.body}
      />

      {/* Fingers */}
      {[-0.12, 0, 0.12].map((offset, index) => (
        <Sphere
          key={index}
          args={[0.065, 16, 16]}
          position={[
            sign * (0.2 + offset),
            -1.85,
            0.02,
          ]}
          material={materials.body}
        />
      ))}
    </group>
  );
}

/* =========================================================
   CHEST
   ========================================================= */

function RobotChest({
  state,
}: {
  state: RobotState;
}) {
  const chestLight = state === 'correct' || state === 'happy'
    ? materials.green
    : state === 'wrong'
    ? materials.red
    : state === 'listening'
    ? materials.orange
    : materials.cyan;

  const ref = useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    if (!ref.current) return;

    const t = clock.clock.elapsedTime;

    if (
      state === 'speaking' ||
      state === 'listening'
    ) {
      const pulse =
        1 + Math.sin(t * 7) * 0.12;

      ref.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, 1.25, 0]}>
      {/* Torso */}
      <RoundedBox
        args={[1.45, 1.25, 0.72]}
        radius={0.28}
        smoothness={8}
        material={materials.body}
      />

      {/* Chest glass */}
      <RoundedBox
        args={[0.9, 0.58, 0.08]}
        radius={0.15}
        smoothness={6}
        position={[0, 1.28, 0.38]}
        material={materials.dark}
      />

      {/* Core */}
      <Sphere
        ref={ref}
        args={[0.15, 32, 32]}
        position={[0, 1.28, 0.45]}
        material={chestLight}
      />

      {/* Core rings */}
      <Torus
        args={[0.23, 0.025, 16, 48]}
        position={[0, 1.28, 0.45]}
        rotation={[Math.PI / 2, 0, 0]}
        material={chestLight}
      />

      <Torus
        args={[0.31, 0.012, 16, 48]}
        position={[0, 1.28, 0.45]}
        rotation={[Math.PI / 2, 0, 0]}
        material={chestLight}
      />

      {/* Status lights */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <Sphere
          key={i}
          args={[0.025, 12, 12]}
          position={[x, 1.03, 0.43]}
          material={i % 2 === 0 ? materials.cyan : materials.blue}
        />
      ))}
    </group>
  );
}

/* =========================================================
   WAIST
   ========================================================= */

function RobotWaist() {
  return (
    <group position={[0, 0.55, 0]}>
      <RoundedBox
        args={[0.82, 0.3, 0.5]}
        radius={0.12}
        smoothness={5}
        material={materials.dark}
      />

      <Torus
        args={[0.32, 0.025, 12, 48]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.cyan}
      />
    </group>
  );
}

/* =========================================================
   LEGS
   ========================================================= */

function RobotLeg({
  side,
}: {
  side: 'left' | 'right';
}) {
  const x = side === 'left' ? -0.35 : 0.35;

  return (
    <group position={[x, 0, 0]}>
      {/* Hip */}
      <Sphere
        args={[0.19, 24, 24]}
        position={[0, 0.45, 0]}
        material={materials.dark}
      />

      {/* Upper leg */}
      <RoundedBox
        args={[0.38, 0.75, 0.4]}
        radius={0.14}
        smoothness={6}
        position={[0, 0.05, 0]}
        material={materials.body}
      />

      {/* Knee */}
      <Sphere
        args={[0.15, 24, 24]}
        position={[0, -0.38, 0.05]}
        material={materials.dark}
      />

      {/* Lower leg */}
      <RoundedBox
        args={[0.36, 0.65, 0.38]}
        radius={0.12}
        smoothness={6}
        position={[0, -0.8, 0]}
        material={materials.body}
      />

      {/* Foot */}
      <RoundedBox
        args={[0.48, 0.22, 0.72]}
        radius={0.1}
        smoothness={5}
        position={[0, -1.22, 0.12]}
        material={materials.dark}
      />

      {/* Foot light */}
      <Torus
        args={[0.11, 0.018, 10, 32]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -1.22, 0.48]}
        material={materials.cyan}
      />
    </group>
  );
}

/* =========================================================
   FULL ROBOT
   ========================================================= */

function TeacherRobot({
  state = 'idle',
}: {
  state?: RobotState;
}) {
  const robot = useRef<THREE.Group>(null);

  useFrame((clock) => {
    if (!robot.current) return;

    const t = clock.clock.elapsedTime;

    // Natural breathing
    robot.current.position.y =
      Math.sin(t * 1.5) * 0.025;

    // Listening animation
    if (state === 'listening') {
      robot.current.rotation.y =
        Math.sin(t * 2) * 0.025;
    }

    // Happy animation
    if (state === 'happy' || state === 'correct') {
      robot.current.position.y =
        Math.abs(Math.sin(t * 4)) * 0.07;
    }

    // Thinking animation
    if (state === 'thinking') {
      robot.current.rotation.y =
        Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group ref={robot} position={[0, -0.9, 0]}>
      <Float
        speed={1.2}
        rotationIntensity={0.05}
        floatIntensity={0.08}
      >
        <RobotHead state={state} />

        <RobotChest state={state} />

        <Shoulder side="left" />
        <Shoulder side="right" />

        <RobotArm
          side="left"
          state={state}
        />

        <RobotArm
          side="right"
          state={state}
        />

        <RobotWaist />

        <RobotLeg side="left" />
        <RobotLeg side="right" />
      </Float>
    </group>
  );
}

/* =========================================================
   HOLOGRAM FLOOR
   ========================================================= */

function HologramFloor({
  state,
}: {
  state: RobotState;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    if (!ref.current) return;

    const t = clock.clock.elapsedTime;

    ref.current.rotation.z = t * 0.15;

    const scale =
      1 + Math.sin(t * 3) * 0.025;

    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <group position={[0, -2.15, 0]}>
      <Torus
        ref={ref}
        args={[1.35, 0.018, 16, 96]}
        rotation={[Math.PI / 2, 0, 0]}
        material={
          state === 'correct' || state === 'happy'
            ? materials.green
            : state === 'wrong'
            ? materials.red
            : materials.cyan
        }
      />

      <Torus
        args={[1.1, 0.01, 16, 96]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.blue}
      />

      <Torus
        args={[0.85, 0.008, 16, 96]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.cyan}
      />
    </group>
  );
}

/* =========================================================
   PARTICLES
   ========================================================= */

function RobotParticles({
  state,
}: {
  state: RobotState;
}) {
  const count =
    state === 'thinking' ||
    state === 'speaking'
      ? 60
      : 30;

  return (
    <Sparkles
      count={count}
      scale={[3.5, 4.5, 3.5]}
      size={2.2}
      speed={0.6}
      noise={1}
      color={
        state === 'correct'
          ? '#42E8A0'
          : state === 'wrong'
          ? '#FF5268'
          : '#35D9FF'
      }
    />
  );
}

/* =========================================================
   ROBOT TEACHER AVATAR EXPORT (INTEGRATED FOR GLOTVIA)
   ========================================================= */

export const RobotTeacherAvatar: React.FC<RobotTeacherAvatarProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  feedbackState = null,
  teacherName = 'Glotvia AI Tutor',
  targetLangName = 'Almanca',
  size = 'lg',
  onTapRobot,
}) => {
  const [internalState, setInternalState] = useState<RobotState>('idle');

  // Sync state with live conversation
  useEffect(() => {
    if (feedbackState === 'correct') {
      setInternalState('correct');
    } else if (feedbackState === 'wrong') {
      setInternalState('wrong');
    } else if (isThinking) {
      setInternalState('thinking');
    } else if (isSpeaking) {
      setInternalState('speaking');
    } else if (isListening) {
      setInternalState('listening');
    } else {
      setInternalState('idle');
    }
  }, [isSpeaking, isListening, isThinking, feedbackState]);

  const handleTap = () => {
    setInternalState('happy');
    if (onTapRobot) onTapRobot();
    setTimeout(() => {
      setInternalState(isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle');
    }, 2000);
  };

  // Dimensions based on prop size
  const heightClass =
    size === 'sm'
      ? 'h-[220px]'
      : size === 'md'
      ? 'h-[320px]'
      : 'h-[360px] sm:h-[440px]';

  return (
    <div className={`relative w-full flex flex-col items-center justify-center select-none ${heightClass}`}>
      
      {/* 3D WebGL Canvas Viewport with Orbit Controls and Studio Environment */}
      <div
        onClick={handleTap}
        className="w-full h-full cursor-pointer relative z-10 flex items-center justify-center rounded-2xl overflow-hidden"
        title="3D Robot Öğretmene dokunun!"
      >
        <Canvas
          camera={{
            position: [0, 0.4, 5.8],
            fov: 38,
          }}
          dpr={[1, 2]}
          shadows
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={1.1} />

            <directionalLight
              position={[3, 5, 5]}
              intensity={2.2}
            />

            <pointLight
              position={[-3, 3, 3]}
              intensity={4}
              distance={9}
              color="#35D9FF"
            />

            <pointLight
              position={[3, 1, -2]}
              intensity={3}
              distance={8}
              color="#4D7CFF"
            />

            {/* Studio Environment Reflections */}
            <Environment preset="city" />

            {/* Full 3D Robot Model */}
            <TeacherRobot state={internalState} />

            {/* Futuristic Hologram Rings Floor */}
            <HologramFloor state={internalState} />

            {/* Glowing Magic Particles */}
            <RobotParticles state={internalState} />

            {/* Smooth Interactive Orbit Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 2.6}
              maxPolarAngle={Math.PI / 2.0}
              minAzimuthAngle={-0.35}
              maxAzimuthAngle={0.35}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Floating Status Pill & Audio Feedback Badge */}
      <div className="relative -mt-3 z-20 flex flex-col items-center gap-1">
        <div
          className={`px-4 py-1.5 rounded-full backdrop-blur-xl border text-xs font-black flex items-center gap-2 shadow-2xl transition-all ${
            internalState === 'speaking'
              ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-sky-500/40 ring-4 ring-sky-400/20 animate-bounce'
              : internalState === 'listening'
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 ring-4 ring-amber-400/20 animate-pulse'
              : internalState === 'thinking'
              ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30'
              : internalState === 'correct' || internalState === 'happy'
              ? 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-emerald-500/50 scale-105'
              : internalState === 'wrong'
              ? 'bg-rose-500 text-white border-rose-300 shadow-rose-500/40'
              : 'bg-slate-900/90 border-white/15 text-slate-200 shadow-xl'
          }`}
        >
          {internalState === 'speaking' ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-slate-950" />
              <span>{teacherName} Konuşuyor...</span>
            </>
          ) : internalState === 'listening' ? (
            <>
              <Mic className="w-3.5 h-3.5 animate-bounce text-slate-950" />
              <span>Seni Dinliyor... (Konuşun)</span>
            </>
          ) : internalState === 'thinking' ? (
            <>
              <SparklesIcon className="w-3.5 h-3.5 animate-spin text-purple-200" />
              <span>Düşünüyor & Analiz Ediyor...</span>
            </>
          ) : internalState === 'correct' || internalState === 'happy' ? (
            <>
              <ThumbsUp className="w-3.5 h-3.5 text-slate-950" />
              <span>Harika! 👏 Doğru Cevap</span>
            </>
          ) : internalState === 'wrong' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-white" />
              <span>Geliştirme İpucu 💡</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>3D AI Öğretmen • {targetLangName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
