package com.victory.apartment.controller;

import com.victory.apartment.model.UtilityBill;
import com.victory.apartment.model.Room;
import com.victory.apartment.repository.UtilityBillRepository;
import com.victory.apartment.repository.RoomRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/utility-bills")
public class UtilityBillController {

    private final UtilityBillRepository repo;
    private final RoomRepository roomRepo;
    private final ActivityLogService logService;

    public UtilityBillController(UtilityBillRepository repo, RoomRepository roomRepo, ActivityLogService logService) {
        this.repo = repo;
        this.roomRepo = roomRepo;
        this.logService = logService;
    }

    @GetMapping
    public List<UtilityBill> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public UtilityBill create(@RequestBody UtilityBill bill) {
        if (bill.getId() == null || bill.getId().isEmpty()) {
            bill.setId("bill-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (bill.getCreatedAt() == null) bill.setCreatedAt(LocalDateTime.now());

        // Auto-calculate amounts
        double waterUnits = Math.max(0, (bill.getCurrWaterMeter() != null ? bill.getCurrWaterMeter() : 0) - (bill.getPrevWaterMeter() != null ? bill.getPrevWaterMeter() : 0));
        double electricUnits = Math.max(0, (bill.getCurrElectricMeter() != null ? bill.getCurrElectricMeter() : 0) - (bill.getPrevElectricMeter() != null ? bill.getPrevElectricMeter() : 0));
        double waterRate = bill.getWaterRate() != null ? bill.getWaterRate() : 18;
        double electricRate = bill.getElectricRate() != null ? bill.getElectricRate() : 7;

        bill.setWaterAmount(waterUnits * waterRate);
        bill.setElectricAmount(electricUnits * electricRate);

        double rent = bill.getRentAmount() != null ? bill.getRentAmount() : 5500;
        double commonFee = bill.getCommonFee() != null ? bill.getCommonFee() : 300;
        bill.setTotalAmount(rent + bill.getWaterAmount() + bill.getElectricAmount() + commonFee);

        if (bill.getStatus() == null) bill.setStatus("Pending");

        UtilityBill saved = repo.save(bill);

        // Update room meters
        if (saved.getRoomId() != null) {
            roomRepo.findById(saved.getRoomId()).ifPresent(room -> {
                room.setPrevWaterMeter(saved.getCurrWaterMeter());
                room.setPrevElectricMeter(saved.getCurrElectricMeter());
                roomRepo.save(room);
            });
        }

        logService.log("Utility Bill Created",
            String.format("Created bill %s for Unit %s (%.0f THB)", saved.getInvoiceNo(), saved.getRoomNumber(), saved.getTotalAmount()));
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilityBill> update(@PathVariable String id, @RequestBody UtilityBill bill) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        bill.setId(id);
        return ResponseEntity.ok(repo.save(bill));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UtilityBill> updateStatus(@PathVariable String id, @RequestBody Map<String, String> req) {
        return repo.findById(id).map(bill -> {
            bill.setStatus(req.get("status"));
            if ("Paid".equals(req.get("status"))) {
                bill.setPaymentDate(java.time.LocalDate.now().toString());
            }
            if (req.containsKey("slipImage")) {
                bill.setSlipImage(req.get("slipImage"));
            }
            logService.log("Bill Status Updated", String.format("Bill %s set to %s", bill.getInvoiceNo(), req.get("status")));
            return ResponseEntity.ok(repo.save(bill));
        }).orElse(ResponseEntity.notFound().build());
    }
}
