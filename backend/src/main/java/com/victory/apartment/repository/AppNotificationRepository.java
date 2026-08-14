package com.victory.apartment.repository;

import com.victory.apartment.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotification, String> {
    List<AppNotification> findAllByOrderByCreatedAtDesc();
}
