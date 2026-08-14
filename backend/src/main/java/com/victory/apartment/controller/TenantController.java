package com.victory.apartment.controller;

import com.victory.apartment.model.Tenant;
import com.victory.apartment.repository.TenantRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantRepository repo;
    private final ActivityLogService logService;

    public TenantController(TenantRepository repo, ActivityLogService logService) {
        this.repo = repo;
        this.logService = logService;
    }

    @GetMapping
    public List<Tenant> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Tenant create(@RequestBody Tenant tenant) {
        if (tenant.getId() == null || tenant.getId().isEmpty()) {
            tenant.setId("t-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (tenant.getCreatedAt() == null) tenant.setCreatedAt(LocalDateTime.now());
        logService.log("Tenant Created", "Created tenant profile for " + tenant.getFullname());
        return repo.save(tenant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> update(@PathVariable String id, @RequestBody Tenant incoming) {
        return repo.findById(id).map(existing -> {
            if (incoming.getFullname() != null) existing.setFullname(incoming.getFullname());
            if (incoming.getPhone() != null) existing.setPhone(incoming.getPhone());
            if (incoming.getEmail() != null) existing.setEmail(incoming.getEmail());
            if (incoming.getIdCardPassport() != null) existing.setIdCardPassport(incoming.getIdCardPassport());
            if (incoming.getEmergencyContact() != null) existing.setEmergencyContact(incoming.getEmergencyContact());
            if (incoming.getUnitId() != null) existing.setUnitId(incoming.getUnitId());
            if (incoming.getUnitNumber() != null) existing.setUnitNumber(incoming.getUnitNumber());

            logService.log("Tenant Updated", "Updated tenant profile for " + existing.getFullname());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        logService.log("Tenant Deleted", "Deleted tenant ID " + id);
        return ResponseEntity.ok().build();
    }
}
