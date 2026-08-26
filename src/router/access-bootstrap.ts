export type AccessBootstrapper = {
  ensureAccess: () => Promise<void>;
  isPending: () => boolean;
};

export function createAccessBootstrapper(
  task: () => Promise<void>,
): AccessBootstrapper {
  let pending: Promise<void> | null = null;
  return {
    ensureAccess() {
      if (pending) return pending;
      pending = Promise.resolve()
        .then(task)
        .finally(() => {
          pending = null;
        });
      return pending;
    },
    isPending: () => pending !== null,
  };
}
