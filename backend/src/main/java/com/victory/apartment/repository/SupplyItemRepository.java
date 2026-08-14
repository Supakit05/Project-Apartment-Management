package com.victory.apartment.repository;

import com.victory.apartment.model.SupplyItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplyItemRepository extends JpaRepository<SupplyItem, String> {
}
