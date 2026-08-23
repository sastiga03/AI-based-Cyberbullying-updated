package com.mainservice.util;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CyberbullyingAnalyzer {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public static class AnalysisResult {
        private final int severityScore;
        private final String flagStatus; // "Flagged" or "Safe"
        private final String result;     // e.g. "Threatening ------ 92% ------ High"
        private final String category;   // Threat, Harassment, Insult, Exclusion, Clean
        private final boolean isBullying;
        private final List<String> flaggedTerms;

        public AnalysisResult(int severityScore, String flagStatus, String result, String category, boolean isBullying, List<String> flaggedTerms) {
            this.severityScore = severityScore;
            this.flagStatus = flagStatus;
            this.result = result;
            this.category = category;
            this.isBullying = isBullying;
            this.flaggedTerms = flaggedTerms != null ? flaggedTerms : Collections.emptyList();
        }

        public int getSeverityScore() {
            return severityScore;
        }

        public String getFlagStatus() {
            return flagStatus;
        }

        public String getResult() {
            return result;
        }

        public String getCategory() {
            return category;
        }

        public boolean isBullying() {
            return isBullying;
        }

        public List<String> getFlaggedTerms() {
            return flaggedTerms;
        }
    }

    private static final Set<String> NEGATION_WORDS = new HashSet<>(Arrays.asList(
            "not", "never", "no", "don't", "dont", "isn't", "isnt", "aren't", "arent", "wasn't", "wasnt", "hardly", "barely", "scarcely", "without"
    ));

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = new HashMap<>();

    static {
        CATEGORY_KEYWORDS.put("Threat", Arrays.asList(
                "die", "kill", "kill yourself", "threat", "destroy", "hurt", "hang", "suicide", "murder", "stab",
                "beat you", "beat you up", "break your", "cut yourself", "watch your back", "punch you", "end your life", "burn you",
                "shoot", "strangle", "drown", "knife", "weapon", "slit", "bullet", "not worth living", "not worth for living",
                "dont deserve to live", "waste of life", "waste of space", "better off dead", "not worth",
                "hunt you down", "finish you", "finish your chapter", "under my control", "hunt", "scared of me", "be scared"
        ));

        CATEGORY_KEYWORDS.put("Harassment", Arrays.asList(
                "creep", "stalk", "stalker", "harass", "bitch", "slut", "whore", "bastard", "target", "freak",
                "pervert", "psychopath", "bully", "abuse", "torture", "terrorize", "chase", "humiliate"
        ));

        CATEGORY_KEYWORDS.put("Insult", Arrays.asList(
                "cow", "elephant", "pig", "fat", "ugly", "jerk", "loser", "idiot", "dumb", "fool", "useless", "rude",
                "shut up", "clown", "stupid", "garbage", "trash", "worthless", "moron", "pathetic", "donkey",
                "monkey", "dog", "filth", "scum", "disgusting", "shame", "dummy", "not fit", "not fit for anything",
                "good for nothing", "fit for nothing", "waste"
        ));

        CATEGORY_KEYWORDS.put("Exclusion", Arrays.asList(
                "isolate", "isolated", "exclude", "ignore", "not friend", "never include", "nobody likes you",
                "no one cares", "stay away", "get out", "you dont belong", "leave us", "unwanted", "kicked out"
        ));
    }

    /**
     * Stage 1: Leetspeak and Obfuscation Normalizer
     * Transforms disguised text (e.g. "b!tch", "f00l", "k!ll", "looooser") into standard clean text.
     */
    public String normalizeLeetspeak(String input) {
        if (input == null) return "";
        String s = input.toLowerCase();

        // Common leetspeak symbol mappings
        s = s.replace("@", "a")
             .replace("0", "o")
             .replace("1", "i")
             .replace("!", "i")
             .replace("$", "s")
             .replace("5", "s")
             .replace("3", "e")
             .replace("+", "t")
             .replace("7", "t")
             .replace("4", "a")
             .replace("8", "b");

        // Collapse repeated characters (e.g. "looooser" -> "loser", "faaaat" -> "fat")
        s = s.replaceAll("([a-z])\\1{2,}", "$1");

        // Collapse single letter spaced words (e.g. "u g l y" -> "ugly") without stripping normal spaces
        s = s.replaceAll("\\b([a-z])\\s+([a-z])\\s+([a-z])\\s+([a-z])\\s+([a-z])\\b", "$1$2$3$4$5");
        s = s.replaceAll("\\b([a-z])\\s+([a-z])\\s+([a-z])\\s+([a-z])\\b", "$1$2$3$4");
        s = s.replaceAll("\\b([a-z])\\s+([a-z])\\s+([a-z])\\b", "$1$2$3");

        return s.trim();
    }

    /**
     * Stage 2 & 3 & 4: Context & Negation Scope Analysis + Multi-Class Weighted Scoring
     */
    public AnalysisResult analyze(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new AnalysisResult(0, "Safe", "Safe ------ 0% ------ Low", "Clean", false, Collections.emptyList());
        }

        // Try Gemini API if key is present
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("$") && !apiKey.contains("GEMINI_API_KEY")) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey.trim();

                // Build request JSON body
                Map<String, Object> reqBody = new HashMap<>();
                
                Map<String, Object> part = new HashMap<>();
                part.put("text", "System Prompt: Analyze the following student text for cyberbullying or harassment. Respond ONLY with a JSON object in this format: { \"isHarmful\": true/false, \"severityScore\": 0 to 100, \"category\": \"Threat\" | \"Harassment\" | \"Insult\" | \"Exclusion\" | \"None\", \"reason\": \"Brief explanation of the decision\" }. Text: " + text);
                
                Map<String, Object> partContainer = new HashMap<>();
                partContainer.put("parts", Collections.singletonList(part));
                
                reqBody.put("contents", Collections.singletonList(partContainer));
                
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("responseMimeType", "application/json");
                reqBody.put("generationConfig", generationConfig);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(reqBody), headers);
                
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                    if (!textNode.isMissingNode()) {
                        String cleanJson = textNode.asText().trim();
                        JsonNode resJson = objectMapper.readTree(cleanJson);

                        boolean isHarmful = resJson.path("isHarmful").asBoolean(false);
                        int severityScore = resJson.path("severityScore").asInt(0);
                        String category = resJson.path("category").asText("Clean");
                        String reason = resJson.path("reason").asText("");

                        if ("None".equalsIgnoreCase(category)) {
                            category = "Clean";
                        }

                        boolean isBullying = isHarmful;
                        String flagStatus = isBullying ? "Flagged" : "Safe";

                        String tier;
                        if (severityScore >= 75) {
                            tier = "At Risk";
                        } else if (severityScore >= 50) {
                            tier = "High";
                        } else if (severityScore >= 30) {
                            tier = "Average";
                        } else {
                            tier = "Low";
                        }

                        String resultStr = (isBullying ? category : "Safe") + " ------ " + severityScore + "% ------ " + tier;
                        List<String> flagged = new ArrayList<>();
                        if (!reason.isEmpty()) {
                            flagged.add(reason);
                        }

                        return new AnalysisResult(severityScore, flagStatus, resultStr, category, isBullying, flagged);
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API call failed, falling back to rule-based: " + e.getMessage());
            }
        }

        // Meta-safety ethical statement bypass (e.g. "Calling someone useless is wrong")
        String lowerText = text.toLowerCase();
        List<String> safePhrases = java.util.Arrays.asList(
            "is wrong",
            "is bad",
            "is unacceptable",
            "is inappropriate",
            "is not correct",
            "is not allowed",
            "should not call",
            "should never call",
            "is forbidden",
            "is illegal",
            "not correct to call",
            "is disrespectful",
            "is not polite",
            "is mean"
        );
        for (String phrase : safePhrases) {
            if (lowerText.contains(phrase)) {
                return new AnalysisResult(2, "Safe", "Safe ------ 2% ------ Low", "Clean", false, java.util.Collections.emptyList());
            }
        }

        String normalized = normalizeLeetspeak(text);
        String[] tokens = normalized.split("[\\s,;:.!?]+");
        List<String> flaggedTerms = new ArrayList<>();

        int threatScore = 0;
        int harassmentScore = 0;
        int insultScore = 0;
        int exclusionScore = 0;

        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            
            // Check for single words (Unigrams), 2-word phrases (Bigrams), 3-word phrases (Trigrams)
            String unigram = token;
            String bigram = (i + 1 < tokens.length) ? token + " " + tokens[i + 1] : "";
            String trigram = (i + 2 < tokens.length) ? token + " " + tokens[i + 1] + " " + tokens[i + 2] : "";

            // Check negation scope in previous 3 tokens
            boolean isNegated = false;
            for (int k = Math.max(0, i - 3); k < i; k++) {
                if (NEGATION_WORDS.contains(tokens[k])) {
                    isNegated = true;
                    break;
                }
            }

            for (Map.Entry<String, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
                String cat = entry.getKey();
                List<String> keywords = entry.getValue();

                for (String kw : keywords) {
                    boolean matches = unigram.equals(kw) || 
                                     (!bigram.isEmpty() && bigram.equals(kw)) || 
                                     (!trigram.isEmpty() && trigram.equals(kw));

                    if (matches) {
                        if (isNegated) {
                            // Negation detected ("not ugly", "never stupid") -> Do not score as bullying!
                            continue;
                        }

                        if (!flaggedTerms.contains(kw)) {
                            flaggedTerms.add(kw);
                        }

                        if ("Threat".equals(cat)) {
                            threatScore += 35;
                        } else if ("Harassment".equals(cat)) {
                            harassmentScore += 25;
                        } else if ("Insult".equals(cat)) {
                            insultScore += 20;
                        } else if ("Exclusion".equals(cat)) {
                            exclusionScore += 18;
                        }
                    }
                }
            }
        }

        String dominantCategory = "Clean";
        int totalScore = 0;

        if (threatScore > 0) {
            dominantCategory = "Threat";
            totalScore = 95;
        } else if (harassmentScore > 0) {
            dominantCategory = "Harassment";
            totalScore = 80;
        } else if (insultScore > 0) {
            dominantCategory = "Insult";
            totalScore = 60;
        } else if (exclusionScore > 0) {
            dominantCategory = "Exclusion";
            totalScore = 50;
        }

        boolean isBullying = totalScore >= 30;
        String flagStatus = isBullying ? "Flagged" : "Safe";

        String tier;
        if (totalScore >= 75) {
            tier = "At Risk";
        } else if (totalScore >= 50) {
            tier = "High";
        } else if (totalScore >= 30) {
            tier = "Average";
        } else {
            tier = "Low";
        }

        String resultStr = (isBullying ? dominantCategory : "Safe") + " ------ " + (isBullying ? totalScore : Math.max(2, totalScore)) + "% ------ " + tier;

        return new AnalysisResult(
                isBullying ? totalScore : Math.max(2, totalScore),
                flagStatus,
                resultStr,
                dominantCategory,
                isBullying,
                flaggedTerms
        );
    }
}

