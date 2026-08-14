package com.victory.apartment.service;

import com.victory.apartment.model.Lease;
import com.victory.apartment.model.Room;
import com.victory.apartment.repository.LeaseRepository;
import com.victory.apartment.repository.RoomRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LeaseService {

    private final LeaseRepository leaseRepo;
    private final RoomRepository roomRepo;
    private final ActivityLogService logService;

    public LeaseService(LeaseRepository leaseRepo, RoomRepository roomRepo, ActivityLogService logService) {
        this.leaseRepo = leaseRepo;
        this.roomRepo = roomRepo;
        this.logService = logService;
    }

    public List<Lease> getAll() {
        return leaseRepo.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Check for occupancy conflicts: no two active leases can overlap on the same room.
     */
    public Map<String, Object> checkConflict(String roomId, String startDate, String endDate, String excludeLeaseId) {
        Map<String, Object> result = new HashMap<>();
        List<Lease> activeLeases = leaseRepo.findByRoomIdAndStatus(roomId, "Active");

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        for (Lease lease : activeLeases) {
            if (excludeLeaseId != null && lease.getId().equals(excludeLeaseId)) continue;

            LocalDate leaseStart = lease.getCheckInDate();
            LocalDate leaseEnd = lease.getCheckOutDate();

            // Overlap: start1 < end2 AND start2 < end1
            if (start.isBefore(leaseEnd) && leaseStart.isBefore(end)) {
                result.put("hasConflict", true);
                result.put("conflictingLease", lease);
                return result;
            }
        }

        result.put("hasConflict", false);
        return result;
    }

    public Map<String, Object> saveLease(Lease leaseData) {
        Map<String, Object> result = new HashMap<>();

        if (leaseData.getRoomId() == null || leaseData.getCheckInDate() == null || leaseData.getCheckOutDate() == null) {
            result.put("success", false);
            result.put("message", "Room, check-in date, and check-out date are required.");
            return result;
        }

        // Check conflict
        Map<String, Object> conflict = checkConflict(
            leaseData.getRoomId(),
            leaseData.getCheckInDate().toString(),
            leaseData.getCheckOutDate().toString(),
            leaseData.getId()
        );

        if ((boolean) conflict.get("hasConflict")) {
            Lease conflicting = (Lease) conflict.get("conflictingLease");
            result.put("success", false);
            result.put("message", String.format(
                "ยูนิต %s มีการจองแล้วกับผู้เช่า \"%s\" (%s ถึง %s)",
                leaseData.getRoomNumber(), conflicting.getTenantName(),
                conflicting.getCheckInDate(), conflicting.getCheckOutDate()
            ));

            return result;
        }

        if (leaseData.getId() == null || leaseData.getId().isEmpty()) {
            leaseData.setId("ls-" + UUID.randomUUID().toString().substring(0, 8));
            leaseData.setCreatedAt(LocalDateTime.now());
            if (leaseData.getStatus() == null) leaseData.setStatus("Active");
        }

        Lease saved = leaseRepo.save(leaseData);

        // Update room status
        roomRepo.findById(saved.getRoomId()).ifPresent(room -> {
            room.setStatus("Occupied");
            room.setCurrentTenantId(saved.getTenantId());
            room.setCurrentTenantName(saved.getTenantName());
            room.setPrice(saved.getRentAmount());
            roomRepo.save(room);
        });

        logService.log("Lease Created/Updated",
            String.format("Assigned tenant %s to Unit %s (%s to %s)",
                saved.getTenantName(), saved.getRoomNumber(),
                saved.getCheckInDate(), saved.getCheckOutDate()));

        result.put("success", true);
        result.put("lease", saved);
        return result;
    }

    public void terminate(String leaseId) {
        leaseRepo.findById(leaseId).ifPresent(lease -> {
            lease.setStatus("Terminated");
            leaseRepo.save(lease);

            // Free room
            roomRepo.findById(lease.getRoomId()).ifPresent(room -> {
                room.setStatus("Available");
                room.setCurrentTenantId(null);
                room.setCurrentTenantName(null);
                roomRepo.save(room);
            });

            logService.log("Lease Terminated",
                String.format("Terminated lease for Unit %s (%s)", lease.getRoomNumber(), lease.getTenantName()));
        });
    }
}
