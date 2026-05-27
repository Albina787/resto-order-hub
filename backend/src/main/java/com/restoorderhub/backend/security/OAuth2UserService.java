package com.restoorderhub.backend.security;

import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.AuthProvider;
import com.restoorderhub.backend.model.enums.UserRole;
import com.restoorderhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider authProvider = resolveProvider(registrationId);

        String email      = oAuth2User.getAttribute("email");
        String firstName  = oAuth2User.getAttribute("given_name");
        String lastName   = oAuth2User.getAttribute("family_name");
        String providerId = oAuth2User.getName(); // sub / id from provider

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        log.info("OAuth2 login: email={}, provider={}", email, registrationId);

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update provider info if user previously registered via LOCAL
            if (user.getAuthProvider() == AuthProvider.LOCAL) {
                user.setAuthProvider(authProvider);
                user.setProviderId(providerId);
                userRepository.save(user);
            }
            log.info("Existing user found: {}", email);
        } else {
            user = User.builder()
                    .email(email)
                    .firstName(firstName != null ? firstName : "")
                    .lastName(lastName != null ? lastName : "")
                    .role(UserRole.CLIENT)
                    .isActive(true)
                    .isEmailVerified(true)
                    .authProvider(authProvider)
                    .providerId(providerId)
                    .build();
            user = userRepository.save(user);
            log.info("New OAuth2 user created: {}", email);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }

    private AuthProvider resolveProvider(String registrationId) {
        return switch (registrationId.toLowerCase()) {
            case "google"   -> AuthProvider.GOOGLE;
            case "facebook" -> AuthProvider.FACEBOOK;
            default         -> throw new OAuth2AuthenticationException(
                    "Unsupported OAuth2 provider: " + registrationId);
        };
    }
}
