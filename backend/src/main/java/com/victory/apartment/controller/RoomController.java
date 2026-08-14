package com.victory.apartment.controller;

import com.victory.apartment.model.Room;
import com.victory.apartment.repository.RoomRepository;
import com.victory.apartment.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomRepository repo;
    private final ActivityLogService logService;

    public RoomController(RoomRepository repo, ActivityLogService logService) {
        this.repo = repo;
        this.logService = logService;
    }

    @GetMapping
    public List<Room> getAll() {
        return repo.findAllByOrderByRoomNumberAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getById(@PathVariable String id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Room create(@RequestBody Room room) {
        if (room.getId() == null || room.getId().isEmpty()) {
            room.setId("rm-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (room.getCreatedAt() == null) room.setCreatedAt(LocalDateTime.now());
        logService.log("Room Created", "Created unit " + room.getRoomNumber());
        return repo.save(room);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> update(@PathVariable String id, @RequestBody Room incoming) {
        return repo.findById(id).map(existing -> {
            if (incoming.getRoomNumber() != null) existing.setRoomNumber(incoming.getRoomNumber());
            if (incoming.getFloor() != null) existing.setFloor(incoming.getFloor());
            if (incoming.getRoomName() != null) existing.setRoomName(incoming.getRoomName());
            if (incoming.getRoomType() != null) existing.setRoomType(incoming.getRoomType());
            if (incoming.getDescription() != null) existing.setDescription(incoming.getDescription());
            if (incoming.getCapacity() != null) existing.setCapacity(incoming.getCapacity());
            if (incoming.getPrice() != null) existing.setPrice(incoming.getPrice());
            if (incoming.getStatus() != null) existing.setStatus(incoming.getStatus());
            if (incoming.getAmenities() != null) existing.setAmenities(incoming.getAmenities());
            if (incoming.getSizeSqm() != null) existing.setSizeSqm(incoming.getSizeSqm());
            if (incoming.getBedType() != null) existing.setBedType(incoming.getBedType());
            if (incoming.getCoverImage() != null) existing.setCoverImage(incoming.getCoverImage());
            if (incoming.getGallery() != null) existing.setGallery(incoming.getGallery());
            if (incoming.getCurrentTenantId() != null) existing.setCurrentTenantId(incoming.getCurrentTenantId());
            if (incoming.getCurrentTenantName() != null) existing.setCurrentTenantName(incoming.getCurrentTenantName());
            if (incoming.getPrevWaterMeter() != null) existing.setPrevWaterMeter(incoming.getPrevWaterMeter());
            if (incoming.getCurrWaterMeter() != null) existing.setCurrWaterMeter(incoming.getCurrWaterMeter());
            if (incoming.getPrevElectricMeter() != null) existing.setPrevElectricMeter(incoming.getPrevElectricMeter());
            if (incoming.getCurrElectricMeter() != null) existing.setCurrElectricMeter(incoming.getCurrElectricMeter());

            logService.log("Room Updated", "Updated unit " + existing.getRoomNumber() + " status: " + existing.getStatus());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        logService.log("Room Deleted", "Deleted unit ID " + id);
        return ResponseEntity.ok().build();
    }
}
