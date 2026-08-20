package com.victory.apartment.controller;

import com.victory.apartment.model.Booking;
import com.victory.apartment.model.AppNotification;
import com.victory.apartment.repository.BookingRepository;
import com.victory.apartment.repository.RoomRepository;
import com.victory.apartment.repository.AppNotificationRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository repo;
    private final RoomRepository roomRepo;
    private final AppNotificationRepository notifRepo;
    private final ActivityLogService logService;

    public BookingController(
            BookingRepository repo,
            RoomRepository roomRepo,
            AppNotificationRepository notifRepo,
            ActivityLogService logService) {
        this.repo = repo;
        this.roomRepo = roomRepo;
        this.notifRepo = notifRepo;
        this.logService = logService;
    }

    @GetMapping
    public List<Booking> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/user/{email}")
    public List<Booking> getByEmail(@PathVariable String email) {
        return repo.findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    @GetMapping("/track")
    public List<Booking> trackBookings(@RequestParam(value = "query", defaultValue = "") String query) {
        String q = query.trim();
        if (q.isEmpty()) return List.of();
        return repo.findByBookingNoIgnoreCaseOrGuestPhoneOrGuestEmailIgnoreCaseOrderByCreatedAtDesc(q, q, q);
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking) {
        if (booking.getId() == null || booking.getId().isEmpty()) {
            booking.setId("bk-" + UUID.randomUUID().toString().substring(0, 8));
            booking.setBookingNo(String.format("APT-%tY%tm-%04d", LocalDateTime.now(), LocalDateTime.now(), (int)(Math.random() * 9000 + 1000)));
        }
        if (booking.getCreatedAt() == null) booking.setCreatedAt(LocalDateTime.now());
        if (booking.getStatus() == null) booking.setStatus("Pending");

        // Set room number from room id
        if (booking.getRoomId() != null && (booking.getRoomNumber() == null || booking.getRoomNumber().isEmpty())) {
            roomRepo.findById(booking.getRoomId()).ifPresent(room -> {
                booking.setRoomNumber(room.getRoomNumber());
                if (booking.getTotalPrice() == null) booking.setTotalPrice(room.getPrice());
            });
        }

        // Validate room status
        if (booking.getRoomId() != null) {
            roomRepo.findById(booking.getRoomId()).ifPresent(room -> {
                if ("Occupied".equalsIgnoreCase(room.getStatus())) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "ห้องพักนี้มีผู้เช่าพักอาศัยอยู่แล้ว ไม่สามารถส่งคำขอจองได้"
                    );
                } else if ("Maintenance".equalsIgnoreCase(room.getStatus())) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "ห้องพักนี้อยู่ระหว่างปิดปรับปรุง/ซ่อมบำรุง ไม่สามารถจองได้"
                    );
                }
            });
        }

        // Prevent overlapping bookings only for already Approved requests
        if (booking.getRoomId() != null) {
            List<Booking> activeBookings = repo.findByRoomIdAndStatusIn(booking.getRoomId(), List.of("Approved"));
            for (Booking existing : activeBookings) {
                boolean overlaps = true;
                if (booking.getCheckIn() != null && booking.getCheckOut() != null
                        && existing.getCheckIn() != null && existing.getCheckOut() != null) {
                    overlaps = booking.getCheckIn().compareTo(existing.getCheckOut()) < 0
                            && booking.getCheckOut().compareTo(existing.getCheckIn()) > 0;
                }
                if (overlaps) {
                    throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "ห้องพักนี้ได้รับการอนุมัติการจองแล้วในช่วงวันดังกล่าว กรุณาเลือกห้องอื่น"
                    );
                }
            }
        }

        Booking saved = repo.save(booking);

        // Auto-create notification for Admin with clean emoji prefix
        AppNotification notif = new AppNotification();
        notif.setId("notif-" + UUID.randomUUID().toString().substring(0, 8));
        notif.setTitle("New Rental Application (Unit " + (saved.getRoomNumber() != null ? saved.getRoomNumber() : "") + ")");
        notif.setMessage(String.format("New application from %s for Unit %s (Phone: %s, Move-in: %s)",
                saved.getGuestName(), saved.getRoomNumber(), saved.getGuestPhone(), saved.getCheckIn()));
        notif.setType("info");
        notif.setIsRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notifRepo.save(notif);

        logService.log("Booking Request", String.format("New booking from %s for Unit %s", saved.getGuestName(), saved.getRoomNumber()));
        return saved;
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String id) {
        return repo.findById(id).map(booking -> {
            booking.setStatus("Cancelled");
            if (booking.getRoomId() != null) {
                roomRepo.findById(booking.getRoomId()).ifPresent(room -> {
                    if ("Reserved".equals(room.getStatus())) {
                        room.setStatus("Available");
                        roomRepo.save(room);
                    }
                });
            }
            logService.log("Booking Cancelled", String.format("Booking %s cancelled", booking.getBookingNo()));
            return ResponseEntity.ok(repo.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable String id, @RequestBody Map<String, String> req) {
        return repo.findById(id).map(booking -> {
            String newStatus = req.get("status");
            booking.setStatus(newStatus);

            if ("Approved".equals(newStatus) && booking.getRoomId() != null) {
                roomRepo.findById(booking.getRoomId()).ifPresent(room -> {
                    room.setStatus("Reserved");
                    roomRepo.save(room);
                });
            } else if ("Rejected".equals(newStatus) || "Cancelled".equals(newStatus)) {
                roomRepo.findById(booking.getRoomId()).ifPresent(room -> {
                    if ("Reserved".equals(room.getStatus())) {
                        room.setStatus("Available");
                        roomRepo.save(room);
                    }
                });
            }

            logService.log("Booking Status Updated", String.format("Booking %s set to %s", booking.getBookingNo(), newStatus));
            return ResponseEntity.ok(repo.save(booking));
        }).orElse(ResponseEntity.notFound().build());
    }

}
