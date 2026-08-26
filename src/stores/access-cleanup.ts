let cleanupHandler: () => void = () => undefined;

export function setAccessCleanupHandler(handler: () => void): void {
  cleanupHandler = handler;
}

export function clearAccessState(): void {
  cleanupHandler();
}
