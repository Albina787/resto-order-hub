package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.OrderItem;
import com.restoorderhub.backend.model.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    List<OrderItem> findByOrder(Order order);

    List<OrderItem> findByOrderAndStatus(Order order, OrderItemStatus status);
}