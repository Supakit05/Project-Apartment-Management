import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { th: 'หน้าแรก', en: 'Home' },
  'nav.units': { th: 'ห้องพักทั้งหมด', en: 'All Units' },
  'nav.checkBooking': { th: 'ตรวจสอบการจอง', en: 'Check Booking' },
  'nav.signIn': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'nav.signUp': { th: 'สมัครสมาชิก', en: 'Sign Up' },
  'nav.adminPanel': { th: 'ระบบแอดมิน', en: 'Admin Panel' },
  'nav.myProfile': { th: 'โปรไฟล์ของฉัน', en: 'My Profile' },
  'nav.myBookings': { th: 'การจองของฉัน', en: 'My Bookings' },
  'nav.signOut': { th: 'ออกจากระบบ', en: 'Sign Out' },

  // Profile Modal & Page
  'profile.title': { th: 'โปรไฟล์ผู้ใช้งาน', en: 'My Profile' },
  'profile.accountSettings': { th: 'ตั้งค่าบัญชีผู้ใช้', en: 'Account Settings' },
  'profile.personalInfo': { th: 'ข้อมูลส่วนตัว', en: 'Personal Information' },
  'profile.fullname': { th: 'ชื่อ-นามสกุล', en: 'Full Name' },
  'profile.email': { th: 'อีเมล', en: 'Email Address' },
  'profile.phone': { th: 'เบอร์โทรศัพท์', en: 'Phone Number' },
  'profile.save': { th: 'บันทึกการเปลี่ยนแปลง', en: 'Save Changes' },
  'profile.saving': { th: 'กำลังบันทึก...', en: 'Saving...' },
  'profile.savedSuccess': { th: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', en: 'Profile saved successfully' },
  'profile.verifiedResident': { th: 'ผู้เช่าที่ยืนยันแล้ว', en: 'Verified Resident' },
  'profile.adminAccess': { th: 'สิทธิ์ผู้ดูแลระบบ', en: 'Admin Access' },

  // Logout Confirm Modal
  'logout.confirmTitle': { th: 'ยืนยันการออกจากระบบ?', en: 'Confirm Sign Out?' },
  'logout.confirmDesc': { th: 'คุณต้องการออกจากระบบ Apartment System ใช่หรือไม่?', en: 'Are you sure you want to sign out of Apartment System?' },
  'logout.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'logout.confirm': { th: 'ออกจากระบบ', en: 'Sign Out' },
  'logout.success': { th: 'ออกจากระบบเรียบร้อยแล้ว', en: 'Signed out successfully' },

  // Home Hero & Sections
  'hero.tag': { th: '24 ยูนิตทันสมัย · ราชเทวี กรุงเทพฯ', en: '24 Modern Units · Ratchathewi, Bangkok' },
  'hero.title': { th: 'POONTAN APARTMENT', en: 'POONTAN APARTMENT' },
  'hero.sub': { th: 'ออกแบบมาเพื่อชีวิตคนเมือง 2 ชั้น 24 ยูนิต พร้อมเฟอร์นิเจอร์ครบครัน ระเบียงส่วนตัว อินเทอร์เน็ตความเร็วสูง และระบบดูแลความปลอดภัยตลอด 24 ชม.', en: 'Engineered for urban living. 2 floors, 24 fully furnished residences featuring private balconies, high-speed fiber Wi-Fi, digital access control, and 24/7 building management.' },
  'hero.cta': { th: 'ดูห้องพักทั้งหมด (24 ยูนิต)', en: 'Explore All 24 Units' },
  'hero.filterBtn': { th: 'กรองห้องว่าง', en: 'Filter Available' },
  'hero.featuredTitle': { th: 'คอลเลกชันห้องพักไฮไลท์', en: 'Featured Residences' },
  'hero.featuredSub': { th: 'สัมผัสประสบการณ์การพักอาศัยที่เหนือระดับ พร้อมเข้าอยู่ได้ทันที', en: 'Curated living spaces engineered for modern comfort.' },

  // Filters
  'filter.title': { th: 'ค้นหาและกรองยูนิตห้องพัก', en: 'Filter Residences' },
  'filter.searchPlaceholder': { th: 'ค้นหาเลขห้อง (เช่น 101, 204) หรือประเภทห้อง...', en: 'Search unit number (e.g. 101, 204) or type...' },
  'filter.floor': { th: 'ชั้น', en: 'Floor' },
  'filter.allFloors': { th: 'ทุกชั้น (ชั้น 1-2)', en: 'All Floors (1-2)' },
  'filter.floor1': { th: 'ชั้น 1 (Unit 101-112)', en: '1st Floor (Unit 101-112)' },
  'filter.floor2': { th: 'ชั้น 2 (Unit 201-212)', en: '2nd Floor (Unit 201-212)' },
  'filter.unitType': { th: 'ประเภทห้อง', en: 'Unit Type' },
  'filter.allTypes': { th: 'ทุกประเภทห้อง', en: 'All Room Types' },
  'filter.status': { th: 'สถานะห้องพัก', en: 'Availability' },
  'filter.allStatus': { th: 'ทุกสถานะ', en: 'All Statuses' },
  'filter.price': { th: 'ช่วงราคา', en: 'Price Range' },
  'filter.allPrices': { th: 'ทุกราคา', en: 'All Prices' },
  'filter.under6k': { th: 'ต่ำกว่า ฿6,000 / เดือน', en: 'Under ฿6,000 / mo' },
  'filter.6kTo7k': { th: '฿6,000 - ฿7,000 / เดือน', en: '฿6,000 - ฿7,000 / mo' },
  'filter.above7k': { th: 'มากกว่า ฿7,000 / เดือน', en: 'Above ฿7,000 / mo' },
  'filter.reset': { th: 'ล้างตัวกรอง', en: 'Reset Filters' },
  'filter.unitsFound': { th: 'ยูนิตที่ตรงเงื่อนไข', en: 'Units matching' },
  'filter.noResults': { th: 'ไม่พบห้องพักตามเงื่อนไขที่ค้นหา', en: 'No units match your selected filters' },
  'filter.noResultsDesc': { th: 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือกดปุ่มล้างตัวกรอง', en: 'Try adjusting your search criteria or reset filters.' },

  // Room Card & Room Detail
  'room.perMonth': { th: '/ เดือน', en: '/ month' },
  'room.detailsBtn': { th: 'รายละเอียด', en: 'Details' },
  'room.bookBtn': { th: 'จองห้อง', en: 'Book' },
  'room.reservedBtn': { th: 'ติดจองแล้ว', en: 'Reserved' },
  'room.occupiedBtn': { th: 'มีผู้เช่าแล้ว', en: 'Occupied' },
  'room.backToUnits': { th: 'กลับไปหน้ารวมห้องพัก', en: 'Back to All Units' },
  'room.sqm': { th: 'ตร.ม.', en: 'sqm' },
  'room.floorLabel': { th: 'ชั้นที่', en: 'Floor' },
  'room.amenities': { th: 'สิ่งอำนวยความสะดวกภายในห้อง', en: 'Unit Amenities' },
  'room.description': { th: 'รายละเอียดและข้อกำหนด', en: 'Description & Features' },
  'room.depositNote': { th: 'เงินมัดจำล่วงหน้า 1 เดือน + ค่าเช่าเดือนแรก', en: '1 Month Security Deposit + 1st Month Rent' },
  'room.applyNow': { th: 'ส่งคำขอเช่าห้องนี้ทันที', en: 'Apply For This Unit' },

  // Booking Verification & Tracking Page
  'track.badge': { th: 'ระบบตรวจสอบและติดตามสถานะการจอง', en: 'RESIDENT VERIFICATION & TRACKING SYSTEM' },
  'track.title': { th: 'ตรวจสอบและติดตามสถานะการจอง', en: 'Track & Verify Booking' },
  'track.subtitle': { th: 'กรอกหมายเลขอ้างอิงการจอง (Booking ID), เบอร์โทรศัพท์ หรืออีเมลเพื่อเช็คสถานะการอนุมัติห้องพักแบบ Real-time', en: 'Enter your Booking ID, phone number, or email to check real-time approval status.' },
  'track.placeholder': { th: 'กรอก Booking ID (เช่น APT-202608-1234), เบอร์โทร หรืออีเมล...', en: 'Enter Booking ID (e.g. APT-202608-1234), phone, or email...' },
  'track.button': { th: 'ตรวจสอบสถานะ', en: 'Track Status' },
  'track.searching': { th: 'กำลังตรวจสอบข้อมูลการจอง...', en: 'Checking reservation data...' },
  'track.bookingRef': { th: 'หมายเลขอ้างอิงการจอง', en: 'Booking Reference Number' },
  'track.status.approved': { th: 'อนุมัติแล้ว (Approved)', en: 'Approved' },
  'track.status.pending': { th: 'รอการตรวจสอบ (Pending)', en: 'Pending Review' },
  'track.status.rejected': { th: 'ปฏิเสธคำขอ (Rejected)', en: 'Rejected' },
  'track.status.cancelled': { th: 'ยกเลิกแล้ว (Cancelled)', en: 'Cancelled' },
  'track.step1.title': { th: 'ส่งคำขอจอง', en: 'Request Submitted' },
  'track.step1.desc': { th: 'บันทึกข้อมูลเรียบร้อย', en: 'Application logged' },
  'track.step2.title': { th: 'เจ้าหน้าที่ตรวจสอบ', en: 'Admin Review' },
  'track.step2.descPending': { th: 'กำลังพิจารณา', en: 'Under review' },
  'track.step2.descDone': { th: 'ตรวจสอบแล้ว', en: 'Verified' },
  'track.step3.title': { th: 'อนุมัติ / พร้อมเข้าพัก', en: 'Contract & Keycard' },
  'track.step3.descApproved': { th: 'ติดต่อรับกุญแจห้อง', en: 'Ready for move-in' },
  'track.step3.descPending': { th: 'รอการอนุมัติ', en: 'Awaiting approval' },
  'track.field.unit': { th: 'ยูนิตห้องพัก', en: 'Residence Unit' },
  'track.field.guest': { th: 'ผู้จองห้องพัก', en: 'Resident Name' },
  'track.field.moveIn': { th: 'วันย้ายเข้า (Move-in)', en: 'Move-in Date' },
  'track.field.rate': { th: 'อัตราค่าเช่ารายเดือน', en: 'Monthly Rate' },
  'track.cancelBtn': { th: 'ยกเลิกคำขอจอง', en: 'Cancel Request' },
  'track.cancelling': { th: 'กำลังยกเลิก...', en: 'Cancelling...' },
  'track.viewRoomBtn': { th: 'ดูห้องพัก', en: 'View Unit' },
  'track.noResults': { th: 'ไม่พบประวัติหรือคำขอจองตามข้อมูลที่ระบุ', en: 'No booking records found for the provided information' },
  'track.noResultsDesc': { th: 'โปรดตรวจสอบความถูกต้องของรหัสการจอง เบอร์โทรศัพท์ หรืออีเมลอีกครั้ง', en: 'Please double-check your booking reference, phone number, or email address.' },
  'track.promptInput': { th: 'กรุณากรอกรหัสการจอง เบอร์โทรศัพท์ หรืออีเมล', en: 'Please enter a booking reference, phone number, or email.' },

  // Booking Form Page
  'booking.title': { th: 'แบบฟอร์มจองและยื่นขอเช่าห้องพัก', en: 'Rental Application Form' },
  'booking.sub': { th: 'กรอกข้อมูลส่วนตัวเพื่อยื่นคำขอจองห้องพักและรอเจ้าหน้าที่ติดต่อกลับ', en: 'Complete the form below to submit your rental application.' },
  'booking.unitSummary': { th: 'สรุปข้อมูลห้องพัก', en: 'Unit Summary' },
  'booking.guestName': { th: 'ชื่อ-นามสกุล ผู้ขอเช่า', en: 'Full Name' },
  'booking.guestPhone': { th: 'เบอร์โทรศัพท์ติดต่อ', en: 'Contact Phone Number' },
  'booking.guestEmail': { th: 'อีเมล', en: 'Email Address' },
  'booking.checkInDate': { th: 'วันที่ต้องการย้ายเข้า (Move-in Date)', en: 'Desired Move-in Date' },
  'booking.submitBtn': { th: 'ยืนยันการส่งคำขอจอง', en: 'Submit Application' },
  'booking.submitting': { th: 'กำลังส่งข้อมูล...', en: 'Submitting...' },

  // Auth: Login & Register
  'auth.loginTitle': { th: 'เข้าสู่ระบบ', en: 'Sign In' },
  'auth.loginSub': { th: 'เข้าถึงบัญชีผู้ใช้ของคุณเพื่อจัดการการจองและสัญญาเช่า', en: 'Access your account to manage bookings and resident services.' },
  'auth.registerTitle': { th: 'สมัครสมาชิก', en: 'Create Account' },
  'auth.registerSub': { th: 'ลงทะเบียนเพื่อเริ่มต้นจองห้องพักและติดตามสถานะ', en: 'Register to book residences and track application status.' },
  'auth.password': { th: 'รหัสผ่าน', en: 'Password' },
  'auth.confirmPassword': { th: 'ยืนยันรหัสผ่าน', en: 'Confirm Password' },
  'auth.noAccount': { th: 'ยังไม่มีบัญชีผู้ใช้?', en: "Don't have an account?" },
  'auth.hasAccount': { th: 'มีบัญชีผู้ใช้แล้ว?', en: 'Already have an account?' },

  // Footer
  'footer.tagline': { th: 'อาคารพักอาศัยพรีเมียม 24 ยูนิต ใจกลางกรุงเทพฯ บริหารจัดการด้วยระบบดิจิทัลทันสมัย', en: 'Premium 24-unit residential building in Bangkok with digital management.' },
  'footer.rights': { th: 'สงวนลิขสิทธิ์ทุกประการ', en: 'All rights reserved.' },

  // Common Statuses & Words
  'common.month': { th: 'เดือน', en: 'mo' },
  'common.baht': { th: 'บาท', en: 'THB' },
  'common.status': { th: 'สถานะ', en: 'Status' },
  'common.available': { th: 'ห้องว่าง', en: 'Available' },
  'common.occupied': { th: 'มีผู้เช่าแล้ว', en: 'Occupied' },
  'common.reserved': { th: 'ติดจอง', en: 'Reserved' },
  'common.floor': { th: 'ชั้น', en: 'Floor' },
  'common.unit': { th: 'ยูนิต', en: 'Unit' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('vr_lang');
    if (saved === 'th' || saved === 'en') return saved;
    return 'th'; // Default to Thai
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vr_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'th' ? 'en' : 'th';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
