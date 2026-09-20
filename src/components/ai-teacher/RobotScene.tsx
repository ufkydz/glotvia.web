import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sparkles, Environment } from '@react-three/drei';
import { RobotModel } from './RobotModel';
import { RobotState } from './types';

interface RobotSceneProps {
  state: RobotState;
  speakingIntensity?: number;
}

export const RobotScene: React.FC<RobotSceneProps> = ({ state, speakingIntensity = 0 }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{
          position: [0, 0.58, 1.95],
          fov: 38,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* General Soft Ambient Light */}
          <ambientLight intensity={0.9} color="#F1F5F9" />

          {/* Key Frontal Studio Light */}
          <directionalLight
            position={[2.0, 3.5, 3.0]}
            intensity={2.2}
            color="#FFFFFF"
          />

          {/* Soft Left Fill Light */}
          <pointLight
            position={[-2.5, 1.8, 2.0]}
            intensity={2.8}
            distance={6.0}
            color="#38BDF8"
          />

          {/* Warm Right Rim Light */}
          <pointLight
            position={[2.2, 2.0, -1.8]}
            intensity={3.5}
            distance={6.0}
            color="#F59E0B"
          />

          {/* Cool Cyan Rim Light from Back-Left */}
          <pointLight
            position={[-1.8, 2.0, -1.8]}
            intensity={3.0}
            distance={5.5}
            color="#06B6D4"
          />

          {/* Bottom Chest Fill Light */}
          <pointLight
            position={[0, -0.4, 1.5]}
            intensity={1.0}
            distance={3.5}
            color="#38BDF8"
          />

          {/* Studio Reflections */}
          <Environment preset="city" />

          {/* The High-Fidelity Humanoid Android 3D Teacher */}
          <RobotModel state={state} speakingIntensity={speakingIntensity} />

          {/* Ambient Energy Sparkles */}
          <Sparkles
            count={state === 'thinking' || state === 'speaking' ? 30 : 16}
            scale={[2.8, 2.8, 2.2]}
            size={1.5}
            speed={0.35}
            noise={0.6}
            color={
              state === 'success'
                ? '#34D399'
                : state === 'listening'
                ? '#FBBF24'
                : state === 'thinking'
                ? '#C084FC'
                : '#38BDF8'
            }
          />

          {/* Smooth Interactive Orbit Controls with strict ergonomic constraints */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0.58, 0]}
            minPolarAngle={Math.PI / 2.3}
            maxPolarAngle={Math.PI / 1.95}
            minAzimuthAngle={-0.3}
            maxAzimuthAngle={0.3}
            rotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
