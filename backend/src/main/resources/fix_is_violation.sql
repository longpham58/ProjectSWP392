-- Add missing columns to Feedback table

-- Add recipient_id column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedback') AND name = 'recipient_id')
BEGIN
    ALTER TABLE Feedback ADD recipient_id INT;
    ALTER TABLE Feedback ADD FOREIGN KEY (recipient_id) REFERENCES Users(id);
END

-- Add is_violation column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedback') AND name = 'is_violation')
BEGIN
    ALTER TABLE Feedback ADD is_violation BIT DEFAULT 0;
END

-- Add is_anonymous column if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Feedback') AND name = 'is_anonymous')
BEGIN
    ALTER TABLE Feedback ADD is_anonymous BIT DEFAULT 0;
END

GO
