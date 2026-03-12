package com.itms.repository;

import com.itms.entity.QuizRequiredModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRequiredModuleRepository extends JpaRepository<QuizRequiredModule, Integer> {

    /**
     * Find all required modules for a specific quiz
     */
    List<QuizRequiredModule> findByQuizId(Integer quizId);

    /**
     * Find all required module IDs for a specific quiz
     */
    @Query("SELECT qrm.module.id FROM QuizRequiredModule qrm WHERE qrm.quiz.id = :quizId")
    List<Integer> findModuleIdsByQuizId(@Param("quizId") Integer quizId);

    /**
     * Find if any of the required modules for a quiz are completed by a user
     * Returns true if at least one required module is completed
     */
    @Query("""
        SELECT CASE WHEN COUNT(qrm) > 0 THEN true ELSE false END
        FROM QuizRequiredModule qrm
        JOIN UserModuleProgress ump ON ump.module.id = qrm.module.id
        WHERE qrm.quiz.id = :quizId
        AND ump.user.id = :userId
        AND ump.isCompleted = true
        """)
    Boolean isAnyRequiredModuleCompleted(@Param("quizId") Integer quizId, @Param("userId") Integer userId);

    /**
     * Find all quizzes in a course that have their any required module completed
     */
    @Query("""
        SELECT DISTINCT qrm.quiz.id
        FROM QuizRequiredModule qrm
        JOIN UserModuleProgress ump ON ump.module.id = qrm.module.id
        WHERE qrm.quiz.course.id = :courseId
        AND ump.user.id = :userId
        AND ump.isCompleted = true
        """)
    List<Integer> findQuizIdsWithAnyRequiredModuleCompleted(@Param("courseId") Integer courseId, @Param("userId") Integer userId);
}
