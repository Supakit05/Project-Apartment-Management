package com.victory.apartment.config;

import com.victory.apartment.model.*;
import com.victory.apartment.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataSeeder {

    private final RoomRepository roomRepo;
    private final TenantRepository tenantRepo;
    private final LeaseRepository leaseRepo;
    private final UtilityBillRepository billRepo;
    private final MaintenanceTaskRepository taskRepo;
    private final SupplyItemRepository supplyRepo;
    private final MaintenanceLogRepository logRepo;
    private final ScheduledReminderRepository reminderRepo;
    private final AppNotificationRepository notifRepo;
    private final ActivityLogRepository activityRepo;
    private final AppUserRepository userRepo;

    public DataSeeder(
            RoomRepository roomRepo, TenantRepository tenantRepo,
            LeaseRepository leaseRepo, UtilityBillRepository billRepo,
            MaintenanceTaskRepository taskRepo, SupplyItemRepository supplyRepo,
            MaintenanceLogRepository logRepo, ScheduledReminderRepository reminderRepo,
            AppNotificationRepository notifRepo, ActivityLogRepository activityRepo,
            AppUserRepository userRepo) {
        this.roomRepo = roomRepo;
        this.tenantRepo = tenantRepo;
        this.leaseRepo = leaseRepo;
        this.billRepo = billRepo;
        this.taskRepo = taskRepo;
        this.supplyRepo = supplyRepo;
        this.logRepo = logRepo;
        this.reminderRepo = reminderRepo;
        this.notifRepo = notifRepo;
        this.activityRepo = activityRepo;
        this.userRepo = userRepo;
    }

    @PostConstruct
    public void seed() {
        seedUsers();

        // If rooms already exist, update image paths to the new 3-image sets
        if (roomRepo.count() > 0) {
            updateRoomImages();
            return;
        }

        seedRooms();
        seedTenants();
        seedLeases();
        seedUtilityBills();
        seedSupplies();
        seedMaintenanceTasks();
        seedMaintenanceLogs();
        seedReminders();
        seedNotifications();
        seedActivityLog();
    }

    private void updateRoomImages() {
        for (Room r : roomRepo.findAll()) {
            String roomNum = r.getRoomNumber();
            int i = Integer.parseInt(roomNum.substring(1));
            String type;
            if (i <= 4) {
                type = "Studio (Single Bed)";
            } else if (i <= 8) {
                type = "Studio (Double Bed)";
            } else if (i <= 11) {
                type = "1-Bedroom";
            } else {
                type = "Corner Room";
            }
            r.setRoomType(type);
            r.setRoomName(String.format("Unit %s (%s)", roomNum, type));
            r.setDescription(String.format("Floor %d %s with private balcony, fully furnished interior, premium bedding, inverter AC, hot water shower, and high-speed fiber Wi-Fi.", r.getFloor(), type));
            assignImagesForRoom(r, roomNum, type);
            roomRepo.save(r);
        }
    }

    private void assignImagesForRoom(Room r, String roomNum, String type) {
        if ("Studio (Single Bed)".equalsIgnoreCase(type) || "Standard Studio".equalsIgnoreCase(type)) {
            if (roomNum.endsWith("01") || roomNum.endsWith("04")) {
                r.setCoverImage("/rooms/std_1.jpg");
                r.setGallery("[\"/rooms/std_1.jpg\",\"/rooms/std_2.jpg\",\"/rooms/std_3.jpg\"]");
            } else if (roomNum.endsWith("02")) {
                r.setCoverImage("/rooms/std_2.jpg");
                r.setGallery("[\"/rooms/std_2.jpg\",\"/rooms/std_1.jpg\",\"/rooms/std_3.jpg\"]");
            } else {
                r.setCoverImage("/rooms/room_standard.png");
                r.setGallery("[\"/rooms/room_standard.png\",\"/rooms/std_1.jpg\",\"/rooms/std_3.jpg\"]");
            }
        } else if ("Studio (Double Bed)".equalsIgnoreCase(type) || "Deluxe Studio".equalsIgnoreCase(type)) {
            if (roomNum.endsWith("05") || roomNum.endsWith("08")) {
                r.setCoverImage("/rooms/dlx_1.jpg");
                r.setGallery("[\"/rooms/dlx_1.jpg\",\"/rooms/dlx_2.jpg\",\"/rooms/dlx_3.jpg\"]");
            } else if (roomNum.endsWith("06")) {
                r.setCoverImage("/rooms/dlx_2.jpg");
                r.setGallery("[\"/rooms/dlx_2.jpg\",\"/rooms/dlx_1.jpg\",\"/rooms/dlx_3.jpg\"]");
            } else {
                r.setCoverImage("/rooms/room_deluxe.png");
                r.setGallery("[\"/rooms/room_deluxe.png\",\"/rooms/dlx_2.jpg\",\"/rooms/dlx_3.jpg\"]");
            }
        } else if ("1-Bedroom".equalsIgnoreCase(type) || "1-Bedroom Suite".equalsIgnoreCase(type)) {
            if (roomNum.equals("109") || roomNum.equals("211")) {
                r.setCoverImage("/rooms/ste_1.jpg");
                r.setGallery("[\"/rooms/ste_1.jpg\",\"/rooms/ste_2.jpg\",\"/rooms/ste_3.jpg\"]");
            } else if (roomNum.equals("110") || roomNum.equals("210")) {
                r.setCoverImage("/rooms/ste_2.jpg");
                r.setGallery("[\"/rooms/ste_2.jpg\",\"/rooms/ste_4.jpg\",\"/rooms/ste_3.jpg\"]");
            } else { // 111, 209
                r.setCoverImage("/rooms/ste_4.jpg");
                r.setGallery("[\"/rooms/ste_4.jpg\",\"/rooms/ste_1.jpg\",\"/rooms/ste_3.jpg\"]");
            }
        } else if ("Corner Room".equalsIgnoreCase(type) || "Corner Suite".equalsIgnoreCase(type)) {
            if (roomNum.equals("112")) {
                r.setCoverImage("/rooms/crn_1.jpg");
                r.setGallery("[\"/rooms/crn_1.jpg\",\"/rooms/crn_2.jpg\",\"/rooms/crn_3.jpg\"]");
            } else { // 212
                r.setCoverImage("/rooms/crn_2.jpg");
                r.setGallery("[\"/rooms/crn_2.jpg\",\"/rooms/crn_1.jpg\",\"/rooms/crn_3.jpg\"]");
            }
        }
    }

    private void seedUsers() {
        if (!userRepo.existsByEmail("admin@victoryapartment.com")) {
            userRepo.save(new AppUser("usr-admin-01", "admin@victoryapartment.com", "admin", "Victory Admin", "081-234-5678", "admin"));
        }
        if (!userRepo.existsByEmail("admin")) {
            userRepo.save(new AppUser("usr-admin-02", "admin", "admin", "Victory Admin", "081-234-5678", "admin"));
        }
    }

    private void seedRooms() {
        // Assigned tenants map: roomNum -> [tenantName, tenantId, status, rent, type]
        Map<String, String[]> assigned = new HashMap<>();
        assigned.put("101", new String[]{"Somchai Jaidee", "t-101", "Occupied", "5500", "Studio (Single Bed)"});
        assigned.put("102", new String[]{"Malee Rattanaporn", "t-102", "Occupied", "5500", "Studio (Single Bed)"});
        assigned.put("105", new String[]{"-", "", "Maintenance", "5500", "Studio (Double Bed)"});
        assigned.put("108", new String[]{"David Miller", "t-108", "Occupied", "6000", "Studio (Double Bed)"});
        assigned.put("201", new String[]{"Wichai Sirisuk", "t-201", "Occupied", "6200", "Studio (Single Bed)"});
        assigned.put("204", new String[]{"Anan Suksawat", "t-204", "Occupied", "7500", "1-Bedroom"});
        assigned.put("207", new String[]{"Napa Charoenwong", "t-207", "Reserved", "6500", "Studio (Double Bed)"});
        assigned.put("210", new String[]{"Kittisak Meechai", "t-210", "Occupied", "8500", "Corner Room"});

        for (int floor = 1; floor <= 2; floor++) {
            for (int i = 1; i <= 12; i++) {
                String roomNum = String.format("%d%02d", floor, i);
                String[] a = assigned.get(roomNum);

                String type;
                double rent;
                double size;
                int capacity;
                String bedType;
                String coverImage = "/rooms/std_1.jpg";
                String gallery = "[]";
                String amenities;

                if (i <= 4) {
                    type = "Studio (Single Bed)";
                    rent = 5500.0;
                    size = 26.0 + (i % 2) * 2;
                    capacity = (i % 2 == 0) ? 1 : 2;
                    bedType = (i % 2 == 0) ? "Single Bed (1 Guest)" : "Queen Bed (2 Guests)";
                    amenities = "[\"High-Speed Wi-Fi\",\"Air Conditioner\",\"Water Heater\",\"Private Balcony\",\"Keycard Access\",\"Work Desk\"]";
                } else if (i <= 8) {
                    type = "Studio (Double Bed)";
                    rent = (floor == 1) ? 6000.0 : 6500.0;
                    size = 32.0 + (i % 2) * 3;
                    capacity = 2;
                    bedType = (i % 2 == 0) ? "King Bed (2 Guests)" : "Super King Bed (2 Guests)";
                    amenities = "[\"High-Speed Wi-Fi\",\"Air Conditioner\",\"Water Heater\",\"Private Balcony\",\"Keycard Access\",\"Work Desk & Ergonomic Chair\",\"Smart TV 43\\\"\",\"Refrigerator 6.5 cu.ft\"]";
                } else if (i <= 11) {
                    type = "1-Bedroom";
                    rent = (floor == 1) ? 7000.0 : 7500.0;
                    size = 42.0 + (i % 2) * 4;
                    capacity = 3;
                    bedType = "King Bed + Sofa Bed (3 Guests)";
                    amenities = "[\"High-Speed Wi-Fi\",\"In-Unit Washing Machine\",\"Dual Air Conditioners\",\"Water Heater\",\"Private Balcony\",\"Smart TV 55\\\"\",\"Kitchenette & Microwave\",\"Sofa Living Area\",\"Digital Door Lock\"]";
                } else {
                    type = "Corner Room";
                    rent = 8500.0;
                    size = 52.0;
                    capacity = 4;
                    bedType = "King Bed + Twin Beds (4 Guests)";
                    amenities = "[\"High-Speed Wi-Fi\",\"Panoramic City Balcony\",\"In-Unit Washing Machine\",\"Dual Air Conditioners\",\"Water Heater\",\"Smart TV 65\\\"\",\"Full Kitchenette & Dining Table\",\"Executive Work Station\",\"Digital Keycard\"]";
                }

                if (a != null) {
                    type = a[4];
                    rent = Double.parseDouble(a[3]);
                }

                Room room = new Room();
                room.setId("rm-" + roomNum);
                room.setRoomNumber(roomNum);
                room.setFloor(floor);
                room.setRoomName(String.format("Unit %s (%s)", roomNum, type));
                room.setRoomType(type);
                room.setDescription(String.format("Floor %d %s with private balcony, fully furnished interior, premium bedding, inverter AC, hot water shower, and high-speed fiber Wi-Fi.", floor, type));
                room.setCapacity(capacity);
                room.setPrice(rent);
                room.setStatus(a != null ? a[2] : "Available");
                room.setAmenities(amenities);
                room.setSizeSqm(size);
                room.setBedType(bedType);
                assignImagesForRoom(room, roomNum, type);
                room.setCurrentTenantId(a != null && !a[1].isEmpty() ? a[1] : null);
                room.setCurrentTenantName(a != null && !a[0].equals("-") ? a[0] : null);
                room.setPrevWaterMeter(120.0 + i * 5);
                room.setCurrWaterMeter(128.0 + i * 5);
                room.setPrevElectricMeter(450.0 + i * 20);
                room.setCurrElectricMeter(520.0 + i * 20);
                room.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0));
                roomRepo.save(room);
            }
        }
    }

    private void seedTenants() {
        String[][] data = {
            {"t-101", "Somchai Jaidee", "081-234-5678", "somchai.j@example.com", "1-1002-34567-89-0", "Sumalee Jaidee (Wife) - 081-222-3333", "rm-101", "101"},
            {"t-102", "Malee Rattanaporn", "089-876-5432", "malee.r@example.com", "3-1005-98765-43-2", "Wichian Rattanaporn (Father) - 089-111-4444", "rm-102", "102"},
            {"t-108", "David Miller", "095-123-9988", "david.m@example.com", "AB9876543 (Passport)", "Sarah Miller - +1 555 0192", "rm-108", "108"},
            {"t-201", "Wichai Sirisuk", "082-345-6789", "wichai.s@example.com", "1-7099-00123-45-1", "Kamontip Sirisuk (Mother) - 082-999-0000", "rm-201", "201"},
            {"t-204", "Anan Suksawat", "084-555-6677", "anan.s@example.com", "1-1008-77665-44-3", "Jiraporn Suksawat - 084-555-8899", "rm-204", "204"},
            {"t-210", "Kittisak Meechai", "086-444-3322", "kittisak.m@example.com", "1-1020-55443-22-1", "Daranee Meechai - 086-444-1100", "rm-210", "210"},
        };

        for (String[] d : data) {
            Tenant t = new Tenant();
            t.setId(d[0]); t.setFullname(d[1]); t.setPhone(d[2]); t.setEmail(d[3]);
            t.setIdCardPassport(d[4]); t.setEmergencyContact(d[5]);
            t.setUnitId(d[6]); t.setUnitNumber(d[7]);
            t.setCreatedAt(LocalDateTime.of(2026, 1, 10, 0, 0));
            tenantRepo.save(t);
        }
    }

    private void seedLeases() {
        Object[][] data = {
            {"ls-101", "rm-101", "101", "t-101", "Somchai Jaidee", "Monthly", 5500.0, "2026-01-15", "2027-01-15", 11000.0, "Active"},
            {"ls-102", "rm-102", "102", "t-102", "Malee Rattanaporn", "Yearly", 5500.0, "2026-02-01", "2027-02-01", 11000.0, "Active"},
            {"ls-108", "rm-108", "108", "t-108", "David Miller", "Monthly", 6000.0, "2026-03-01", "2027-03-01", 12000.0, "Active"},
            {"ls-201", "rm-201", "201", "t-201", "Wichai Sirisuk", "Yearly", 6200.0, "2026-01-01", "2027-01-01", 12400.0, "Active"},
            {"ls-204", "rm-204", "204", "t-204", "Anan Suksawat", "Yearly", 7500.0, "2026-04-01", "2027-04-01", 15000.0, "Active"},
            {"ls-210", "rm-210", "210", "t-210", "Kittisak Meechai", "Monthly", 8500.0, "2026-05-01", "2027-05-01", 17000.0, "Active"},
        };

        for (Object[] d : data) {
            Lease l = new Lease();
            l.setId((String) d[0]); l.setRoomId((String) d[1]); l.setRoomNumber((String) d[2]);
            l.setTenantId((String) d[3]); l.setTenantName((String) d[4]); l.setBillingCycle((String) d[5]);
            l.setRentAmount((Double) d[6]);
            l.setCheckInDate(java.time.LocalDate.parse((String) d[7]));
            l.setCheckOutDate(java.time.LocalDate.parse((String) d[8]));
            l.setDepositAmount((Double) d[9]); l.setStatus((String) d[10]);
            l.setCreatedAt(LocalDateTime.of(2026, 1, 15, 0, 0));
            leaseRepo.save(l);
        }
    }

    private void seedUtilityBills() {
        UtilityBill b1 = new UtilityBill();
        b1.setId("bill-101"); b1.setInvoiceNo("INV-202608-101"); b1.setLeaseId("ls-101");
        b1.setRoomId("rm-101"); b1.setRoomNumber("101"); b1.setTenantName("Somchai Jaidee");
        b1.setBillingMonth("August 2026"); b1.setRentAmount(5500.0);
        b1.setPrevWaterMeter(125.0); b1.setCurrWaterMeter(133.0); b1.setWaterRate(18.0); b1.setWaterAmount(144.0);
        b1.setPrevElectricMeter(470.0); b1.setCurrElectricMeter(550.0); b1.setElectricRate(7.0); b1.setElectricAmount(560.0);
        b1.setCommonFee(300.0); b1.setTotalAmount(6504.0); b1.setStatus("Paid"); b1.setPaymentDate("2026-08-05");
        b1.setCreatedAt(LocalDateTime.of(2026, 8, 1, 8, 0));
        billRepo.save(b1);

        UtilityBill b2 = new UtilityBill();
        b2.setId("bill-102"); b2.setInvoiceNo("INV-202608-102"); b2.setLeaseId("ls-102");
        b2.setRoomId("rm-102"); b2.setRoomNumber("102"); b2.setTenantName("Malee Rattanaporn");
        b2.setBillingMonth("August 2026"); b2.setRentAmount(5500.0);
        b2.setPrevWaterMeter(130.0); b2.setCurrWaterMeter(138.0); b2.setWaterRate(18.0); b2.setWaterAmount(144.0);
        b2.setPrevElectricMeter(490.0); b2.setCurrElectricMeter(580.0); b2.setElectricRate(7.0); b2.setElectricAmount(630.0);
        b2.setCommonFee(300.0); b2.setTotalAmount(6574.0); b2.setStatus("Pending");
        b2.setCreatedAt(LocalDateTime.of(2026, 8, 1, 8, 0));
        billRepo.save(b2);

        UtilityBill b3 = new UtilityBill();
        b3.setId("bill-201"); b3.setInvoiceNo("INV-202608-201"); b3.setLeaseId("ls-201");
        b3.setRoomId("rm-201"); b3.setRoomNumber("201"); b3.setTenantName("Wichai Sirisuk");
        b3.setBillingMonth("August 2026"); b3.setRentAmount(6200.0);
        b3.setPrevWaterMeter(140.0); b3.setCurrWaterMeter(152.0); b3.setWaterRate(18.0); b3.setWaterAmount(216.0);
        b3.setPrevElectricMeter(510.0); b3.setCurrElectricMeter(620.0); b3.setElectricRate(7.0); b3.setElectricAmount(770.0);
        b3.setCommonFee(300.0); b3.setTotalAmount(7486.0); b3.setStatus("Paid"); b3.setPaymentDate("2026-08-04");
        b3.setCreatedAt(LocalDateTime.of(2026, 8, 1, 8, 0));
        billRepo.save(b3);
    }

    private void seedSupplies() {
        String[][] data = {
            {"sup-1", "LED Bulb 12W (E27)", "Electrical", "24", "65", "pcs"},
            {"sup-2", "Stainless Bidet Spray Set", "Plumbing", "8", "250", "sets"},
            {"sup-3", "R32 Refrigerant Can", "Air-con servicing", "5", "450", "cans"},
            {"sup-4", "Air-con Filter (Wall Type)", "Air-con servicing", "12", "120", "pcs"},
            {"sup-5", "Basin Sink Valve 1/2 inch", "Plumbing", "10", "180", "pcs"},
            {"sup-6", "Circuit Breaker 15A Panasonic", "Electrical", "6", "150", "pcs"},
        };
        for (String[] d : data) {
            SupplyItem s = new SupplyItem();
            s.setId(d[0]); s.setName(d[1]); s.setCategory(d[2]);
            s.setStockQuantity(Integer.parseInt(d[3]));
            s.setUnitCost(Double.parseDouble(d[4])); s.setUnitName(d[5]);
            supplyRepo.save(s);
        }
    }

    private void seedMaintenanceTasks() {
        MaintenanceTask t1 = new MaintenanceTask();
        t1.setId("mt-101"); t1.setTaskNo("MNT-202608-01"); t1.setRoomId("rm-105"); t1.setRoomNumber("105");
        t1.setCategory("Plumbing"); t1.setDescription("Basin drain pipe leak and 1 bathroom light bulb out");
        t1.setReportedDate("2026-08-05"); t1.setDueDate("2026-08-09"); t1.setPriority("High");
        t1.setStatus("In Progress"); t1.setAssignedWorker("Technician Wichian");
        t1.setSuppliesUsed("[{\"supply_id\":\"sup-1\",\"name\":\"LED Bulb 12W (E27)\",\"quantity\":1,\"unit_cost\":65},{\"supply_id\":\"sup-5\",\"name\":\"Basin Sink Valve 1/2 inch\",\"quantity\":1,\"unit_cost\":180}]");
        t1.setLaborCost(300.0); t1.setTotalCost(545.0); t1.setRecurringReminder("None");
        t1.setCreatedAt(LocalDateTime.of(2026, 8, 5, 10, 0));
        taskRepo.save(t1);

        MaintenanceTask t2 = new MaintenanceTask();
        t2.setId("mt-102"); t2.setTaskNo("MNT-202608-02"); t2.setRoomId("rm-102"); t2.setRoomNumber("102");
        t2.setCategory("Air-con servicing"); t2.setDescription("6-month scheduled air-con deep clean + refrigerant check");
        t2.setReportedDate("2026-08-01"); t2.setDueDate("2026-08-10"); t2.setPriority("Medium");
        t2.setStatus("Pending"); t2.setAssignedWorker("Technician Prasert (Air Service)");
        t2.setSuppliesUsed("[{\"supply_id\":\"sup-4\",\"name\":\"Air-con Filter (Wall Type)\",\"quantity\":1,\"unit_cost\":120}]");
        t2.setLaborCost(500.0); t2.setTotalCost(620.0); t2.setRecurringReminder("Every 6 Months");
        t2.setCreatedAt(LocalDateTime.of(2026, 8, 1, 9, 0));
        taskRepo.save(t2);

        MaintenanceTask t3 = new MaintenanceTask();
        t3.setId("mt-103"); t3.setTaskNo("MNT-202607-05"); t3.setRoomId("rm-201"); t3.setRoomNumber("201");
        t3.setCategory("Light bulb replacement"); t3.setDescription("Replace 2 balcony light bulbs");
        t3.setReportedDate("2026-07-20"); t3.setDueDate("2026-07-21"); t3.setPriority("Low");
        t3.setStatus("Completed"); t3.setAssignedWorker("Technician Wichian");
        t3.setSuppliesUsed("[{\"supply_id\":\"sup-1\",\"name\":\"LED Bulb 12W (E27)\",\"quantity\":2,\"unit_cost\":65}]");
        t3.setLaborCost(100.0); t3.setTotalCost(230.0); t3.setRecurringReminder("None");
        t3.setCreatedAt(LocalDateTime.of(2026, 7, 20, 11, 0));
        t3.setCompletedAt(LocalDateTime.of(2026, 7, 21, 14, 0));
        taskRepo.save(t3);
    }

    private void seedMaintenanceLogs() {
        MaintenanceLog l1 = new MaintenanceLog();
        l1.setId("log-1"); l1.setRoomId("rm-201"); l1.setRoomNumber("201"); l1.setDate("2026-07-21");
        l1.setTaskNo("MNT-202607-05"); l1.setCategory("Light bulb replacement");
        l1.setDescription("Replaced 2 balcony light bulbs - completed");
        l1.setSuppliesSummary("LED Bulb 12W x2"); l1.setTotalCost(230.0); l1.setPerformedBy("Technician Wichian");
        logRepo.save(l1);

        MaintenanceLog l2 = new MaintenanceLog();
        l2.setId("log-2"); l2.setRoomId("rm-101"); l2.setRoomNumber("101"); l2.setDate("2026-05-10");
        l2.setTaskNo("MNT-202605-01"); l2.setCategory("Air-con servicing");
        l2.setDescription("Deep clean air-con with coil wash + filter replacement");
        l2.setSuppliesSummary("Air-con Filter x1"); l2.setTotalCost(620.0); l2.setPerformedBy("Technician Prasert");
        logRepo.save(l2);
    }

    private void seedReminders() {
        ScheduledReminder r1 = new ScheduledReminder();
        r1.setId("rem-1"); r1.setTitle("6-Month Air-con Service (All Floor 1 Units)");
        r1.setCategory("Air-con servicing"); r1.setRoomNumber("Floor 1 (101-112)");
        r1.setFrequency("Every 6 Months"); r1.setLastTriggered("2026-02-15");
        r1.setNextDueDate("2026-08-15"); r1.setIsActive(true);
        reminderRepo.save(r1);

        ScheduledReminder r2 = new ScheduledReminder();
        r2.setId("rem-2"); r2.setTitle("Quarterly Water Pump & Rooftop Tank Inspection");
        r2.setCategory("Plumbing"); r2.setRoomNumber("Building Common");
        r2.setFrequency("Quarterly"); r2.setLastTriggered("2026-05-01");
        r2.setNextDueDate("2026-08-20"); r2.setIsActive(true);
        reminderRepo.save(r2);

        ScheduledReminder r3 = new ScheduledReminder();
        r3.setId("rem-3"); r3.setTitle("Annual Fire Extinguisher & Emergency Light Check");
        r3.setCategory("Electrical"); r3.setRoomNumber("Building (Floor 1-2)");
        r3.setFrequency("Yearly"); r3.setLastTriggered("2025-09-01");
        r3.setNextDueDate("2026-09-01"); r3.setIsActive(true);
        reminderRepo.save(r3);
    }

    private void seedNotifications() {
        AppNotification n1 = new AppNotification();
        n1.setId("notif-01"); n1.setTitle("New Maintenance Request (Unit 105)");
        n1.setMessage("Basin drain pipe leak and bathroom light bulb replacement (Priority: High)");
        n1.setType("warning"); n1.setIsRead(false);
        n1.setCreatedAt(LocalDateTime.of(2026, 8, 5, 10, 0));
        notifRepo.save(n1);

        AppNotification n2 = new AppNotification();
        n2.setId("notif-02"); n2.setTitle("Scheduled Maintenance Reminder");
        n2.setMessage("6-Month Air-con Service for Floor 1 Units (101-112) is due on August 15, 2026");
        n2.setType("info"); n2.setIsRead(false);
        n2.setCreatedAt(LocalDateTime.of(2026, 8, 6, 8, 0));
        notifRepo.save(n2);

        AppNotification n3 = new AppNotification();
        n3.setId("notif-03"); n3.setTitle("New Rental Application (Unit 102)");
        n3.setMessage("Application submitted by Malee Rattanaporn for 1-Year lease starting August 11, 2026");
        n3.setType("info"); n3.setIsRead(false);
        n3.setCreatedAt(LocalDateTime.of(2026, 8, 11, 14, 30));
        notifRepo.save(n3);
    }

    private void seedActivityLog() {
        ActivityLog a = new ActivityLog();
        a.setId("act-01"); a.setUserName("Victory Admin");
        a.setAction("System Initialized");
        a.setDetails("Apartment Management System configured for 24 Units (Floor 1 & Floor 2) with all modules active");
        a.setCreatedAt(LocalDateTime.of(2026, 8, 8, 8, 0));
        activityRepo.save(a);
    }
}
