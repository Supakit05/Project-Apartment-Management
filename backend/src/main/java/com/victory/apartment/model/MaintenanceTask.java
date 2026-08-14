package com.victory.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tasks")
public class MaintenanceTask {

    @Id
    private String id;

    @Column(unique = true)
    private String taskNo;

    private String roomId;
    private String roomNumber;
    private String category; // Light bulb replacement, Air-con servicing, Plumbing, Electrical, General Repair
    @Column(length = 1000)
    private String description;
    private String reportedDate;
    private String dueDate;
    private String priority; // Low, Medium, High
    private String status; // Pending, In Progress, Completed
    private String assignedWorker;
    @Column(length = 2000)
    private String suppliesUsed; // JSON string
    private Double laborCost;
    private Double totalCost;
    private String recurringReminder; // None, Monthly, Quarterly, Every 6 Months, Yearly
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public MaintenanceTask() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTaskNo() { return taskNo; }
    public void setTaskNo(String taskNo) { this.taskNo = taskNo; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReportedDate() { return reportedDate; }
    public void setReportedDate(String reportedDate) { this.reportedDate = reportedDate; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAssignedWorker() { return assignedWorker; }
    public void setAssignedWorker(String assignedWorker) { this.assignedWorker = assignedWorker; }
    public String getSuppliesUsed() { return suppliesUsed; }
    public void setSuppliesUsed(String suppliesUsed) { this.suppliesUsed = suppliesUsed; }
    public Double getLaborCost() { return laborCost; }
    public void setLaborCost(Double laborCost) { this.laborCost = laborCost; }
    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
    public String getRecurringReminder() { return recurringReminder; }
    public void setRecurringReminder(String recurringReminder) { this.recurringReminder = recurringReminder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
