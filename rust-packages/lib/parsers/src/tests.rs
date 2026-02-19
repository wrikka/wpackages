#[cfg(test)]
mod tests {
    use crate::{parse_json, parse_toml, parse_xml, parse_yaml};

    #[test]
    fn test_parse_json_valid() {
        let input = r#"{"name": "test", "value": 123}"#;
        let result = parse_json(input.to_string());
        assert!(result.is_ok());
        
        let parsed = result.unwrap();
        assert_eq!(parsed["name"], "test");
        assert_eq!(parsed["value"], 123);
    }

    #[test]
    fn test_parse_json_invalid() {
        let input = r#"{"name": "test", "value": }"#;
        let result = parse_json(input.to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_toml_valid() {
        let input = r#"[package]
name = "test"
version = "1.0.0""#;
        let result = parse_toml(input.to_string());
        assert!(result.is_ok());
        
        let parsed = result.unwrap();
        assert_eq!(parsed["package"]["name"], "test");
        assert_eq!(parsed["package"]["version"], "1.0.0");
    }

    #[test]
    fn test_parse_toml_invalid() {
        let input = r#"[package
name = "test""#;
        let result = parse_toml(input.to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_xml_valid() {
        let input = r#"<root><name>test</name><value>123</value></root>"#;
        let result = parse_xml(input.to_string());
        assert!(result.is_ok());
        
        let parsed = result.unwrap();
        // quick-xml creates object with $text field for text content
        assert_eq!(parsed["name"]["$text"], "test");
        assert_eq!(parsed["value"]["$text"], "123");
    }

    #[test]
    fn test_parse_xml_invalid() {
        let input = r#"<root><name>test</name><value></root>"#;
        let result = parse_xml(input.to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_yaml_valid() {
        let input = r#"name: test
value: 123"#;
        let result = parse_yaml(input.to_string());
        assert!(result.is_ok());
        
        let parsed = result.unwrap();
        assert_eq!(parsed["name"], "test");
        assert_eq!(parsed["value"], 123);
    }

    #[test]
    fn test_parse_yaml_invalid() {
        let input = r#"name: test
value: 123: invalid"#;
        let result = parse_yaml(input.to_string());
        assert!(result.is_err());
    }
}
