package com.itms.controller;

import com.itms.dto.HrEmployeeDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.HrEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR', 'ADMIN')")
public class HrEmployeeController {

    private final HrEmployeeService hrEmployeeService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<HrEmployeeDto>>> getEmployees(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(ResponseDto.success(
                hrEmployeeService.getEmployees(role, status, keyword),
                "HR employees retrieved"
        ));
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<ResponseDto<Void>> toggleUserStatus(@PathVariable Integer userId) {
        hrEmployeeService.toggleUserStatus(userId);
        return ResponseEntity.ok(ResponseDto.success(null, "User status updated"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ResponseDto<Void>> deleteUser(@PathVariable Integer userId) {
        hrEmployeeService.deleteUser(userId);
        return ResponseEntity.ok(ResponseDto.success(null, "User deleted successfully"));
    }

    @PostMapping("/import")
    public ResponseEntity<ResponseDto<Integer>> importUsers(@RequestBody List<HrEmployeeDto> users) {
        int count = hrEmployeeService.importUsers(users);
        return ResponseEntity.ok(ResponseDto.success(count, "Users imported successfully"));
    }
}
