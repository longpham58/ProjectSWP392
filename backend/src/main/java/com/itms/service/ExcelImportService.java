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
                quizDto.setQuizTitle(getCellValueAsString(quizTitleRow.getCell(1)));
            }
            
            Row descriptionRow = sheet.getRow(1);
            if (descriptionRow != null && descriptionRow.getCell(1) != null) {
                quizDto.setDescription(getCellValueAsString(descriptionRow.getCell(1)));
            }
            
            Row durationRow = sheet.getRow(2);
            if (durationRow != null && durationRow.getCell(1) != null) {
                quizDto.setDurationMinutes((int) durationRow.getCell(1).getNumericCellValue());
            }
            
            Row passingScoreRow = sheet.getRow(3);
            if (passingScoreRow != null && passingScoreRow.getCell(1) != null) {
                quizDto.setPassingScore(passingScoreRow.getCell(1).getNumericCellValue());
            }
            
            // Set defaults
            quizDto.setQuizType("ASSESSMENT");
            quizDto.setMaxAttempts(3);
            quizDto.setRandomizeQuestions(false);
            quizDto.setShowCorrectAnswers(true);
            
            // Read questions starting from row 6 (0-indexed row 5)
            int startRow = 5;
            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                QuizQuestionImportDto question = new QuizQuestionImportDto();
                
                // Column mapping:
                // A: Question Text, B: Option A, C: Option B, D: Option C, E: Option D
                // F: Correct Answer, G: Marks, H: Explanation
                
                Cell questionCell = row.getCell(0);
                if (questionCell == null || getCellValueAsString(questionCell).trim().isEmpty()) {
                    continue; // Skip empty rows
                }
                
                question.setQuestionText(getCellValueAsString(questionCell));
                question.setOptionA(getCellValueAsString(row.getCell(1)));
                question.setOptionB(getCellValueAsString(row.getCell(2)));
                question.setOptionC(getCellValueAsString(row.getCell(3)));
                question.setOptionD(getCellValueAsString(row.getCell(4)));
                question.setCorrectAnswer(getCellValueAsString(row.getCell(5)));
                
                Cell marksCell = row.getCell(6);
                if (marksCell != null) {
                    question.setMarks((int) marksCell.getNumericCellValue());
                } else {
                    question.setMarks(1); // Default marks
                }
                
                question.setExplanation(getCellValueAsString(row.getCell(7)));
                question.setQuestionType("MULTIPLE_CHOICE");
                question.setDisplayOrder(i - startRow + 1);
                
                questions.add(question);
            }
            
            quizDto.setQuestions(questions);
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
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
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
            
            // Convert to byte array
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}