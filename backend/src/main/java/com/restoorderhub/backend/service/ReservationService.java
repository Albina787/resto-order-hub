package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.BadRequestException;
import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.dto.request.PreOrderItemRequest;
import com.restoorderhub.backend.model.entity.*;
import com.restoorderhub.backend.model.enums.ConfirmationType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.repository.*;
import com.restoorderhub.backend.service.TableAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;
    private final MenuItemRepository menuItemRepository;
    private final PreOrderItemRepository preOrderItemRepository;
    private final TableAvailabilityService tableAvailabilityService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Reservation> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Reservation> getReservationById(UUID id) {
        return reservationRepository.findByIdWithDetails(id);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return reservationRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public Page<Reservation> getReservationsByRestaurant(UUID restaurantId, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return reservationRepository.findByRestaurant(restaurant, pageable);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return reservationRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Page<Reservation> getReservationsByUser(UUID userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return reservationRepository.findByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Reservation> getReservationsByRestaurantAndStatus(UUID restaurantId, ReservationStatus status, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return reservationRepository.findByRestaurantAndStatus(restaurant, status, pageable);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByRestaurantAndDate(UUID restaurantId, LocalDate date) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return reservationRepository.findByRestaurantAndReservationDate(restaurant, date);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByRestaurantAndStatus(UUID restaurantId, ReservationStatus status) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return reservationRepository.findByRestaurantAndStatus(restaurant, status);
    }

    @Transactional
    public Reservation createReservation(Reservation reservation, UUID restaurantId, UUID userId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reservationDateTime = reservation.getReservationDate()
                .atTime(reservation.getReservationTime());

        if (reservationDateTime.isBefore(now.plusHours(1))) {
            throw new BadRequestException("Бронювання має бути щонайменше за 1 годину від поточного часу");
        }
        if (reservation.getReservationDate().isAfter(now.toLocalDate().plusDays(90))) {
            throw new BadRequestException("Бронювання має бути не пізніше ніж 90 днів від поточної дати");
        }

        // Check working hours
        if (!tableAvailabilityService.isRestaurantOpen(restaurantId,
                reservation.getReservationDate(), reservation.getReservationTime())) {
            throw new BadRequestException("Ресторан не працює в обраний час");
        }

        int duration = reservation.getDuration() != null ? reservation.getDuration() : 120;

        // Find optimal table using availability service (with pessimistic lock inside)
        RestaurantTable optimalTable = tableAvailabilityService.findOptimalTable(
                restaurantId,
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getGuestCount(),
                duration,
                reservation.getSpecialRequests()
        );

        reservation.setRestaurant(restaurant);
        reservation.setUser(user);
        reservation.setDuration(duration);

        if (optimalTable != null) {
            reservation.setTable(optimalTable);
            // Auto-confirm for <= 8 guests
            if (reservation.getGuestCount() <= 8) {
                reservation.setStatus(ReservationStatus.CONFIRMED);
                reservation.setConfirmationType(ConfirmationType.AUTO);
                reservation.setConfirmedAt(LocalDateTime.now());
            } else {
                reservation.setStatus(ReservationStatus.PENDING);
                reservation.setConfirmationType(ConfirmationType.MANUAL);
            }
        } else {
            reservation.setStatus(ReservationStatus.PENDING);
            reservation.setConfirmationType(ConfirmationType.MANUAL);
        }

        Reservation saved = reservationRepository.save(reservation);
        if (saved.getStatus() == ReservationStatus.CONFIRMED) {
            emailService.sendReservationConfirmationEmail(
                    saved.getCustomerEmail(), buildReservationDetails(saved));
        }
        return saved;
    }

    @Transactional
    public Reservation createReservationWithPreOrder(Reservation reservation, UUID restaurantId, UUID userId, 
                                                     List<PreOrderItemRequest> preOrderItemRequests) {
        // Create reservation first
        Reservation savedReservation = createReservation(reservation, restaurantId, userId);
        
        // Process pre-order items if provided
        if (preOrderItemRequests != null && !preOrderItemRequests.isEmpty()) {
            List<PreOrderItem> preOrderItems = new ArrayList<>();
            
            for (PreOrderItemRequest itemRequest : preOrderItemRequests) {
                MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Страву не знайдено"));
                
                // Validate menu item belongs to the same restaurant
                if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
                    throw new IllegalArgumentException("Страва не належить до цього ресторану");
                }
                
                // Validate menu item is available
                if (!menuItem.getAvailable()) {
                    throw new IllegalArgumentException("Страва " + menuItem.getName() + " недоступна");
                }
                
                PreOrderItem preOrderItem = PreOrderItem.builder()
                        .reservation(savedReservation)
                        .menuItem(menuItem)
                        .quantity(itemRequest.getQuantity())
                        .price(menuItem.getPrice())
                        .specialInstructions(itemRequest.getSpecialInstructions())
                        .build();
                
                preOrderItems.add(preOrderItem);
            }
            
            // Save all pre-order items
            preOrderItemRepository.saveAll(preOrderItems);
            savedReservation.setPreOrderItems(preOrderItems);
        }
        
        return savedReservation;
    }

    @Transactional
    public Reservation confirmReservation(UUID reservationId, UUID confirmedById) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        User confirmedBy = userRepository.findById(confirmedById)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));

        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setConfirmedAt(LocalDateTime.now());
        reservation.setConfirmedBy(confirmedBy);

        Reservation saved = reservationRepository.save(reservation);
        emailService.sendReservationConfirmationEmail(
                saved.getCustomerEmail(), buildReservationDetails(saved));
        return saved;
    }

    @Transactional
    public Reservation cancelReservation(UUID reservationId, User requestingUser, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Бронювання вже скасовано");
        }
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new IllegalArgumentException("Не можна скасувати завершене бронювання");
        }

        // Clients can only cancel at least 24 hours before
        boolean isStaff = requestingUser.getRole() == com.restoorderhub.backend.model.enums.UserRole.MANAGER
                || requestingUser.getRole() == com.restoorderhub.backend.model.enums.UserRole.OWNER;

        if (!isStaff) {
            LocalDateTime reservationDateTime = reservation.getReservationDate()
                    .atTime(reservation.getReservationTime());
            if (LocalDateTime.now().isAfter(reservationDateTime.minusHours(24))) {
                throw new IllegalArgumentException(
                        "Скасування можливе не пізніше ніж за 24 години до бронювання");
            }
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        emailService.sendReservationCancellationEmail(
                saved.getCustomerEmail(), buildCancellationDetails(saved));
        return saved;
    }

    // Keep old signature for backward compatibility with scheduler/internal calls
    @Transactional
    public Reservation cancelReservation(UUID reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(LocalDateTime.now());
        Reservation saved = reservationRepository.save(reservation);
        emailService.sendReservationCancellationEmail(
                saved.getCustomerEmail(), buildCancellationDetails(saved));
        return saved;
    }

    @Transactional
    public Reservation markNoShow(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalArgumentException("Позначити як 'не з'явився' можна лише підтверджене бронювання");
        }

        reservation.setStatus(ReservationStatus.NO_SHOW);
        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public Page<Reservation> getReservationsByUserAndStatus(UUID userId, ReservationStatus status, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувача не знайдено"));
        return reservationRepository.findByUserAndStatus(user, status, pageable);
    }

    @Transactional
    public Reservation completeReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        reservation.setStatus(ReservationStatus.COMPLETED);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation assignTable(UUID reservationId, UUID tableId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Стіл не знайдено"));

        reservation.setTable(table);

        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation updateReservation(UUID id, Reservation updatedReservation) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Бронювання не знайдено"));

        reservation.setGuestCount(updatedReservation.getGuestCount());
        reservation.setReservationDate(updatedReservation.getReservationDate());
        reservation.setReservationTime(updatedReservation.getReservationTime());
        reservation.setDuration(updatedReservation.getDuration());
        reservation.setConfirmationType(updatedReservation.getConfirmationType());
        reservation.setSpecialRequests(updatedReservation.getSpecialRequests());
        reservation.setCustomerName(updatedReservation.getCustomerName());
        reservation.setCustomerPhone(updatedReservation.getCustomerPhone());
        reservation.setCustomerEmail(updatedReservation.getCustomerEmail());

        return reservationRepository.save(reservation);
    }

    // --- Email helper methods ---

    private String buildReservationDetails(Reservation r) {
        return "Ресторан: " + r.getRestaurant().getName() + "\n" +
               "Дата: " + r.getReservationDate() + "\n" +
               "Час: " + r.getReservationTime() + "\n" +
               "Кількість гостей: " + r.getGuestCount();
    }

    private String buildCancellationDetails(Reservation r) {
        return "Ресторан: " + r.getRestaurant().getName() + "\n" +
               "Дата: " + r.getReservationDate() + "\n" +
               "Час: " + r.getReservationTime() + "\n" +
               "Причина скасування: " + (r.getCancellationReason() != null ? r.getCancellationReason() : "не вказано");
    }
}