'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseAdminIdleTimerOptions {
  timeoutMs?: number; // default: 60 minutes
  onTimeout: () => void;
  enabled?: boolean;
}

const DEFAULT_ADMIN_IDLE_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * Hook to automatically detect administrator inactivity across user interaction events.
 * Invokes onTimeout when no user activity has occurred for the specified duration.
 */
export function useAdminIdleTimer({
  timeoutMs = DEFAULT_ADMIN_IDLE_TIMEOUT,
  onTimeout,
  enabled = true,
}: UseAdminIdleTimerOptions) {
  const lastActiveRef = useRef<number>(0);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const handleActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    lastActiveRef.current = Date.now();

    // Events to track user interaction
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttle event listener handler to avoid excessive execution on mousemove
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleActivity();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, throttledHandler, { passive: true });
    });

    // Check periodically (every 15 seconds) if user has been idle for >= timeoutMs
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActiveRef.current;
      if (elapsed >= timeoutMs) {
        clearInterval(intervalId);
        onTimeoutRef.current();
      }
    }, 15000);

    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      clearInterval(intervalId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, throttledHandler);
      });
    };
  }, [enabled, timeoutMs, handleActivity]);
}
