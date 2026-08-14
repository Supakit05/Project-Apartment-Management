package com.victory.apartment.service;

import com.victory.apartment.model.ActivityLog;
import com.victory.apartment.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repo;

    public ActivityLogService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public List<ActivityLog> getAll() {
        return repo.findTop50ByOrderByCreatedAtDesc();
    }

    public void log(String action, String details) {
        log(action, details, "Admin");
    }

    public void log(String action, String details, String userName) {
        ActivityLog entry = new ActivityLog();
        entry.setId("act-" + UUID.randomUUID().toString().substring(0, 8));
        entry.setUserName(userName);
        entry.setAction(action);
        entry.setDetails(details);
        entry.setCreatedAt(LocalDateTime.now());
        repo.save(entry);
    }
}
