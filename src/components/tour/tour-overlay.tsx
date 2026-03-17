'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourContext } from './tour-provider';
import { TOUR_STEPS } from './tour-steps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 12;

/**
 * Build a CSS clip-path that covers the full viewport except for a
 * rectangular cutout around the target element.
 */
function buildClipPath(rect: Rect): string {
  const top = rect.top - PADDING;
  const left = rect.left - PADDING;
  const right = rect.left + rect.width + PADDING;
  const bottom = rect.top + rect.height + PADDING;

  // Polygon that forms a frame: outer rectangle → inner cutout → back to outer
  return `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${left}px ${top}px,
    ${left}px ${bottom}px,
    ${right}px ${bottom}px,
    ${right}px ${top}px,
    ${left}px ${top}px
  )`;
}

type TooltipPosition = { top: number; left: number; placement: 'bottom' | 'top' };

function computeTooltipPosition(
  rect: Rect,
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPosition {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Prefer placing below the element
  let placement: 'bottom' | 'top' = 'bottom';
  let top = rect.top + rect.height + PADDING + TOOLTIP_GAP;

  if (top + tooltipHeight > viewportHeight - 16) {
    // Not enough room below — place above
    placement = 'top';
    top = rect.top - PADDING - TOOLTIP_GAP - tooltipHeight;
  }

  // Horizontally center on the target, but clamp to viewport
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));

  return { top, left, placement };
}

export function TourOverlay() {
  const {
    isActive,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
  } = useTourContext();

  const router = useRouter();
  const pathname = usePathname();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [navigating, setNavigating] = useState(false);

  const step = isActive ? TOUR_STEPS[currentStep] : null;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Locate the target element and measure its position
  const measureTarget = useCallback(() => {
    if (!step) return;

    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const domRect = el.getBoundingClientRect();
    const rect: Rect = {
      top: domRect.top + window.scrollY,
      left: domRect.left + window.scrollX,
      width: domRect.width,
      height: domRect.height,
    };
    setTargetRect(rect);

    // Scroll element into view if needed
    if (
      domRect.top < 0 ||
      domRect.bottom > window.innerHeight
    ) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  // Navigate to the step's page if we're not already there
  useEffect(() => {
    if (!step) return;

    // Normalize paths for comparison (strip trailing slash)
    const currentPath = pathname.replace(/\/$/, '') || '/dashboard';
    const stepPath = step.page.replace(/\/$/, '');

    if (currentPath !== stepPath) {
      setNavigating(true);
      router.push(step.page);
    } else {
      setNavigating(false);
    }
  }, [step, pathname, router]);

  // When the pathname changes, clear navigating flag
  useEffect(() => {
    if (!step) return;
    const currentPath = pathname.replace(/\/$/, '') || '/dashboard';
    const stepPath = step.page.replace(/\/$/, '');

    if (currentPath === stepPath) {
      setNavigating(false);
    }
  }, [pathname, step]);

  // Measure target after step changes or navigation completes
  useEffect(() => {
    if (!isActive || navigating) return;

    // Small delay to let the page render
    const timer = setTimeout(measureTarget, 300);
    return () => clearTimeout(timer);
  }, [isActive, currentStep, navigating, measureTarget]);

  // Reposition on window resize
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => measureTarget();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, measureTarget]);

  // Compute tooltip position when target rect or tooltip size changes
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const pos = computeTooltipPosition(
      targetRect,
      tooltipRect.width,
      tooltipRect.height
    );
    setTooltipPos(pos);
  }, [targetRect]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !step) return null;

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Dark overlay with spotlight cutout */}
          <div
            className="absolute inset-0 bg-black/50 transition-[clip-path] duration-300 ease-in-out"
            style={{
              clipPath: targetRect ? buildClipPath(targetRect) : undefined,
            }}
            onClick={skipTour}
          />

          {/* Tooltip */}
          {targetRect && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -8 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="absolute z-[10000] w-80 max-w-[calc(100vw-32px)] rounded-[var(--radius-xl)] bg-surface-card shadow-lg border border-surface-border"
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
              }}
            >
              {/* Progress bar */}
              <div className="h-1 w-full rounded-t-[var(--radius-xl)] bg-surface-border-light overflow-hidden">
                <div
                  className="h-full bg-green transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="p-4">
                {/* Step counter */}
                <p className="text-xs font-medium text-text-tertiary mb-1">
                  Step {currentStep + 1} of {totalSteps}
                </p>

                {/* Title */}
                <h3 className="text-sm font-semibold text-navy mb-1">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={skipTour}
                    className="text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    Skip
                  </button>

                  <div className="flex items-center gap-2">
                    {!isFirstStep && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-3 py-1.5 text-xs font-semibold text-navy border border-surface-border rounded-[var(--radius-md)] hover:bg-surface-border-light transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-green hover:bg-green-light rounded-[var(--radius-md)] transition-colors cursor-pointer"
                    >
                      {isLastStep ? 'Finish Tour' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading state while navigating */}
          {navigating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 flex items-center justify-center z-[10001]"
            >
              <div className="bg-surface-card rounded-[var(--radius-xl)] px-6 py-4 shadow-lg border border-surface-border">
                <p className="text-sm text-text-secondary">
                  Navigating to {step.title}...
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
