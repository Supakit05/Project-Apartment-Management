package com.victory.apartment.controller;

import com.victory.apartment.model.Building;
import com.victory.apartment.repository.BuildingRepository;
import com.victory.apartment.service.ActivityLogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BuildingControllerTest {

    private BuildingRepository buildingRepo;
    private ActivityLogService logService;
    private BuildingController buildingController;

    @BeforeEach
    void setUp() {
        buildingRepo = mock(BuildingRepository.class);
        logService = mock(ActivityLogService.class);
        buildingController = new BuildingController(buildingRepo, logService);
    }

    @Test
    @DisplayName("Should create and save a new building")
    void testCreateBuilding() {
        Building incoming = new Building();
        incoming.setName("Building C");
        incoming.setCode("C");
        incoming.setFloors(3);
        incoming.setTotalRooms(15);

        when(buildingRepo.save(any(Building.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Building created = buildingController.create(incoming);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertTrue(created.getId().startsWith("bld-"));
        assertEquals("Building C", created.getName());
        assertEquals("C", created.getCode());
        verify(buildingRepo, times(1)).save(any(Building.class));
    }

    @Test
    @DisplayName("Should delete existing building and return OK")
    void testDeleteBuilding_Found() {
        Building b = new Building("bld-99", "Building Test", "T", 2, 10, "", "", "", LocalDateTime.now());
        when(buildingRepo.findById("bld-99")).thenReturn(Optional.of(b));

        ResponseEntity<Void> response = buildingController.delete("bld-99");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(buildingRepo, times(1)).deleteById("bld-99");
    }

    @Test
    @DisplayName("Should return 404 when deleting non-existent building")
    void testDeleteBuilding_NotFound() {
        when(buildingRepo.findById("non-existent")).thenReturn(Optional.empty());

        ResponseEntity<Void> response = buildingController.delete("non-existent");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(buildingRepo, never()).deleteById("non-existent");
    }
}
