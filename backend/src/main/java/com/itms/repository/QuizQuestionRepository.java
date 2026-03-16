package com.itms.repository;

import com.itms.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Integer> {
    
    List<QuizQuestion> findByQuizIdOrderByDisplayOrderAsc(Integer quizId);
    
    @Query("SELECT q FROM QuizQuestion q WHERE q.quiz.id = :quizId ORDER BY q.displayOrder ASC")
    List<QuizQuestion> findQuestionsByQuizId(@Param("quizId") Integer quizId);
    
    void deleteByQuizId(Integer quizId);
}