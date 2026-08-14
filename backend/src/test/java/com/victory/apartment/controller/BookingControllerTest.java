package com.victory.apartment.controller;

import com.victory.apartment.model.Booking;
import com.victory.apartment.repository.AppNotificationRepository;
import com.victory.apartment.repository.BookingRepository;
import com.victory.apartment.repository.RoomRepository;
import com.victory.apartment.service.ActivityLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingControllerTest {

    private BookingRepository bookingRepo;
    private RoomRepository roomRepo;
    private AppNotificationRepository notifRepo;
    private ActivityLogService logService;
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        bookingRepo = mock(BookingRepository.class);
        roomRepo = mock(RoomRepository.class);
        notifRepo = mock(AppNotificationRepository.class);
        logService = mock(ActivityLogService.class);
        bookingController = new BookingController(bookingRepo, roomRepo, notifRepo, logService);
    }

    @Test
    @DisplayName("Should throw CONFLICT exception when booking dates overlap with existing Pending or Approved booking")
    void testCreateBooking_OverlapConflict() {
        Booking existing = new Booking();
        existing.setId("bk-001");
        existing.setRoomId("r-101");
        existing.setCheckIn("2026-09-01");
        existing.setCheckOut("2026-09-30");
        existing.setStatus("Pending");

        when(bookingRepo.findByRoomIdAndStatusIn("r-101", List.of("Pending", "Approved")))
                .thenReturn(List.of(existing));

        Booking newBooking = new Booking();
        newBooking.setRoomId("r-101");
        newBooking.setGuestName("Test Customer");
        newBooking.setCheckIn("2026-09-15");
        newBooking.setCheckOut("2026-10-15");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            bookingController.create(newBooking);
        });

        assertTrue(ex.getReason().contains("มีคำขอจองอยู่ระหว่างรออนุมัติหรือได้รับการอนุมัติแล้ว"));
        verify(bookingRepo, never()).save(any());
    }

    @Test
    @DisplayName("Should create booking successfully when no overlapping Pending/Approved booking exists")
    void testCreateBooking_Success() {
        when(bookingRepo.findByRoomIdAndStatusIn("r-101", List.of("Pending", "Approved")))
                .thenReturn(List.of());
        when(bookingRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Booking newBooking = new Booking();
        newBooking.setRoomId("r-101");
        newBooking.setGuestName("Test Customer");
        newBooking.setGuestEmail("customer@test.com");
        newBooking.setCheckIn("2026-11-01");
        newBooking.setCheckOut("2026-11-30");

        Booking result = bookingController.create(newBooking);

        assertNotNull(result);
        assertEquals("Pending", result.getStatus());
        verify(bookingRepo, times(1)).save(any());
    }
}
