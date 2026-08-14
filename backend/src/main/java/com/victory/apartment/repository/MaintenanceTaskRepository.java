package com.victory.apartment.repository;

import com.victory.apartment.model.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, String> {
    List<MaintenanceTask> findAllByOrderByCreatedAtDesc();
}
