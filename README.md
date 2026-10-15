# CyberSaarthi – Cybersecurity Without Digital Exclusion

[![CyberSaarthi Platform](https://img.shields.io/badge/Platform-CyberSaarthi-1e3a8a?style=for-the-badge&logo=shield)](https://github.com/)
[![Java Spring Boot](https://img.shields.io/badge/Backend-Java_Spring_Boot_3.2-007396?style=for-the-badge&logo=java)](https://spring.io/)
[![PWA Ready](https://img.shields.io/badge/Frontend-HTML5_CSS3_JS_PWA-2563eb?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

CyberSaarthi is an inclusive cyber-safety companion platform designed for ordinary citizens, students, parents, elderly people, and users with low digital literacy.

---

## 1. Problem Statement & Solution

Millions of ordinary citizens in India fall victim to cyber fraud every day—ranging from fake bank SMS threats, OTP phishing, and UPI refund traps to high-tech AI deepfakes and 'Digital Arrest' video call scams. Most existing cybersecurity tools are complex, jargon-heavy dashboards built for IT professionals.

**CyberSaarthi** breaks digital exclusion by offering:
- Plain-language risk warnings (`LOW RISK` Likely Safe, `SUSPICIOUS` Proceed With Care, `HIGH RISK` Take Action Immediately).
- **Elder Mode**: High-contrast, large text, audio reading, and simplified 1-click warning cards.
- **Regional Language Support**: English, Malayalam (മലയാളം), and Hindi (हिन्दी).
- **Java Spring Boot Helpline Backend**: A REST API & Operator Console for helpline call registration and scam report tracking.
- **Judge Demo Mode**: Preset scenario triggers for instant PBL evaluation.

---

## 2. System Architecture

```
                                  CYBERSAARTHI PLATFORM
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              ▼                             ▼                             ▼
     Responsive Web App              PWA (Mobile App)           Java Helpline Backend
   (HTML5, CSS3, JS, i18n)         (Service Worker, Manifest)     (Spring Boot 3.2, JPA)
              │                             │                             │
              └─────────────────────────────┼─────────────────────────────┘
                                            ▼
                               Unified Analysis Engine
                     (Message, Link, Phone, Media, Chatbot API)
                                            │
                                            ▼
                                  Relational Database
                                (H2 / SQLite / MySQL)
```

---

## 3. Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design Tokens, Elder-Mode Accessibility), JavaScript ES6 Modules, Web Speech API (Speech Recognition & Speech Synthesis).
- **Mobile / PWA**: Web App Manifest (`manifest.json`), Service Worker (`service-worker.js`), Offline Caching.
- **Backend**: Java 17, Spring Boot 3.2.3, Spring Data JPA, H2 Database (In-Memory / File persistence), Maven (`pom.xml` / `mvnw`).
- **Server Option**: Node.js Express static launcher (`frontend/server.js`) for instant 1-command deployment.

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18+) OR Java JDK 17+ with Maven.

### Option A: Run via Node.js Express Server (Instant Setup)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the application
npm start

# 4. Open in browser at:
http://localhost:3000
```

### Option B: Run via Java Spring Boot Backend
```bash
# 1. Navigate to backend directory
cd backend

# 2. Build and run Spring Boot application
mvn spring-boot:run
# OR on Windows:
.\mvnw.cmd spring-boot:run

# 3. Access REST API at http://localhost:8080/api
# 4. H2 Console at http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:cybersaarthidb)
```

---

## 5. REST API Documentation

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze/message` | `POST` | Analyzes SMS/text for OTP, banking, job, or lottery scam patterns |
| `/api/analyze/link` | `POST` | Checks URL hostname, SSL encryption, TLDs, and bank brand spoofs |
| `/api/analyze/phone` | `POST` | Analyzes phone number format, country code, and reported spam indicators |
| `/api/analyze/media` | `POST` | Evaluates facial, lighting, and compression artifacts for AI deepfakes |
| `/api/chat` | `POST` | CyberSaarthi Assistant chatbot response query engine |
| `/api/report` | `POST` | Submits fraud complaint & generates reference ID (e.g. `CYB-2026-001245`) |
| `/api/helpline/call` | `POST` | Registers incoming helpline dispatch call for operator console |
| `/api/helpline/calls` | `GET` | Retrieves live queue of helpline complaints for operator console |
| `/api/help` | `GET` | Returns 5-step emergency response checklist & national helpline 1930 |

---

## 6. PBL Judge Demo Mode Guide

Click the floating **"⚖ PBL Judge Demo Mode"** button at the bottom-right corner of the screen:
1. **Scenario 1**: Fake Bank SMS Phishing
2. **Scenario 2**: Suspicious Shortened URL
3. **Scenario 3**: International Scam Number
4. **Scenario 4**: UPI Refund Scam Message
5. **Scenario 5**: AI Deepfake Media Inspection
6. **Scenario 6**: Elder User High Risk Mode

Or click **"🎬 RUN MAIN DEMONSTRATION FLOW"** to execute all 13 steps automatically from message analysis to Java backend ticket generation and Admin Operator Dashboard display!

---

## 7. Disclaimers & Ethics

> [!IMPORTANT]
> This platform provides heuristic guidance and risk assessment for educational and awareness purposes. It is a student Project-Based Learning (PBL) prototype and does not guarantee 100% scam detection accuracy. In emergencies, citizens should contact National Cyber Crime Hotline at **1930** or visit [cybercrime.gov.in](https://cybercrime.gov.in).

---

## 8. License

Distributed under the MIT License. See `LICENSE` for more information.
