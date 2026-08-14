package com.victory.apartment.service;

import com.victory.apartment.model.Lease;
import com.victory.apartment.model.Room;
import com.victory.apartment.repository.LeaseRepository;
import com.victory.apartment.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LeaseServiceTest {

    private LeaseRepository leaseRepo;
    private RoomRepository roomRepo;
    private ActivityLogService logService;
    private LeaseService leaseService;

    @BeforeEach
    void setUp() {
        leaseRepo = mock(LeaseRepository.class);
        roomRepo = mock(RoomRepository.class);
        logService = mock(ActivityLogService.class);
        leaseService = new LeaseService(leaseRepo, roomRepo, logService);
    }

    @Test
    @DisplayName("Should detect occupancy conflict when date ranges overlap on same unit")
    void testCheckConflict_OverlappingDates() {
        // Existing lease: 2026-01-01 to 2026-12-31 on room "r-101"
        Lease existing = new Lease();
        existing.setId("ls-001");
        existing.setRoomId("r-101");
        existing.setRoomNumber("101");
        existing.setTenantName("Somchai");
        existing.setCheckInDate(LocalDate.of(2026, 1, 1));
        existing.setCheckOutDate(LocalDate.of(2026, 12, 31));
        existing.setStatus("Active");

        when(leaseRepo.findByRoomIdAndStatus("r-101", "Active")).thenReturn(List.of(existing));

        // Test overlapping date request: 2026-06-01 to 2027-06-01
        Map<String, Object> result = leaseService.checkConflict(
            "r-101", "2026-06-01", "2027-06-01", null
        );

        assertTrue((boolean) result.get("hasConflict"), "Should report a conflict for overlapping dates");
        assertEquals(existing, result.get("conflictingLease"));
    }

    @Test
    @DisplayName("Should pass conflict check when date ranges do not overlap")
    void testCheckConflict_NoOverlap() {
        Lease existing = new Lease();
        existing.setId("ls-001");
        existing.setRoomId("r-101");
        existing.setCheckInDate(LocalDate.of(2026, 1, 1));
        existing.setCheckOutDate(LocalDate.of(2026, 6, 30));
        existing.setStatus("Active");

        when(leaseRepo.findByRoomIdAndStatus("r-101", "Active")).thenReturn(List.of(existing));

        // Test non-overlapping request: 2026-07-01 to 2026-12-31
        Map<String, Object> result = leaseService.checkConflict(
            "r-101", "2026-07-01", "2026-12-31", null
        );

        assertFalse((boolean) result.get("hasConflict"), "Should not report a conflict for non-overlapping dates");
    }

    @Test
    @DisplayName("Should prevent saveLease when conflict exists and return error message")
    void testSaveLease_ConflictPrevented() {
        Lease existing = new Lease();
        existing.setId("ls-001");
        existing.setRoomId("r-101");
        existing.setTenantName("Somchai");
        existing.setCheckInDate(LocalDate.of(2026, 1, 1));
        existing.setCheckOutDate(LocalDate.of(2026, 12, 31));
        existing.setStatus("Active");

        when(leaseRepo.findByRoomIdAndStatus("r-101", "Active")).thenReturn(List.of(existing));

        Lease newLease = new Lease();
        newLease.setRoomId("r-101");
        newLease.setRoomNumber("101");
        newLease.setTenantName("New Tenant");
        newLease.setCheckInDate(LocalDate.of(2026, 5, 1));
        newLease.setCheckOutDate(LocalDate.of(2026, 11, 1));

        Map<String, Object> result = leaseService.saveLease(newLease);

        assertTrue(((String) result.get("message")).contains("มีการจองแล้ว"), "Message should mention occupied/booked");

        verify(leaseRepo, never()).save(any());
    }

    @Test
    @DisplayName("Should save lease successfully when no conflict and update room status to Occupied")
    void testSaveLease_Success() {
        when(leaseRepo.findByRoomIdAndStatus("r-102", "Active")).thenReturn(new ArrayList<>());
        when(leaseRepo.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Room room = new Room();
        room.setId("r-102");
        room.setRoomNumber("102");
        room.setStatus("Available");
        when(roomRepo.findById("r-102")).thenReturn(Optional.of(room));

        Lease newLease = new Lease();
        newLease.setRoomId("r-102");
        newLease.setRoomNumber("102");
        newLease.setTenantId("t-102");
        newLease.setTenantName("Malee");
        newLease.setRentAmount(5500.0);
        newLease.setCheckInDate(LocalDate.of(2026, 1, 1));
        newLease.setCheckOutDate(LocalDate.of(2026, 12, 31));

        Map<String, Object> result = leaseService.saveLease(newLease);

        assertTrue((boolean) result.get("success"));
        assertEquals("Occupied", room.getStatus());
        assertEquals("Malee", room.getCurrentTenantName());
    }
}
