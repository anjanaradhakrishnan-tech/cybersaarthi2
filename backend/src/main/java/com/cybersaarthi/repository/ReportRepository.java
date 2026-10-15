package com.cybersaarthi.repository;

import com.cybersaarthi.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByReferenceId(String referenceId);
    List<Report> findByRiskLevel(String riskLevel);
    List<Report> findByStatus(String status);
}
