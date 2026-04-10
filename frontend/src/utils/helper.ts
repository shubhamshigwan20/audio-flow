function formatSeconds(totalSeconds: number) {
  totalSeconds = Math.floor(totalSeconds); // ← floors the decimals
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(hours)} H: ${pad(minutes)} M: ${pad(seconds)} S`;
}

function formatDate(isoString: string) {
  const date = new Date(isoString);

  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // months are 0-based
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  return `${day}/${month} - ${hours}:${minutes.toString().padStart(2, '0')}`;
}

export { formatSeconds, formatDate }
