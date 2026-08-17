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
  'nav.myApartment': { th: 'ห้องพักของฉัน', en: 'My Unit' },
  'nav.myMaintenance': { th: 'แจ้งซ่อมห้องพัก', en: 'In-Room Repair' },
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
  'hero.tag': { th: '24 ห้องพักทันสมัย · ราชเทวี กรุงเทพฯ', en: '24 Modern Units · Ratchathewi, Bangkok' },
  'hero.title': { th: 'POONTAN APARTMENT', en: 'POONTAN APARTMENT' },
  'hero.sub': { th: 'ออกแบบมาเพื่อชีวิตคนเมือง 2 ชั้น 24 ห้องพัก พร้อมเฟอร์นิเจอร์ครบครัน ระเบียงส่วนตัว อินเทอร์เน็ตความเร็วสูง และระบบดูแลความปลอดภัยตลอด 24 ชม.', en: 'Engineered for urban living. 2 floors, 24 fully furnished residences featuring private balconies, high-speed fiber Wi-Fi, digital access control, and 24/7 building management.' },
  'hero.cta': { th: 'ดูห้องพักทั้งหมด (24 ห้อง)', en: 'Explore All 24 Units' },
  'hero.filterBtn': { th: 'กรองห้องว่าง', en: 'Filter Available' },
  'hero.featuredTitle': { th: 'คอลเลกชันห้องพักไฮไลท์', en: 'Featured Residences' },
  'hero.featuredSub': { th: 'สัมผัสประสบการณ์การพักอาศัยที่เหนือระดับ พร้อมเข้าอยู่ได้ทันที', en: 'Curated living spaces engineered for modern comfort.' },

  // Filters
  'filter.title': { th: 'ค้นหาและกรองห้องพัก', en: 'Filter Residences' },
  'filter.searchPlaceholder': { th: 'ค้นหาเลขห้อง (เช่น 101, 204) หรือประเภทห้อง...', en: 'Search unit number (e.g. 101, 204) or type...' },
  'filter.building': { th: 'อาคาร/ตึก', en: 'Building/Tower' },
  'filter.allBuildings': { th: 'ทุกอาคาร (ตึก A & B)', en: 'All Buildings (A & B)' },
  'filter.buildingA': { th: 'อาคาร A (Victory Tower A - 24 ห้องหลัก)', en: 'Building A (Victory Tower A - 24 Main Units)' },
  'filter.buildingB': { th: 'อาคาร B (Victory Residence B)', en: 'Building B (Victory Residence B - Extension)' },
  'filter.floor': { th: 'ชั้น', en: 'Floor' },
  'filter.allFloors': { th: 'ทุกชั้น (ชั้น 1-2)', en: 'All Floors (1-2)' },
  'filter.floor1': { th: 'ชั้น 1', en: '1st Floor' },
  'filter.floor2': { th: 'ชั้น 2', en: '2nd Floor' },
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
  'filter.unitsFound': { th: 'ห้องพักที่ตรงเงื่อนไข', en: 'Units matching' },
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
  'room.bedLabel': { th: 'ประเภทเตียง', en: 'Bed' },
  'room.guestsLabel': { th: 'ผู้เข้าพัก', en: 'Guests' },
  'room.termsTitle': { th: 'เงื่อนไขและข้อตกลงการเช่า', en: 'Terms & Conditions' },
  'room.termsLease': { th: 'ระยะเวลาสัญญา:', en: 'Lease Term:' },
  'room.termsLeaseVal': { th: 'สัญญาขั้นต่ำ 1 เดือน / ต่ออายุรายปี', en: 'Monthly / Yearly renewable' },
  'room.termsDeposit': { th: 'เงินมัดจำล่วงหน้า:', en: 'Security Deposit:' },
  'room.termsDepositVal': { th: '1 เดือน + ค่าเช่าเดือนแรก', en: '1 Month Security Deposit' },
  'room.termsCam': { th: 'ค่าบริการส่วนกลาง:', en: 'Common Area Maintenance:' },
  'room.termsCamVal': { th: '300 บาท / เดือน', en: '฿300 / month' },
  'room.utilsTitle': { th: 'อัตราค่าน้ำไฟและอินเทอร์เน็ต', en: 'Utilities & Metering' },
  'room.utilsWater': { th: 'ค่าน้ำประปา:', en: 'Water:' },
  'room.utilsWaterVal': { th: '18 บาท / หน่วย ', en: '18 THB / Unit (m³)' },
  'room.utilsElec': { th: 'ค่าไฟฟ้า:', en: 'Electricity:' },
  'room.utilsElecVal': { th: '7 บาท / หน่วย ', en: '7 THB / Unit (kWh)' },
  'room.utilsWifi': { th: 'อินเทอร์เน็ต:', en: 'Internet:' },
  'room.utilsWifiVal': { th: 'ฟรี Wi-Fi ความเร็วสูง', en: 'Free Wi-Fi' },

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
  'track.field.unit': { th: 'ห้องพัก', en: 'Residence Unit' },
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
  'booking.checkOutDate': { th: 'วันที่สิ้นสุดสัญญา (Move-Out Date)', en: 'Move-Out Date' },
  'booking.specialRequests': { th: 'หมายเหตุและคำขอเพิ่มเติม', en: 'Special Requests & Notes' },
  'booking.specialRequestsPlaceholder': { th: 'เช่น ขอสิทธิ์จอดรถยนต์ 1 คัน, สัญญาเช่าระยะยาว 1 ปี', en: 'e.g. Request car parking stall, 1-year contract preferred' },
  'booking.submitBtn': { th: 'ยืนยันการส่งคำขอจอง', en: 'Submit Application' },
  'booking.submitting': { th: 'กำลังส่งข้อมูล...', en: 'Submitting...' },

  // Payment Confirmation Page
  'payment.title': { th: 'ส่งคำขอเช่าห้องพักสำเร็จ', en: 'Application Received' },
  'payment.badge': { th: 'บันทึกคำขอจองห้องพักเรียบร้อยแล้ว', en: 'Reservation Request Confirmed' },
  'payment.desc': { th: 'เจ้าหน้าที่ฝ่ายบริหารอพาร์ตเมนต์จะทำการตรวจสอบคำขอจองของคุณ และติดต่อกลับทางเบอร์โทรศัพท์หรืออีเมลเพื่อทำสัญญาเช่าและรับกุญแจห้องพัก', en: 'Our building administration team will review your application and contact you via phone or email for contract execution and keycard pickup.' },

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
  'footer.tagline': { th: 'อาคารพักอาศัยพรีเมียม 24 ห้อง ใจกลางกรุงเทพฯ บริหารจัดการด้วยระบบดิจิทัลทันสมัย', en: 'Premium 24-unit residential building in Bangkok with digital management.' },
  'footer.rights': { th: 'สงวนลิขสิทธิ์ทุกประการ', en: 'All rights reserved.' },

  // Admin Sidebar & Navigation
  'admin.nav.dashboard': { th: 'แดชบอร์ดภาพรวม', en: 'Dashboard' },
  'admin.nav.buildings': { th: 'ระบบจัดการอาคาร', en: 'Building Management' },
  'admin.nav.tenants': { th: 'สัญญาและผู้เช่า', en: 'Tenants & Contracts' },
  'admin.nav.utilityBills': { th: 'ค่าน้ำไฟและใบเสร็จ', en: 'Utility Bills & Receipts' },
  'admin.nav.maintenance': { th: 'งานซ่อมและสต็อก', en: 'Maintenance & Supplies' },
  'admin.nav.rooms': { th: 'จัดการห้องพัก', en: 'Apartment Units' },
  'admin.nav.bookings': { th: 'คำขอจองห้องพัก', en: 'Booking Requests' },
  'admin.nav.activityLog': { th: 'ประวัติกิจกรรมระบบ', en: 'Activity Log' },
  'admin.nav.notifications': { th: 'การแจ้งเตือน', en: 'Notifications' },
  'admin.nav.backToPublic': { th: 'กลับสู่หน้าเว็บไซต์', en: 'Back to Public Site' },
  'admin.nav.controlPanel': { th: 'แผงควบคุมระบบ', en: 'Control Panel' },

  // Admin Dashboard
  'dashboard.title': { th: 'แดชบอร์ดระบบบริหารจัดการอพาร์ตเมนต์', en: 'Apartment Operations Command Center' },
  'dashboard.sub': { th: 'ภาพรวม 24 ห้อง (ชั้น 1 และ ชั้น 2) อัตราการเข้าพัก และรายได้ประจำเดือน', en: '24-Unit Overview (Floor 1 & Floor 2), Real-Time Occupancy & Monthly Revenue' },
  'dashboard.totalUnits': { th: 'ห้องพักทั้งหมด', en: 'Total Units' },
  'dashboard.occupiedUnits': { th: 'มีผู้เช่าแล้ว', en: 'Occupied Units' },
  'dashboard.availableUnits': { th: 'ห้องว่างพร้อมอยู่', en: 'Available Units' },
  'dashboard.maintenanceUnits': { th: 'กำลังซ่อมบำรุง', en: 'Under Maintenance' },
  'dashboard.occupancyRate': { th: 'อัตราการเข้าพัก', en: 'Occupancy Rate' },
  'dashboard.estimatedRevenue': { th: 'ประมาณการรายรับเดือนนี้', en: 'Est. Monthly Revenue' },
  'dashboard.floorPlan': { th: 'ผังห้องพักประจำชั้น', en: 'Floor Plan Map' },
  'dashboard.quickActions': { th: 'เมนูด่วน', en: 'Quick Actions' },

  // Building Management
  'bld.title': { th: 'ระบบจัดการอาคาร (Building Management)', en: 'Building Management' },
  'bld.sub': { th: 'รวมตึกและอาคารพักอาศัยทั้งหมด สามารถจัดการข้อมูล เพิ่มตึกใหม่ และดูภาพรวมการเข้าพักรายตึกได้ที่นี่', en: 'Manage all apartment buildings, add new towers, and monitor building occupancy rates.' },
  'bld.addBtn': { th: 'เพิ่มตึกใหม่', en: 'Add New Building' },
  'bld.editBtn': { th: 'แก้ไขข้อมูลตึก', en: 'Edit Building' },
  'bld.deleteBtn': { th: 'ลบตึก', en: 'Delete Building' },
  'bld.totalRooms': { th: 'ห้องทั้งหมด', en: 'Total Rooms' },
  'bld.available': { th: 'ห้องว่าง', en: 'Available' },
  'bld.occupied': { th: 'มีคนเช่า', en: 'Occupied' },
  'bld.manageRooms': { th: 'จัดการห้องในตึกนี้', en: 'Manage Units in Building' },
  'bld.code': { th: 'รหัสตึก', en: 'Building Code' },
  'bld.name': { th: 'ชื่ออาคาร', en: 'Building Name' },
  'bld.address': { th: 'ที่อยู่ / ทำเล', en: 'Address / Location' },

  // Room Management / Directory
  'roomMgmt.title': { th: 'ระบบจัดการห้องพัก (Room Directory)', en: 'Room Directory' },
  'roomMgmt.sub': { th: 'จัดการข้อมูลห้องพัก รายราคา สถานะห้อง และแยกดูรายอาคาร', en: 'Manage room directory, pricing, status, and filter by building.' },
  'roomMgmt.addRoom': { th: 'เพิ่มห้องพัก (Add Room)', en: 'Add Room' },
  'roomMgmt.search': { th: 'ค้นหาด้วยเลขห้อง หรือประเภทห้อง...', en: 'Search unit number or type...' },
  'roomMgmt.allBuildings': { th: 'ทุกอาคาร (All Buildings)', en: 'All Buildings' },
  'roomMgmt.allStatuses': { th: 'ทุกสถานะห้อง (All Statuses)', en: 'All Statuses' },
  'roomMgmt.unitNo': { th: 'เลขห้อง (Room No.)', en: 'Room No.' },
  'roomMgmt.building': { th: 'อาคาร (Building)', en: 'Building' },
  'roomMgmt.type': { th: 'ประเภทห้อง (Room Type)', en: 'Room Type' },
  'roomMgmt.rent': { th: 'ค่าเช่ารายเดือน', en: 'Monthly Rent' },
  'roomMgmt.size': { th: 'ขนาด & ผู้เข้าพัก', en: 'Size & Capacity' },
  'roomMgmt.status': { th: 'สถานะ', en: 'Status' },
  'roomMgmt.actions': { th: 'การจัดการ', en: 'Actions' },

  // Utility Bills
  'util.title': { th: 'ระบบออกบิลค่าน้ำไฟ & ใบเสร็จ (Utility Bills Management)', en: 'Utility Bills & Receipts' },
  'util.sub': { th: 'บันทึกมิเตอร์น้ำไฟ คำนวณยอดชำระประจำเดือน กรองดูตามงวดเดือน และพิมพ์ใบเสร็จ', en: 'Meter reading, monthly billing calculation, filtering, and receipt printing.' },
  'util.newBill': { th: '+ ออกบิล/ใบเสร็จใหม่', en: '+ New Utility Bill' },
  'util.paid': { th: 'ชำระแล้ว (Paid Receipts)', en: 'Paid Receipts' },
  'util.pending': { th: 'ค้างชำระ (Pending Payments)', en: 'Pending Payments' },
  'util.rates': { th: 'อัตราค่าน้ำ: 18 บาท/หน่วย | ค่าไฟ: 7 บาท/หน่วย', en: 'Water: ฿18/unit | Electric: ฿7/unit' },
  'util.invoiceNo': { th: 'Invoice No / Unit', en: 'Invoice No / Unit' },
  'util.month': { th: 'Billing Month', en: 'Billing Month' },
  'util.water': { th: 'Water (Units / Amt)', en: 'Water (Units / Amt)' },
  'util.electric': { th: 'Electric (Units / Amt)', en: 'Electric (Units / Amt)' },
  'util.grandTotal': { th: 'Grand Total', en: 'Grand Total' },
  'util.printReceipt': { th: 'พิมพ์ใบเสร็จ', en: 'Print Receipt' },

  // Maintenance
  'mnt.title': { th: 'ระบบงานซ่อมบำรุงและสต็อกอะไหล่ (Maintenance & Supplies)', en: 'Maintenance & Supplies' },
  'mnt.sub': { th: 'ติดตามงานซ่อมบำรุง สต็อกอะไหล่ แยกประเภทห้องมีคนเช่า/ห้องว่าง และตั้งเตือนรอบบำรุงรักษา', en: 'Track repairs, manage spare parts inventory, per-unit logs, and reminders.' },
  'mnt.activeTasks': { th: 'รายการแจ้งซ่อมบำรุง', en: 'Active Tasks' },
  'mnt.supplies': { th: 'สต็อกอะไหล่', en: 'Supply Stock' },
  'mnt.logs': { th: 'ประวัติซ่อมรายห้อง', en: 'Per-Unit Logs' },
  'mnt.reminders': { th: 'การตั้งเตือนรอบบำรุงรักษา', en: 'Scheduled Reminders' },
  'mnt.all': { th: 'ทั้งหมด', en: 'All' },
  'mnt.occupied': { th: 'ห้องมีคนเช่า', en: 'Occupied Units' },
  'mnt.vacant': { th: 'ห้องว่าง', en: 'Vacant Units' },
  'mnt.newTask': { th: 'แจ้งซ่อมบำรุงใหม่', en: 'New Maintenance Task' },

  // Tenant & Lease Management
  'tnt.title': { th: 'ระบบจัดการสัญญาเช่าและผู้เช่า (Tenants & Leases)', en: 'Tenants & Lease Agreements' },
  'tnt.sub': { th: 'บันทึกข้อมูลผู้เช่า จัดทำสัญญาเช่า ป้องกันการจองซ้ำซ้อน และติดตามการหมดสัญญา', en: 'Manage tenant profiles, lease contracts, prevent occupancy conflicts, and track expirations.' },
  'tnt.newLease': { th: '+ ทำสัญญาเช่าใหม่', en: '+ Create New Lease' },
  'tnt.newTenant': { th: '+ เพิ่มผู้เช่าใหม่', en: '+ Add Tenant' },
  'tnt.activeLeases': { th: 'สัญญาเช่าที่ใช้งานอยู่', en: 'Active Leases' },
  'tnt.tenantList': { th: 'รายชื่อผู้พักอาศัย', en: 'Tenant Directory' },

  // Bookings Admin
  'bkg.title': { th: 'ระบบจัดการคำขอจองห้องพัก (Booking Requests)', en: 'Booking Requests Management' },
  'bkg.sub': { th: 'พิจารณาอนุมัติหรือปฏิเสธคำขอเช่าห้องพักที่ส่งมาจากหน้าเว็บไซต์แบบ Real-Time', en: 'Review, approve, or reject public rental applications in real time.' },
  'bkg.approve': { th: 'อนุมัติการจอง', en: 'Approve Booking' },
  'bkg.reject': { th: 'ปฏิเสธ', en: 'Reject' },
  'bkg.searchPlaceholder': { th: 'ค้นหารหัสการจอง ชื่อผู้ยื่น หรือเบอร์โทร...', en: 'Search by booking no, applicant name, or phone...' },
  'bkg.colNo': { th: 'รหัสการจอง', en: 'Booking No' },
  'bkg.colGuest': { th: 'ข้อมูลผู้ยื่นคำขอ', en: 'Applicant Info' },
  'bkg.colUnit': { th: 'ห้องพัก', en: 'Unit' },
  'bkg.colDates': { th: 'วันย้ายเข้า - ย้ายออก', en: 'Move-in / Out' },
  'bkg.colRent': { th: 'ค่าเช่ารายเดือน', en: 'Monthly Rent' },
  'bkg.colStatus': { th: 'สถานะคำขอ', en: 'Status' },
  'bkg.empty': { th: 'ไม่พบรายการคำขอจองห้องพักในขณะนี้', en: 'No rental booking requests found' },

  // Activity Log
  'log.title': { th: 'ประวัติกิจกรรมในระบบ (System Activity Log)', en: 'System Activity Log' },
  'log.sub': { th: 'บันทึกประวัติการทำงานของแอดมิน การทำสัญญาเช่า ออกบิล และการอัปเดตสถานะห้องพัก', en: 'Audit trail of administrative actions, lease creations, bill generation, and unit status updates' },
  'log.timestamp': { th: 'วัน-เวลา', en: 'Timestamp' },
  'log.user': { th: 'ผู้ดำเนินการ', en: 'User' },
  'log.action': { th: 'การทำงาน', en: 'Action' },
  'log.details': { th: 'รายละเอียด', en: 'Details' },
  'log.empty': { th: 'ยังไม่มีประวัติกิจกรรมในระบบ', en: 'No activity logs recorded yet' },

  // Notifications Center
  'notif.title': { th: 'ศูนย์แจ้งเตือนระบบ (System Notifications)', en: 'System Notifications' },
  'notif.sub': { th: 'รายการแจ้งเตือนคำขอจองห้องพัก คำขอแจ้งซ่อม และรอบการบำรุงรักษา', en: 'Live alerts for new rental applications, maintenance work orders, and scheduled reminders' },
  'notif.unread': { th: 'รายการยังไม่ได้อ่าน', en: 'Unread' },
  'notif.markAllRead': { th: 'ทำเครื่องหมายอ่านแล้วทั้งหมด', en: 'Mark All as Read' },
  'notif.emptyTitle': { th: 'อ่านครบทุกรายการแล้ว!', en: 'All caught up!' },
  'notif.emptyDesc': { th: 'ไม่มีการแจ้งเตือนใหม่ในขณะนี้', en: 'No system notifications at this time.' },

  // Tenant & Lease Management
  'tnt.addProfile': { th: '+ เพิ่มข้อมูลผู้เช่า', en: '+ Add Tenant Profile' },
  'tnt.activeLeasesCard': { th: 'สัญญาเช่าที่ใช้งานอยู่', en: 'Active Leases' },
  'tnt.registeredTenantsCard': { th: 'ผู้เช่าที่ลงทะเบียนแล้ว', en: 'Registered Tenants' },
  'tnt.conflictProtectionCard': { th: 'ระบบป้องกันการจองซ้ำซ้อน', en: 'Occupancy Conflict Protection' },
  'tnt.conflictActive': { th: 'ทำงานอยู่ (ป้องกันห้องซ้อน)', en: 'Active (prevents double booking)' },
  'tnt.activeAgreementSection': { th: 'รายการสัญญาเช่าที่ใช้งานอยู่', en: 'Active Lease Agreements & Occupancy' },
  'tnt.colUnit': { th: 'ห้องพัก', en: 'Unit' },
  'tnt.colTenant': { th: 'ชื่อผู้เช่า', en: 'Tenant Name' },
  'tnt.colPeriod': { th: 'ระยะเวลาสัญญา', en: 'Lease Start & End' },
  'tnt.colRentCycle': { th: 'ค่าเช่า / รอบชำระ', en: 'Rent / Cycle' },
  'tnt.colDeposit': { th: 'เงินมัดจำ', en: 'Deposit Amount' },
  'tnt.colStatus': { th: 'สถานะสัญญา', en: 'Lease Status' },
  'tnt.colActions': { th: 'จัดการ', en: 'Actions' },
  'tnt.printContract': { th: 'พิมพ์สัญญา', en: 'Print Contract' },
  'tnt.terminateLease': { th: 'ยกเลิกสัญญา', en: 'Terminate Lease' },

  // Common Statuses & Words
  'common.month': { th: 'เดือน', en: 'mo' },
  'common.baht': { th: 'บาท', en: 'THB' },
  'common.status': { th: 'สถานะ', en: 'Status' },
  'common.available': { th: 'ห้องว่าง', en: 'Available' },
  'common.occupied': { th: 'มีผู้เช่าแล้ว', en: 'Occupied' },
  'common.reserved': { th: 'ติดจอง', en: 'Reserved' },
  'common.maintenance': { th: 'ซ่อมบำรุง', en: 'Maintenance' },
  'common.floor': { th: 'ชั้น', en: 'Floor' },
  'common.unit': { th: 'ห้อง', en: 'Unit' },
  'common.save': { th: 'บันทึก', en: 'Save' },
  'common.cancel': { th: 'ยกเลิก', en: 'Cancel' },
  'common.edit': { th: 'แก้ไข', en: 'Edit' },
  'common.delete': { th: 'ลบ', en: 'Delete' },
  'common.search': { th: 'ค้นหา', en: 'Search' },
  'common.all': { th: 'ทั้งหมด', en: 'All' },
  'common.langSwitch': { th: 'เปลี่ยนภาษา', en: 'Switch Language' },
  'common.loginRequiredBooking': { th: 'หากต้องการจอง/เช่าห้อง กรุณาเข้าสู่ระบบก่อน', en: 'Please sign in before booking or applying for a room' },

  // Unified Status Keys
  'status.pending': { th: 'รอการตรวจสอบ', en: 'Pending' },
  'status.approved': { th: 'อนุมัติแล้ว', en: 'Approved' },
  'status.completed': { th: 'เสร็จสมบูรณ์', en: 'Completed' },
  'status.cancelled': { th: 'ยกเลิกแล้ว', en: 'Cancelled' },
  'status.rejected': { th: 'ปฏิเสธคำขอ', en: 'Rejected' },
  'status.active': { th: 'ใช้งานอยู่', en: 'Active' },
  'status.terminated': { th: 'ยกเลิกสัญญาแล้ว', en: 'Terminated' },
  'status.expired': { th: 'หมดสัญญาแล้ว', en: 'Expired' },
  'status.paid': { th: 'ชำระแล้ว', en: 'Paid' },
  'status.unpaid': { th: 'ค้างชำระ', en: 'Pending' },
  'status.inProgress': { th: 'กำลังดำเนินการ', en: 'In Progress' },
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
