//! PII (Personally Identifiable Information) detection

use regex::Regex;
use serde::{Deserialize, Serialize};

/// PII types
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum PiiType {
    Email,
    PhoneNumber,
    Ssn,
    CreditCard,
    IpAddress,
    Address,
    Name,
    DateOfBirth,
    Passport,
    DriverLicense,
}

/// Detected PII
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedPii {
    pub pii_type: PiiType,
    pub value: String,
    pub start: usize,
    pub end: usize,
    pub confidence: f64,
}

/// PII Detector
pub struct PiiDetector {
    patterns: std::collections::HashMap<PiiType, Vec<Regex>>,
}

impl PiiDetector {
    pub fn new() -> Self {
        let mut patterns: std::collections::HashMap<PiiType, Vec<Regex>> = 
            std::collections::HashMap::new();

        // Email pattern
        patterns.insert(PiiType::Email, vec![
            Regex::new(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}").unwrap()
        ]);

        // Phone patterns
        patterns.insert(PiiType::PhoneNumber, vec![
            Regex::new(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b").unwrap(),
            Regex::new(r"\b\+?\d{1,3}[-.]?\d{3,4}[-.]?\d{4}\b").unwrap(),
        ]);

        // SSN pattern
        patterns.insert(PiiType::Ssn, vec![
            Regex::new(r"\b\d{3}-\d{2}-\d{4}\b").unwrap(),
        ]);

        // Credit card patterns
        patterns.insert(PiiType::CreditCard, vec![
            Regex::new(r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b").unwrap(),
        ]);

        // IP address
        patterns.insert(PiiType::IpAddress, vec![
            Regex::new(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b").unwrap(),
        ]);

        Self { patterns }
    }

    pub fn detect(&self, text: &str) -> Vec<DetectedPii> {
        let mut results = Vec::new();

        for (pii_type, patterns) in &self.patterns {
            for pattern in patterns {
                for capture in pattern.find_iter(text) {
                    results.push(DetectedPii {
                        pii_type: *pii_type,
                        value: capture.as_str().to_string(),
                        start: capture.start(),
                        end: capture.end(),
                        confidence: 0.9,
                    });
                }
            }
        }

        results
    }

    pub fn redact(&self, text: &str) -> String {
        let mut redacted = text.to_string();

        for patterns in self.patterns.values() {
            for pattern in patterns {
                redacted = pattern
                    .replace_all(&redacted, "[REDACTED]")
                    .to_string();
            }
        }

        redacted
    }
}

impl Default for PiiDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_email() {
        let detector = PiiDetector::new();
        let text = "Contact us at test@example.com for help";
        let detected = detector.detect(text);
        
        assert!(!detected.is_empty());
        assert_eq!(detected[0].pii_type, PiiType::Email);
    }

    #[test]
    fn test_redact() {
        let detector = PiiDetector::new();
        let text = "Email: test@example.com";
        let redacted = detector.redact(text);
        
        assert!(redacted.contains("[REDACTED]"));
        assert!(!redacted.contains("test@example.com"));
    }
}
