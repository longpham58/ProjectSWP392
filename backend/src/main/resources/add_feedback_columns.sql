-- Add missing columns to Feedback table for System Feedback feature

-- Add status column (NVARCHAR for enum)
ALTER TABLE Feedback ADD status NVARCHAR(20) DEFAULT 'OPEN';

-- Add type column (NVARCHAR for enum)
ALTER TABLE Feedback ADD type NVARCHAR(20) DEFAULT 'COURSE_FEEDBACK';

-- Add recipient_id column (for system feedback)
ALTER TABLE Feedback ADD recipient_id INT;
ALTER TABLE Feedback ADD FOREIGN KEY (recipient_id) REFERENCES Users(id);

-- Add is_violation column
ALTER TABLE Feedback ADD is_violation BIT DEFAULT 0;

-- Add is_anonymous column
ALTER TABLE Feedback ADD is_anonymous BIT DEFAULT 0;

-- Add submitted_at column
ALTER TABLE Feedback ADD submitted_at DATETIME;
