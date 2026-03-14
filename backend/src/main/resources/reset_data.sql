-- Reset user-related data only (Department, User, Role, UserRole)
-- Run this script to delete user data, then restart the application to trigger DataSeeder

-- Delete in correct order (respecting foreign keys)
DELETE FROM UserRole;
DELETE FROM [User];
DELETE FROM Department;
DELETE FROM Role;

-- Verify deletion
SELECT COUNT(*) AS RemainingUsers FROM [User];
SELECT COUNT(*) AS RemainingRoles FROM Role;
