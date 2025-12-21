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
  return `📦 Order ${order.orderId}*
`;
}
export function buildOrderDataMessage(order: any): string {
  return JSON.stringify({
    orderId: order.orderId,
  });
}
export function buildOrderMessage(order: any) {
  return `📦 *New Order Created!*

🆔 *Order ID:* ${order.orderId}
🏪 *Market:* ${order.market?.name ?? "Unknown"}
👤 *Client:* ${order.client?.name ?? "Unknown"}

📍 *Delivery Address:* ${order.deliveryAddress ?? "Not provided"}
🕒 *Time:* ${order.time ? formatTimeToAMPM(order.time) : "N/A"}
📅 *Date:* ${order.date ? formatDateToReadable(order.date) : "N/A"}

⚡ *Status:* ${order.status}
`;
}
