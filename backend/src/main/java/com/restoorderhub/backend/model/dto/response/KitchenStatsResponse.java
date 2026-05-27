package com.restoorderhub.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KitchenStatsResponse {
    private Long totalOrders;
    private Long completedOrders;
    private Long activeOrders;
    private Double averagePreparationTime;
    private List<PopularItem> topItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopularItem {
        private String name;
        private Long count;
    }
}
