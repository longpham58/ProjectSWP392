package com.itms.repository;


import com.itms.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Integer> {
    List<Certificate> findByUserId(Integer userId);

    /**
     * Recent certificate activities for the employee, most recent first.
     */
    @Query(value = """
        SELECT TOP 10
            cert.id        AS id,
            'CERTIFICATE'  AS type,
            cert.certificate_code AS title,
            c.name         AS course,
            cert.issue_date AS time
        FROM Certificate cert
        JOIN Course c ON cert.course_id = c.id
        WHERE cert.user_id = :userId
        AND cert.is_valid = 1
        ORDER BY cert.issue_date DESC
    """, nativeQuery = true)
    List<Object[]> findRecentCertificateActivities(@Param("userId") Integer userId);

    /**
     * Count certificates for a user.
     */
    @Query("SELECT COUNT(c) FROM Certificate c WHERE c.user.id = :userId AND c.isValid = true")
    Integer countByUserId(@Param("userId") Integer userId);
}
