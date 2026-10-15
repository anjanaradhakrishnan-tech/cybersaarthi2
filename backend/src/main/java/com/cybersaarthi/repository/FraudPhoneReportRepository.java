package com.cybersaarthi.repository;

import com.cybersaarthi.model.FraudPhoneReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FraudPhoneReportRepository extends JpaRepository<FraudPhoneReport, Long> {
    Optional<FraudPhoneReport> findByPhoneNumber(String phoneNumber);
}
