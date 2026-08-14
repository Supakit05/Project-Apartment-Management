package com.victory.apartment.controller;

import com.victory.apartment.model.ActivityLog;
import com.victory.apartment.model.AppNotification;
import com.victory.apartment.repository.AppNotificationRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class GeneralController {

    private final ActivityLogService activityLogService;
    private final AppNotificationRepository notifRepo;

    public GeneralController(ActivityLogService activityLogService, AppNotificationRepository notifRepo) {
        this.activityLogService = activityLogService;
        this.notifRepo = notifRepo;
    }

    // === ACTIVITY LOGS ===
    @GetMapping("/activity-logs")
    public List<ActivityLog> getActivityLogs() {
        return activityLogService.getAll();
    }

    // === NOTIFICATIONS ===
    @GetMapping("/notifications")
    public List<AppNotification> getNotifications() {
        return notifRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/notifications")
    public AppNotification createNotification(@RequestBody AppNotification notif) {
        if (notif.getId() == null || notif.getId().isEmpty()) {
            notif.setId("notif-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (notif.getIsRead() == null) notif.setIsRead(false);
        if (notif.getCreatedAt() == null) notif.setCreatedAt(LocalDateTime.now());
        return notifRepo.save(notif);
    }

    @PutMapping("/notifications/mark-read")
    public ResponseEntity<Void> markAllRead() {
        List<AppNotification> all = notifRepo.findAll();
        all.forEach(n -> n.setIsRead(true));
        notifRepo.saveAll(all);
        return ResponseEntity.ok().build();
    }
}
