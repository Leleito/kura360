'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { IS_DEMO } from '@/lib/demo';
import { TOUR_STEPS } from '@/components/tour/tour-steps';

const STORAGE_KEY = 'kura360_tour_completed';
const AUTO_START_DELAY = 2000;

export interface UseTourReturn {
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Index of the current step (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether the tour has been completed or skipped */
  isCompleted: boolean;
  /** Start or restart the tour from the beginning */
  startTour: () => void;
  /** Advance to the next step */
  nextStep: () => void;
  /** Go back to the previous step */
  prevStep: () => void;
  /** Skip/dismiss the tour and mark as completed */
  skipTour: () => void;
  /** Jump directly to a specific step */
  goToStep: (step: number) => void;
}

function getCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setCompleted(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function useTour(): UseTourReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const autoStarted = useRef(false);

  // On mount, read persisted completion state and auto-start if applicable
  useEffect(() => {
    const completed = getCompleted();
    setIsCompleted(completed);

    if (IS_DEMO && !completed && !autoStarted.current) {
      autoStarted.current = true;
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
      }, AUTO_START_DELAY);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setIsCompleted(false);
    setCompleted(false);
  }, []);

  const finishTour = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    setCompleted(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= TOUR_STEPS.length - 1) {
        // Last step — finish tour
        finishTour();
        return prev;
      }
      return prev + 1;
    });
  }, [finishTour]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    finishTour();
  }, [finishTour]);

  const goToStep = useCallback(
    (step: number) => {
      if (step < 0 || step >= TOUR_STEPS.length) return;
      setCurrentStep(step);
      if (!isActive) {
        setIsActive(true);
      }
    },
    [isActive]
  );

  return {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    isCompleted,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    goToStep,
  };
}
