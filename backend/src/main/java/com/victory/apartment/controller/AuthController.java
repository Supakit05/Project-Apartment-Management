package com.victory.apartment.controller;

import com.victory.apartment.model.AppUser;
import com.victory.apartment.repository.AppUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepo;

    public AuthController(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim().toLowerCase();
        String password = credentials.getOrDefault("password", "").trim();

        Map<String, Object> response = new HashMap<>();

        // Admin authentication
        if ((email.equals("admin") || email.equals("admin@victoryapartment.com")) && password.equals("admin")) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", "usr-admin-01");
            userMap.put("fullname", "Victory Admin");
            userMap.put("email", "admin@victoryapartment.com");
            userMap.put("role", "admin");
            response.put("success", true);
            response.put("user", userMap);
            return ResponseEntity.ok(response);
        }

        // Database user authentication (by email)
        Optional<AppUser> dbUserOpt = userRepo.findByEmail(email);
        if (dbUserOpt.isPresent() && dbUserOpt.get().getPassword().equals(password)) {
            AppUser dbUser = dbUserOpt.get();
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", dbUser.getId());
            userMap.put("fullname", dbUser.getFullname());
            userMap.put("email", dbUser.getEmail());
            userMap.put("role", dbUser.getRole());
            response.put("success", true);
            response.put("user", userMap);
            return ResponseEntity.ok(response);
        }

        response.put("success", false);
        response.put("error", "Invalid email or password.");
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> data) {
        String fullname = data.getOrDefault("fullname", "User").trim();
        String email = data.getOrDefault("email", "").trim().toLowerCase();
        String password = data.getOrDefault("password", "").trim();
        String phone = data.getOrDefault("phone", "").trim();

        Map<String, Object> response = new HashMap<>();

        if (email.isEmpty() || password.isEmpty()) {
            response.put("success", false);
            response.put("error", "Fullname, email, and password are required.");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepo.existsByEmail(email)) {
            response.put("success", false);
            response.put("error", "Email is already registered. Please log in.");
            return ResponseEntity.badRequest().body(response);
        }

        AppUser newUser = new AppUser("usr-" + UUID.randomUUID().toString().substring(0, 8), email, password, fullname, phone, "customer");
        AppUser saved = userRepo.save(newUser);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", saved.getId());
        userMap.put("fullname", saved.getFullname());
        userMap.put("email", saved.getEmail());
        userMap.put("role", saved.getRole());

        response.put("success", true);
        response.put("user", userMap);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> data) {
        String email = data.getOrDefault("email", "").trim().toLowerCase();
        String fullname = data.getOrDefault("fullname", "").trim();
        String phone = data.getOrDefault("phone", "").trim();

        Map<String, Object> response = new HashMap<>();
        if (email.isEmpty() || fullname.isEmpty()) {
            response.put("success", false);
            response.put("error", "Email and fullname are required.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<AppUser> dbUserOpt = userRepo.findByEmail(email);
        if (dbUserOpt.isPresent()) {
            AppUser user = dbUserOpt.get();
            user.setFullname(fullname);
            if (!phone.isEmpty()) {
                user.setPhone(phone);
            }
            AppUser saved = userRepo.save(user);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", saved.getId());
            userMap.put("fullname", saved.getFullname());
            userMap.put("email", saved.getEmail());
            userMap.put("phone", saved.getPhone());
            userMap.put("role", saved.getRole());

            response.put("success", true);
            response.put("user", userMap);
            return ResponseEntity.ok(response);
        }

        // Admin fallback
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", "usr-admin-01");
        userMap.put("fullname", fullname);
        userMap.put("email", email);
        userMap.put("phone", phone);
        userMap.put("role", "admin");

        response.put("success", true);
        response.put("user", userMap);
        return ResponseEntity.ok(response);
    }
}
