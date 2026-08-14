package com.victory.apartment.repository;

import com.victory.apartment.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, String> {
    List<MaintenanceLog> findByRoomIdOrderByDateDesc(String roomId);
}
