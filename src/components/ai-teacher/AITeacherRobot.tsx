import React from 'react';
import { RobotScene } from './RobotScene';
import { RobotStatus } from './RobotStatus';
import { RobotState } from './types';

interface AITeacherRobotProps {
  state: RobotState;
  speakingIntensity?: number;
}

export const AITeacherRobot: React.FC<AITeacherRobotProps> = ({
  state,
  speakingIntensity = 0,
}) => {
  return (
    <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Robot Canvas Viewport */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-xl h-[280px] sm:h-[360px] md:h-[420px]">
        <RobotScene state={state} speakingIntensity={speakingIntensity} />
      </div>

      {/* Floating Status Pill right below the robot */}
      <div className="mt-1 z-10">
        <RobotStatus state={state} />
      </div>
    </div>
  );
};
