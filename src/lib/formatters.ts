import { paisaToBdt } from './calculations';

/**
 * Formats paisa as Bangladeshi Taka string (e.g., ৳1,250 or ৳250.50)
 */
export function formatBDT(paisa: number, includeDecimals = false): string {
  const bdt = paisaToBdt(Math.abs(paisa));
  const hasFraction = bdt % 1 !== 0 || includeDecimals;

  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(bdt);

  const sign = paisa < 0 ? '-' : '';
  return `${sign}৳${formatted}`;
}

/**
 * Returns initials from a member's full name.
 * e.g. "Asaduzzaman" -> "AZ", "Abdullah" -> "AB", "Md Milon" -> "MM", "Md Monir" -> "MO"
 */
export function getInitials(name: string): string {
  if (!name) return 'BS';
  const clean = name.trim().replace(/^Md\.?\s+/i, 'M ');
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }

  return clean.toUpperCase();
}

/**
 * Formats a YYYY-MM-DD or ISO date string into readable English
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Consistent gradient color generator for member avatars
 */
export function getAvatarColor(userIdOrName: string): {
  bg: string;
  text: string;
  border: string;
} {
  const palettes = [
    { bg: 'from-blue-600 to-navy-800', text: 'text-white', border: 'border-blue-400' },
    { bg: 'from-emerald-500 to-teal-700', text: 'text-white', border: 'border-emerald-400' },
    { bg: 'from-indigo-500 to-purple-700', text: 'text-white', border: 'border-indigo-400' },
    { bg: 'from-amber-500 to-orange-700', text: 'text-white', border: 'border-amber-400' },
  ];

  let hash = 0;
  for (let i = 0; i < userIdOrName.length; i++) {
    hash = (hash << 5) - hash + userIdOrName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}
