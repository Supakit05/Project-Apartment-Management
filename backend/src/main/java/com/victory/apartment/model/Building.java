package com.victory.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "buildings")
public class Building {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    private Integer floors;
    private Integer totalRooms;
    @Column(length = 1000)
    private String description;
    @Column(length = 1000)
    private String coverImage;
    @Column(length = 1000)
    private String address;

    private LocalDateTime createdAt;

    public Building() {}

    public Building(String id, String name, String code, Integer floors, Integer totalRooms, String description, String coverImage, String address, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.floors = floors;
        this.totalRooms = totalRooms;
        this.description = description;
        this.coverImage = coverImage;
        this.address = address;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getFloors() { return floors; }
    public void setFloors(Integer floors) { this.floors = floors; }

    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
