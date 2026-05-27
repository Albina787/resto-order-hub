package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.PreOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PreOrderItemRepository extends JpaRepository<PreOrderItem, UUID> {
    List<PreOrderItem> findByReservationId(UUID reservationId);
}
