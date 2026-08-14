package com.victory.apartment.controller;

import com.victory.apartment.model.Lease;
import com.victory.apartment.service.LeaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leases")
public class LeaseController {

    private final LeaseService leaseService;

    public LeaseController(LeaseService leaseService) {
        this.leaseService = leaseService;
    }

    @GetMapping
    public List<Lease> getAll() {
        return leaseService.getAll();
    }

    @PostMapping("/check-conflict")
    public Map<String, Object> checkConflict(@RequestBody Map<String, String> req) {
        return leaseService.checkConflict(
            req.get("roomId"),
            req.get("startDate"),
            req.get("endDate"),
            req.get("excludeLeaseId")
        );
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Lease lease) {
        Map<String, Object> result = leaseService.saveLease(lease);
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable String id, @RequestBody Lease lease) {
        lease.setId(id);
        Map<String, Object> result = leaseService.saveLease(lease);
        if ((boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PutMapping("/{id}/terminate")
    public ResponseEntity<Void> terminate(@PathVariable String id) {
        leaseService.terminate(id);
        return ResponseEntity.ok().build();
    }
}
