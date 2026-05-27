package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.mapper.RestaurantMapper;
import com.restoorderhub.backend.model.dto.request.CreateRestaurantRequest;
import com.restoorderhub.backend.model.dto.request.UpdateRestaurantRequest;
import com.restoorderhub.backend.model.dto.response.RestaurantResponse;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.WorkingHours;
import com.restoorderhub.backend.security.SecurityUtils;
import com.restoorderhub.backend.service.RestaurantService;
import com.restoorderhub.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
@Tag(name = "Restaurants", description = "API для управління ресторанами")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantMapper restaurantMapper;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Список ресторанів з фільтрацією та пагінацією")
    public ResponseEntity<Page<RestaurantResponse>> getAllRestaurants(
            @Parameter(description = "Пошук по назві") @RequestParam(required = false) String search,
            @Parameter(description = "Фільтр по місту")  @RequestParam(required = false) String city,
            @Parameter(description = "Тип кухні")        @RequestParam(required = false) String cuisineType,
            @Parameter(description = "Цінова категорія") @RequestParam(required = false) String priceRange,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(
                restaurantService.searchRestaurants(search, city, cuisineType, priceRange, pageable)
                        .map(restaurantMapper::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable UUID id) {
        return restaurantService.getRestaurantById(id)
                .map(r -> ResponseEntity.ok(restaurantMapper.toResponse(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<List<RestaurantResponse>> getActiveRestaurants() {
        return ResponseEntity.ok(
                restaurantService.getActiveRestaurants()
                        .stream().map(restaurantMapper::toResponse).toList());
    }

    @GetMapping("/my-restaurants")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER', 'CHEF')")
    @Operation(summary = "Ресторани поточного користувача")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants() {
        return ResponseEntity.ok(
                restaurantService.getMyRestaurants()
                        .stream().map(restaurantMapper::toResponse).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request) {
        // Resolve current owner
        var owner = SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .orElseThrow(() -> new com.restoorderhub.backend.exception.UnauthorizedException("Не авторизовано"));

        Restaurant restaurant = restaurantMapper.toEntity(request);
        restaurant.setOwner(owner);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restaurantMapper.toResponse(restaurantService.createRestaurant(restaurant)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRestaurantRequest request) {
        return restaurantService.getRestaurantById(id)
                .map(existing -> {
                    restaurantMapper.updateEntity(request, existing);
                    return ResponseEntity.ok(restaurantMapper.toResponse(
                            restaurantService.updateRestaurant(id, existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deactivateRestaurant(@PathVariable UUID id) {
        if (restaurantService.getRestaurantById(id).isPresent()) {
            restaurantService.deactivateRestaurant(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<RestaurantResponse> activateRestaurant(@PathVariable UUID id) {
        return restaurantService.getRestaurantById(id)
                .map(r -> {
                    restaurantService.activateRestaurant(id);
                    return ResponseEntity.ok(restaurantMapper.toResponse(
                            restaurantService.getRestaurantById(id).orElseThrow()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/working-hours")
    public ResponseEntity<List<WorkingHours>> getWorkingHours(@PathVariable UUID id) {
        return ResponseEntity.ok(restaurantService.getWorkingHours(id));
    }

    @PutMapping("/{id}/working-hours/{day}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<WorkingHours> updateWorkingHours(
            @PathVariable UUID id,
            @PathVariable DayOfWeek day,
            @RequestBody WorkingHours hours) {
        return ResponseEntity.ok(restaurantService.updateWorkingHours(id, day, hours));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getRestaurantStats(@PathVariable UUID id) {
        return ResponseEntity.ok(restaurantService.getRestaurantStats(id));
    }
}
