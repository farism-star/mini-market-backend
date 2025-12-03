export function formatTimeToAMPM(time: string | Date) {
  const date = new Date(time);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Riyadh',
  });
}
