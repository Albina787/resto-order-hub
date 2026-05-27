package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.dto.request.CreateOrderRequest;
import com.restoorderhub.backend.model.entity.*;
import com.restoorderhub.backend.model.enums.OrderItemStatus;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import com.restoorderhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(UUID id) {
        return orderRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return orderRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByRestaurant(UUID restaurantId, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return orderRepository.findByRestaurant(restaurant, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByRestaurantAndStatus(UUID restaurantId, OrderStatus status, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return orderRepository.findByRestaurantAndStatus(restaurant, status, pageable);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return orderRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUser(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return orderRepository.findByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUserAndStatus(UUID userId, OrderStatus status, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return orderRepository.findByUserAndStatus(user, status, pageable);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByRestaurantAndStatus(UUID restaurantId, OrderStatus status) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return orderRepository.findByRestaurantAndStatus(restaurant, status);
    }

    @Transactional
    public Order createOrder(Order order, UUID restaurantId, UUID userId, OrderType orderType) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));

        String orderNumber = generateOrderNumber(restaurant);
        order.setRestaurant(restaurant);
        order.setUser(user);
        order.setCreatedBy(user);
        order.setOrderNumber(orderNumber);
        order.setOrderType(orderType);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);

        return orderRepository.save(order);
    }

    @Transactional
    public Order createOrderFromRequest(CreateOrderRequest request, User currentUser) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));

        Order order = Order.builder()
                .restaurant(restaurant)
                .user(currentUser)
                .createdBy(currentUser)
                .orderNumber(generateOrderNumber(restaurant))
                .orderType(request.getOrderType())
                .status(OrderStatus.PENDING)
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        if (request.getTableId() != null) {
            RestaurantTable table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Стіл не знайдено"));
            order.setTable(table);
        }

        if (request.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));
            order.setReservation(reservation);
        }

        Order savedOrder = orderRepository.save(order);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            savedOrder = addOrderItems(savedOrder.getId(), request.getItems());
        }

        emailService.sendOrderConfirmationEmail(
                currentUser.getEmail(), buildOrderDetails(savedOrder));

        return savedOrder;
    }

    @Transactional
    public Order addOrderItems(UUID orderId, List<CreateOrderRequest.OrderItemRequest> items) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));

        BigDecimal addedAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemRequest : items) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Страву не знайдено"));

            // Validate menu item belongs to the same restaurant
            if (!menuItem.getRestaurant().getId().equals(order.getRestaurant().getId())) {
                throw new IllegalArgumentException(
                        "Страва '" + menuItem.getName() + "' не належить до цього ресторану");
            }
            if (!menuItem.getAvailable()) {
                throw new IllegalArgumentException("Страва '" + menuItem.getName() + "' недоступна");
            }

            BigDecimal subtotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItem(menuItem)
                    .quantity(itemRequest.getQuantity())
                    .price(menuItem.getPrice())
                    .subtotal(subtotal)
                    .status(OrderItemStatus.PENDING)
                    .specialInstructions(itemRequest.getSpecialInstructions())
                    .build();

            orderItemRepository.save(orderItem);
            addedAmount = addedAmount.add(subtotal);
        }

        order.setTotalAmount(order.getTotalAmount().add(addedAmount));
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderItemStatus(UUID orderId, UUID itemId, OrderItemStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Позицію замовлення не знайдено"));

        if (!item.getOrder().getId().equals(orderId)) {
            throw new IllegalArgumentException("Позиція не належить до цього замовлення");
        }

        item.setStatus(status);
        orderItemRepository.save(item);

        // Auto-update order status based on items
        autoUpdateOrderStatus(order);

        return orderRepository.findById(orderId).orElseThrow();
    }

    private void autoUpdateOrderStatus(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        if (items.isEmpty()) return;

        boolean allServed = items.stream().allMatch(i -> i.getStatus() == OrderItemStatus.SERVED);
        boolean allReady = items.stream().allMatch(i ->
                i.getStatus() == OrderItemStatus.READY || i.getStatus() == OrderItemStatus.SERVED);
        boolean anyPreparing = items.stream().anyMatch(i -> i.getStatus() == OrderItemStatus.PREPARING);

        if (allServed) {
            order.setStatus(OrderStatus.SERVED);
        } else if (allReady) {
            order.setStatus(OrderStatus.READY);
        } else if (anyPreparing) {
            order.setStatus(OrderStatus.PREPARING);
        }
        orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));

        order.setStatus(status);
        if (status == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order addOrderItem(UUID orderId, UUID menuItemId, Integer quantity, String specialInstructions) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));
        
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Страву не знайдено"));

        BigDecimal subtotal = menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));
        
        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .menuItem(menuItem)
                .quantity(quantity)
                .price(menuItem.getPrice())
                .subtotal(subtotal)
                .specialInstructions(specialInstructions)
                .build();
        
        orderItemRepository.save(orderItem);
        
        order.setTotalAmount(order.getTotalAmount().add(subtotal));

        return orderRepository.save(order);
    }

    @Transactional
    public Order assignTable(UUID orderId, UUID tableId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Стіл не знайдено"));

        order.setTable(table);

        return orderRepository.save(order);
    }

    @Transactional
    public Order assignReservation(UUID orderId, UUID reservationId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        order.setReservation(reservation);

        return orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private String generateOrderNumber(Restaurant restaurant) {
        String prefix = restaurant.getName().substring(0, Math.min(3, restaurant.getName().length())).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(5);
        return prefix + "-" + timestamp;
    }

    private String buildOrderDetails(Order order) {
        return "Номер замовлення: " + order.getOrderNumber() + "\n" +
               "Ресторан: " + order.getRestaurant().getName() + "\n" +
               "Тип: " + order.getOrderType() + "\n" +
               "Сума: " + order.getTotalAmount() + " грн";
    }
}