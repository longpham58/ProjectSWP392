package com.itms.repository;

import com.itms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    // Find quizzes by course
    List<Quiz> findByCourseId(Integer courseId);

    // Find quizzes by course with specific quiz types (PRE_TEST, POST_TEST, ASSESSMENT, PRACTICE)
    @Query("SELECT q FROM Quiz q WHERE q.course.id = :courseId AND q.quizType IN ('PRE_TEST', 'POST_TEST', 'ASSESSMENT', 'PRACTICE')")
    List<Quiz> findByCourseIdAndQuizTypeIn(@Param("courseId") Integer courseId);

    // Find quizzes by module
    List<Quiz> findByModuleId(Integer moduleId);

    // Find quizzes by module with specific quiz types (PRE_TEST, POST_TEST, ASSESSMENT, PRACTICE)
    @Query("SELECT q FROM Quiz q WHERE q.module.id = :moduleId AND q.quizType IN ('PRE_TEST', 'POST_TEST', 'ASSESSMENT', 'PRACTICE')")
    List<Quiz> findByModuleIdAndQuizTypeIn(@Param("moduleId") Integer moduleId);

    @Query("""
    SELECT 
        q.id,
        q.title,
        c.name,
        q.dueDate,
        FUNCTION('TIMESTAMPDIFF', DAY, CURRENT_DATE, q.dueDate),
        q.quizType
    FROM Quiz q
    JOIN q.course c
    WHERE q.isActive = true
    AND q.dueDate IS NOT NULL
    AND c.id IN (
        SELECT s.course.id
        FROM Enrollment e
        JOIN e.session s
        WHERE e.user.id = :userId
    )
    AND NOT EXISTS (
        SELECT qa.id
        FROM QuizAttempt qa
        WHERE qa.quiz.id = q.id
        AND qa.user.id = :userId
        AND qa.passed = true
    )
    ORDER BY q.dueDate ASC
""")
    List<Object[]> findPendingQuizDeadlines(@Param("userId") Integer userId);

    /**
     * Count quizzes completed (passed) today by the employee.
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM QuizAttempt qa
        WHERE qa.user_id = :userId
        AND qa.passed = 1
        AND CAST(qa.submitted_at AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer countQuizzesPassedToday(@Param("userId") Integer userId);

    /**
     * Recent activities: quiz attempts (submitted/graded) for the employee, most recent first.
     */
    @Query(value = """
        SELECT TOP 10
            qa.id          AS id,
            'QUIZ'         AS type,
            q.title        AS title,
            c.name         AS course,
            qa.submitted_at AS time
        FROM QuizAttempt qa
        JOIN Quiz q ON qa.quiz_id = q.id
        JOIN Course c ON q.course_id = c.id
        WHERE qa.user_id = :userId
        AND qa.status IN ('SUBMITTED', 'GRADED')
        ORDER BY qa.submitted_at DESC
    """, nativeQuery = true)
    List<Object[]> findRecentQuizActivities(@Param("userId") Integer userId);
}
