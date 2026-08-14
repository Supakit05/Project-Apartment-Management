package com.victory.apartment.repository;

import com.victory.apartment.model.ScheduledReminder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduledReminderRepository extends JpaRepository<ScheduledReminder, String> {
}
