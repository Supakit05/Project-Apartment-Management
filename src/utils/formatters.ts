export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount).replace('THB', '฿');
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    return dateString;
  }
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

// Formats JSON string supply summaries into clean human-readable text
export const formatSuppliesSummary = (raw?: string): string => {
  if (!raw) return 'No supplies used';
  const trimmed = raw.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) {
    return raw;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return 'No supplies used';
      return parsed
        .map((item: any) => `${item.name || item.supply_id || 'Item'} x${item.quantity || 1}`)
        .join(', ');
    } else if (typeof parsed === 'object' && parsed !== null) {
      return `${parsed.name || parsed.supply_id || 'Item'} x${parsed.quantity || 1}`;
    }
  } catch (e) {
    return raw;
  }
  return raw;
};

export const getPromptPayQRUrl = (amount: number, promptPayId = '0812345678'): string => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PROMTPAY|${promptPayId}|${amount}`;
};
