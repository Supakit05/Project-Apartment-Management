package com.victory.apartment.repository;

import com.victory.apartment.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findAllByOrderByRoomNumberAsc();
    List<Room> findByStatus(String status);
    List<Room> findByFloor(Integer floor);
}
