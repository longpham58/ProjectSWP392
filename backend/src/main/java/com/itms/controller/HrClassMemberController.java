package com.itms.controller;

import com.itms.dto.ClassMemberDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.HrClassMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/hr/classes/{classId}/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrClassMemberController {

    private final HrClassMemberService hrClassMemberService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<ClassMemberDto>>> getMembers(@PathVariable Integer classId) {
        return ResponseEntity.ok(ResponseDto.success(hrClassMemberService.getMembers(classId), "Class members retrieved"));
    }

    @GetMapping("/available-employees")
    public ResponseEntity<ResponseDto<List<ClassMemberDto>>> getAvailableEmployees() {
        return ResponseEntity.ok(ResponseDto.success(hrClassMemberService.getAvailableEmployees(), "Available employees retrieved"));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<ResponseDto<ClassMemberDto>> addMember(
            @PathVariable Integer classId,
            @PathVariable Integer userId,
            Authentication auth) {
        Integer addedById = getUserId(auth);
        ClassMemberDto added = hrClassMemberService.addMember(classId, userId, addedById);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(added, "Member added successfully"));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ResponseDto<Void>> removeMember(
            @PathVariable Integer classId,
            @PathVariable Integer memberId) {
        hrClassMemberService.removeMember(classId, memberId);
        return ResponseEntity.ok(ResponseDto.success(null, "Member removed successfully"));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDto<HrClassMemberService.ImportResult>> importFromExcel(
            @PathVariable Integer classId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            Integer addedById = getUserId(auth);
            HrClassMemberService.ImportResult result = hrClassMemberService.importFromExcel(classId, file, addedById);
            
            if (!result.errors().isEmpty()) {
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .body(ResponseDto.success(result, "Import completed with " + result.errors().size() + " errors"));
            }
            return ResponseEntity.ok(ResponseDto.success(result, "Import completed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ResponseDto.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDto.error("Error processing Excel file: " + e.getMessage()));
        }
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] excelBytes = hrClassMemberService.generateTemplate();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Import_Members_Template.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    private Integer getUserId(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser().getId();
        }
        return null;
    }
}
