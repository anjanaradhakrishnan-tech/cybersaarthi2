package com.cybersaarthi.repository;

import com.cybersaarthi.model.SmsSpamRecord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmsSpamRepository extends JpaRepository<SmsSpamRecord, Long> {

    List<SmsSpamRecord> findByLabel(String label);

    List<SmsSpamRecord> findTop10ByIsSpamOrderByIdAsc(boolean isSpam);

    long countByIsSpam(boolean isSpam);

    @Query("SELECT s FROM SmsSpamRecord s WHERE LOWER(s.messageText) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<SmsSpamRecord> searchByKeyword(@Param("query") String query, Pageable pageable);
}
