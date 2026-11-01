import React from 'react';

export type MascotPose = 
  | 'greeting' 
  | 'search' 
  | 'bulletin' 
  | 'sleep' 
  | 'winner' 
  | 'gift' 
  | 'question' 
  | 'reading';

interface BabySnakeMascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

// User requested to completely remove mascot in favor of a luxurious, refined aesthetic
export const BabySnakeMascot: React.FC<BabySnakeMascotProps> = () => {
  return null;
};
