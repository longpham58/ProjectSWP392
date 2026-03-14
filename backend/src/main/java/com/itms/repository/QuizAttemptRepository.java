package com.itms.repository;

import com.itms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Integer> {
    
    // Find attempts by quiz and user
    List<QuizAttempt> findByQuizIdAndUserId(Integer quizId, Integer userId);
    
    // Find attempt by ID
    Optional<QuizAttempt> findById(Integer attemptId);
}
