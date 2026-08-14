package com.victory.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_bills")
public class UtilityBill {

    @Id
    private String id;

    @Column(unique = true)
    private String invoiceNo;

    private String leaseId;
    private String roomId;
    private String roomNumber;
    private String tenantName;
    private String billingMonth;
    private Double rentAmount;
    private Double prevWaterMeter;
    private Double currWaterMeter;
    private Double waterRate;
    private Double waterAmount;
    private Double prevElectricMeter;
    private Double currElectricMeter;
    private Double electricRate;
    private Double electricAmount;
    private Double commonFee;
    private Double totalAmount;
    private String status; // Pending, Paid
    private String paymentDate;
    private String slipImage;
    private LocalDateTime createdAt;

    public UtilityBill() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }
    public String getLeaseId() { return leaseId; }
    public void setLeaseId(String leaseId) { this.leaseId = leaseId; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getTenantName() { return tenantName; }
    public void setTenantName(String tenantName) { this.tenantName = tenantName; }
    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
    public Double getRentAmount() { return rentAmount; }
    public void setRentAmount(Double rentAmount) { this.rentAmount = rentAmount; }
    public Double getPrevWaterMeter() { return prevWaterMeter; }
    public void setPrevWaterMeter(Double prevWaterMeter) { this.prevWaterMeter = prevWaterMeter; }
    public Double getCurrWaterMeter() { return currWaterMeter; }
    public void setCurrWaterMeter(Double currWaterMeter) { this.currWaterMeter = currWaterMeter; }
    public Double getWaterRate() { return waterRate; }
    public void setWaterRate(Double waterRate) { this.waterRate = waterRate; }
    public Double getWaterAmount() { return waterAmount; }
    public void setWaterAmount(Double waterAmount) { this.waterAmount = waterAmount; }
    public Double getPrevElectricMeter() { return prevElectricMeter; }
    public void setPrevElectricMeter(Double prevElectricMeter) { this.prevElectricMeter = prevElectricMeter; }
    public Double getCurrElectricMeter() { return currElectricMeter; }
    public void setCurrElectricMeter(Double currElectricMeter) { this.currElectricMeter = currElectricMeter; }
    public Double getElectricRate() { return electricRate; }
    public void setElectricRate(Double electricRate) { this.electricRate = electricRate; }
    public Double getElectricAmount() { return electricAmount; }
    public void setElectricAmount(Double electricAmount) { this.electricAmount = electricAmount; }
    public Double getCommonFee() { return commonFee; }
    public void setCommonFee(Double commonFee) { this.commonFee = commonFee; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentDate() { return paymentDate; }
    public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }
    public String getSlipImage() { return slipImage; }
    public void setSlipImage(String slipImage) { this.slipImage = slipImage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
