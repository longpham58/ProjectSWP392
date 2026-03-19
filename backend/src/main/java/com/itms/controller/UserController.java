package com.itms.controller;

import com.itms.dto.UserDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<UserDto>>> getUsers() {
        return ResponseEntity.ok(ResponseDto.success(userService.getUsers(), "Users retrieved successfully"));
    }

    @PostMapping("/import")
    public ResponseEntity<ResponseDto<Integer>> importUsers(@RequestParam("file") MultipartFile file) {
        try {

            int count = userService.importUsers(file);
            return ResponseEntity.ok(ResponseDto.success(count, "Users imported successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDto.fail("Failed to import users: " + e.getMessage()));
        }
    }

    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<ResponseDto<Void>> toggleUserStatus(@PathVariable("userId") Integer userId) {
        userService.toggleUserStatus(userId);
        return ResponseEntity.ok(ResponseDto.success(null, "User status updated successfully"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ResponseDto<Void>> deleteUser(@PathVariable("userId") Integer userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ResponseDto.success(null, "User deleted successfully"));
    }
}
