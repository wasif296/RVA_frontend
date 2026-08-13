import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

/** Minimal YouTube IFrame API typings — no `any`. */

export type YTPlayerStateName =
  | 'unstarted'
  | 'ended'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'cued';

const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

function playerStateFromCode(code: number): YTPlayerStateName {
  switch (code) {
    case YT_PLAYER_STATE.ENDED:
      return 'ended';
    case YT_PLAYER_STATE.PLAYING:
      return 'playing';
    case YT_PLAYER_STATE.PAUSED:
      return 'paused';
    case YT_PLAYER_STATE.BUFFERING:
      return 'buffering';
    case YT_PLAYER_STATE.CUED:
      return 'cued';
    case YT_PLAYER_STATE.UNSTARTED:
    default:
      return 'unstarted';
  }
}

export type YTPlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
  getPlaybackRate: () => number;
  getPlayerState: () => number;
};

type YTPlayerEvent = {
  target: YTPlayer;
  data: number;
};

type YTPlayerOptions = {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: {
    enablejsapi?: 0 | 1;
    origin?: string;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    playsinline?: 0 | 1;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
  };
};

type YTNamespace = {
  Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

let apiLoadPromise: Promise<YTNamespace> | null = null;

/**
 * Load the IFrame Player API once. Concurrent callers share one promise;
 * an already-present YT.Player resolves immediately.
 */
function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser environment'));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      try {
        previous?.();
      } catch {
        // ignore prior handler errors
      }
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        apiLoadPromise = null;
        reject(new Error('YouTube IFrame API ready without YT.Player'));
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${IFRAME_API_SRC}"]`,
    );

    if (!existing) {
      const tag = document.createElement('script');
      tag.src = IFRAME_API_SRC;
      tag.async = true;
      tag.onerror = () => {
        apiLoadPromise = null;
        reject(new Error('Failed to load YouTube IFrame API'));
      };
      document.head.appendChild(tag);
    } else if (window.YT?.Player) {
      resolve(window.YT);
    }
    // else: script is already loading; onYouTubeIframeAPIReady will fire
  });

  return apiLoadPromise;
}

function errorMessageForCode(code: number): string {
  switch (code) {
    case 2:
      return 'Invalid video id.';
    case 5:
      return 'The HTML5 player encountered an error.';
    case 100:
      return 'This video is unavailable or has been removed.';
    case 101:
    case 150:
      return 'This video is private or cannot be embedded.';
    default:
      return 'Unable to play this video.';
  }
}

export type YouTubePlayerHandle = {
  getCurrentTime: () => number;
  getPlaybackRate: () => number;
};

export type YouTubePlayerProps = {
  videoId: string;
  className?: string;
  onReady?: (player: YTPlayer) => void;
  onStateChange?: (state: YTPlayerStateName, player: YTPlayer) => void;
  onError?: (code: number, message: string) => void;
};

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  function YouTubePlayer(
    { videoId, className, onReady, onStateChange, onError },
    ref,
  ) {
    const reactId = useId();
    const containerId = `yt-player-${reactId.replace(/:/g, '')}`;
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const callbacksRef = useRef({ onReady, onStateChange, onError });
    const [fatalError, setFatalError] = useState<string | null>(null);

    callbacksRef.current = { onReady, onStateChange, onError };

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => {
        try {
          return playerRef.current?.getCurrentTime() ?? 0;
        } catch {
          return 0;
        }
      },
      getPlaybackRate: () => {
        try {
          return playerRef.current?.getPlaybackRate() ?? 1;
        } catch {
          return 1;
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setFatalError(null);

      const destroyPlayer = () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {
            // player may already be gone
          }
          playerRef.current = null;
        }
      };

      destroyPlayer();

      void (async () => {
        try {
          const YT = await loadYouTubeIframeApi();
          if (cancelled || !containerRef.current) return;

          containerRef.current.innerHTML = '';
          const host = document.createElement('div');
          host.id = containerId;
          host.className = 'size-full';
          containerRef.current.appendChild(host);

          const player = new YT.Player(host, {
            videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              enablejsapi: 1,
              origin: window.location.origin,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event) => {
                if (cancelled) return;
                playerRef.current = event.target;
                callbacksRef.current.onReady?.(event.target);
              },
              onStateChange: (event) => {
                if (cancelled) return;
                const state = playerStateFromCode(event.data);
                callbacksRef.current.onStateChange?.(state, event.target);
              },
              onError: (event) => {
                if (cancelled) return;
                const message = errorMessageForCode(event.data);
                setFatalError(message);
                callbacksRef.current.onError?.(event.data, message);
              },
            },
          });

          if (!cancelled) {
            playerRef.current = player;
          } else {
            try {
              player.destroy();
            } catch {
              // ignore
            }
          }
        } catch (error) {
          if (cancelled) return;
          const message =
            error instanceof Error ? error.message : 'Failed to load the video player.';
          setFatalError(message);
          callbacksRef.current.onError?.(-1, message);
        }
      })();

      return () => {
        cancelled = true;
        destroyPlayer();
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }, [videoId, containerId]);

    return (
      <div className={className}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-900">
          {fatalError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900 px-6 text-center"
              role="alert"
            >
              <p className="font-medium text-inverse">Video unavailable</p>
              <p className="text-sm text-neutral-300">{fatalError}</p>
            </div>
          ) : (
            <div ref={containerRef} className="absolute inset-0 size-full" />
          )}
        </div>
      </div>
    );
  },
);
