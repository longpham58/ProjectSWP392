package com.itms.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Runs once on startup to fix DB constraints that may conflict with new enum values.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintFixer {

    private final DataSource dataSource;

    @PostConstruct
    public void init() {
        fixRecipientTypeConstraint();
    }

    private void fixRecipientTypeConstraint() {
        log.info("🚀 Starting Notification recipient_type constraint patch...");
        
        String dropAll = """
                DECLARE @ConstraintName nvarchar(200)
                SELECT @ConstraintName = name
                FROM sys.check_constraints
                WHERE parent_object_id = object_id('Notification')
                  AND definition LIKE '%recipient_type%'
                IF @ConstraintName IS NOT NULL
                BEGIN
                    PRINT 'Dropping constraint: ' + @ConstraintName
                    EXEC('ALTER TABLE [Notification] DROP CONSTRAINT [' + @ConstraintName + ']')
                END
                """;

        String dropNamed = """
                IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_recipient_type')
                BEGIN
                    ALTER TABLE [Notification] DROP CONSTRAINT CK_Notification_recipient_type
                END
                """;

        String addNew = """
                IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_recipient_type')
                BEGIN
                    ALTER TABLE [Notification]
                    ADD CONSTRAINT CK_Notification_recipient_type
                    CHECK ([recipient_type] IS NULL OR [recipient_type] IN (
                        'ALL', 'STUDENTS', 'TRAINERS', 'HR', 'EMPLOYEE', 'TRAINER', 'SYSTEM'
                    ))
                END
                """;

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(dropAll);
            stmt.execute(dropNamed);
            stmt.execute(addNew);
            log.info("✅ Notification recipient_type constraint patched successfully");
        } catch (Exception e) {
            log.error("❌ Could not patch recipient_type constraint: {}", e.getMessage(), e);
        }
    }
}
