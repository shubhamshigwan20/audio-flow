function formatSeconds(totalSeconds: number) {
  totalSeconds = Math.floor(totalSeconds); // ← floors the decimals
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(hours)} H: ${pad(minutes)} M: ${pad(seconds)} S`;
}

export { formatSeconds }
