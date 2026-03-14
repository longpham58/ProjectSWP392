package com.itms.repository;

import com.itms.dto.DeadlineDto;
import com.itms.dto.RecentActivityDto;
import com.itms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    @Query("""
    SELECT new com.itms.dto.DeadlineDto(
        q.id,
        q.title,
        c.name,
        q.dueDate,
        FUNCTION('TIMESTAMPDIFF', DAY, CURRENT_DATE, q.dueDate),
        null,
        q.quizType
    )
    FROM Quiz q
    JOIN q.course c
    WHERE q.isActive = true
    AND q.dueDate IS NOT NULL
    AND c.id IN (
<<<<<<< Updated upstream
        SELECT s.course.id
=======
        SELECT e.session.course.id
>>>>>>> Stashed changes
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
    List<DeadlineDto> findPendingQuizDeadlines(@Param("userId") Integer userId);

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
