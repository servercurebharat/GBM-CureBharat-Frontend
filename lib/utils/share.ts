/**
 * CureBharat MLM – Reusable WhatsApp & Share Utilities
 * Used across Admin, SH, HBA, HCM, HCC dashboards.
 */

/**
 * Opens WhatsApp share intent with a pre-filled message.
 * Works on both desktop (WhatsApp Web) and mobile (native app).
 * Falls back to clipboard copy if Web Share API is unavailable.
 *
 * @param memberId - The current user's member ID used to build the referral link
 * @param message  - Optional custom message prefix
 */
export function shareOnWhatsApp(memberId: string, message?: string): void {
  if (typeof window === 'undefined') return;

  const origin = window.location.origin;
  const referralLink = `${origin}/buy/${memberId}`;
  const shareText =
    message ||
    `🌟 Join CureBharat Wellness – India's most advanced healthcare GBM platform!\n\nGet access to:\n✅ Preventive Healthcare Plans\n✅ 10,000+ Hospital Network\n✅ Real-time Commission Payouts\n\nEnroll now 👇\n${referralLink}`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Copies the referral link to clipboard and returns the link string.
 * Shows a toast-friendly signal via promise resolution.
 */
export async function copyReferralLink(memberId: string): Promise<string> {
  if (typeof window === 'undefined') return '';
  const link = `${window.location.origin}/buy/${memberId}`;
  try {
    await navigator.clipboard.writeText(link);
  } catch {
    // Fallback for browsers without clipboard API
    const el = document.createElement('textarea');
    el.value = link;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  return link;
}
