package com.itms.controller;

import com.itms.dto.HrClassDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.HrClassService;
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
@RequestMapping("/api/hr/classes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrClassController {

    private final HrClassService hrClassService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<HrClassDto>>> getAll() {
        return ResponseEntity.ok(ResponseDto.success(hrClassService.getAll(), "HR classes retrieved"));
    }

    @GetMapping("/trainers")
    public ResponseEntity<ResponseDto<List<HrClassDto>>> getTrainers() {
        return ResponseEntity.ok(ResponseDto.success(hrClassService.getTrainers(), "Trainers retrieved"));
    }

    @PostMapping
    public ResponseEntity<ResponseDto<HrClassDto>> create(@RequestBody HrClassDto request) {
        HrClassDto created = hrClassService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(created, "Class created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<HrClassDto>> update(@PathVariable Integer id, @RequestBody HrClassDto request) {
        return ResponseEntity.ok(ResponseDto.success(hrClassService.update(id, request), "Class updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> delete(@PathVariable Integer id) {
        hrClassService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(null, "Class deleted"));
    }
}
