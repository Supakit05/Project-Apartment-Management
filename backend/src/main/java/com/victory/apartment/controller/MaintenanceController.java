package com.victory.apartment.controller;

import com.victory.apartment.model.*;
import com.victory.apartment.repository.*;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class MaintenanceController {

    private final MaintenanceTaskRepository taskRepo;
    private final SupplyItemRepository supplyRepo;
    private final MaintenanceLogRepository logRepo;
    private final ScheduledReminderRepository reminderRepo;
    private final ActivityLogService activityLogService;

    public MaintenanceController(
            MaintenanceTaskRepository taskRepo,
            SupplyItemRepository supplyRepo,
            MaintenanceLogRepository logRepo,
            ScheduledReminderRepository reminderRepo,
            ActivityLogService activityLogService) {
        this.taskRepo = taskRepo;
        this.supplyRepo = supplyRepo;
        this.logRepo = logRepo;
        this.reminderRepo = reminderRepo;
        this.activityLogService = activityLogService;
    }

    // === MAINTENANCE TASKS ===
    @GetMapping("/maintenance-tasks")
    public List<MaintenanceTask> getAllTasks() {
        return taskRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/maintenance-tasks")
    public MaintenanceTask createTask(@RequestBody MaintenanceTask task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId("mt-" + UUID.randomUUID().toString().substring(0, 8));
            task.setTaskNo(String.format("MNT-%tY%tm-%02d", LocalDateTime.now(), LocalDateTime.now(), (int)(Math.random() * 90 + 10)));
        }
        if (task.getCreatedAt() == null) task.setCreatedAt(LocalDateTime.now());
        if (task.getStatus() == null) task.setStatus("Pending");

        MaintenanceTask saved = taskRepo.save(task);

        // Auto-add to maintenance log if completed
        if ("Completed".equals(saved.getStatus())) {
            saved.setCompletedAt(LocalDateTime.now());
            taskRepo.save(saved);
            addMaintenanceLogFromTask(saved);
        }

        activityLogService.log("Maintenance Task Saved",
            String.format("Task %s for Unit %s - %s", saved.getTaskNo(), saved.getRoomNumber(), saved.getStatus()));
        return saved;
    }

    @PutMapping("/maintenance-tasks/{id}")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable String id, @RequestBody MaintenanceTask incoming) {
        return taskRepo.findById(id).map(existing -> {
            if (incoming.getStatus() != null) existing.setStatus(incoming.getStatus());
            if (incoming.getCategory() != null) existing.setCategory(incoming.getCategory());
            if (incoming.getDescription() != null) existing.setDescription(incoming.getDescription());
            if (incoming.getPriority() != null) existing.setPriority(incoming.getPriority());
            if (incoming.getAssignedWorker() != null) existing.setAssignedWorker(incoming.getAssignedWorker());
            if (incoming.getLaborCost() != null) existing.setLaborCost(incoming.getLaborCost());
            if (incoming.getTotalCost() != null) existing.setTotalCost(incoming.getTotalCost());
            if (incoming.getSuppliesUsed() != null) existing.setSuppliesUsed(incoming.getSuppliesUsed());

            if ("Completed".equals(existing.getStatus()) && existing.getCompletedAt() == null) {
                existing.setCompletedAt(LocalDateTime.now());
                addMaintenanceLogFromTask(existing);
            }

            activityLogService.log("Maintenance Task Updated",
                String.format("Task %s for Unit %s set to %s", existing.getTaskNo(), existing.getRoomNumber(), existing.getStatus()));
            return ResponseEntity.ok(taskRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void addMaintenanceLogFromTask(MaintenanceTask task) {
        MaintenanceLog log = new MaintenanceLog();
        log.setId("log-" + UUID.randomUUID().toString().substring(0, 8));
        log.setRoomId(task.getRoomId());
        log.setRoomNumber(task.getRoomNumber());
        log.setDate(java.time.LocalDate.now().toString());
        log.setTaskNo(task.getTaskNo());
        log.setCategory(task.getCategory());
        log.setDescription(task.getDescription());
        log.setSuppliesSummary(task.getSuppliesUsed() != null ? task.getSuppliesUsed() : "No supplies");
        log.setTotalCost(task.getTotalCost());
        log.setPerformedBy(task.getAssignedWorker());
        logRepo.save(log);
    }

    // === SUPPLIES ===
    @GetMapping("/supplies")
    public List<SupplyItem> getAllSupplies() {
        return supplyRepo.findAll();
    }

    @PostMapping("/supplies")
    public SupplyItem createSupply(@RequestBody SupplyItem supply) {
        if (supply.getId() == null || supply.getId().isEmpty()) {
            supply.setId("sup-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return supplyRepo.save(supply);
    }

    @PutMapping("/supplies/{id}")
    public ResponseEntity<SupplyItem> updateSupply(@PathVariable String id, @RequestBody SupplyItem incoming) {
        return supplyRepo.findById(id).map(existing -> {
            if (incoming.getName() != null) existing.setName(incoming.getName());
            if (incoming.getCategory() != null) existing.setCategory(incoming.getCategory());
            if (incoming.getStockQuantity() != null) existing.setStockQuantity(incoming.getStockQuantity());
            if (incoming.getUnitCost() != null) existing.setUnitCost(incoming.getUnitCost());
            if (incoming.getUnitName() != null) existing.setUnitName(incoming.getUnitName());
            return ResponseEntity.ok(supplyRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // === MAINTENANCE LOGS (per-unit history) ===
    @GetMapping("/maintenance-logs")
    public List<MaintenanceLog> getAllLogs(@RequestParam(required = false) String roomId) {
        if (roomId != null && !roomId.isEmpty()) {
            return logRepo.findByRoomIdOrderByDateDesc(roomId);
        }
        return logRepo.findAll();
    }

    @PostMapping("/maintenance-logs")
    public MaintenanceLog createLog(@RequestBody MaintenanceLog log) {
        if (log.getId() == null || log.getId().isEmpty()) {
            log.setId("log-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return logRepo.save(log);
    }

    // === SCHEDULED REMINDERS ===
    @GetMapping("/reminders")
    public List<ScheduledReminder> getAllReminders() {
        return reminderRepo.findAll();
    }

    @PostMapping("/reminders")
    public ScheduledReminder createReminder(@RequestBody ScheduledReminder reminder) {
        if (reminder.getId() == null || reminder.getId().isEmpty()) {
            reminder.setId("rem-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (reminder.getIsActive() == null) reminder.setIsActive(true);
        return reminderRepo.save(reminder);
    }

    @PutMapping("/reminders/{id}")
    public ResponseEntity<ScheduledReminder> updateReminder(@PathVariable String id, @RequestBody ScheduledReminder incoming) {
        return reminderRepo.findById(id).map(existing -> {
            if (incoming.getTitle() != null) existing.setTitle(incoming.getTitle());
            if (incoming.getCategory() != null) existing.setCategory(incoming.getCategory());
            if (incoming.getRoomId() != null) existing.setRoomId(incoming.getRoomId());
            if (incoming.getRoomNumber() != null) existing.setRoomNumber(incoming.getRoomNumber());
            if (incoming.getFrequency() != null) existing.setFrequency(incoming.getFrequency());
            if (incoming.getNextDueDate() != null) existing.setNextDueDate(incoming.getNextDueDate());
            if (incoming.getIsActive() != null) existing.setIsActive(incoming.getIsActive());
            return ResponseEntity.ok(reminderRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/reminders/{id}/toggle")
    public ResponseEntity<ScheduledReminder> toggleReminder(@PathVariable String id) {
        return reminderRepo.findById(id).map(rem -> {
            rem.setIsActive(!rem.getIsActive());
            return ResponseEntity.ok(reminderRepo.save(rem));
        }).orElse(ResponseEntity.notFound().build());
    }
}
