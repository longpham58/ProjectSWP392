-- Script to add session_name and session_number columns to existing Session table
-- Run this script to update your existing database

ALTER TABLE Session
ADD session_name NVARCHAR(255) NOT NULL DEFAULT 'Session',
    session_number INT NULL;
GO

-- Optional: Update existing sessions with proper session numbers
-- This calculates the session number based on date and time within each class
UPDATE s
SET s.session_number = sub.session_num
FROM Session s
INNER JOIN (
    SELECT 
        s2.id,
        ROW_NUMBER() OVER (PARTITION BY s2.class_id ORDER BY s2.date, s2.time_start) AS session_num
    FROM Session s2
) AS sub ON s.id = sub.id;
GO

PRINT 'Successfully added session_name and session_number columns to Session table';
GO
