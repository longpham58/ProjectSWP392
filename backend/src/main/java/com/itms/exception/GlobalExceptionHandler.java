package com.itms.exception;


import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;


import java.util.Map;
import java.util.Objects;


@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ResponseEntity<Map<String, String>> error(HttpStatusCode status, String code, String message) {
        HttpStatusCode safeStatus = Objects.requireNonNull(status);
        return ResponseEntity.status(safeStatus)
                .body(Map.of(
                        "error", code,
                        "message", message
                ));
    }

    // 404 - URL không tồn tại
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNotFound(NoResourceFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND", "API không tồn tại");
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<?> handleEntityNotFound(EntityNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Dữ liệu không hợp lệ");
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return error(HttpStatus.CONFLICT, "DATA_CONFLICT", "Dữ liệu đã tồn tại hoặc không hợp lệ");
    }

    @ExceptionHandler(InvalidDataAccessResourceUsageException.class)
    public ResponseEntity<?> handleInvalidDataAccessResource(InvalidDataAccessResourceUsageException ex) {
        String message = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();
        log.error("DB resource usage error: {}", message, ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "DB_ERROR", resolveDatabaseMessage(message));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccess(DataAccessException ex) {
        String message = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();
        log.error("DB access error: {}", message, ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "DB_ERROR", resolveDatabaseMessage(message));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", "Phương thức không được hỗ trợ");
    }

    // fallback 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "SERVER_ERROR", "Lỗi hệ thống");
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(Exception ex) {
        return error(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền truy cập");
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<?> handleAuthenticationRequired(AuthenticationCredentialsNotFoundException ex) {
        return error(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Bạn chưa đăng nhập");
    }

    @ExceptionHandler(OtpException.class)
    public ResponseEntity<?> handleOtp(OtpException ex) {
        return error(HttpStatus.BAD_REQUEST, "OTP_ERROR", ex.getMessage());
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<?> handleAccountLocked(AccountLockedException ex) {
        return ResponseEntity.status(HttpStatus.LOCKED)
                .body(Map.of(
                        "error", "ACCOUNT_LOCKED",
                        "message", ex.getMessage(),
                        "lockedUntil", ex.getLockedUntil() != null ? ex.getLockedUntil().toString() : ""
                ));
    }

    // 400 - runtime business errors
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return error(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    private String resolveDatabaseMessage(String rawMessage) {
        if (rawMessage == null || rawMessage.isBlank()) {
            return "Lỗi truy vấn cơ sở dữ liệu";
        }
        if (rawMessage.contains("Classroom")) {
            return "Chức năng lớp học chưa sẵn sàng trên cơ sở dữ liệu (thiếu bảng Classroom).";
        }
        if (rawMessage.contains("meeing_password") || rawMessage.contains("meeting_password")) {
            return "Cấu trúc bảng Session chưa khớp cột meeting password. Vui lòng kiểm tra lại mapping và tên cột.";
        }
        if (rawMessage.contains("location_type")) {
            return "Dữ liệu kiểu học (ONLINE/OFFLINE) chưa hợp lệ hoặc thiếu trong bảng Session.";
        }
        if (rawMessage.contains("Cannot insert the value NULL")) {
            return "Thiếu dữ liệu bắt buộc khi lưu lịch học. Vui lòng kiểm tra lại thông tin nhập.";
        }
        if (rawMessage.contains("time and datetime are incompatible")) {
            return "Kiểu dữ liệu thời gian trong bảng Session chưa đồng nhất (TIME/DATETIME).";
        }
        return "Lỗi truy vấn cơ sở dữ liệu";
    }

}
