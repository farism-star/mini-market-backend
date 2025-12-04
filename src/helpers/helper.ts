export function formatTimeToAMPM(time: string | Date) {
  const date = new Date(time);

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Riyadh',
  });
}

export function formatDateToReadable(dateInput: string | Date) {
  const date = new Date(dateInput);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Riyadh',
  });
}

export function buildOrderBanarMessage(order: any) {
  return `📦 Order: ${order.orderId}
`;
}
