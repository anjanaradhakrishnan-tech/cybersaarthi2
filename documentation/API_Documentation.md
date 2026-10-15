# CyberSaarthi REST API Documentation

Base URL: `http://localhost:8080/api` (Spring Boot) or `http://localhost:3000/api` (Express Server)

---

## 1. Message Risk Analysis
**Endpoint:** `POST /api/analyze/message`

**Request Body:**
```json
{
  "messageText": "Congratulations! You have won ₹50,000. Click http://win-lottery.xyz to claim now."
}
```

**Response Body:**
```json
{
  "category": "MESSAGE",
  "riskScore": 85,
  "riskLevel": "HIGH RISK",
  "label": "Take Action Immediately",
  "threatsDetected": [
    "Prize / Lottery Scam Pattern",
    "Embedded Suspicious Link"
  ],
  "reasons": [
    "Message promises unexpected monetary rewards or prizes.",
    "Contains unverified links pointing to unknown websites."
  ],
  "recommendedAction": "Do NOT click any link. Do NOT share OTP, PIN, password or banking details.",
  "disclaimer": "This assessment provides guidance and is not a guarantee of accuracy. Prototype Heuristic Engine."
}
```

---

## 2. Link Safety Check
**Endpoint:** `POST /api/analyze/link`

**Request Body:**
```json
{
  "url": "http://sbi-kyc-verify.xyz/login"
}
```

---

## 3. Submit Fraud Report
**Endpoint:** `POST /api/report`

**Request Body:**
```json
{
  "reporterName": "Citizen User",
  "reporterPhone": "+91 98765 43210",
  "scamType": "Banking Fraud",
  "description": "Received fake SBI KYC SMS asking to click link.",
  "suspiciousUrl": "http://sbi-kyc-verify.xyz/login",
  "amountLost": 0
}
```

**Response Body:**
```json
{
  "referenceId": "CYB-2026-881234",
  "status": "NEW",
  "createdAt": "2026-09-13T20:00:00"
}
```
