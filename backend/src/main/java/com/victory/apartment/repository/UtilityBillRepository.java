package com.victory.apartment.repository;

import com.victory.apartment.model.UtilityBill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UtilityBillRepository extends JpaRepository<UtilityBill, String> {
    List<UtilityBill> findAllByOrderByCreatedAtDesc();
}
