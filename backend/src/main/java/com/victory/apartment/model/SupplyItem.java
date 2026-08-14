package com.victory.apartment.model;

import jakarta.persistence.*;

@Entity
@Table(name = "supply_items")
public class SupplyItem {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String category;
    private Integer stockQuantity;
    private Double unitCost;
    private String unitName;

    public SupplyItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }
    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }
}
