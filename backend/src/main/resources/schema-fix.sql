ALTER TABLE [Session] ALTER COLUMN class_id INT NULL;

-- Fix Notification type constraint to include GENERAL and ALERT
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK__Notificati__type__09746778')
    ALTER TABLE [dbo].[Notification] DROP CONSTRAINT [CK__Notificati__type__09746778];

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Notification_type')
    ALTER TABLE [dbo].[Notification] ADD CONSTRAINT CK_Notification_type
    CHECK ([type] IN ('ENROLLMENT','APPROVAL','REJECTION','REMINDER','CANCELLATION','COMPLETION','QUIZ','CERTIFICATE','FEEDBACK','ANNOUNCEMENT','SYSTEM','GENERAL','ALERT'));
