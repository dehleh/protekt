// Preserve tap order even when the underlying device writes finish at different speeds.
export function createWriteQueue(write: (value: string) => Promise<void>) {
  let queue = Promise.resolve();
  return (value: string) => {
    const pending = queue.catch(() => {}).then(() => write(value));
    queue = pending;
    return pending;
  };
}
