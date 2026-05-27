package com.restoorderhub.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String email, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Підтвердження email - RestoOrderHub");
            message.setText("Вітаємо!\n\n" +
                    "Для підтвердження вашого email перейдіть за посиланням:\n" +
                    "https://resto-order-hub.com/verify?token=" + verificationToken + "\n\n" +
                    "Якщо ви не реєструвалися, ігноруйте цей лист.");
            mailSender.send(message);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Відновлення паролю - RestoOrderHub");
            message.setText("Вітаємо!\n\n" +
                    "Для відновлення паролю перейдіть за посиланням:\n" +
                    "https://resto-order-hub.com/reset-password?token=" + resetToken + "\n\n" +
                    "Посилання діє 24 години.\n" +
                    "Якщо ви не записували відновлення паролю, ігноруйте цей лист.");
            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendReservationConfirmationEmail(String email, String reservationDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Підтвердження бронювання - RestoOrderHub");
            message.setText("Ваше бронювання підтверджено!\n\n" +
                    reservationDetails + "\n\n" +
                    "До зустрічі в ресторані!");
            mailSender.send(message);
            log.info("Reservation confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send reservation confirmation email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendReservationCancellationEmail(String email, String cancellationDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Скасування бронювання - RestoOrderHub");
            message.setText("Ваше бронювання скасовано.\n\n" +
                    cancellationDetails + "\n\n" +
                    "Якщо це помилка, зверніться до менеджера ресторану.");
            mailSender.send(message);
            log.info("Reservation cancellation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send reservation cancellation email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendOrderConfirmationEmail(String email, String orderDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Замовлення підтверджено - RestoOrderHub");
            message.setText("Дякуємо за замовлення!\n\n" +
                    orderDetails + "\n\n" +
                    "Ваше замовлення прийнято і готується.");
            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {}: {}", email, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String email, String firstName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Ласкаво просимо до RestoOrderHub!");
            message.setText("Вітаємо, " + firstName + "!\n\n" +
                    "Дякуємо за реєстрацію в RestoOrderHub.\n\n" +
                    "Тепер ви можете:\n" +
                    "- Бронювати столики в улюблених ресторанах\n" +
                    "- Замовляти страви заздалегідь\n" +
                    "- Переглядати історію відвідувань\n\n" +
                    "Бажаємо вам приємного досвіду!");
            mailSender.send(message);
            log.info("Welcome email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", email, e.getMessage());
        }
    }
}