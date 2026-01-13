-- Script to create the ITMS database schema in Microsoft SQL Server
-- Database: ITMS (Improved & Fixed Version)
-- Assumptions: Using NVARCHAR for Unicode support (Vietnamese/English), IDENTITY for auto-increment PKs.
-- Run this in SQL Server Management Studio or via JDBC in Spring Boot setup.

-- Create the database (if not exists)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ITMS')
BEGIN
    CREATE DATABASE ITMS;
END
GO

USE ITMS;
GO

-- Table: Department
CREATE TABLE Department (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO

-- Table: User (Roles: EMPLOYEE, TRAINER, HR, MANAGER)
CREATE TABLE [User] (  -- Note: 'User' is a reserved word, so use brackets
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,  -- Hashed password
    email NVARCHAR(100) NOT NULL UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('EMPLOYEE', 'TRAINER', 'HR', 'MANAGER')),
    department_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES Department(id) ON DELETE SET NULL
);
GO

-- Table: Course
CREATE TABLE Course (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    trainer_id INT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (trainer_id) REFERENCES [User](id) ON DELETE SET NULL
);
GO

-- Table: Session (Training sessions for courses)
CREATE TABLE Session (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    location NVARCHAR(255) NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (course_id) REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT CK_Session_Time CHECK (time_end > time_start)
);
GO

-- Table: Enrollment
CREATE TABLE Enrollment (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'APPROVED', 'WAITLIST', 'CANCELLED')),
    approval_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES Session(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Enrollment_UserSession UNIQUE (user_id, session_id)
);
GO

-- Table: Attendance
CREATE TABLE Attendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    enrollment_id INT NOT NULL UNIQUE,  -- One attendance record per enrollment
    attended BIT NOT NULL DEFAULT 0,  -- 0: False, 1: True
    completion_status NVARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (completion_status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (enrollment_id) REFERENCES Enrollment(id) ON DELETE CASCADE
);
GO

-- Table: Quiz
CREATE TABLE Quiz (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    pass_threshold FLOAT NOT NULL DEFAULT 0.7 CHECK (pass_threshold BETWEEN 0 AND 1),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (course_id) REFERENCES Course(id) ON DELETE CASCADE
);
GO

-- Table: Question (Multiple-choice questions)
CREATE TABLE Question (
    id INT IDENTITY(1,1) PRIMARY KEY,
    quiz_id INT NOT NULL,
    text NVARCHAR(MAX) NOT NULL,
    options NVARCHAR(MAX) NOT NULL,  -- JSON array of options, e.g., '["A: Option1", "B: Option2"]'
    correct_answer NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE CASCADE
);
GO

-- Table: QuizAttempt
CREATE TABLE QuizAttempt (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score FLOAT NOT NULL CHECK (score BETWEEN 0 AND 100),
    pass BIT NOT NULL DEFAULT 0,
    attempt_date DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE CASCADE
);
GO

-- Table: Feedback
CREATE TABLE Feedback (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments NVARCHAR(MAX) NULL,
    trainer_rating INT NULL CHECK (trainer_rating BETWEEN 1 AND 5),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES Session(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Feedback_UserSession UNIQUE (user_id, session_id)
);
GO

-- Table: Notification (Optional for workflows)
CREATE TABLE Notification (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('APPROVAL', 'REMINDER', 'GENERAL', 'ALERT')),
    is_read BIT NOT NULL DEFAULT 0,
    sent_date DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE
);
GO

-- Table: Certification (Optional basic certification)
CREATE TABLE Certification (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    issue_date DATETIME NOT NULL DEFAULT GETDATE(),
    expiry_date DATETIME NULL,
    certificate_code NVARCHAR(100) NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Certification_UserCourse UNIQUE (user_id, course_id)
);
GO



