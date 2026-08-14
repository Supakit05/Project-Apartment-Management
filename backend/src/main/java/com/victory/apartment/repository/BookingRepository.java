package com.victory.apartment.repository;

import com.victory.apartment.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(String guestEmail);
    List<Booking> findByRoomIdAndStatusIn(String roomId, List<String> statuses);
    List<Booking> findByBookingNoIgnoreCaseOrGuestPhoneOrGuestEmailIgnoreCaseOrderByCreatedAtDesc(String bookingNo, String guestPhone, String guestEmail);
}
