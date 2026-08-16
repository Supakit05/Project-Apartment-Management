package com.victory.apartment.controller;

import com.victory.apartment.model.*;
import com.victory.apartment.repository.*;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class MaintenanceController {

    private final MaintenanceTaskRepository taskRepo;
    private final SupplyItemRepository supplyRepo;
    private final MaintenanceLogRepository logRepo;
    private final ScheduledReminderRepository reminderRepo;
    private final AppNotificationRepository notifRepo;
    private final RoomRepository roomRepo;
    private final ActivityLogService activityLogService;

    public MaintenanceController(
            MaintenanceTaskRepository taskRepo,
            SupplyItemRepository supplyRepo,
            MaintenanceLogRepository logRepo,
            ScheduledReminderRepository reminderRepo,
            AppNotificationRepository notifRepo,
            RoomRepository roomRepo,
            ActivityLogService activityLogService) {
        this.taskRepo = taskRepo;
        this.supplyRepo = supplyRepo;
        this.logRepo = logRepo;
        this.reminderRepo = reminderRepo;
        this.notifRepo = notifRepo;
        this.roomRepo = roomRepo;
        this.activityLogService = activityLogService;
    }

    // === MAINTENANCE TASKS ===
    @GetMapping("/maintenance-tasks")
    public List<MaintenanceTask> getAllTasks() {
        List<MaintenanceTask> tasks = taskRepo.findAllByOrderByCreatedAtDesc();
        for (MaintenanceTask t : tasks) {
            if (t.getRoomNumber() != null && !t.getRoomNumber().isEmpty()) {
                roomRepo.findByRoomNumber(t.getRoomNumber()).ifPresent(rm -> {
                    boolean isOccupied = "Occupied".equalsIgnoreCase(rm.getStatus()) || (rm.getCurrentTenantId() != null && !rm.getCurrentTenantId().isEmpty());
                    String correctType = isOccupied ? "Occupied" : "Vacant/Common";
                    if (!correctType.equals(t.getOccupancyType())) {
                        t.setOccupancyType(correctType);
                        taskRepo.save(t);
                    }
                });
            }
        }
        return tasks;
    }

    @GetMapping("/maintenance-tasks/user/{email}")
    public List<MaintenanceTask> getByUserEmail(@PathVariable String email) {
        return taskRepo.findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    @PostMapping("/maintenance-tasks")
    public MaintenanceTask createTask(@RequestBody MaintenanceTask task) {
        if (task.getId() == null || task.getId().isEmpty()) {
            task.setId("mt-" + UUID.randomUUID().toString().substring(0, 8));
            task.setTaskNo(String.format("MNT-%tY%tm-%02d", LocalDateTime.now(), LocalDateTime.now(), (int)(Math.random() * 90 + 10)));
        }
        if (task.getCreatedAt() == null) task.setCreatedAt(LocalDateTime.now());
        if (task.getStatus() == null) task.setStatus("Pending");

        // Sync occupancyType based on actual room occupancy status
        if (task.getRoomNumber() != null && !task.getRoomNumber().isEmpty()) {
            roomRepo.findByRoomNumber(task.getRoomNumber()).ifPresent(rm -> {
                boolean isOccupied = "Occupied".equalsIgnoreCase(rm.getStatus()) || (rm.getCurrentTenantId() != null && !rm.getCurrentTenantId().isEmpty());
                task.setOccupancyType(isOccupied ? "Occupied" : "Vacant/Common");
            });
        }

        MaintenanceTask saved = taskRepo.save(task);

        // Always sync/add to maintenance log so per-unit history is always up to date!
        syncOrAddMaintenanceLogFromTask(saved);

        // Auto-create notification for Admin
        AppNotification notif = new AppNotification();
        notif.setId("notif-" + UUID.randomUUID().toString().substring(0, 8));
        notif.setTitle(String.format("New Repair Request: Unit %s (%s)", saved.getRoomNumber() != null ? saved.getRoomNumber() : "", saved.getCategory() != null ? saved.getCategory() : "General"));
        notif.setMessage(String.format("Unit %s reported by %s: %s (Priority: %s)", 
            saved.getRoomNumber(), 
            saved.getReporterName() != null && !saved.getReporterName().isEmpty() ? saved.getReporterName() : "Resident", 
            saved.getDescription(), 
            saved.getPriority()));
        notif.setType("warning");
        notif.setIsRead(false);
        notif.setCreatedAt(LocalDateTime.now());
        notifRepo.save(notif);

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
            if (incoming.getOccupancyType() != null) existing.setOccupancyType(incoming.getOccupancyType());

            if ("Completed".equals(existing.getStatus()) && existing.getCompletedAt() == null) {
                existing.setCompletedAt(LocalDateTime.now());
            }

            // Always sync/update maintenance log
            syncOrAddMaintenanceLogFromTask(existing);

            activityLogService.log("Maintenance Task Updated",
                String.format("Task %s for Unit %s set to %s", existing.getTaskNo(), existing.getRoomNumber(), existing.getStatus()));
            return ResponseEntity.ok(taskRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/maintenance-tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        return taskRepo.findById(id).map(t -> {
            if (t.getTaskNo() != null) {
                List<MaintenanceLog> linkedLogs = logRepo.findByTaskNo(t.getTaskNo());
                logRepo.deleteAll(linkedLogs);
            }
            taskRepo.deleteById(id);
            activityLogService.log("Maintenance Task Deleted", "Task " + id + " was removed");
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private void syncOrAddMaintenanceLogFromTask(MaintenanceTask task) {
        List<MaintenanceLog> existingLogs = logRepo.findByTaskNo(task.getTaskNo());
        MaintenanceLog log;
        if (!existingLogs.isEmpty()) {
            log = existingLogs.get(0);
        } else {
            log = new MaintenanceLog();
            log.setId("log-" + UUID.randomUUID().toString().substring(0, 8));
            log.setDate(task.getCreatedAt() != null ? task.getCreatedAt().toLocalDate().toString() : java.time.LocalDate.now().toString());
            log.setTaskNo(task.getTaskNo());
        }
        log.setRoomId(task.getRoomId());
        log.setRoomNumber(task.getRoomNumber());
        log.setCategory(task.getCategory());
        log.setDescription(task.getDescription());
        log.setSuppliesSummary(task.getSuppliesUsed() != null && !task.getSuppliesUsed().isEmpty() ? task.getSuppliesUsed() : "ไม่มีอะไหล่ (ค่าแรงอย่างเดียว)");
        log.setTotalCost(task.getTotalCost() != null ? task.getTotalCost() : (task.getLaborCost() != null ? task.getLaborCost() : 0.0));
        log.setPerformedBy(task.getAssignedWorker() != null && !task.getAssignedWorker().isEmpty() ? task.getAssignedWorker() : "ช่างประจำอาคาร");
        logRepo.save(log);
    }

    // === SUPPLIES ===
    @GetMapping("/supplies")
    public List<SupplyItem> getAllSupplies() {
        recalculateAndDeductSuppliesStock();
        return supplyRepo.findAll();
    }

    @PostMapping("/supplies")
    public SupplyItem createSupply(@RequestBody SupplyItem supply) {
        if (supply.getId() == null || supply.getId().isEmpty()) {
            supply.setId("sup-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (supply.getBaseStockQuantity() == null && supply.getStockQuantity() != null) {
            supply.setBaseStockQuantity(supply.getStockQuantity());
        }
        SupplyItem saved = supplyRepo.save(supply);
        recalculateAndDeductSuppliesStock();
        return supplyRepo.findById(saved.getId()).orElse(saved);
    }

    @PutMapping("/supplies/{id}")
    public ResponseEntity<SupplyItem> updateSupply(@PathVariable String id, @RequestBody SupplyItem incoming) {
        return supplyRepo.findById(id).map(existing -> {
            if (incoming.getName() != null) existing.setName(incoming.getName());
            if (incoming.getCategory() != null) existing.setCategory(incoming.getCategory());
            if (incoming.getUnitCost() != null) existing.setUnitCost(incoming.getUnitCost());
            if (incoming.getUnitName() != null) existing.setUnitName(incoming.getUnitName());

            // If manual adjustment of stockQuantity (like +1 or -1 buttons)
            if (incoming.getStockQuantity() != null) {
                int used = getUsedCountForSupply(existing.getName());
                existing.setBaseStockQuantity(incoming.getStockQuantity() + used);
                existing.setStockQuantity(incoming.getStockQuantity());
            }
            supplyRepo.save(existing);
            recalculateAndDeductSuppliesStock();
            return ResponseEntity.ok(supplyRepo.findById(id).orElse(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Dynamic helper methods for parsing and stock deduction
    public static Map<String, Integer> parseSuppliesUsed(String raw) {
        Map<String, Integer> result = new HashMap<>();
        if (raw == null || raw.trim().isEmpty() || raw.contains("ไม่มีอะไหล่") || raw.contains("No supplies")) {
            return result;
        }
        String trimmed = raw.trim();

        // 1. JSON Array format
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"[^}]*\"quantity\"\\s*:\\s*(\\d+)").matcher(trimmed);
                while (m.find()) {
                    String name = m.group(1).trim();
                    int qty = Integer.parseInt(m.group(2));
                    result.put(name, result.getOrDefault(name, 0) + qty);
                }
                if (!result.isEmpty()) return result;
            } catch (Exception ignored) {}
        }

        // 2. Comma separated text format, e.g. "R32 Refrigerant Can x1 (฿450), Basin Sink Valve 1/2 inch x1 (฿180)"
        String[] parts = trimmed.split(",");
        for (String part : parts) {
            String p = part.trim();
            if (p.isEmpty()) continue;
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("^(.*?)\\s+x(\\d+)(?:\\s*\\(.*\\))?$").matcher(p);
            if (m.find()) {
                String name = m.group(1).trim();
                int qty = Integer.parseInt(m.group(2));
                result.put(name, result.getOrDefault(name, 0) + qty);
            } else {
                String cleanName = p.replaceAll("\\(.*\\)", "").trim();
                if (!cleanName.isEmpty()) {
                    result.put(cleanName, result.getOrDefault(cleanName, 0) + 1);
                }
            }
        }
        return result;
    }

    private boolean supplyNameMatches(String supplyName, String usedName) {
        if (supplyName == null || usedName == null) return false;
        String s1 = supplyName.toLowerCase().replaceAll("[^a-z0-9]", "");
        String s2 = usedName.toLowerCase().replaceAll("[^a-z0-9]", "");
        return s1.contains(s2) || s2.contains(s1) ||
               (s1.contains("ledbulb") && s2.contains("ledbulb")) ||
               (s1.contains("airconfilter") && s2.contains("airconfilter")) ||
               (s1.contains("basinsink") && s2.contains("basinsink")) ||
               (s1.contains("refrigerant") && s2.contains("refrigerant")) ||
               (s1.contains("bidetspray") && s2.contains("bidetspray")) ||
               (s1.contains("circuitbreaker") && s2.contains("circuitbreaker"));
    }

    private int getUsedCountForSupply(String supplyName) {
        List<MaintenanceTask> allTasks = taskRepo.findAll();
        List<MaintenanceLog> allLogs = logRepo.findAll();
        int total = 0;

        for (MaintenanceTask t : allTasks) {
            Map<String, Integer> parsed = parseSuppliesUsed(t.getSuppliesUsed());
            for (Map.Entry<String, Integer> entry : parsed.entrySet()) {
                if (supplyNameMatches(supplyName, entry.getKey())) {
                    total += entry.getValue();
                }
            }
        }

        for (MaintenanceLog l : allLogs) {
            if (l.getTaskNo() == null || l.getTaskNo().isEmpty()) {
                Map<String, Integer> parsed = parseSuppliesUsed(l.getSuppliesSummary());
                for (Map.Entry<String, Integer> entry : parsed.entrySet()) {
                    if (supplyNameMatches(supplyName, entry.getKey())) {
                        total += entry.getValue();
                    }
                }
            }
        }
        return total;
    }

    private void recalculateAndDeductSuppliesStock() {
        List<SupplyItem> allSupplies = supplyRepo.findAll();
        List<MaintenanceTask> allTasks = taskRepo.findAll();
        List<MaintenanceLog> allLogs = logRepo.findAll();

        Map<String, Integer> totalUsedMap = new HashMap<>();

        for (MaintenanceTask t : allTasks) {
            Map<String, Integer> parsed = parseSuppliesUsed(t.getSuppliesUsed());
            parsed.forEach((k, v) -> totalUsedMap.put(k, totalUsedMap.getOrDefault(k, 0) + v));
        }

        for (MaintenanceLog l : allLogs) {
            if (l.getTaskNo() == null || l.getTaskNo().isEmpty()) {
                Map<String, Integer> parsed = parseSuppliesUsed(l.getSuppliesSummary());
                parsed.forEach((k, v) -> totalUsedMap.put(k, totalUsedMap.getOrDefault(k, 0) + v));
            }
        }

        for (SupplyItem item : allSupplies) {
            int totalUsed = 0;
            for (Map.Entry<String, Integer> entry : totalUsedMap.entrySet()) {
                if (supplyNameMatches(item.getName(), entry.getKey())) {
                    totalUsed += entry.getValue();
                }
            }

            int base = item.getBaseStockQuantity() != null ? item.getBaseStockQuantity() : getDefaultBaseQuantity(item.getName());
            if (item.getBaseStockQuantity() == null) {
                item.setBaseStockQuantity(base);
            }
            int remainingStock = Math.max(0, base - totalUsed);
            item.setStockQuantity(remainingStock);
            supplyRepo.save(item);
        }
    }

    private int getDefaultBaseQuantity(String name) {
        if (name == null) return 10;
        String n = name.toLowerCase();
        if (n.contains("led") || n.contains("bulb")) return 24;
        if (n.contains("spray") || n.contains("bidet")) return 8;
        if (n.contains("refrigerant") || n.contains("r32")) return 5;
        if (n.contains("filter")) return 12;
        if (n.contains("valve") || n.contains("sink")) return 10;
        if (n.contains("breaker")) return 6;
        return 10;
    }

    // === MAINTENANCE LOGS (per-unit history) ===
    @GetMapping("/maintenance-logs")
    public List<MaintenanceLog> getAllLogs(@RequestParam(required = false) String roomId) {
        // Sync all tasks into logs so nothing is missing
        List<MaintenanceTask> allTasks = taskRepo.findAll();
        for (MaintenanceTask t : allTasks) {
            if (t.getTaskNo() != null && !t.getTaskNo().isEmpty()) {
                syncOrAddMaintenanceLogFromTask(t);
            }
        }
        recalculateAndDeductSuppliesStock();

        return (roomId != null && !roomId.isEmpty())
                ? logRepo.findByRoomIdOrderByDateDesc(roomId)
                : logRepo.findAll();
    }

    @PostMapping("/maintenance-logs")
    public MaintenanceLog createLog(@RequestBody MaintenanceLog log) {
        if (log.getId() == null || log.getId().isEmpty()) {
            log.setId("log-" + UUID.randomUUID().toString().substring(0, 8));
        }
        MaintenanceLog saved = logRepo.save(log);
        recalculateAndDeductSuppliesStock();
        return saved;
    }

    @PutMapping("/maintenance-logs/{id}")
    public ResponseEntity<MaintenanceLog> updateLog(@PathVariable String id, @RequestBody MaintenanceLog incoming) {
        return logRepo.findById(id).map(existing -> {
            if (incoming.getDescription() != null) existing.setDescription(incoming.getDescription());
            if (incoming.getSuppliesSummary() != null) existing.setSuppliesSummary(incoming.getSuppliesSummary());
            if (incoming.getTotalCost() != null) existing.setTotalCost(incoming.getTotalCost());
            if (incoming.getPerformedBy() != null) existing.setPerformedBy(incoming.getPerformedBy());
            MaintenanceLog saved = logRepo.save(existing);
            recalculateAndDeductSuppliesStock();
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/maintenance-logs/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable String id) {
        if (logRepo.existsById(id)) {
            logRepo.deleteById(id);
            recalculateAndDeductSuppliesStock();
            activityLogService.log("Maintenance Log Deleted", "Log " + id + " was removed");
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
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
