-- V7__seed_images.sql
-- Add local images to restaurants, menu items, floor plans, and users

-- =====================================================
-- RESTAURANT IMAGES
-- =====================================================

-- Update "Смак" restaurant (Ukrainian cuisine) with images
UPDATE restaurants SET images = '["/images/restaurants/smak/restaurant-1.jpg", "/images/restaurants/smak/restaurant-2.jpg", "/images/restaurants/smak/restaurant-3.jpg"]'
WHERE name = 'Ресторан "Смак"';

-- Update "Мрія" restaurant (European cuisine) with images
UPDATE restaurants SET images = '["/images/restaurants/mriya/restaurant-1.jpg", "/images/restaurants/mriya/restaurant-2.jpg", "/images/restaurants/mriya/restaurant-3.jpg"]'
WHERE name = 'Ресторан "Мрія"';

-- =====================================================
-- MENU ITEM IMAGES - "СМАК" RESTAURANT
-- =====================================================

-- Soups category (category id: 0x05000000000000000000000000000001)
UPDATE menu_items SET images = '["/images/menu/ukrainian/soups/borscht.jpg"]' WHERE name = 'Борщ';
UPDATE menu_items SET images = '["/images/menu/ukrainian/soups/fish-soup.jpg"]' WHERE name = 'Уха';
UPDATE menu_items SET images = '["/images/menu/ukrainian/soups/solyanka.jpg"]' WHERE name = 'Солянка';

-- Main dishes category (category id: 0x05000000000000000000000000000002)
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/varenyky.jpg"]' WHERE name = 'Вареники з картоплею';
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/pork.jpg"]' WHERE name = 'Свинина по-київськи';
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/chicken.jpg"]' WHERE name = 'Курча по- домашньому';
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/steak.jpg"]' WHERE name = 'Стейк з телятини';
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/lagman.jpg"]' WHERE name = 'Лагман';
UPDATE menu_items SET images = '["/images/menu/ukrainian/mains/pelmeni.jpg"]' WHERE name = 'Пельмені зі сметаною';

-- Salads category (category id: 0x05000000000000000000000000000003)
UPDATE menu_items SET images = '["/images/menu/ukrainian/salads/olivie.jpg"]' WHERE name = 'Олів''є';
UPDATE menu_items SET images = '["/images/menu/ukrainian/salads/greek-salad.jpg"]' WHERE name = 'Грецький салат';
UPDATE menu_items SET images = '["/images/menu/ukrainian/salads/caesar.jpg"]' WHERE name = 'Цезар з куркою';
UPDATE menu_items SET images = '["/images/menu/ukrainian/salads/vegetable-salad.jpg"]' WHERE name = 'Овочевий салат';

-- Desserts category (category id: 0x05000000000000000000000000000004)
UPDATE menu_items SET images = '["/images/menu/ukrainian/desserts/napoleon.jpg"]' WHERE name = 'Торт Наполеон';
UPDATE menu_items SET images = '["/images/menu/ukrainian/desserts/cheesecake.jpg"]' WHERE name = 'Чізкейк';
UPDATE menu_items SET images = '["/images/menu/ukrainian/desserts/panna-cotta.jpg"]' WHERE name = 'Панна-кота';

-- Drinks category (category id: 0x05000000000000000000000000000005)
UPDATE menu_items SET images = '["/images/menu/ukrainian/drinks/black-tea.jpg"]' WHERE name = 'Чай чорний';
UPDATE menu_items SET images = '["/images/menu/ukrainian/drinks/espresso.jpg"]' WHERE name = 'Кава еспресо';
UPDATE menu_items SET images = '["/images/menu/ukrainian/drinks/latte.jpg"]' WHERE name = 'Кава латте';
UPDATE menu_items SET images = '["/images/menu/ukrainian/drinks/fresh-juice.jpg"]' WHERE name = 'Сік свіжовижатий';
UPDATE menu_items SET images = '["/images/menu/ukrainian/drinks/kompot.jpg"]' WHERE name = 'Компот';

-- =====================================================
-- MENU ITEM IMAGES - "МРІЯ" RESTAURANT
-- =====================================================

-- Starters category (category id: 0x05000000000000000000000000000006)
UPDATE menu_items SET images = '["/images/menu/european/bruschetta.jpg"]' WHERE name = 'Брускета';
UPDATE menu_items SET images = '["/images/menu/european/soup-of-day.jpg"]' WHERE name = 'Суп дня';

-- Main Course category (category id: 0x05000000000000000000000000000007)
UPDATE menu_items SET images = '["/images/menu/european/beef-tenderloin.jpg"]' WHERE name = 'Філе яловичини';
UPDATE menu_items SET images = '["/images/menu/european/grilled-salmon.jpg"]' WHERE name = 'Лосось на грилі';
UPDATE menu_items SET images = '["/images/menu/european/risotto.jpg"]' WHERE name = 'Різото з грибами';
UPDATE menu_items SET images = '["/images/menu/european/chicken-parmesan.jpg"]' WHERE name = 'Курка Пармезан';

-- Dessert category (category id: 0x05000000000000000000000000000008)
UPDATE menu_items SET images = '["/images/menu/european/tiramisu.jpg"]' WHERE name = 'Тірамісу';
UPDATE menu_items SET images = '["/images/menu/european/panna-cotta.jpg"]' WHERE name = 'Панна-кота';

-- Drinks category (category id: 0x05000000000000000000000000000009)
UPDATE menu_items SET images = '["/images/menu/european/espresso.jpg"]' WHERE name = 'Еспресо';
UPDATE menu_items SET images = '["/images/menu/european/cappuccino.jpg"]' WHERE name = 'Капучино';
UPDATE menu_items SET images = '["/images/menu/european/red-wine.jpg"]' WHERE name = 'Червоне вино (бокал)';
UPDATE menu_items SET images = '["/images/menu/european/white-wine.jpg"]' WHERE name = 'Біле вино (бокал)';
UPDATE menu_items SET images = '["/images/menu/european/sparkling-water.jpg"]' WHERE name = 'Газована вода';

-- =====================================================
-- FLOOR PLAN IMAGES
-- =====================================================

UPDATE floor_plans SET background_image = '/images/floor-plans/main-hall.jpg' WHERE name = 'Main Hall' AND restaurant_id = 0x02000000000000000000000000000001;
UPDATE floor_plans SET background_image = '/images/floor-plans/terrace.jpg' WHERE name = 'Terrace' AND restaurant_id = 0x02000000000000000000000000000001;
UPDATE floor_plans SET background_image = '/images/floor-plans/main-hall.jpg' WHERE name = 'Main Hall' AND restaurant_id = 0x02000000000000000000000000000002;

-- =====================================================
-- USER AVATARS
-- =====================================================

UPDATE users SET avatar = '/images/avatars/avatar-1.jpg' WHERE email = 'owner@restohub.com';
UPDATE users SET avatar = '/images/avatars/avatar-2.jpg' WHERE email = 'manager@restohub.com';
UPDATE users SET avatar = '/images/avatars/avatar-3.jpg' WHERE email = 'waiter@restohub.com';
UPDATE users SET avatar = '/images/avatars/avatar-4.jpg' WHERE email = 'chef@restohub.com';
UPDATE users SET avatar = '/images/avatars/avatar-5.jpg' WHERE email = 'client1@test.com';
UPDATE users SET avatar = '/images/avatars/avatar-6.jpg' WHERE email = 'client2@test.com';
UPDATE users SET avatar = '/images/avatars/avatar-7.jpg' WHERE email = 'client3@test.com';
UPDATE users SET avatar = '/images/avatars/avatar-8.jpg' WHERE email = 'client4@test.com';
