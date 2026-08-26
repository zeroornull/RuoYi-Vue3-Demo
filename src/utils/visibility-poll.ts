export type VisibilityPollOptions = {
  intervalMs: number;
  run: () => Promise<void> | void;
  isVisible: () => boolean;
  schedule?: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
  cancel?: (id: ReturnType<typeof setTimeout>) => void;
  subscribeVisibility?: (listener: () => void) => () => void;
};

export type VisibilityPoll = {
  start: () => void;
  stop: () => void;
};

export function createVisibilityPoll(options: VisibilityPollOptions): VisibilityPoll {
  const schedule = options.schedule ?? setTimeout;
  const cancel = options.cancel ?? clearTimeout;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = true;
  let inflight = false;
  let unsubscribe: (() => void) | undefined;

  function clearTimer(): void {
    if (timer !== undefined) {
      cancel(timer);
      timer = undefined;
    }
  }

  function arm(): void {
    if (stopped) {
      return;
    }
    clearTimer();
    timer = schedule(() => {
      void tick();
    }, options.intervalMs);
  }

  async function tick(): Promise<void> {
    if (stopped) {
      return;
    }
    if (!options.isVisible() || inflight) {
      arm();
      return;
    }
    inflight = true;
    try {
      await options.run();
    } finally {
      inflight = false;
      arm();
    }
  }

  function onVisible(): void {
    if (!stopped && options.isVisible()) {
      void tick();
    }
  }

  return {
    start() {
      if (!stopped) {
        return;
      }
      stopped = false;
      unsubscribe = options.subscribeVisibility
        ? options.subscribeVisibility(onVisible)
        : typeof document === "undefined"
          ? undefined
          : (() => {
              document.addEventListener("visibilitychange", onVisible);
              return () => document.removeEventListener("visibilitychange", onVisible);
            })();
      arm();
    },
    stop() {
      stopped = true;
      inflight = false;
      clearTimer();
      unsubscribe?.();
      unsubscribe = undefined;
    },
  };
}
