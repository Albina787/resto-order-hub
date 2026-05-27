package com.restoorderhub.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restoorderhub.backend.model.dto.request.LoginRequest;
import com.restoorderhub.backend.model.dto.request.RegisterRequest;
import com.restoorderhub.backend.model.dto.response.AuthResponse;
import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.MenuItem;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.model.entity.StaffAssignment;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.ConfirmationType;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.StaffPosition;
import com.restoorderhub.backend.model.enums.UserRole;
import com.restoorderhub.backend.repository.CategoryRepository;
import com.restoorderhub.backend.repository.MenuItemRepository;
import com.restoorderhub.backend.repository.OrderRepository;
import com.restoorderhub.backend.repository.ReservationRepository;
import com.restoorderhub.backend.repository.RestaurantRepository;
import com.restoorderhub.backend.repository.RestaurantTableRepository;
import com.restoorderhub.backend.repository.StaffAssignmentRepository;
import com.restoorderhub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Базовий клас для інтеграційних тестів
 * Використовує H2 in-memory базу даних
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    protected record TestUser(User user, String token) {}

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected RestaurantRepository restaurantRepository;

    @Autowired
    protected CategoryRepository categoryRepository;

    @Autowired
    protected RestaurantTableRepository tableRepository;

    @Autowired
    protected MenuItemRepository menuItemRepository;

    @Autowired
    protected ReservationRepository reservationRepository;

    @Autowired
    protected OrderRepository orderRepository;

    @Autowired
    protected StaffAssignmentRepository staffAssignmentRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected String jwtToken;
    protected String clientToken;
    protected String managerToken;
    protected String ownerToken;
    protected String chefToken;
    protected String waiterToken;

    @BeforeEach
    public void setUp() {
        // Базове налаштування перед кожним тестом
        jwtToken = null;
        clientToken = null;
        managerToken = null;
        ownerToken = null;
        chefToken = null;
        waiterToken = null;
    }

    /**
     * Конвертує об'єкт в JSON string
     */
    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    /**
     * Конвертує JSON string в об'єкт
     */
    protected <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return objectMapper.readValue(json, clazz);
    }

    /**
     * Реєстрація користувача та отримання токену
     */
    protected String registerAndLogin(String email, String password, String firstName, String lastName) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName(firstName);
        registerRequest.setLastName(lastName);
        registerRequest.setEmail(email);
        registerRequest.setPassword(password);
        registerRequest.setPhone("+380501234567");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AuthResponse response = fromJson(responseBody, AuthResponse.class);
        return response.getAccessToken();
    }

    /**
     * Логін існуючого користувача
     */
    protected String login(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AuthResponse response = fromJson(responseBody, AuthResponse.class);
        return response.getAccessToken();
    }

    /**
     * Отримання токену для клієнта
     */
    protected String getClientToken() throws Exception {
        if (clientToken == null) {
            clientToken = createAuthenticatedUser(UserRole.CLIENT).token();
        }
        return clientToken;
    }

    /**
     * Отримання токену для менеджера
     */
    protected String getManagerToken() throws Exception {
        if (managerToken == null) {
            managerToken = createAuthenticatedUser(UserRole.MANAGER).token();
        }
        return managerToken;
    }

    /**
     * Отримання токену для власника
     */
    protected String getOwnerToken() throws Exception {
        if (ownerToken == null) {
            ownerToken = createAuthenticatedUser(UserRole.OWNER).token();
        }
        return ownerToken;
    }

    /**
     * Отримання токену для кухаря
     */
    protected String getChefToken() throws Exception {
        if (chefToken == null) {
            chefToken = createAuthenticatedUser(UserRole.CHEF).token();
        }
        return chefToken;
    }

    /**
     * Отримання токену для офіціанта
     */
    protected String getWaiterToken() throws Exception {
        if (waiterToken == null) {
            waiterToken = createAuthenticatedUser(UserRole.WAITER).token();
        }
        return waiterToken;
    }

    protected TestUser createAuthenticatedUser(UserRole role) throws Exception {
        String email = role.name().toLowerCase() + "-" + UUID.randomUUID() + "@test.com";
        String password = "Password123!";
        registerAndLogin(email, password, role.name(), "User");

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setRole(role);
        user.setIsActive(true);
        userRepository.saveAndFlush(user);

        return new TestUser(user, login(email, password));
    }

    protected User createUser(UserRole role) {
        User user = User.builder()
                .email(role.name().toLowerCase() + "-" + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .firstName(role.name())
                .lastName("User")
                .phone("+380501234567")
                .role(role)
                .isEmailVerified(true)
                .isActive(true)
                .build();
        return userRepository.saveAndFlush(user);
    }

    protected Restaurant createTestRestaurant() {
        return createTestRestaurant((User) null);
    }

    protected Restaurant createTestRestaurant(User owner) {
        Restaurant restaurant = Restaurant.builder()
                .name("Test Restaurant " + UUID.randomUUID())
                .address("123 Test Street")
                .city("Kyiv")
                .phone("+380501234567")
                .email("restaurant-" + UUID.randomUUID() + "@test.com")
                .cuisineType("Ukrainian")
                .capacity(50)
                .owner(owner)
                .isActive(true)
                .build();
        return restaurantRepository.saveAndFlush(restaurant);
    }

    protected Restaurant createTestRestaurant(String ignoredToken) {
        return createTestRestaurant();
    }

    protected Category createTestCategory(Restaurant restaurant) {
        Category category = Category.builder()
                .restaurant(restaurant)
                .name("Category " + UUID.randomUUID())
                .description("Test Description")
                .displayOrder(1)
                .isActive(true)
                .build();
        return categoryRepository.saveAndFlush(category);
    }

    protected Category createTestCategory(UUID restaurantId, String ignoredToken) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        return createTestCategory(restaurant);
    }

    protected RestaurantTable createTestTable(Restaurant restaurant) {
        RestaurantTable table = RestaurantTable.builder()
                .restaurant(restaurant)
                .tableNumber("T" + Math.abs(UUID.randomUUID().hashCode()))
                .capacity(4)
                .minCapacity(2)
                .maxCapacity(4)
                .active(true)
                .available(true)
                .build();
        return tableRepository.saveAndFlush(table);
    }

    protected RestaurantTable createTestTable(UUID restaurantId, String ignoredToken) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        return createTestTable(restaurant);
    }

    protected MenuItem createTestMenuItem(Restaurant restaurant, Category category) {
        MenuItem menuItem = MenuItem.builder()
                .restaurant(restaurant)
                .category(category)
                .name("Dish " + UUID.randomUUID())
                .description("Delicious test dish")
                .price(new BigDecimal("150.00"))
                .available(true)
                .popular(false)
                .preparationTime(20)
                .build();
        return menuItemRepository.saveAndFlush(menuItem);
    }

    protected MenuItem createTestMenuItem(UUID restaurantId, UUID categoryId, String ignoredToken) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        return createTestMenuItem(restaurant, category);
    }

    protected Reservation createTestReservation(Restaurant restaurant, User user) {
        return createTestReservation(restaurant, user, null, ReservationStatus.PENDING);
    }

    protected Reservation createTestReservation(Restaurant restaurant, User user, RestaurantTable table, ReservationStatus status) {
        Reservation reservation = Reservation.builder()
                .restaurant(restaurant)
                .user(user)
                .table(table)
                .guestCount(4)
                .reservationDate(LocalDate.now().plusDays(1))
                .reservationTime(LocalTime.of(18, 0))
                .duration(120)
                .status(status)
                .confirmationType(ConfirmationType.AUTO)
                .customerName(user.getFirstName() + " " + user.getLastName())
                .customerPhone(user.getPhone())
                .customerEmail(user.getEmail())
                .build();
        return reservationRepository.saveAndFlush(reservation);
    }

    protected Order createTestOrder(Restaurant restaurant, User user, RestaurantTable table, Reservation reservation,
                                    OrderStatus status, OrderType orderType) {
        Order order = Order.builder()
                .restaurant(restaurant)
                .user(user)
                .createdBy(user)
                .table(table)
                .reservation(reservation)
                .orderNumber("ORD-" + Math.abs(UUID.randomUUID().hashCode()))
                .orderType(orderType)
                .status(status)
                .totalAmount(new BigDecimal("250.00"))
                .notes("Test order")
                .build();
        return orderRepository.saveAndFlush(order);
    }

    protected StaffAssignment createTestStaffAssignment(Restaurant restaurant, User staffUser, User assignedBy,
                                                        StaffPosition position, boolean active) {
        StaffAssignment assignment = StaffAssignment.builder()
                .restaurant(restaurant)
                .user(staffUser)
                .assignedBy(assignedBy)
                .position(position)
                .isActive(active)
                .build();
        return staffAssignmentRepository.saveAndFlush(assignment);
    }
}
