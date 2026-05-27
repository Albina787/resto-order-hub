package com.restoorderhub.backend.scheduler;

import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.repository.RefreshTokenRepository;
import com.restoorderhub.backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Видаляє прострочені refresh tokens щогодини.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanExpiredRefreshTokens() {
        log.info("Cleaning expired refresh tokens");
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Expired refresh tokens cleaned");
    }

    /**
     * Автоматично завершує підтверджені бронювання, час яких минув.
     * Запускається кожні 15 хвилин.
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void autoCompleteExpiredReservations() {
        log.info("Auto-completing expired reservations");

        LocalDateTime now = LocalDateTime.now();

        // Find CONFIRMED reservations where (date + time + duration) < now
        List<com.restoorderhub.backend.model.entity.Reservation> confirmed =
                reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

        int completed = 0;
        for (var reservation : confirmed) {
            LocalDateTime endTime = LocalDateTime.of(
                    reservation.getReservationDate(),
                    reservation.getReservationTime()
            ).plusMinutes(reservation.getDuration());

            if (endTime.isBefore(now)) {
                reservation.setStatus(ReservationStatus.COMPLETED);
                reservationRepository.save(reservation);
                completed++;
            }
        }

        if (completed > 0) {
            log.info("Auto-completed {} reservations", completed);
        }
    }

    /**
     * Позначає як NO_SHOW бронювання, де клієнт не з'явився (30 хв після початку).
     * Запускається кожні 15 хвилин.
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void autoMarkNoShow() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);

        List<com.restoorderhub.backend.model.entity.Reservation> pending =
                reservationRepository.findByStatus(ReservationStatus.CONFIRMED);

        int noShow = 0;
        for (var reservation : pending) {
            LocalDateTime startTime = LocalDateTime.of(
                    reservation.getReservationDate(),
                    reservation.getReservationTime()
            );
            // If reservation started more than 30 min ago and still CONFIRMED — mark NO_SHOW
            if (startTime.isBefore(threshold)) {
                reservation.setStatus(ReservationStatus.NO_SHOW);
                reservationRepository.save(reservation);
                noShow++;
            }
        }

        if (noShow > 0) {
            log.info("Auto-marked {} reservations as NO_SHOW", noShow);
        }
    }
}
