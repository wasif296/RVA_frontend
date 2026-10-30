import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { ApiError } from '../../lib/apiClient';
import {
  applyPointsDeltaToSession,
  invalidateLearnerProgressCaches,
} from '../../lib/invalidateProgress';
import type { LearningProgress } from './learning.api';
import type { YouTubePlayerHandle, YTPlayerStateName } from './components/YouTubePlayer';
import * as watchApi from './watch.api';

const TICK_MS = 500;
const MAX_TICK_SEC = 1.5;
const MAX_PLAYBACK_RATE = 1.25;
const SEEK_FORWARD_TOLERANCE_SEC = 2;
const HEARTBEAT_ACCRUE_SEC = 15;
const MAX_PENDING_DELTA_SEC = 20;
/** Client must respect the server's 12s gap — leave a small buffer. */
const MIN_FLUSH_GAP_MS = 12_500;
const BACKOFF_MS = [3_000, 6_000, 12_000, 20_000] as const;
const SOFT_FAIL_THRESHOLD = 3;

export type WatchTimerState = {
  watchedSec: number;
  requiredWatchSec: number;
  completed: boolean;
  videoPointsAwarded: number;
  rejectedMessage: string | null;
  flushError: string | null;
};

type UseWatchTimerParams = {
  lessonId: string;
  requiredWatchSec: number;
  initialProgress: LearningProgress;
  playerRef: React.RefObject<YouTubePlayerHandle | null>;
  playerState: YTPlayerStateName;
};

type FlushOptions = {
  /**
   * Wait out client gap/backoff, then flush.
   * Used when the player ends or the page tears down so the last seconds
   * are not discarded.
   */
  force?: boolean;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useWatchTimer({
  lessonId,
  requiredWatchSec,
  initialProgress,
  playerRef,
  playerState,
}: UseWatchTimerParams): WatchTimerState {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [watchedSec, setWatchedSec] = useState(initialProgress.watchedSec);
  const [completed, setCompleted] = useState(
    initialProgress.videoCompletedAt != null,
  );
  const [videoPointsAwarded, setVideoPointsAwarded] = useState(
    initialProgress.videoPointsAwarded,
  );
  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null);
  const [flushError, setFlushError] = useState<string | null>(null);

  const serverWatchedRef = useRef(initialProgress.watchedSec);
  const pendingDeltaRef = useRef(0);
  const accruedSinceHeartbeatRef = useRef(0);
  const lastTickAtRef = useRef<number | null>(null);
  const lastFlushAtRef = useRef(0);
  const maxPositionRef = useRef(0);
  const stoppedRef = useRef(initialProgress.videoCompletedAt != null);
  const flushingRef = useRef(false);
  const playerStateRef = useRef(playerState);
  const prevPlayerStateRef = useRef(playerState);
  const rejectStreakRef = useRef(0);
  const backoffUntilRef = useRef(0);
  const requiredWatchSecRef = useRef(requiredWatchSec);

  playerStateRef.current = playerState;
  requiredWatchSecRef.current = requiredWatchSec;

  useEffect(() => {
    serverWatchedRef.current = initialProgress.watchedSec;
    setWatchedSec(initialProgress.watchedSec);
    setCompleted(initialProgress.videoCompletedAt != null);
    setVideoPointsAwarded(initialProgress.videoPointsAwarded);
    stoppedRef.current = initialProgress.videoCompletedAt != null;
    pendingDeltaRef.current = 0;
    accruedSinceHeartbeatRef.current = 0;
    lastTickAtRef.current = null;
    lastFlushAtRef.current = 0;
    maxPositionRef.current = 0;
    rejectStreakRef.current = 0;
    backoffUntilRef.current = 0;
    setRejectedMessage(null);
    setFlushError(null);
  }, [lessonId, initialProgress]);

  const syncProgressCaches = useCallback(
    async (result: watchApi.WatchHeartbeatResult) => {
      if (result.pointsAwarded > 0) {
        applyPointsDeltaToSession(result.pointsAwarded);
        toast({
          variant: 'success',
          title: 'Lesson video complete',
          description: `+${result.pointsAwarded} points earned`,
        });
      }
      if (result.pointsAwarded > 0 || result.completed || result.progress.videoCompletedAt) {
        await invalidateLearnerProgressCaches(queryClient);
      }
    },
    [queryClient, toast],
  );

  const applyServerResult = useCallback((result: watchApi.WatchHeartbeatResult) => {
    serverWatchedRef.current = result.progress.watchedSec;
    setWatchedSec(result.progress.watchedSec + pendingDeltaRef.current);
    setVideoPointsAwarded(result.progress.videoPointsAwarded);
    if (result.completed || result.progress.videoCompletedAt) {
      setCompleted(true);
      stoppedRef.current = true;
      pendingDeltaRef.current = 0;
      accruedSinceHeartbeatRef.current = 0;
    }
  }, []);

  const tryCompleteVideo = useCallback(async () => {
    if (stoppedRef.current) return;
    if (serverWatchedRef.current < requiredWatchSecRef.current) return;

    const complete = await watchApi.completeVideo(lessonId);
    applyServerResult(complete);
    await syncProgressCaches(complete);
  }, [applyServerResult, lessonId, syncProgressCaches]);

  // If the learner already meets the watch target (e.g. admin lowered
  // requiredWatchSec, or a prior flush landed over threshold without award),
  // complete immediately on arrival — do not wait for another play session.
  useEffect(() => {
    if (stoppedRef.current) return;
    if (serverWatchedRef.current < requiredWatchSecRef.current) return;
    void tryCompleteVideo();
  }, [lessonId, tryCompleteVideo]);

  const flushPending = useCallback(
    async (options: FlushOptions = {}) => {
      if (stoppedRef.current || flushingRef.current) return;

      const force = Boolean(options.force);
      const maxAttempts = force ? 2 : 1;

      flushingRef.current = true;
      setFlushError(null);

      try {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          if (stoppedRef.current) return;

          if (force || attempt > 1) {
            const now = Date.now();
            const gapWait = Math.max(0, MIN_FLUSH_GAP_MS - (now - lastFlushAtRef.current));
            const backoffWait = Math.max(0, backoffUntilRef.current - now);
            const waitMs = Math.max(gapWait, backoffWait);
            if (waitMs > 0) await sleep(waitMs);
          } else {
            const now = Date.now();
            if (now < backoffUntilRef.current) return;
            if (now - lastFlushAtRef.current < MIN_FLUSH_GAP_MS) return;
          }

          if (stoppedRef.current) return;

          const delta = Math.min(pendingDeltaRef.current, MAX_PENDING_DELTA_SEC);
          if (delta < 0.5) {
            if (force) {
              try {
                await tryCompleteVideo();
              } catch {
                // Still under threshold on the server — nothing more to do.
              }
            }
            return;
          }

          try {
            const position = playerRef.current?.getCurrentTime() ?? 0;
            const result = await watchApi.postHeartbeat(lessonId, {
              deltaSec: delta,
              playerPositionSec: position,
            });
            lastFlushAtRef.current = Date.now();
            rejectStreakRef.current = 0;
            backoffUntilRef.current = 0;
            setRejectedMessage(null);
            pendingDeltaRef.current = Math.max(0, pendingDeltaRef.current - delta);
            accruedSinceHeartbeatRef.current = Math.max(
              0,
              accruedSinceHeartbeatRef.current - delta,
            );
            applyServerResult(result);
            await syncProgressCaches(result);

            if (
              !stoppedRef.current &&
              result.progress.watchedSec >= requiredWatchSecRef.current &&
              !result.completed
            ) {
              await tryCompleteVideo();
            }
            return;
          } catch (error) {
            if (error instanceof ApiError && error.code === 'HEARTBEAT_REJECTED') {
              rejectStreakRef.current += 1;
              const streak = rejectStreakRef.current;
              const backoff =
                BACKOFF_MS[Math.min(streak - 1, BACKOFF_MS.length - 1)] ?? 20_000;
              backoffUntilRef.current = Date.now() + backoff;
              lastFlushAtRef.current = Date.now();
              accruedSinceHeartbeatRef.current = 0;

              if (force && attempt < maxAttempts) {
                continue;
              }

              if (streak >= SOFT_FAIL_THRESHOLD) {
                setRejectedMessage(
                  'Progress sync is temporarily delayed. Keep watching — we will retry automatically.',
                );
              }
              return;
            }

            setFlushError(
              'Could not sync watch progress right now. Keep watching — we will retry.',
            );
            backoffUntilRef.current = Date.now() + BACKOFF_MS[0];
            return;
          }
        }
      } finally {
        flushingRef.current = false;
      }
    },
    [applyServerResult, lessonId, playerRef, syncProgressCaches, tryCompleteVideo],
  );

  // Accrual loop — only while PLAYING. Continues even after sync rejections.
  useEffect(() => {
    if (stoppedRef.current) return;

    const id = window.setInterval(() => {
      if (stoppedRef.current) return;

      const now = Date.now();
      const last = lastTickAtRef.current;
      lastTickAtRef.current = now;
      if (last == null) return;

      const wallDelta = Math.min(MAX_TICK_SEC, (now - last) / 1000);
      if (wallDelta <= 0) return;

      if (playerStateRef.current !== 'playing') return;

      const rate = playerRef.current?.getPlaybackRate() ?? 1;
      if (rate > MAX_PLAYBACK_RATE) return;

      const position = playerRef.current?.getCurrentTime() ?? 0;
      if (position > maxPositionRef.current + SEEK_FORWARD_TOLERANCE_SEC) {
        maxPositionRef.current = position;
        return;
      }
      if (position > maxPositionRef.current) {
        maxPositionRef.current = position;
      }

      pendingDeltaRef.current = Math.min(
        MAX_PENDING_DELTA_SEC,
        pendingDeltaRef.current + wallDelta,
      );
      accruedSinceHeartbeatRef.current += wallDelta;
      setWatchedSec(serverWatchedRef.current + pendingDeltaRef.current);

      if (accruedSinceHeartbeatRef.current >= HEARTBEAT_ACCRUE_SEC) {
        void flushPending();
      }
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [flushPending, playerRef, lessonId]);

  // Leaving PLAYING (pause, buffering, ended, …) must flush pending watch time.
  // ENDED uses force so a recent heartbeat gap cannot drop the final seconds.
  useEffect(() => {
    const prev = prevPlayerStateRef.current;
    prevPlayerStateRef.current = playerState;

    if (prev === 'playing' && playerState !== 'playing') {
      if (playerState === 'ended') {
        void flushPending({ force: true });
      } else {
        void flushPending();
      }
    }

    if (playerState === 'playing') {
      lastTickAtRef.current = Date.now();
    }
  }, [playerState, flushPending]);

  // Flush on hide / unmount — force so teardown cannot discard the last seconds.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        void flushPending({ force: true });
      } else {
        lastTickAtRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      void flushPending({ force: true });
    };
  }, [flushPending]);

  return {
    watchedSec,
    requiredWatchSec,
    completed,
    videoPointsAwarded,
    rejectedMessage,
    flushError,
  };
}
