package com.itms.service;

import com.itms.dto.ClassMemberDto;
import com.itms.entity.ClassMember;
import com.itms.entity.ClassRoom;
import com.itms.entity.User;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrClassMemberService {

    private final ClassMemberRepository classMemberRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;

    /** List all members of a class */
    public List<ClassMemberDto> getMembers(Integer classId) {
        return classMemberRepository.findByClassRoomId(classId).stream()
                .map(this::toDto)
                .toList();
    }

    /** List all employees (role=EMPLOYEE) available to add */
    public List<ClassMemberDto> getAvailableEmployees() {
        return userRepository.findAllActiveEmployees().stream()
                .map(u -> ClassMemberDto.builder()
                        .userId(u.getId())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .build())
                .toList();
    }

    /** Add a single employee to a class */
    @Transactional
    public ClassMemberDto addMember(Integer classId, Integer userId, Integer addedById) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp với id: " + classId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với id: " + userId));

        if (classMemberRepository.existsByClassRoomIdAndUserId(classId, userId)) {
            throw new IllegalArgumentException("Học viên đã có trong lớp này");
        }

        // Check max students
        if (classRoom.getMaxStudents() != null) {
            long current = classMemberRepository.countByClassRoomIdAndStatus(classId, "ACTIVE");
            if (current >= classRoom.getMaxStudents()) {
                throw new IllegalArgumentException("Lớp đã đạt sĩ số tối đa (" + classRoom.getMaxStudents() + ")");
            }
        }

        User addedBy = addedById != null ? userRepository.findById(addedById).orElse(null) : null;

        ClassMember member = ClassMember.builder()
                .classRoom(classRoom)
                .user(user)
                .status("ACTIVE")
                .joinedAt(LocalDateTime.now())
                .addedBy(addedBy)
                .build();

        return toDto(classMemberRepository.save(member));
    }

    /** Remove a member from a class */
    @Transactional
    public void removeMember(Integer classId, Integer memberId) {
        ClassMember member = classMemberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy học viên với id: " + memberId));
        if (!member.getClassRoom().getId().equals(classId)) {
            throw new IllegalArgumentException("Học viên không thuộc lớp này");
        }
        classMemberRepository.delete(member);
    }

    /** Import members from Excel file. Expected columns: username or email */
    @Transactional
    public ImportResult importFromExcel(Integer classId, MultipartFile file, Integer addedById) throws IOException {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp với id: " + classId));

        User addedBy = addedById != null ? userRepository.findById(addedById).orElse(null) : null;

        List<String> errors = new ArrayList<>();
        int added = 0;
        int skipped = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            // Row 0 = header, data starts at row 1
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String identifier = getCellString(row.getCell(0)).trim();
                if (identifier.isEmpty()) continue;

                // Try find by username first, then email
                User user = userRepository.findByUsername(identifier)
                        .or(() -> userRepository.findByEmail(identifier))
                        .orElse(null);

                if (user == null) {
                    errors.add("Dòng " + (i + 1) + ": Không tìm thấy người dùng '" + identifier + "'");
                    skipped++;
                    continue;
                }

                if (classMemberRepository.existsByClassRoomIdAndUserId(classId, user.getId())) {
                    errors.add("Dòng " + (i + 1) + ": '" + identifier + "' đã có trong lớp");
                    skipped++;
                    continue;
                }

                if (classRoom.getMaxStudents() != null) {
                    long current = classMemberRepository.countByClassRoomIdAndStatus(classId, "ACTIVE");
                    if (current >= classRoom.getMaxStudents()) {
                        errors.add("Dòng " + (i + 1) + ": Lớp đã đạt sĩ số tối đa");
                        skipped++;
                        continue;
                    }
                }

                ClassMember member = ClassMember.builder()
                        .classRoom(classRoom)
                        .user(user)
                        .status("ACTIVE")
                        .joinedAt(LocalDateTime.now())
                        .addedBy(addedBy)
                        .build();
                classMemberRepository.save(member);
                added++;
            }
        }

        return new ImportResult(added, skipped, errors);
    }

    /** Generate Excel template for import */
    public byte[] generateTemplate() throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách học viên");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Username hoặc Email");
            header.createCell(1).setCellValue("Ghi chú (không bắt buộc)");

            Row sample = sheet.createRow(1);
            sample.createCell(0).setCellValue("employee01");
            sample.createCell(1).setCellValue("Học viên mẫu");

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private ClassMemberDto toDto(ClassMember cm) {
        return ClassMemberDto.builder()
                .id(cm.getId())
                .classId(cm.getClassRoom().getId())
                .classCode(cm.getClassRoom().getClassCode())
                .userId(cm.getUser().getId())
                .username(cm.getUser().getUsername())
                .fullName(cm.getUser().getFullName())
                .email(cm.getUser().getEmail())
                .status(cm.getStatus())
                .joinedAt(cm.getJoinedAt())
                .notes(cm.getNotes())
                .build();
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

    public record ImportResult(int added, int skipped, List<String> errors) {}
}
