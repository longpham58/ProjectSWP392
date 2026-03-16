package com.itms.controller;

import com.itms.dto.HrEmployeeDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.HrEmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
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
}
