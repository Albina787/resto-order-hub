package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.mapper.MenuItemMapper;
import com.restoorderhub.backend.model.dto.request.CreateMenuItemRequest;
import com.restoorderhub.backend.model.dto.request.UpdateMenuItemRequest;
import com.restoorderhub.backend.model.dto.response.MenuItemResponse;
import com.restoorderhub.backend.model.entity.MenuItem;
import com.restoorderhub.backend.service.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
public class MenuItemController {
    private final MenuItemService menuItemService;
    private final MenuItemMapper menuItemMapper;

    @GetMapping
    public ResponseEntity<Page<MenuItemResponse>> getAllMenuItems(
            @RequestParam(required = false) UUID restaurantId,
            @RequestParam(required = false) UUID categoryId,
            Pageable pageable) {
        Page<MenuItem> menuItems;
        if (restaurantId != null) {
            menuItems = menuItemService.getMenuItemsByRestaurant(restaurantId, pageable);
        } else if (categoryId != null) {
            menuItems = menuItemService.getMenuItemsByCategory(categoryId, pageable);
        } else {
            menuItems = menuItemService.getAllMenuItems(pageable);
        }
        return ResponseEntity.ok(menuItems.map(menuItemMapper::toResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemResponse> getMenuItemById(@PathVariable UUID id) {
        return menuItemService.getMenuItemById(id)
                .map(item -> ResponseEntity.ok(menuItemMapper.toResponse(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByRestaurant(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                menuItemService.getMenuItemsByRestaurant(restaurantId)
                        .stream().map(menuItemMapper::toResponse).toList());
    }

    @GetMapping("/restaurant/{restaurantId}/available")
    public ResponseEntity<List<MenuItemResponse>> getAvailableMenuItems(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                menuItemService.getAvailableMenuItems(restaurantId)
                        .stream().map(menuItemMapper::toResponse).toList());
    }

    @GetMapping("/restaurant/{restaurantId}/popular")
    public ResponseEntity<List<MenuItemResponse>> getPopularMenuItems(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                menuItemService.getPopularMenuItems(restaurantId)
                        .stream().map(menuItemMapper::toResponse).toList());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(
                menuItemService.getMenuItemsByCategory(categoryId)
                        .stream().map(menuItemMapper::toResponse).toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<MenuItemResponse> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItem menuItem = menuItemMapper.toEntity(request);
        MenuItem created = menuItemService.createMenuItem(request.getRestaurantId(), request.getCategoryId(), menuItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMenuItemRequest request) {
        return menuItemService.getMenuItemById(id)
                .map(existing -> {
                    menuItemMapper.updateEntity(request, existing);
                    return ResponseEntity.ok(menuItemMapper.toResponse(menuItemService.updateMenuItem(id, existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-availability")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<MenuItemResponse> toggleAvailability(@PathVariable UUID id) {
        menuItemService.toggleAvailability(id);
        return menuItemService.getMenuItemById(id)
                .map(item -> ResponseEntity.ok(menuItemMapper.toResponse(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-popular")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<MenuItemResponse> togglePopular(@PathVariable UUID id) {
        menuItemService.togglePopular(id);
        return menuItemService.getMenuItemById(id)
                .map(item -> ResponseEntity.ok(menuItemMapper.toResponse(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable UUID id) {
        if (menuItemService.getMenuItemById(id).isPresent()) {
            menuItemService.deleteMenuItem(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
