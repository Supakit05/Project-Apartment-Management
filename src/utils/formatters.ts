export const formatCurrency = (amount?: number | null): string => {
  const num = (amount !== undefined && amount !== null && !isNaN(Number(amount))) ? Number(amount) : 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(num).replace('THB', '฿');
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

export const getTranslatedRoomType = (type?: string, lang: 'th' | 'en' = 'th'): string => {
  if (!type) return '';
  if (lang !== 'th') return type;

  if (type.includes('Studio (Single Bed)')) return 'สตูดิโอ (เตียงเดี่ยว)';
  if (type.includes('Studio (Double Bed)')) return 'สตูดิโอ (เตียงคู่)';
  if (type.includes('Studio (Queen Bed)')) return 'สตูดิโอ (เตียงคิงไซส์)';
  if (type.includes('Studio')) return 'สตูดิโอ';
  if (type.includes('1-Bedroom Suite')) return '1 ห้องนอน สวีท';
  if (type.includes('1-Bedroom')) return '1 ห้องนอน';
  if (type.includes('Corner Room')) return 'ห้องมุม';
  return type;
};

export const getTranslatedBedType = (bedType?: string, lang: 'th' | 'en' = 'th'): string => {
  if (!bedType) return '';
  if (lang !== 'th') return bedType;

  if (bedType.includes('Single Bed')) return 'เตียงเดี่ยว (พักได้ 1 ท่าน)';
  if (bedType.includes('Queen Bed')) return 'เตียงควีนไซส์ (พักได้ 2 ท่าน)';
  if (bedType.includes('King Bed + Sofa Bed')) return 'เตียงคิงไซส์ + โซฟาเบด (พักได้ 3 ท่าน)';
  if (bedType.includes('King Bed + Twin Beds')) return 'เตียงคิงไซส์ + เตียงคู่ (พักได้ 4 ท่าน)';
  if (bedType.includes('King Bed')) return 'เตียงคิงไซส์ (พักได้ 2 ท่าน)';
  if (bedType.includes('Super King Bed')) return 'เตียงซูเปอร์คิงไซส์ (พักได้ 2 ท่าน)';
  return bedType;
};

export const getTranslatedRoomName = (roomName?: string, roomNumber?: string, lang: 'th' | 'en' = 'th'): string => {
  if (!roomName) return lang === 'th' ? `ห้อง ${roomNumber || ''}` : `Unit ${roomNumber || ''}`;

  if (lang === 'en') {
    let name = roomName.replace(/^ห้อง\s*/i, 'Unit ');
    name = name.replace(/\(ชั้น\s*(\d+)\)/gi, '(Floor $1)');
    name = name.replace(/\(ห้องมุมระเบียงกว้าง\)/gi, '(Corner Balcony Suite)');
    name = name.replace(/\(เตียงคิงไซส์\)/gi, '(King Bed)');
    name = name.replace(/\(เตียงเดี่ยว\)/gi, '(Single Bed)');
    name = name.replace(/\(เตียงคู่\)/gi, '(Twin Bed)');
    name = name.replace(/\(วิวสวน\)/gi, '(Garden View)');
    return name;
  }

  let name = roomName.replace(/^Unit\s*/i, 'ห้อง ');
  name = name.replace(/\(Studio \(Single Bed\)\)/gi, '(สตูดิโอ เตียงเดี่ยว)');
  name = name.replace(/\(Studio \(Double Bed\)\)/gi, '(สตูดิโอ เตียงคู่)');
  name = name.replace(/\(Studio \(Queen Bed\)\)/gi, '(สตูดิโอ เตียงควีนไซส์)');
  name = name.replace(/\(Studio\)/gi, '(สตูดิโอ)');
  name = name.replace(/\(1-Bedroom Suite\)/gi, '(1 ห้องนอน สวีท)');
  name = name.replace(/\(1-Bedroom\)/gi, '(1 ห้องนอน)');
  name = name.replace(/\(Corner Room\)/gi, '(ห้องมุม)');
  return name;
};

export const getTranslatedRoomDescription = (desc?: string, floor?: number, lang: 'th' | 'en' = 'th'): string => {
  if (!desc) return '';
  if (lang !== 'th') return desc;

  const descLower = desc.toLowerCase();
  if (descLower.includes('balcony') || descLower.includes('furnished') || descLower.includes('inverter ac')) {
    const floorStr = floor ? `ชั้น ${floor}` : '';
    let typeStr = 'ดีไซน์ทันสมัย';
    if (desc.includes('Studio (Single Bed)')) typeStr = 'สไตล์สตูดิโอ (เตียงเดี่ยว)';
    else if (desc.includes('Studio')) typeStr = 'สไตล์สตูดิโอ';
    else if (desc.includes('1-Bedroom')) typeStr = 'สไตล์ 1 ห้องนอน';
    else if (desc.includes('Corner Room')) typeStr = 'สไตล์ห้องมุมวิวสวย';

    return `ห้องพัก${floorStr} ${typeStr} พร้อมระเบียงส่วนตัว ตกแต่งด้วยเฟอร์นิเจอร์คุณภาพครบครัน เครื่องปรับอากาศอินเวอร์เตอร์ เครื่องทำน้ำอุ่น และอินเทอร์เน็ต Wi-Fi ความเร็วสูง`;
  }

  return desc;
};
