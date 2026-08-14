package com.victory.apartment.repository;

import com.victory.apartment.model.Lease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaseRepository extends JpaRepository<Lease, String> {
    List<Lease> findByRoomIdAndStatus(String roomId, String status);
    List<Lease> findAllByOrderByCreatedAtDesc();
}
