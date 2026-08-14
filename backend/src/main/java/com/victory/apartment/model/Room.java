package com.victory.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String roomNumber;

    @Column(nullable = false)
    private Integer floor;

    private String roomName;
    private String roomType;
    private String description;
    private Integer capacity;
    private Double price;
    private String status; // Available, Reserved, Occupied, Maintenance
    private String amenities; // JSON string
    private Double sizeSqm;
    private String bedType;
    private String coverImage;
    private String gallery; // JSON string

    private String currentTenantId;
    private String currentTenantName;
    private Double prevWaterMeter;
    private Double currWaterMeter;
    private Double prevElectricMeter;
    private Double currElectricMeter;

    private LocalDateTime createdAt;

    public Room() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Double getSizeSqm() { return sizeSqm; }
    public void setSizeSqm(Double sizeSqm) { this.sizeSqm = sizeSqm; }

    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getGallery() { return gallery; }
    public void setGallery(String gallery) { this.gallery = gallery; }

    public String getCurrentTenantId() { return currentTenantId; }
    public void setCurrentTenantId(String currentTenantId) { this.currentTenantId = currentTenantId; }

    public String getCurrentTenantName() { return currentTenantName; }
    public void setCurrentTenantName(String currentTenantName) { this.currentTenantName = currentTenantName; }

    public Double getPrevWaterMeter() { return prevWaterMeter; }
    public void setPrevWaterMeter(Double prevWaterMeter) { this.prevWaterMeter = prevWaterMeter; }

    public Double getCurrWaterMeter() { return currWaterMeter; }
    public void setCurrWaterMeter(Double currWaterMeter) { this.currWaterMeter = currWaterMeter; }

    public Double getPrevElectricMeter() { return prevElectricMeter; }
    public void setPrevElectricMeter(Double prevElectricMeter) { this.prevElectricMeter = prevElectricMeter; }

    public Double getCurrElectricMeter() { return currElectricMeter; }
    public void setCurrElectricMeter(Double currElectricMeter) { this.currElectricMeter = currElectricMeter; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
