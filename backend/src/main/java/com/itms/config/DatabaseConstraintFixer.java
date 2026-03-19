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
        log.info("🚀 Starting Notification table constraints patch...");
        
        // Fix recipient_type
        String dropRecipientType = """
                DECLARE @ConstraintName nvarchar(200)
                SELECT @ConstraintName = name
                FROM sys.check_constraints
                WHERE parent_object_id = object_id('Notification')
                  AND definition LIKE '%recipient_type%'
                IF @ConstraintName IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE [Notification] DROP CONSTRAINT [' + @ConstraintName + ']')
                END
                """;

        String addNewRecipientType = """
                IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_recipient_type')
                BEGIN
                    ALTER TABLE [Notification]
                    ADD CONSTRAINT CK_Notification_recipient_type
                    CHECK ([recipient_type] IS NULL OR [recipient_type] IN (
                        'ALL', 'STUDENTS', 'TRAINERS', 'HR', 'EMPLOYEE', 'TRAINER', 'SYSTEM'
                    ))
                END
                """;

        // Fix type
        String dropType = """
                DECLARE @ConstraintName nvarchar(200)
                SELECT @ConstraintName = name
                FROM sys.check_constraints
                WHERE parent_object_id = object_id('Notification')
                  AND (definition LIKE '%type IN%' AND definition NOT LIKE '%recipient_type%' AND definition NOT LIKE '%reference_type%')
                IF @ConstraintName IS NOT NULL
                BEGIN
                    EXEC('ALTER TABLE [Notification] DROP CONSTRAINT [' + @ConstraintName + ']')
                END
                """;

        String addNewType = """
                IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_type')
                BEGIN
                    ALTER TABLE [Notification]
                    ADD CONSTRAINT CK_Notification_type
                    CHECK ([type] IN (
                        'ENROLLMENT','APPROVAL','REJECTION','REMINDER','CANCELLATION',
                        'COMPLETION','QUIZ','CERTIFICATE','FEEDBACK','ANNOUNCEMENT','SYSTEM', 'GENERAL'
                    ))
                END
                """;

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            // Drop recipient_type constraints
            stmt.execute(dropRecipientType);
            // Drop named if it exists
            stmt.execute("IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_recipient_type') ALTER TABLE [Notification] DROP CONSTRAINT CK_Notification_recipient_type");
            // Add new recipient_type
            stmt.execute(addNewRecipientType);
            
            // Drop type constraints
            stmt.execute(dropType);
            // Drop named if it exists
            stmt.execute("IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_type') ALTER TABLE [Notification] DROP CONSTRAINT CK_Notification_type");
            // Add new type
            stmt.execute(addNewType);
            
            log.info("✅ Notification table constraints patched successfully");
        } catch (Exception e) {
            log.error("❌ Could not patch Notification constraints: {}", e.getMessage(), e);
        }
    }
}
