package com.itms.service;

import com.itms.dto.QuizImportDto;
import com.itms.dto.QuizQuestionImportDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {

    /**
     * Parse Excel file and return quiz data without creating quiz
     */
    public QuizImportDto parseExcelFile(MultipartFile file) throws IOException {
        return importQuizFromExcel(file);
    }

    public QuizImportDto importQuizFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            QuizImportDto quizDto = new QuizImportDto();
            List<QuizQuestionImportDto> questions = new ArrayList<>();
            
            // Read quiz metadata from first few rows
            Row quizTitleRow = sheet.getRow(0);
            if (quizTitleRow != null && quizTitleRow.getCell(1) != null) {
                quizDto.setQuizTitle(getCellValueAsString(quizTitleRow.getCell(1)).trim());
            }
            
            Row descriptionRow = sheet.getRow(1);
            if (descriptionRow != null && descriptionRow.getCell(1) != null) {
                quizDto.setDescription(getCellValueAsString(descriptionRow.getCell(1)).trim());
            }
            
            Row durationRow = sheet.getRow(2);
            if (durationRow != null && durationRow.getCell(1) != null) {
                try {
                    Cell durationCell = durationRow.getCell(1);
                    if (durationCell.getCellType() == CellType.NUMERIC) {
                        quizDto.setDurationMinutes((int) durationCell.getNumericCellValue());
                    } else {
                        quizDto.setDurationMinutes(Integer.parseInt(getCellValueAsString(durationCell).trim()));
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse duration: {}", e.getMessage());
                    quizDto.setDurationMinutes(60); // Default
                }
            }
            
            Row passingScoreRow = sheet.getRow(3);
            if (passingScoreRow != null && passingScoreRow.getCell(1) != null) {
                try {
                    Cell passingCell = passingScoreRow.getCell(1);
                    if (passingCell.getCellType() == CellType.NUMERIC) {
                        quizDto.setPassingScore(passingCell.getNumericCellValue());
                    } else {
                        quizDto.setPassingScore(Double.parseDouble(getCellValueAsString(passingCell).trim()));
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse passing score: {}", e.getMessage());
                    quizDto.setPassingScore(70.0); // Default
                }
            }
            
            // Set defaults
            quizDto.setQuizType("ASSESSMENT");
            quizDto.setMaxAttempts(3);
            quizDto.setRandomizeQuestions(false);
            quizDto.setShowCorrectAnswers(true);
            
            // Read questions starting from row 7 in Excel (0-indexed row 6)
            // Row 0: Quiz Title, Row 1: Desc, Row 2: Duration, Row 3: Passing Score
            // Row 4: Instructions, Row 5: Column headers, Row 6+: Actual questions
            int startRow = 6;
            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                // Column mapping:
                // A: Question Text, B: Option A, C: Option B, D: Option C, E: Option D
                // F: Correct Answer, G: Marks, H: Explanation
                
                Cell questionCell = row.getCell(0);
                String questionText = getCellValueAsString(questionCell).trim();
                
                if (questionText.isEmpty()) {
                    log.info("Skipping empty question row: {}", i + 1);
                    continue; // Skip empty rows
                }
                
                QuizQuestionImportDto question = new QuizQuestionImportDto();
                question.setQuestionText(questionText);
                question.setOptionA(getCellValueAsString(row.getCell(1)).trim());
                question.setOptionB(getCellValueAsString(row.getCell(2)).trim());
                question.setOptionC(getCellValueAsString(row.getCell(3)).trim());
                question.setOptionD(getCellValueAsString(row.getCell(4)).trim());
                question.setCorrectAnswer(getCellValueAsString(row.getCell(5)).trim().toUpperCase());
                
                Cell marksCell = row.getCell(6);
                if (marksCell != null) {
                    try {
                        if (marksCell.getCellType() == CellType.NUMERIC) {
                            question.setMarks((int) marksCell.getNumericCellValue());
                        } else {
                            question.setMarks(Integer.parseInt(getCellValueAsString(marksCell).trim()));
                        }
                    } catch (Exception e) {
                        question.setMarks(1);
                    }
                } else {
                    question.setMarks(1); // Default marks
                }
                
                question.setExplanation(getCellValueAsString(row.getCell(7)).trim());
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setDisplayOrder(questions.size() + 1);
                
                questions.add(question);
            }
            
            quizDto.setQuestions(questions);
            log.info("Successfully parsed {} questions from Excel", questions.size());
            return quizDto;
        }
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double val = cell.getNumericCellValue();
                    if (val == (long) val) {
                        return String.valueOf((long) val);
                    }
                    return String.valueOf(val);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
    
    public byte[] generateExcelTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Quiz Template");
            
            // Create header rows for quiz metadata
            Row titleRow = sheet.createRow(0);
            titleRow.createCell(0).setCellValue("Quiz Title:");
            titleRow.createCell(1).setCellValue("Sample Quiz Title");
            
            Row descRow = sheet.createRow(1);
            descRow.createCell(0).setCellValue("Description:");
            descRow.createCell(1).setCellValue("Sample quiz description");
            
            Row durationRow = sheet.createRow(2);
            durationRow.createCell(0).setCellValue("Duration (minutes):");
            durationRow.createCell(1).setCellValue(60);
            
            Row passingRow = sheet.createRow(3);
            passingRow.createCell(0).setCellValue("Passing Score (%):");
            passingRow.createCell(1).setCellValue(70);
            
            // Empty row
            sheet.createRow(4);
            
            // Create header row for questions
            Row headerRow = sheet.createRow(5);
            headerRow.createCell(0).setCellValue("Question Text");
            headerRow.createCell(1).setCellValue("Option A");
            headerRow.createCell(2).setCellValue("Option B");
            headerRow.createCell(3).setCellValue("Option C");
            headerRow.createCell(4).setCellValue("Option D");
            headerRow.createCell(5).setCellValue("Correct Answer (A/B/C/D)");
            headerRow.createCell(6).setCellValue("Marks");
            headerRow.createCell(7).setCellValue("Explanation");
            
            // Add sample question
            Row sampleRow = sheet.createRow(6);
            sampleRow.createCell(0).setCellValue("What is Java?");
            sampleRow.createCell(1).setCellValue("A programming language");
            sampleRow.createCell(2).setCellValue("A coffee brand");
            sampleRow.createCell(3).setCellValue("An island");
            sampleRow.createCell(4).setCellValue("A framework");
            sampleRow.createCell(5).setCellValue("A");
            sampleRow.createCell(6).setCellValue(1);
            sampleRow.createCell(7).setCellValue("Java is a popular programming language");
            
            // Auto-size columns
            for (int i = 0; i < 8; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Add some styling to headers if possible (POI basics)
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Apply style to question headers
            for (int i = 0; i < 8; i++) {
                headerRow.getCell(i).setCellStyle(headerStyle);
            }
            
            // Add helpful instruction row
            Row instructionRow = sheet.createRow(4);
            instructionRow.createCell(0).setCellValue("Fill in quiz metadata above, then add questions starting from row 7. Correct Answer must be 'A', 'B', 'C', or 'D'.");
            
            // Convert to byte array
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}