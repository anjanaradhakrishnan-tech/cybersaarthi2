# CyberSaarthi Architecture Specification

## Overview
CyberSaarthi is structured as a decoupled, multi-tiered architecture featuring:
1. **Frontend Presentation Layer**: Built with HTML5, CSS3, ES6 JavaScript modules, Web Speech APIs, and PWA Service Workers.
2. **Java Spring Boot Service Layer**: Built with Spring Boot 3.2, RESTful Controllers, Service Orchestrators, and Data Transfer Objects (DTOs).
3. **Data Persistence Layer**: JPA Repositories mapping to an embedded H2/SQLite relational schema.

## Component Breakdown

### 1. Unified Risk Analysis Engine
- **MessageAnalysisService**: Scans incoming text for key threat patterns including OTP requests, banking PIN demands, lottery claims, fake KYC threats, utility bill panics, fake job offers, and remote access software installation.
- **LinkAnalysisService**: Inspects web URLs for SSL encryption status, IP-based hostnames, link shortener masking, high-risk top-level domain extensions, brand spoofing, and excessive hyphenation.
- **PhoneAnalysisService**: Validates number formats, international country codes (+91 vs foreign), virtual SIM ranges, and known digital arrest scam call patterns.
- **MediaAnalysisService**: Assesses uploaded photos and videos for AI-generated artifacts, facial feature smoothing, lighting mismatches, and compression anomalies.

### 2. Chatbot & Voice Subsystem
- Uses Web Speech `SpeechRecognition` for hands-free speech input.
- Uses Web Speech `SpeechSynthesis` for audio reading of safety warnings.
- Gracefully degrades to text mode if browser APIs are unavailable.

### 3. Java Helpline Operator Console
- Tracks helpline call queues and citizen fraud reports.
- Supports lifecycle state transitions: `NEW` -> `IN PROGRESS` -> `ESCALATED` -> `RESOLVED`.
- Persists data to the JPA repository layer.
