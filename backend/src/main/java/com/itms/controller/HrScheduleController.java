package com.itms.controller;

import com.itms.dto.HrScheduleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.HrScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hr/schedules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrScheduleController {

    private final HrScheduleService hrScheduleService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<HrScheduleDto>>> getAll() {
        return ResponseEntity.ok(ResponseDto.success(hrScheduleService.getAll(), "HR schedules retrieved"));
    }

    @PostMapping
    public ResponseEntity<ResponseDto<HrScheduleDto>> create(@RequestBody HrScheduleDto request) {
        HrScheduleDto created = hrScheduleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResponseDto.success(created, "Schedule created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<HrScheduleDto>> update(@PathVariable("id") Long id, @RequestBody HrScheduleDto request) {
        HrScheduleDto updated = hrScheduleService.update(id, request);
        return ResponseEntity.ok(ResponseDto.success(updated, "Schedule updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> delete(@PathVariable("id") Long id) {
        hrScheduleService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(null, "Schedule deleted"));
    }
}
