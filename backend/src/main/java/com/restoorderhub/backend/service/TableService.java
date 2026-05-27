package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.repository.RestaurantRepository;
import com.restoorderhub.backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<RestaurantTable> getAllTablesByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return tableRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public RestaurantTable getTableById(UUID id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));
    }

    @Transactional(readOnly = true)
    public List<RestaurantTable> getAvailableTables(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return tableRepository.findByRestaurantAndAvailableTrue(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantTable> getTablesForCapacity(UUID restaurantId, Integer minCapacity, Integer maxCapacity) {
        return tableRepository.findAvailableTablesForCapacity(restaurantId, minCapacity, maxCapacity);
    }

    @Transactional
    public RestaurantTable createTable(UUID restaurantId, RestaurantTable table) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        
        table.setRestaurant(restaurant);
        table.setActive(true);
        table.setAvailable(true);
        
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable updateTable(UUID id, RestaurantTable updatedTable) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));

        table.setTableNumber(updatedTable.getTableNumber());
        table.setCapacity(updatedTable.getCapacity());
        table.setMinCapacity(updatedTable.getMinCapacity());
        table.setMaxCapacity(updatedTable.getMaxCapacity());
        table.setLocation(updatedTable.getLocation());
        table.setShape(updatedTable.getShape());
        table.setPositionX(updatedTable.getPositionX());
        table.setPositionY(updatedTable.getPositionY());

        return tableRepository.save(table);
    }

    @Transactional
    public void deleteTable(UUID id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));
        tableRepository.delete(table);
    }

    @Transactional
    public RestaurantTable updateTableStatus(UUID id, Boolean isAvailable) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));
        table.setAvailable(isAvailable);
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable activateTable(UUID id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));
        table.setActive(true);
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable deactivateTable(UUID id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Столик", "id", id));
        table.setActive(false);
        return tableRepository.save(table);
    }
}
