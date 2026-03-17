-- Fix: Make user_id nullable and update type/recipient_type CHECK constraints in Notification table
-- Run this SQL in your database

-- Step 1: Make user_id nullable
ALTER TABLE [dbo].[Notification] 
ALTER COLUMN [user_id] INT NULL;
GO

-- Step 2: Drop old type constraint if exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_type')
    ALTER TABLE [dbo].[Notification] DROP CONSTRAINT CK_Notification_type;
GO

-- Step 3: Add new type constraint with allowed values
ALTER TABLE [dbo].[Notification]
ADD CONSTRAINT CK_Notification_type 
CHECK ([type] IN ('APPROVAL', 'REMINDER', 'GENERAL', 'ALERT'));
GO

-- Step 4: Drop old recipient_type constraint if exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Notification_recipient_type')
    ALTER TABLE [dbo].[Notification] DROP CONSTRAINT CK_Notification_recipient_type;
GO

-- Step 5: Add new recipient_type constraint with correct values matching frontend
ALTER TABLE [dbo].[Notification]
ADD CONSTRAINT CK_Notification_recipient_type 
CHECK ([recipient_type] IS NULL OR [recipient_type] IN ('STUDENTS', 'HR', 'ALL', 'SYSTEM'));
GO

PRINT 'Notification table constraints updated successfully';
