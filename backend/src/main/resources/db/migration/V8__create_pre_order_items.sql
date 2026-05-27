-- Create pre_order_items table
CREATE TABLE IF NOT EXISTS pre_order_items (
    id BINARY(16) PRIMARY KEY,
    reservation_id BINARY(16) NOT NULL,
    menu_item_id BINARY(16) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pre_order_items_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_pre_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
    INDEX idx_pre_order_items_reservation (reservation_id),
    INDEX idx_pre_order_items_menu_item (menu_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
