package com.restoorderhub.backend.scheduler;

import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.OrderItem;
import com.restoorderhub.backend.model.entity.PreOrderItem;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.repository.OrderRepository;
import com.restoorderhub.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PreOrderScheduler {
    
    private final ReservationRepository reservationRepository;
    private final OrderRepository orderRepository;

    /**
     * Runs every 5 minutes to check for reservations that need pre-orders sent to kitchen
     * According to project.md: Pre-orders should be sent to kitchen 30 minutes before reservation time
     */
    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    @Transactional
    public void processPreOrders() {
        log.info("Starting pre-order processing scheduler");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetTime = now.plusMinutes(30);
        
        // Find confirmed reservations with pre-order items that are within 30-35 minutes from now
        List<Reservation> reservations = reservationRepository.findUpcomingReservationsWithPreOrders(
            now.plusMinutes(25), // 25 minutes from now
            now.plusMinutes(35)  // 35 minutes from now
        );
        
        log.info("Found {} reservations with pre-orders to process", reservations.size());
        
        for (Reservation reservation : reservations) {
            try {
                processReservationPreOrder(reservation);
            } catch (Exception e) {
                log.error("Error processing pre-order for reservation {}: {}", 
                    reservation.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Pre-order processing completed");
    }
    
    private void processReservationPreOrder(Reservation reservation) {
        // Check if order already exists for this reservation
        boolean orderExists = orderRepository.existsByReservationIdAndOrderType(
            reservation.getId(), OrderType.PRE_ORDER);
        
        if (orderExists) {
            log.debug("Pre-order already exists for reservation {}", reservation.getId());
            return;
        }
        
        List<PreOrderItem> preOrderItems = reservation.getPreOrderItems();
        if (preOrderItems == null || preOrderItems.isEmpty()) {
            log.debug("No pre-order items for reservation {}", reservation.getId());
            return;
        }
        
        log.info("Creating PRE_ORDER for reservation {} with {} items", 
            reservation.getId(), preOrderItems.size());
        
        // Create Order entity
        Order order = Order.builder()
            .restaurant(reservation.getRestaurant())
            .reservation(reservation)
            .table(reservation.getTable())
            .user(reservation.getUser())
            .orderNumber(generateOrderNumber())
            .orderType(OrderType.PRE_ORDER)
            .status(OrderStatus.CONFIRMED)
            .totalAmount(calculateTotalAmount(preOrderItems))
            .notes("Попереднє замовлення - автоматично створено за 30 хв до бронювання")
            .createdBy(reservation.getUser())
            .build();
        
        // Create OrderItems from PreOrderItems
        List<OrderItem> orderItems = new ArrayList<>();
        for (PreOrderItem preOrderItem : preOrderItems) {
            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .menuItem(preOrderItem.getMenuItem())
                .quantity(preOrderItem.getQuantity())
                .price(preOrderItem.getPrice())
                .subtotal(preOrderItem.getPrice().multiply(
                    java.math.BigDecimal.valueOf(preOrderItem.getQuantity())))
                .status(com.restoorderhub.backend.model.enums.OrderItemStatus.PENDING)
                .specialInstructions(preOrderItem.getSpecialInstructions())
                .build();
            orderItems.add(orderItem);
        }
        
        order.setOrderItems(orderItems);
        
        // Save order
        orderRepository.save(order);
        
        log.info("Successfully created PRE_ORDER {} for reservation {}", 
            order.getOrderNumber(), reservation.getId());
    }
    
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis();
    }
    
    private java.math.BigDecimal calculateTotalAmount(List<PreOrderItem> items) {
        return items.stream()
            .map(item -> item.getPrice().multiply(
                java.math.BigDecimal.valueOf(item.getQuantity())))
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }
}
