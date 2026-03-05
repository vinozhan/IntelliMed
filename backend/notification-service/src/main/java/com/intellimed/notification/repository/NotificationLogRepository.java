package com.intellimed.notification.repository;

import com.intellimed.notification.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findAllByOrderBySentAtDesc();
    Page<NotificationLog> findAllByOrderBySentAtDesc(Pageable pageable);
}
