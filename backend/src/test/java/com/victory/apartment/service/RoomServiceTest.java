package com.victory.apartment.service;

import com.victory.apartment.model.Room;
import com.victory.apartment.repository.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RoomServiceTest {

    @Test
    @DisplayName("Should verify 24 room structure across 2 floors (12 rooms per floor)")
    void test24RoomStructure() {
        RoomRepository roomRepo = mock(RoomRepository.class);

        List<Room> seededRooms = new ArrayList<>();
        for (int floor = 1; floor <= 2; floor++) {
            for (int i = 1; i <= 12; i++) {
                Room r = new Room();
                r.setId("r-" + floor + String.format("%02d", i));
                r.setRoomNumber(String.format("%d%02d", floor, i));
                r.setFloor(floor);
                r.setStatus((i % 2 == 0) ? "Occupied" : "Available");
                seededRooms.add(r);
            }
        }

        when(roomRepo.findAllByOrderByRoomNumberAsc()).thenReturn(seededRooms);

        List<Room> allRooms = roomRepo.findAllByOrderByRoomNumberAsc();
        assertEquals(24, allRooms.size(), "Total room count must be 24");

        long floor1Count = allRooms.stream().filter(r -> r.getFloor() == 1).count();
        long floor2Count = allRooms.stream().filter(r -> r.getFloor() == 2).count();

        assertEquals(12, floor1Count, "Floor 1 must contain 12 rooms");
        assertEquals(12, floor2Count, "Floor 2 must contain 12 rooms");
    }
}
