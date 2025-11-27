// Hook to manage tutorial state
// Location: src/hooks/useMindmapTutorial.ts

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useMindmapTutorial() {
  const { user } = useUser();
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Check localStorage for tutorial completion
    const tutorialKey = `mindmap_tutorial_completed_${user.id}`;
    const completed = localStorage.getItem(tutorialKey) === 'true';
    setHasCompletedTutorial(completed);
  }, [user]);

  const startTutorial = () => {
    if (!hasCompletedTutorial) {
      setShowTutorial(true);
    }
  };

  const completeTutorial = () => {
    if (!user) return;
    
    const tutorialKey = `mindmap_tutorial_completed_${user.id}`;
    localStorage.setItem(tutorialKey, 'true');
    setHasCompletedTutorial(true);
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    completeTutorial(); // Same as completing - don't show again
  };

  return {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
  };
}

