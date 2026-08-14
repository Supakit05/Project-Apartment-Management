package com.victory.apartment.model;

import jakarta.persistence.*;

@Entity
@Table(name = "scheduled_reminders")
public class ScheduledReminder {

    @Id
    private String id;

    private String title;
    private String category;
    private String roomId;
    private String roomNumber;
    private String frequency; // None, Monthly, Quarterly, Every 6 Months, Yearly
    private String lastTriggered;
    private String nextDueDate;
    private Boolean isActive;

    public ScheduledReminder() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public String getLastTriggered() { return lastTriggered; }
    public void setLastTriggered(String lastTriggered) { this.lastTriggered = lastTriggered; }
    public String getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(String nextDueDate) { this.nextDueDate = nextDueDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
