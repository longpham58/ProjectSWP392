package com.itms.repository;

import com.itms.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    Page<Comment> findByCourse_IdAndParentIsNullOrderByCreatedAtDesc(Integer courseId, Pageable pageable);

    List<Comment> findByParent_IdOrderByCreatedAtAsc(Integer parentId);
}