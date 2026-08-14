package com.victory.apartment.repository;

import com.victory.apartment.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
}
