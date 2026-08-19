package com.victory.apartment.controller;

import com.victory.apartment.model.Building;
import com.victory.apartment.repository.BuildingRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    private final BuildingRepository repo;
    private final ActivityLogService logService;

    public BuildingController(BuildingRepository repo, ActivityLogService logService) {
        this.repo = repo;
        this.logService = logService;
    }

    @GetMapping
    public List<Building> getAll() {
        return repo.findAllByOrderByCodeAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getById(@PathVariable String id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Building create(@RequestBody Building building) {
        if (building.getId() == null || building.getId().isEmpty()) {
            building.setId("bld-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (building.getCreatedAt() == null) {
            building.setCreatedAt(LocalDateTime.now());
        }
        if (building.getFloors() == null) building.setFloors(5);
        if (building.getTotalRooms() == null) building.setTotalRooms(20);
        if (building.getCoverImage() == null || building.getCoverImage().isEmpty()) {
            building.setCoverImage("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80");
        }

        logService.log("Building Created", "Created building " + building.getName() + " (" + building.getCode() + ")");
        return repo.save(building);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Building> update(@PathVariable String id, @RequestBody Building incoming) {
        return repo.findById(id).map(existing -> {
            if (incoming.getName() != null) existing.setName(incoming.getName());
            if (incoming.getCode() != null) existing.setCode(incoming.getCode());
            if (incoming.getFloors() != null) existing.setFloors(incoming.getFloors());
            if (incoming.getTotalRooms() != null) existing.setTotalRooms(incoming.getTotalRooms());
            if (incoming.getDescription() != null) existing.setDescription(incoming.getDescription());
            if (incoming.getCoverImage() != null) existing.setCoverImage(incoming.getCoverImage());
            if (incoming.getAddress() != null) existing.setAddress(incoming.getAddress());

            logService.log("Building Updated", "Updated building " + existing.getName());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return repo.findById(id).map(bld -> {
            repo.deleteById(id);
            logService.log("Building Deleted", "Deleted building " + bld.getName() + " (" + id + ")");
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
