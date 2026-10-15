package com.cybersaarthi.service;

import com.cybersaarthi.model.SmsMatchResult;
import com.cybersaarthi.model.SmsSpamRecord;
import com.cybersaarthi.repository.SmsSpamRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SmsSpamDatabaseService {

    @Autowired(required = false)
    private SmsSpamRepository repository;

    private final List<SmsSpamRecord> inMemoryRecords = new ArrayList<>();
    private final Map<String, Integer> spamWordFreq = new ConcurrentHashMap<>();
    private final Map<String, Integer> hamWordFreq = new ConcurrentHashMap<>();
    private final Set<String> knownSpamNumbers = ConcurrentHashMap.newKeySet();

    private int totalSpamCount = 0;
    private int totalHamCount = 0;
    private long totalSpamTokens = 0;
    private long totalHamTokens = 0;

    private static final Pattern WORD_PATTERN = Pattern.compile("[a-zA-Z0-9£$€]+");
    private static final Pattern PHONE_PATTERN = Pattern.compile("\\b(0[7-9]\\d{9}|08\\d{8,9}|09\\d{8,9}|\\+44\\d{10}|\\d{5})\\b");

    @PostConstruct
    public void init() {
        loadDatabaseFromCsv();
    }

    public synchronized void loadDatabaseFromCsv() {
        if (!inMemoryRecords.isEmpty()) return;

        try {
            InputStream is = null;
            try {
                ClassPathResource resource = new ClassPathResource("sms_spam_collection.csv");
                if (resource.exists()) {
                    is = resource.getInputStream();
                }
            } catch (Exception ignored) {}

            if (is == null) {
                String[] candidatePaths = {
                        "src/main/resources/sms_spam_collection.csv",
                        "backend/src/main/resources/sms_spam_collection.csv",
                        "database/sms_spam_collection.csv",
                        "../database/sms_spam_collection.csv",
                        "sms_spam_collection.csv"
                };
                for (String p : candidatePaths) {
                    java.io.File file = new java.io.File(p);
                    if (file.exists() && file.isFile()) {
                        is = new java.io.FileInputStream(file);
                        break;
                    }
                }
            }

            if (is == null) {
                System.err.println("[CyberSaarthi] SMS Spam Collection CSV not found. Initializing with core knowledge patterns.");
                return;
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                StringBuilder fullText = new StringBuilder();
                String l;
                while ((l = reader.readLine()) != null) {
                    fullText.append(l).append("\n");
                }

                List<ParsedRow> rows = parseCsvContent(fullText.toString());
                List<SmsSpamRecord> batchToSave = new ArrayList<>();

                for (ParsedRow row : rows) {
                    if (row.text.isEmpty()) continue;

                    SmsSpamRecord record = new SmsSpamRecord(row.label, row.isSpam, row.text);
                    record.setId((long) (inMemoryRecords.size() + 1));
                    inMemoryRecords.add(record);

                    if (row.isSpam) {
                        totalSpamCount++;
                        Matcher phoneMatcher = PHONE_PATTERN.matcher(row.text);
                        while (phoneMatcher.find()) {
                            knownSpamNumbers.add(phoneMatcher.group());
                        }
                    } else {
                        totalHamCount++;
                    }

                    // Word frequency
                    Set<String> words = tokenize(row.text);
                    for (String w : words) {
                        if (row.isSpam) {
                            spamWordFreq.put(w, spamWordFreq.getOrDefault(w, 0) + 1);
                            totalSpamTokens++;
                        } else {
                            hamWordFreq.put(w, hamWordFreq.getOrDefault(w, 0) + 1);
                            totalHamTokens++;
                        }
                    }

                    if (repository != null) {
                        batchToSave.add(record);
                    }
                }

                // Batch persist initial slice to database if empty
                if (repository != null && repository.count() == 0 && !batchToSave.isEmpty()) {
                    try {
                        repository.saveAll(batchToSave);
                    } catch (Exception ex) {
                        // In-memory fallback
                    }
                }

                System.out.println("[CyberSaarthi] Successfully loaded " + inMemoryRecords.size() +
                        " SMS spam database records (" + totalSpamCount + " spam, " + totalHamCount + " ham, " +
                        knownSpamNumbers.size() + " scam numbers).");
            }
        } catch (Exception e) {
            System.err.println("[CyberSaarthi] Error loading SMS Spam Database: " + e.getMessage());
        }
    }

    private static class ParsedRow {
        String label;
        boolean isSpam;
        String text;
        ParsedRow(String label, boolean isSpam, String text) {
            this.label = label;
            this.isSpam = isSpam;
            this.text = text;
        }
    }

    private List<ParsedRow> parseCsvContent(String csv) {
        List<ParsedRow> records = new ArrayList<>();
        String[] lines = csv.split("\\r?\\n");
        int i = 0;
        if (lines.length > 0 && lines[0].toLowerCase().contains("v1,v2")) {
            i = 1;
        }

        for (; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            String label;
            boolean isSpam;
            if (line.startsWith("spam,")) {
                label = "spam";
                isSpam = true;
                line = line.substring(5);
            } else if (line.startsWith("ham,")) {
                label = "ham";
                isSpam = false;
                line = line.substring(4);
            } else {
                continue;
            }

            String text = "";
            if (line.startsWith("\"")) {
                StringBuilder acc = new StringBuilder(line.substring(1));
                boolean quoteClosed = false;
                while (true) {
                    int endIdx = -1;
                    String s = acc.toString();
                    for (int c = 0; c < s.length(); c++) {
                        if (s.charAt(c) == '"') {
                            if (c + 1 < s.length() && s.charAt(c + 1) == '"') {
                                c++; // escaped quote
                            } else {
                                endIdx = c;
                                break;
                            }
                        }
                    }
                    if (endIdx != -1) {
                        text = s.substring(0, endIdx).replace("\"\"", "\"");
                        quoteClosed = true;
                        break;
                    } else {
                        i++;
                        if (i >= lines.length) break;
                        acc.append("\n").append(lines[i]);
                    }
                }
                if (!quoteClosed) {
                    text = acc.toString().replace("\"\"", "\"");
                }
            } else {
                text = line.replaceAll(",+$", "").trim();
            }

            text = text.trim();
            if (!text.isEmpty()) {
                records.add(new ParsedRow(label, isSpam, text));
            }
        }
        return records;
    }

    public SmsMatchResult checkSms(String inputMessage) {
        if (inputMessage == null || inputMessage.trim().isEmpty()) {
            return new SmsMatchResult(false, 0, 0.0, 0.0, "", "NONE", null, List.of(), "Empty message provided.");
        }

        String inputLower = inputMessage.toLowerCase();
        Set<String> inputTokens = tokenize(inputMessage);

        // 1. Check known spam telephone numbers / shortcodes extracted from database
        List<String> detectedNumbers = new ArrayList<>();
        for (String num : knownSpamNumbers) {
            if (num.length() >= 5 && inputLower.contains(num.toLowerCase())) {
                detectedNumbers.add(num);
            }
        }

        // 2. High-value Spam Keywords & Bayesian Log-Odds
        List<String> matchedSpamKeywords = new ArrayList<>();
        double logOdds = 0.0;
        int vocabSize = Math.max(1, spamWordFreq.size() + hamWordFreq.size());

        for (String token : inputTokens) {
            int sCount = spamWordFreq.getOrDefault(token, 0);
            int hCount = hamWordFreq.getOrDefault(token, 0);

            // Only score tokens that exist in corpus vocabulary to prevent unseen words skewing probabilities
            if (sCount > 0 || hCount > 0) {
                double pWordGivenSpam = (sCount + 1.0) / (totalSpamTokens + vocabSize);
                double pWordGivenHam = (hCount + 1.0) / (totalHamTokens + vocabSize);
                logOdds += Math.log(pWordGivenSpam / pWordGivenHam);

                if (sCount >= 3 && (double) sCount / (hCount + 1) >= 2.5) {
                    matchedSpamKeywords.add(token);
                }
            }
        }

        // Prior odds
        double priorOdds = (double) Math.max(1, totalSpamCount) / Math.max(1, totalHamCount);
        double posteriorOdds = priorOdds * Math.exp(Math.max(-20.0, Math.min(20.0, logOdds)));
        double spamBayesScore = (posteriorOdds / (1.0 + posteriorOdds)) * 100.0;
        if (matchedSpamKeywords.isEmpty() && detectedNumbers.isEmpty()) {
            spamBayesScore = Math.min(spamBayesScore, 40.0);
        }

        // 3. Find closest matching SPAM and HAM records from the 5,572 database corpus
        SmsSpamRecord bestSpamMatch = null;
        double bestSpamSimilarity = 0.0;
        SmsSpamRecord bestHamMatch = null;
        double bestHamSimilarity = 0.0;

        for (SmsSpamRecord record : inMemoryRecords) {
            double sim = calculateJaccardSimilarity(inputTokens, tokenize(record.getMessageText()));
            if (record.isSpam()) {
                if (sim > bestSpamSimilarity) {
                    bestSpamSimilarity = sim;
                    bestSpamMatch = record;
                }
            } else {
                if (sim > bestHamSimilarity) {
                    bestHamSimilarity = sim;
                    bestHamMatch = record;
                }
            }
        }

        // 4. Calculate consolidated risk score & rationale
        int riskScore = 0;
        boolean isSpamDetected = false;
        StringBuilder rationale = new StringBuilder();

        if (bestSpamMatch != null && bestSpamSimilarity >= 0.40) {
            isSpamDetected = true;
            riskScore = Math.max(riskScore, (int) Math.round(bestSpamSimilarity * 100));
            rationale.append(String.format("Direct high-confidence match (%.1f%% similarity) with verified spam record #%d in database. ",
                    bestSpamSimilarity * 100, bestSpamMatch.getId()));
        }

        if (!detectedNumbers.isEmpty()) {
            riskScore = Math.max(riskScore, 90);
            isSpamDetected = true;
            rationale.append("Detected known scam phone number or shortcode from database: ").append(String.join(", ", detectedNumbers)).append(". ");
        }

        if (matchedSpamKeywords.size() >= 2) {
            riskScore = Math.max(riskScore, (int) Math.min(spamBayesScore, 85.0));
            isSpamDetected = true;
            rationale.append("Contains high-frequency promotional/fraud keywords: ").append(String.join(", ", matchedSpamKeywords)).append(". ");
        }

        if (bestHamMatch != null && bestHamSimilarity >= 0.65 && bestSpamSimilarity < 0.35 && detectedNumbers.isEmpty() && matchedSpamKeywords.size() <= 1) {
            if (riskScore == 0) {
                rationale.append(String.format("Pattern closely matches known legitimate user message (Ham record #%d, %.1f%% similarity). ",
                        bestHamMatch.getId(), bestHamSimilarity * 100));
            }
        }

        if (riskScore == 0) {
            rationale.append("Does not match known scam patterns in the CyberSaarthi SMS Spam Database. ");
        }

        SmsSpamRecord chosenBest = (bestSpamSimilarity >= bestHamSimilarity && bestSpamMatch != null) ? bestSpamMatch : bestHamMatch;
        String matchedSnippet = (chosenBest != null) ? chosenBest.getMessageText() : "";
        String matchedCategory = (chosenBest != null) ? chosenBest.getLabel().toUpperCase() : "NONE";
        Long matchedId = (chosenBest != null) ? chosenBest.getId() : null;

        SmsMatchResult result = new SmsMatchResult(
                isSpamDetected,
                riskScore,
                Math.round(spamBayesScore * 10.0) / 10.0,
                Math.round(bestSpamSimilarity * 1000.0) / 1000.0,
                matchedSnippet,
                matchedCategory,
                matchedId,
                matchedSpamKeywords,
                rationale.toString().trim()
        );

        result.setDetectedNumbers(detectedNumbers);
        result.setHamSimilarity(Math.round(bestHamSimilarity * 1000.0) / 1000.0);
        if (bestHamMatch != null) {
            result.setMatchedHamId(bestHamMatch.getId());
            result.setMatchedHamSnippet(bestHamMatch.getMessageText());
        }
        result.setCorpusSize(inMemoryRecords.size());

        return result;
    }

    private double calculateJaccardSimilarity(Set<String> set1, Set<String> set2) {
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        int intersection = 0;
        for (String s : set1) {
            if (set2.contains(s)) intersection++;
        }
        int union = set1.size() + set2.size() - intersection;
        return (double) intersection / union;
    }

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        Set<String> tokens = new HashSet<>();
        Matcher m = WORD_PATTERN.matcher(text.toLowerCase());
        while (m.find()) {
            String word = m.group();
            if (word.length() > 1) {
                tokens.add(word);
            }
        }
        return tokens;
    }

    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecords", inMemoryRecords.size());
        stats.put("spamCount", totalSpamCount);
        stats.put("hamCount", totalHamCount);
        stats.put("spamPercentage", inMemoryRecords.isEmpty() ? "0%" :
                String.format("%.2f%%", ((double) totalSpamCount / inMemoryRecords.size()) * 100));
        stats.put("distinctSpamKeywords", spamWordFreq.size());
        stats.put("extractedSpamNumbers", knownSpamNumbers.size());
        return stats;
    }

    public List<SmsSpamRecord> searchRecords(String query, String type, int limit) {
        List<SmsSpamRecord> source = inMemoryRecords;
        if ("spam".equalsIgnoreCase(type)) {
            source = source.stream().filter(r -> r != null && r.isSpam()).collect(Collectors.toList());
        } else if ("ham".equalsIgnoreCase(type)) {
            source = source.stream().filter(r -> r != null && !r.isSpam()).collect(Collectors.toList());
        }

        if (query == null || query.trim().isEmpty()) {
            return source.stream().limit(limit).collect(Collectors.toList());
        }

        String qClean = query.trim().toLowerCase();
        if (qClean.startsWith("#")) {
            try {
                long targetId = Long.parseLong(qClean.substring(1));
                return source.stream().filter(r -> r != null && r.getId() != null && r.getId() == targetId).limit(limit).collect(Collectors.toList());
            } catch (Exception ignored) {}
        }

        return source.stream()
                .filter(r -> r != null && r.getMessageText() != null && r.getMessageText().toLowerCase().contains(qClean))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<SmsSpamRecord> getSampleRecords(int count) {
        List<SmsSpamRecord> samples = new ArrayList<>();
        inMemoryRecords.stream().filter(r -> r != null && r.isSpam()).limit(count / 2).forEach(samples::add);
        inMemoryRecords.stream().filter(r -> r != null && !r.isSpam()).limit(count / 2).forEach(samples::add);
        return samples;
    }
}
