package com.cybersaarthi.service;

import com.cybersaarthi.model.HelplineCall;
import com.cybersaarthi.repository.HelplineCallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class HelplineService {

    @Autowired(required = false)
    private HelplineCallRepository helplineCallRepository;

    public HelplineCall registerCall(HelplineCall call) {
        String callRef = "CALL-2026-" + String.format("%06d", new Random().nextInt(900000) + 100000);
        call.setCallRef(callRef);

        if (helplineCallRepository != null) {
            return helplineCallRepository.save(call);
        }
        return call;
    }

    public List<HelplineCall> getAllCalls() {
        if (helplineCallRepository != null) {
            return helplineCallRepository.findAll();
        }
        return List.of();
    }

    public HelplineCall updateStatus(Long id, String status, String notes) {
        if (id != null && helplineCallRepository != null) {
            Optional<HelplineCall> optionalCall = helplineCallRepository.findById(id);
            if (optionalCall.isPresent()) {
                HelplineCall call = optionalCall.get();
                if (status != null) {
                    call.setStatus(status);
                }
                if (notes != null) {
                    call.setOperatorNotes(notes);
                }
                call.setUpdatedAt(LocalDateTime.now());
                return helplineCallRepository.save(call);
            }
        }
        return null;
    }
}
