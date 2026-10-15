package com.cybersaarthi.repository;

import com.cybersaarthi.model.HelplineCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelplineCallRepository extends JpaRepository<HelplineCall, Long> {
    Optional<HelplineCall> findByCallRef(String callRef);
    List<HelplineCall> findByStatus(String status);
    List<HelplineCall> findByRiskLevel(String riskLevel);
}
