-- =====================================================
-- Module Progress Tracking for ITMS Database
-- =====================================================

-- 1. Add module_id column to Quiz table to link quizzes to modules
ALTER TABLE [dbo].[Quiz] ADD [module_id] [int] NULL;
GO

-- Add foreign key constraint
ALTER TABLE [dbo].[Quiz] 
ADD CONSTRAINT [FK_Quiz_CourseModules] 
FOREIGN KEY ([module_id]) REFERENCES [CourseModules]([id]);
GO

-- 2. Create UserModuleProgress table to track module completion per user
CREATE TABLE [dbo].[UserModuleProgress](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[module_id] [int] NOT NULL,
	[enrollment_id] [int] NULL,
	[is_completed] [bit] NOT NULL DEFAULT 0,
	[completed_at] [datetime] NULL,
	[progress_percentage] [decimal](5, 2) NULL DEFAULT 0,
	[time_spent_minutes] [int] NULL DEFAULT 0,
	[last_accessed_at] [datetime] NULL,
	[created_at] [datetime] NOT NULL DEFAULT GETDATE(),
	[updated_at] [datetime] NULL,
 CONSTRAINT [PK_UserModuleProgress] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- Add unique constraint to prevent duplicate progress records
ALTER TABLE [dbo].[UserModuleProgress]
ADD CONSTRAINT [UQ_UserModuleProgress_UserModule] UNIQUE NONCLUSTERED 
(
	[user_id] ASC,
	[module_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

-- Add foreign keys
ALTER TABLE [dbo].[UserModuleProgress] 
ADD CONSTRAINT [FK_UserModuleProgress_User] 
FOREIGN KEY ([user_id]) REFERENCES [User]([id]);
GO

ALTER TABLE [dbo].[UserModuleProgress] 
ADD CONSTRAINT [FK_UserModuleProgress_CourseModules] 
FOREIGN KEY ([module_id]) REFERENCES [CourseModules]([id]);
GO

ALTER TABLE [dbo].[UserModuleProgress] 
ADD CONSTRAINT [FK_UserModuleProgress_Enrollment] 
FOREIGN KEY ([enrollment_id]) REFERENCES [Enrollment]([id]);
GO

-- 3. Create index for faster queries
CREATE NONCLUSTERED INDEX [IX_UserModuleProgress_UserId] 
ON [dbo].[UserModuleProgress]([user_id]) 
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_UserModuleProgress_ModuleId] 
ON [dbo].[UserModuleProgress]([module_id]) 
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

-- 4. Add is_final_exam column to Quiz table to distinguish final exams
ALTER TABLE [dbo].[Quiz] ADD [is_final_exam] [bit] NOT NULL DEFAULT 0;
GO

-- 5. Update existing quizzes to link to modules (example for course 1)
-- This will be populated based on actual course structure
/*
UPDATE [dbo].[Quiz] 
SET [module_id] = 1 
WHERE [course_id] = 1 AND [id] = 1;

UPDATE [dbo].[Quiz] 
SET [module_id] = 2 
WHERE [course_id] = 1 AND [id] = 2;

UPDATE [dbo].[Quiz] 
SET [module_id] = 3 
WHERE [course_id] = 1 AND [id] = 3;
*/
GO

PRINT 'Module Progress Tracking tables and columns added successfully!';
GO
