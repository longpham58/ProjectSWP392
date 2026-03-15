-- =====================================================
-- ITMS - Internal Training Management System
-- Database: Microsoft SQL Server
-- Version: 2.0
-- =====================================================

CREATE DATABASE ITMS;
GO

USE ITMS;
GO

-- =====================================================
-- 1. Role
-- =====================================================
CREATE TABLE Role (
    id           INT           IDENTITY(1,1) PRIMARY KEY,
    role_name    NVARCHAR(50)  NOT NULL UNIQUE,
    role_code    NVARCHAR(20)  NOT NULL UNIQUE,
    description  NVARCHAR(500) NULL,
    is_active    BIT           NOT NULL DEFAULT 1,
    created_at   DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME      NULL
);
GO

-- =====================================================
-- 2. Department  (manager_id FK added after [User])
-- =====================================================
CREATE TABLE Department (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    code        NVARCHAR(20)  NOT NULL UNIQUE,
    description NVARCHAR(500) NULL,
    manager_id  INT           NULL,
    is_active   BIT           NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME      NULL,
    created_by  INT           NULL,
    updated_by  INT           NULL
);
GO

-- =====================================================
-- 3. User
-- =====================================================
CREATE TABLE [User] (
    id                    INT           IDENTITY(1,1) PRIMARY KEY,
    username              NVARCHAR(50)  NOT NULL UNIQUE,
    password              NVARCHAR(255) NOT NULL,
    email                 NVARCHAR(100) NOT NULL UNIQUE,
    full_name             NVARCHAR(100) NOT NULL,
    phone                 NVARCHAR(20)  NULL,
    avatar_url            NVARCHAR(500) NULL,
    department_id         INT           NULL,
    is_active             BIT           NOT NULL DEFAULT 1,
    otp_enabled           BIT           NOT NULL DEFAULT 0,
    otp_secret            NVARCHAR(255) NULL,
    last_login            DATETIME      NULL,
    failed_login_attempts INT           NOT NULL DEFAULT 0,
    locked_until          DATETIME      NULL,
    created_at            DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at            DATETIME      NULL,

    CONSTRAINT FK_User_Department
        FOREIGN KEY (department_id) REFERENCES Department(id) ON DELETE SET NULL
);
GO

-- FK: Department.manager_id → User
ALTER TABLE Department
ADD CONSTRAINT FK_Department_Manager
    FOREIGN KEY (manager_id) REFERENCES [User](id) ON DELETE NO ACTION;
GO

-- =====================================================
-- 4. UserRole
-- =====================================================
CREATE TABLE UserRole (
    id          INT      IDENTITY(1,1) PRIMARY KEY,
    user_id     INT      NOT NULL,
    role_id     INT      NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT GETDATE(),
    assigned_by INT      NULL,
    is_active   BIT      NOT NULL DEFAULT 1,

    CONSTRAINT FK_UserRole_User
        FOREIGN KEY (user_id)     REFERENCES [User](id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRole_Role
        FOREIGN KEY (role_id)     REFERENCES Role(id)   ON DELETE CASCADE,
    CONSTRAINT FK_UserRole_AssignedBy
        FOREIGN KEY (assigned_by) REFERENCES [User](id) ON DELETE NO ACTION,
    CONSTRAINT UQ_UserRole_UserRole
        UNIQUE (user_id, role_id)
);
GO

-- =====================================================
-- 5. Course
-- Một khóa học có thể có nhiều lớp học (ClassRoom)
-- =====================================================
CREATE TABLE Course (
    id             INT            IDENTITY(1,1) PRIMARY KEY,
    code           NVARCHAR(20)   NOT NULL UNIQUE,
    name           NVARCHAR(255)  NOT NULL,
    description    NVARCHAR(MAX)  NULL,
    objectives     NVARCHAR(MAX)  NULL,
    prerequisites  NVARCHAR(MAX)  NULL,
    duration_hours DECIMAL(5,2)   NULL  CHECK (duration_hours > 0),
    trainer_id     INT            NULL,
    category       NVARCHAR(50)   NULL,
    level          NVARCHAR(20)   NULL  CHECK (level IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
    thumbnail_url  NVARCHAR(500)  NULL,
    passing_score  DECIMAL(5,2)   NULL  CHECK (passing_score BETWEEN 0 AND 100),
    max_attempts   INT            NULL  DEFAULT 3,
    start_date     DATE           NULL,
    end_date       DATE           NULL,
    status         NVARCHAR(20)   NOT NULL DEFAULT 'DRAFT'
                                  CHECK (status IN ('DRAFT','ACTIVE','INACTIVE','ARCHIVED')),
    created_at     DATETIME       NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME       NULL,
    created_by     INT            NULL,
    updated_by     INT            NULL,

    CONSTRAINT FK_Course_Trainer
        FOREIGN KEY (trainer_id)  REFERENCES [User](id) ON DELETE SET NULL,
    CONSTRAINT FK_Course_CreatedBy
        FOREIGN KEY (created_by)  REFERENCES [User](id) ON DELETE NO ACTION,
    CONSTRAINT FK_Course_UpdatedBy
        FOREIGN KEY (updated_by)  REFERENCES [User](id) ON DELETE NO ACTION
);
GO

-- =====================================================
-- 6. ClassRoom
-- Lớp học thuộc về một khóa học.
-- Một khóa học có nhiều lớp, mỗi lớp có nhiều học viên.
-- Ví dụ: Course "Java Spring" → Lớp SE18D01, SE18D02
-- =====================================================
CREATE TABLE ClassRoom (
    id           INT           IDENTITY(1,1) PRIMARY KEY,
    course_id    INT           NOT NULL,
    class_code   NVARCHAR(50)  NOT NULL UNIQUE,  -- mã lớp, VD: SE18D01
    class_name   NVARCHAR(255) NULL,
    trainer_id   INT           NULL,             -- giảng viên phụ trách lớp
    max_students INT           NOT NULL DEFAULT 30 CHECK (max_students > 0),
    status       NVARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                               CHECK (status IN ('ACTIVE','INACTIVE','COMPLETED','CANCELLED')),
    notes        NVARCHAR(MAX) NULL,
    created_at   DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME      NULL,
    created_by   INT           NULL,
    updated_by   INT           NULL,

    CONSTRAINT FK_ClassRoom_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id)  ON DELETE CASCADE,
    CONSTRAINT FK_ClassRoom_Trainer
        FOREIGN KEY (trainer_id) REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT FK_ClassRoom_CreatedBy
        FOREIGN KEY (created_by) REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT FK_ClassRoom_UpdatedBy
        FOREIGN KEY (updated_by) REFERENCES [User](id)  ON DELETE NO ACTION
);
GO

-- =====================================================
-- 7. ClassMember
-- Học viên (employee) được thêm vào lớp học.
-- Một user có thể ở nhiều lớp khác nhau.
-- =====================================================
CREATE TABLE ClassMember (
    id          INT          IDENTITY(1,1) PRIMARY KEY,
    class_id    INT          NOT NULL,
    user_id     INT          NOT NULL,
    joined_at   DATETIME     NOT NULL DEFAULT GETDATE(),
    status      NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                             CHECK (status IN ('ACTIVE','DROPPED','COMPLETED')),
    added_by    INT          NULL,
    notes       NVARCHAR(500) NULL,

    CONSTRAINT FK_ClassMember_Class
        FOREIGN KEY (class_id) REFERENCES ClassRoom(id) ON DELETE CASCADE,
    CONSTRAINT FK_ClassMember_User
        FOREIGN KEY (user_id)  REFERENCES [User](id)    ON DELETE NO ACTION,
    CONSTRAINT FK_ClassMember_AddedBy
        FOREIGN KEY (added_by) REFERENCES [User](id)    ON DELETE NO ACTION,
    -- Một user chỉ vào một lớp một lần
    CONSTRAINT UQ_ClassMember_ClassUser
        UNIQUE (class_id, user_id)
);
GO

-- =====================================================
-- 8. CourseModules
-- =====================================================
CREATE TABLE CourseModules (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    course_id     INT           NOT NULL,
    title         NVARCHAR(255) NOT NULL,
    description   NVARCHAR(MAX) NULL,
    display_order INT           NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME      NULL,
    created_by    INT           NULL,
    updated_by    INT           NULL,

    CONSTRAINT FK_CourseModule_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id) ON DELETE CASCADE,
    CONSTRAINT FK_CourseModule_CreatedBy
        FOREIGN KEY (created_by) REFERENCES [User](id),
    CONSTRAINT FK_CourseModule_UpdatedBy
        FOREIGN KEY (updated_by) REFERENCES [User](id)
);
GO

-- =====================================================
-- 9. CourseMaterial
-- =====================================================
CREATE TABLE CourseMaterial (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    course_id       INT           NULL,
    module_id       INT           NULL,
    title           NVARCHAR(255) NOT NULL,
    description     NVARCHAR(MAX) NULL,
    type            NVARCHAR(20)  NOT NULL
                                  CHECK (type IN ('PDF','VIDEO','LINK','DOCUMENT','SLIDE','AUDIO','OTHER')),
    file_url        NVARCHAR(500) NULL,
    file_size       BIGINT        NULL,
    display_order   INT           NOT NULL DEFAULT 0,
    is_required     BIT           NOT NULL DEFAULT 0,
    is_downloadable BIT           NOT NULL DEFAULT 1,
    created_at      DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME      NULL,
    created_by      INT           NULL,

    CONSTRAINT FK_CourseMaterial_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id)        ON DELETE CASCADE,
    CONSTRAINT FK_CourseMaterial_Module
        FOREIGN KEY (module_id)  REFERENCES CourseModules(id) ON DELETE NO ACTION,
    CONSTRAINT FK_CourseMaterial_CreatedBy
        FOREIGN KEY (created_by) REFERENCES [User](id)        ON DELETE NO ACTION
);
GO

-- =====================================================
-- 10. CourseSchedule
-- Pattern lịch học lặp lại theo thứ trong tuần.
-- Gắn với ClassRoom (lớp cụ thể) để mỗi lớp có lịch riêng.
-- SP_GenerateSessions sẽ đọc bảng này để sinh Session.
-- =====================================================
CREATE TABLE CourseSchedule (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    course_id     INT           NOT NULL,
    class_id      INT           NOT NULL,  -- lịch này thuộc lớp nào
    trainer_id    INT           NULL,      -- trainer phụ trách theo lịch này, sẽ được copy sang Session
    day_of_week   NVARCHAR(3)   NOT NULL
                                CHECK (day_of_week IN ('MON','TUE','WED','THU','FRI','SAT','SUN')),
    time_start    TIME          NOT NULL,
    time_end      TIME          NOT NULL,
    location      NVARCHAR(255) NULL,
    location_type NVARCHAR(20)  NOT NULL DEFAULT 'OFFLINE'
                                CHECK (location_type IN ('ONLINE','OFFLINE','HYBRID')),
    meeting_link  NVARCHAR(500) NULL,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at    DATETIME      NULL,
    created_by    INT           NULL,

    CONSTRAINT FK_CourseSchedule_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id)    ON DELETE CASCADE,
    CONSTRAINT FK_CourseSchedule_Class
        FOREIGN KEY (class_id)   REFERENCES ClassRoom(id) ON DELETE NO ACTION,
    CONSTRAINT FK_CourseSchedule_Trainer
        FOREIGN KEY (trainer_id) REFERENCES [User](id)    ON DELETE NO ACTION,
    CONSTRAINT FK_CourseSchedule_CreatedBy
        FOREIGN KEY (created_by) REFERENCES [User](id)    ON DELETE NO ACTION,
    CONSTRAINT CK_CourseSchedule_Time
        CHECK (time_end > time_start)
);
GO

-- =====================================================
-- 11. Session
-- Các buổi học cụ thể theo ngày.
-- Lưu cả course_id và class_id để hiển thị:
--   "Mã khóa học: JPD316 | Lớp: SE18D10"
-- Được sinh tự động từ SP_GenerateSessions hoặc tạo thủ công.
-- =====================================================
CREATE TABLE Session (
    id                  INT           IDENTITY(1,1) PRIMARY KEY,
    course_id           INT           NOT NULL,
    class_id            INT           NOT NULL,   -- lớp học của buổi này
    schedule_id         INT           NULL,        -- NULL nếu tạo thủ công
    trainer_id          INT           NULL,        -- trainer phụ trách buổi này, điểm danh buổi này
    date                DATE          NOT NULL,
    time_start          TIME          NOT NULL,
    time_end            TIME          NOT NULL,
    location            NVARCHAR(255) NULL,
    location_type       NVARCHAR(20)  NOT NULL DEFAULT 'OFFLINE'
                                      CHECK (location_type IN ('ONLINE','OFFLINE','HYBRID')),
    meeting_link        NVARCHAR(500) NULL,
    meeting_password    NVARCHAR(100) NULL,
    max_capacity        INT           NOT NULL CHECK (max_capacity > 0),
    current_enrolled    INT           NOT NULL DEFAULT 0,
    status              NVARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED'
                                      CHECK (status IN ('SCHEDULED','ONGOING','COMPLETED','CANCELLED')),
    cancellation_reason NVARCHAR(500) NULL,
    notes               NVARCHAR(MAX) NULL,
    created_at          DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME      NULL,
    created_by          INT           NULL,
    updated_by          INT           NULL,

    CONSTRAINT FK_Session_Course
        FOREIGN KEY (course_id)   REFERENCES Course(id)         ON DELETE CASCADE,
    CONSTRAINT FK_Session_Class
        FOREIGN KEY (class_id)    REFERENCES ClassRoom(id)      ON DELETE NO ACTION,
    CONSTRAINT FK_Session_Schedule
        FOREIGN KEY (schedule_id) REFERENCES CourseSchedule(id) ON DELETE NO ACTION,
    CONSTRAINT FK_Session_Trainer
        FOREIGN KEY (trainer_id)  REFERENCES [User](id)         ON DELETE NO ACTION,
    CONSTRAINT FK_Session_CreatedBy
        FOREIGN KEY (created_by)  REFERENCES [User](id)         ON DELETE NO ACTION,
    CONSTRAINT FK_Session_UpdatedBy
        FOREIGN KEY (updated_by)  REFERENCES [User](id)         ON DELETE NO ACTION,
    CONSTRAINT CK_Session_Time
        CHECK (time_end > time_start),
    CONSTRAINT CK_Session_Capacity
        CHECK (current_enrolled <= max_capacity),
    -- Không cho phép cùng lớp trùng ngày + giờ bắt đầu
    CONSTRAINT UQ_Session_ClassDateTime
        UNIQUE (class_id, date, time_start)
);
GO

-- =====================================================
-- STORED PROCEDURE: SP_GenerateSessions
-- Tự động sinh các buổi học (Session) cho một lớp cụ thể
-- dựa vào CourseSchedule và Course.start_date / end_date
--
-- Cách dùng:
--   EXEC SP_GenerateSessions @class_id = 1;
-- =====================================================
CREATE OR ALTER PROCEDURE SP_GenerateSessions
    @class_id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @course_id    INT;
    DECLARE @start_date   DATE;
    DECLARE @end_date     DATE;
    DECLARE @max_capacity INT;

    -- Lấy thông tin course và lớp
    SELECT
        @course_id    = cr.course_id,
        @start_date   = c.start_date,
        @end_date     = c.end_date,
        @max_capacity = cr.max_students
    FROM ClassRoom cr
    JOIN Course c ON c.id = cr.course_id
    WHERE cr.id = @class_id;

    IF @start_date IS NULL OR @end_date IS NULL
    BEGIN
        RAISERROR('Course phải có start_date và end_date trước khi sinh sessions.', 16, 1);
        RETURN;
    END

    -- Duyệt từng ngày từ start_date đến end_date
    DECLARE @current_date DATE = @start_date;
    DECLARE @day_name     NVARCHAR(3);

    WHILE @current_date <= @end_date
    BEGIN
        SET @day_name = CASE DATEPART(WEEKDAY, @current_date)
            WHEN 1 THEN 'SUN'
            WHEN 2 THEN 'MON'
            WHEN 3 THEN 'TUE'
            WHEN 4 THEN 'WED'
            WHEN 5 THEN 'THU'
            WHEN 6 THEN 'FRI'
            WHEN 7 THEN 'SAT'
        END;

        -- Sinh session, tự động lấy trainer_id từ CourseSchedule
        INSERT INTO Session (
            course_id, class_id, schedule_id, trainer_id,
            date, time_start, time_end,
            location, location_type, meeting_link,
            max_capacity
        )
        SELECT
            cs.course_id,
            cs.class_id,
            cs.id,
            cs.trainer_id,      -- trainer được assign trong lịch sẽ tự động gán vào buổi học
            @current_date,
            cs.time_start,
            cs.time_end,
            cs.location,
            cs.location_type,
            cs.meeting_link,
            @max_capacity
        FROM CourseSchedule cs
        WHERE cs.class_id    = @class_id
          AND cs.day_of_week = @day_name
          -- Bỏ qua nếu session đã tồn tại
          AND NOT EXISTS (
              SELECT 1 FROM Session s
              WHERE s.class_id   = cs.class_id
                AND s.date       = @current_date
                AND s.time_start = cs.time_start
          );

        SET @current_date = DATEADD(DAY, 1, @current_date);
    END
END;
GO

-- =====================================================
-- 12. Enrollment
-- =====================================================
CREATE TABLE Enrollment (
    id                  INT          IDENTITY(1,1) PRIMARY KEY,
    user_id             INT          NOT NULL,
    session_id          INT          NOT NULL,
    status              NVARCHAR(20) NOT NULL DEFAULT 'REGISTERED'
                                     CHECK (status IN ('REGISTERED','APPROVED','WAITLIST','CANCELLED','COMPLETED','REJECTED','NO_SHOW')),
    approved_by         INT          NULL,
    approval_date       DATETIME     NULL,
    rejection_reason    NVARCHAR(500) NULL,
    cancellation_reason NVARCHAR(500) NULL,
    registered_at       DATETIME     NOT NULL DEFAULT GETDATE(),
    completion_date     DATETIME     NULL,
    completion_rate     DECIMAL(5,2) NULL CHECK (completion_rate BETWEEN 0 AND 100),
    final_score         DECIMAL(5,2) NULL CHECK (final_score BETWEEN 0 AND 100),
    certificate_issued  BIT          NOT NULL DEFAULT 0,
    created_at          DATETIME     NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME     NULL,

    CONSTRAINT FK_Enrollment_User
        FOREIGN KEY (user_id)     REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT FK_Enrollment_Session
        FOREIGN KEY (session_id)  REFERENCES Session(id) ON DELETE NO ACTION,
    CONSTRAINT FK_Enrollment_Approver
        FOREIGN KEY (approved_by) REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT UQ_Enrollment_UserSession
        UNIQUE (user_id, session_id)
);
GO

-- =====================================================
-- 13. Attendance
-- =====================================================
CREATE TABLE Attendance (
    id                INT          IDENTITY(1,1) PRIMARY KEY,
    enrollment_id     INT          NOT NULL UNIQUE,
    attended          BIT          NOT NULL DEFAULT 0,
    check_in_time     DATETIME     NULL,
    check_out_time    DATETIME     NULL,
    duration_minutes  INT          NULL,
    completion_status NVARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                                   CHECK (completion_status IN ('IN_PROGRESS','COMPLETED','FAILED','ABSENT')),
    completion_date   DATETIME     NULL,
    notes             NVARCHAR(MAX) NULL,
    marked_by         INT          NULL,
    created_at        DATETIME     NOT NULL DEFAULT GETDATE(),
    updated_at        DATETIME     NULL,

    CONSTRAINT FK_Attendance_Enrollment
        FOREIGN KEY (enrollment_id) REFERENCES Enrollment(id) ON DELETE CASCADE,
    CONSTRAINT FK_Attendance_MarkedBy
        FOREIGN KEY (marked_by)     REFERENCES [User](id)     ON DELETE NO ACTION
);
GO

-- =====================================================
-- 14. Quiz
-- =====================================================
CREATE TABLE Quiz (
    id                   INT          IDENTITY(1,1) PRIMARY KEY,
    course_id            INT          NOT NULL,
    module_id            INT          NULL,
    title                NVARCHAR(255) NOT NULL,
    description          NVARCHAR(MAX) NULL,
    quiz_type            NVARCHAR(20) NOT NULL DEFAULT 'ASSESSMENT'
                                      CHECK (quiz_type IN ('PRE_TEST','POST_TEST','ASSESSMENT','PRACTICE')),
    total_questions      INT          NOT NULL CHECK (total_questions > 0),
    total_marks          DECIMAL(5,2) NOT NULL CHECK (total_marks > 0),
    passing_score        DECIMAL(5,2) NOT NULL CHECK (passing_score BETWEEN 0 AND 100),
    duration_minutes     INT          NOT NULL CHECK (duration_minutes > 0),
    max_attempts         INT          NOT NULL DEFAULT 3 CHECK (max_attempts > 0),
    randomize_questions  BIT          NOT NULL DEFAULT 0,
    show_correct_answers BIT          NOT NULL DEFAULT 1,
    due_date             DATE         NULL,
    is_final_exam        BIT          NOT NULL DEFAULT 0,
    is_active            BIT          NOT NULL DEFAULT 1,
    created_at           DATETIME     NOT NULL DEFAULT GETDATE(),
    updated_at           DATETIME     NULL,
    created_by           INT          NULL,

    CONSTRAINT FK_Quiz_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id)        ON DELETE CASCADE,
    CONSTRAINT FK_Quiz_Module
        FOREIGN KEY (module_id)  REFERENCES CourseModules(id),
    CONSTRAINT FK_Quiz_CreatedBy
        FOREIGN KEY (created_by) REFERENCES [User](id)        ON DELETE NO ACTION
);
GO

-- =====================================================
-- 15. QuizQuestion
-- =====================================================
CREATE TABLE QuizQuestion (
    id             INT           IDENTITY(1,1) PRIMARY KEY,
    quiz_id        INT           NOT NULL,
    question_text  NVARCHAR(MAX) NOT NULL,
    question_type  NVARCHAR(20)  NOT NULL DEFAULT 'MULTIPLE_CHOICE'
                                  CHECK (question_type IN ('MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER')),
    option_a       NVARCHAR(500) NULL,
    option_b       NVARCHAR(500) NULL,
    option_c       NVARCHAR(500) NULL,
    option_d       NVARCHAR(500) NULL,
    correct_answer NVARCHAR(500) NOT NULL,
    marks          DECIMAL(5,2)  NOT NULL DEFAULT 1 CHECK (marks > 0),
    explanation    NVARCHAR(MAX) NULL,
    display_order  INT           NOT NULL DEFAULT 0,
    created_at     DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME      NULL,

    CONSTRAINT FK_QuizQuestion_Quiz
        FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- 16. QuizAttempt
-- =====================================================
CREATE TABLE QuizAttempt (
    id                 INT          IDENTITY(1,1) PRIMARY KEY,
    quiz_id            INT          NOT NULL,
    user_id            INT          NOT NULL,
    enrollment_id      INT          NULL,
    attempt_number     INT          NOT NULL DEFAULT 1,
    score              DECIMAL(5,2) NULL  CHECK (score BETWEEN 0 AND 100),
    total_marks        DECIMAL(5,2) NULL,
    obtained_marks     DECIMAL(5,2) NULL,
    passed             BIT          NOT NULL DEFAULT 0,
    started_at         DATETIME     NOT NULL DEFAULT GETDATE(),
    submitted_at       DATETIME     NULL,
    time_taken_minutes INT          NULL,
    status             NVARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
                                    CHECK (status IN ('IN_PROGRESS','SUBMITTED','GRADED','ABANDONED')),
    created_at         DATETIME     NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_QuizAttempt_Quiz
        FOREIGN KEY (quiz_id)       REFERENCES Quiz(id)        ON DELETE CASCADE,
    CONSTRAINT FK_QuizAttempt_User
        FOREIGN KEY (user_id)       REFERENCES [User](id)      ON DELETE NO ACTION,
    CONSTRAINT FK_QuizAttempt_Enrollment
        FOREIGN KEY (enrollment_id) REFERENCES Enrollment(id)  ON DELETE NO ACTION
);
GO

-- =====================================================
-- 17. QuizAnswer
-- =====================================================
CREATE TABLE QuizAnswer (
    id             INT          IDENTITY(1,1) PRIMARY KEY,
    attempt_id     INT          NOT NULL,
    question_id    INT          NOT NULL,
    user_answer    NVARCHAR(500) NULL,
    is_correct     BIT          NULL,
    marks_obtained DECIMAL(5,2) NULL,
    answered_at    DATETIME     NULL,

    CONSTRAINT FK_QuizAnswer_Attempt
        FOREIGN KEY (attempt_id)  REFERENCES QuizAttempt(id)  ON DELETE CASCADE,
    CONSTRAINT FK_QuizAnswer_Question
        FOREIGN KEY (question_id) REFERENCES QuizQuestion(id) ON DELETE NO ACTION,
    CONSTRAINT UQ_QuizAnswer_AttemptQuestion
        UNIQUE (attempt_id, question_id)
);
GO

-- =====================================================
-- 18. Certificate
-- =====================================================
CREATE TABLE Certificate (
    id                 INT           IDENTITY(1,1) PRIMARY KEY,
    user_id            INT           NOT NULL,
    course_id          INT           NOT NULL,
    certificate_code   NVARCHAR(50)  NOT NULL UNIQUE,
    certificate_url    NVARCHAR(500) NULL,
    issue_date         DATE          NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    expiry_date        DATE          NULL,
    grade              NVARCHAR(20)  NULL CHECK (grade IN ('PASS','MERIT','DISTINCTION','FAIL')),
    score              DECIMAL(5,2)  NULL,
    issued_by          INT           NULL,
    is_valid           BIT           NOT NULL DEFAULT 1,
    revoked_at         DATETIME      NULL,
    revoked_by         INT           NULL,
    revocation_reason  NVARCHAR(500) NULL,
    created_at         DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Certificate_User
        FOREIGN KEY (user_id)    REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT FK_Certificate_Course
        FOREIGN KEY (course_id)  REFERENCES Course(id)  ON DELETE NO ACTION,
    CONSTRAINT FK_Certificate_IssuedBy
        FOREIGN KEY (issued_by)  REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT FK_Certificate_RevokedBy
        FOREIGN KEY (revoked_by) REFERENCES [User](id)  ON DELETE NO ACTION,
    CONSTRAINT UQ_Certificate_UserCourse
        UNIQUE (user_id, course_id)
);
GO

-- =====================================================
-- 19. Feedback
-- =====================================================
CREATE TABLE Feedback (
    id              INT          IDENTITY(1,1) PRIMARY KEY,
    enrollment_id   INT          NOT NULL,
    session_id      INT          NOT NULL,
    user_id         INT          NOT NULL,
    course_rating   INT          NULL CHECK (course_rating   BETWEEN 1 AND 5),
    trainer_rating  INT          NULL CHECK (trainer_rating  BETWEEN 1 AND 5),
    content_rating  INT          NULL CHECK (content_rating  BETWEEN 1 AND 5),
    overall_rating  INT          NULL CHECK (overall_rating  BETWEEN 1 AND 5),
    comments        NVARCHAR(MAX) NULL,
    suggestions     NVARCHAR(MAX) NULL,
    would_recommend BIT          NULL,
    submitted_at    DATETIME     NOT NULL DEFAULT GETDATE(),
    is_anonymous    BIT          NOT NULL DEFAULT 0,

    CONSTRAINT FK_Feedback_Enrollment
        FOREIGN KEY (enrollment_id) REFERENCES Enrollment(id) ON DELETE CASCADE,
    CONSTRAINT FK_Feedback_Session
        FOREIGN KEY (session_id)    REFERENCES Session(id)    ON DELETE NO ACTION,
    CONSTRAINT FK_Feedback_User
        FOREIGN KEY (user_id)       REFERENCES [User](id)     ON DELETE NO ACTION,
    CONSTRAINT UQ_Feedback_EnrollmentSession
        UNIQUE (enrollment_id, session_id)
);
GO

-- =====================================================
-- 20. Notification
-- =====================================================
CREATE TABLE Notification (
    id             INT           IDENTITY(1,1) PRIMARY KEY,
    user_id        INT           NOT NULL,
    sender_id      INT           NULL,
    type           NVARCHAR(50)  NOT NULL
                                 CHECK (type IN ('ENROLLMENT','APPROVAL','REJECTION','REMINDER','CANCELLATION',
                                                 'COMPLETION','QUIZ','CERTIFICATE','FEEDBACK','ANNOUNCEMENT','SYSTEM')),
    title          NVARCHAR(255) NOT NULL,
    message        NVARCHAR(MAX) NOT NULL,
    detail_content NVARCHAR(MAX) NULL,
    reference_id   INT           NULL,
    reference_type NVARCHAR(50)  NULL
                                 CHECK (reference_type IN ('ENROLLMENT','SESSION','COURSE','QUIZ','CERTIFICATE') OR reference_type IS NULL),
    recipient_type NVARCHAR(50)  NULL
                                 CHECK (recipient_type IN ('STUDENTS','HR','SYSTEM') OR recipient_type IS NULL),
    class_codes    NVARCHAR(MAX) NULL,
    priority       NVARCHAR(20)  NOT NULL DEFAULT 'NORMAL'
                                 CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT')),
    is_read        BIT           NOT NULL DEFAULT 0,
    is_draft       BIT           NOT NULL DEFAULT 0,
    read_at        DATETIME      NULL,
    sent_date      DATETIME      NOT NULL DEFAULT GETDATE(),
    expires_at     DATETIME      NULL,
    created_at     DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME      NULL,

    CONSTRAINT FK_Notification_User
        FOREIGN KEY (user_id)   REFERENCES [User](id) ON DELETE CASCADE,
    CONSTRAINT FK_Notification_Sender
        FOREIGN KEY (sender_id) REFERENCES [User](id) ON DELETE NO ACTION
);
GO

-- =====================================================
-- 21. UserModuleProgress
-- =====================================================
CREATE TABLE UserModuleProgress (
    id                  INT          IDENTITY(1,1) PRIMARY KEY,
    user_id             INT          NOT NULL,
    module_id           INT          NOT NULL,
    enrollment_id       INT          NULL,
    is_completed        BIT          NOT NULL DEFAULT 0,
    completed_at        DATETIME     NULL,
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    time_spent_minutes  INT          NOT NULL DEFAULT 0,
    last_accessed_at    DATETIME     NULL,
    created_at          DATETIME     NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME     NULL,

    CONSTRAINT FK_UserModuleProgress_User
        FOREIGN KEY (user_id)       REFERENCES [User](id)        ON DELETE NO ACTION,
    CONSTRAINT FK_UserModuleProgress_Module
        FOREIGN KEY (module_id)     REFERENCES CourseModules(id) ON DELETE NO ACTION,
    CONSTRAINT FK_UserModuleProgress_Enrollment
        FOREIGN KEY (enrollment_id) REFERENCES Enrollment(id)    ON DELETE NO ACTION,
    CONSTRAINT UQ_UserModuleProgress_UserModule
        UNIQUE (user_id, module_id)
);
GO

-- =====================================================
-- 22. AuditLog
-- =====================================================
CREATE TABLE AuditLog (
    id            INT           IDENTITY(1,1) PRIMARY KEY,
    user_id       INT           NULL,
    action        NVARCHAR(100) NOT NULL,
    entity_type   NVARCHAR(50)  NOT NULL,
    entity_id     INT           NULL,
    old_value     NVARCHAR(MAX) NULL,
    new_value     NVARCHAR(MAX) NULL,
    ip_address    NVARCHAR(45)  NULL,
    user_agent    NVARCHAR(500) NULL,
    status        NVARCHAR(20)  NULL CHECK (status IN ('SUCCESS','FAILED','WARNING') OR status IS NULL),
    error_message NVARCHAR(MAX) NULL,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_AuditLog_User
        FOREIGN KEY (user_id) REFERENCES [User](id) ON DELETE SET NULL
);
GO

-- =====================================================
-- INDEXES
-- =====================================================
CREATE NONCLUSTERED INDEX IX_ClassRoom_CourseId
    ON ClassRoom(course_id);
GO

CREATE NONCLUSTERED INDEX IX_ClassMember_ClassId
    ON ClassMember(class_id);
GO

CREATE NONCLUSTERED INDEX IX_ClassMember_UserId
    ON ClassMember(user_id);
GO

CREATE NONCLUSTERED INDEX IX_Session_CourseDate
    ON Session(course_id, date);
GO

CREATE NONCLUSTERED INDEX IX_Session_ClassDate
    ON Session(class_id, date);
GO

CREATE NONCLUSTERED INDEX IX_CourseSchedule_ClassDay
    ON CourseSchedule(class_id, day_of_week);
GO

CREATE NONCLUSTERED INDEX IX_UserModuleProgress_UserId
    ON UserModuleProgress(user_id);
GO

CREATE NONCLUSTERED INDEX IX_UserModuleProgress_ModuleId
    ON UserModuleProgress(module_id);
GO

CREATE NONCLUSTERED INDEX IX_Notification_Sender_Draft
    ON Notification(sender_id, is_draft);
GO

CREATE NONCLUSTERED INDEX IX_Notification_User_Read
    ON Notification(user_id, is_read, sent_date DESC);
GO

-- =====================================================
-- LUỒNG SỬ DỤNG HOÀN CHỈNH
-- =====================================================
-- [HR] Bước 1: Tạo Course với thời gian bắt đầu/kết thúc
--   INSERT INTO Course (code, name, start_date, end_date, status)
--   VALUES ('JPD316', 'Japanese N3', '2025-06-02', '2025-08-29', 'ACTIVE');
--
-- [HR] Bước 2: Tạo ClassRoom thuộc Course đó
--   INSERT INTO ClassRoom (course_id, class_code, class_name, max_students)
--   VALUES (1, 'SE18D10', 'Lớp SE18D10', 30);
--
-- [HR] Bước 3: Thêm học viên (employee) vào lớp
--   INSERT INTO ClassMember (class_id, user_id, added_by)
--   VALUES (1, 5, 1), (1, 6, 1), (1, 7, 1);
--
-- [HR] Bước 4: Thiết lập lịch học lặp + assign trainer cho lịch đó
--   INSERT INTO CourseSchedule (course_id, class_id, trainer_id, day_of_week, time_start, time_end, location, location_type)
--   VALUES (1, 1, 10, 'MON', '12:30', '14:45', 'Gamma 405', 'OFFLINE'),
--          (1, 1, 10, 'WED', '12:30', '14:45', 'Gamma 405', 'OFFLINE');
--   -- trainer_id = 10 sẽ tự động được gán vào từng buổi học khi sinh session
--
-- [HR] Bước 5: Sinh toàn bộ sessions tự động cho lớp
--   EXEC SP_GenerateSessions @class_id = 1;
--   -- Hệ thống tự tạo tất cả buổi học từ 2025-06-02 đến 2025-08-29
--   -- mỗi Thứ 2 và Thứ 4, kèm trainer_id đã assign
--
-- [TRAINER] Bước 6: Điểm danh từng buổi học
--   -- Trainer xem danh sách học viên của buổi học
--   SELECT u.full_name, e.id AS enrollment_id, a.attended, a.check_in_time
--   FROM Session s
--   JOIN Enrollment e  ON e.session_id    = s.id
--   JOIN [User] u      ON u.id            = e.user_id
--   LEFT JOIN Attendance a ON a.enrollment_id = e.id
--   WHERE s.id = @session_id
--   ORDER BY u.full_name;
--
--   -- Trainer điểm danh từng học viên
--   UPDATE Attendance
--   SET attended = 1, check_in_time = GETDATE(), marked_by = @trainer_id
--   WHERE enrollment_id = @enrollment_id;
--
-- Query hiển thị lịch học (giống UI trong ảnh):
--   SELECT
--       s.date, s.time_start, s.time_end,
--       s.location,
--       c.code        AS course_code,
--       cr.class_code,
--       u.full_name   AS trainer_name,
--       s.status
--   FROM Session s
--   JOIN Course    c  ON c.id  = s.course_id
--   JOIN ClassRoom cr ON cr.id = s.class_id
--   LEFT JOIN [User] u ON u.id = s.trainer_id
--   WHERE s.class_id = 1
--   ORDER BY s.date, s.time_start;
-- =====================================================