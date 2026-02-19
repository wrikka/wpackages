//! Pure mathematical utility functions

use statrs::statistics::Statistics;

/// Calculate mean of a slice of f64 values
pub fn mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    values.iter().sum::<f64>() / values.len() as f64
}

/// Calculate median of a slice of f64 values
pub fn median(values: &mut [f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    
    values.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let len = values.len();
    
    if len % 2 == 0 {
        (values[len / 2 - 1] + values[len / 2]) / 2.0
    } else {
        values[len / 2]
    }
}

/// Calculate standard deviation
pub fn standard_deviation(values: &[f64]) -> f64 {
    if values.len() < 2 {
        return 0.0;
    }
    
    let mean_val = mean(values);
    let variance = values
        .iter()
        .map(|&x| (x - mean_val).powi(2))
        .sum::<f64>() / (values.len() - 1) as f64;
    
    variance.sqrt()
}

/// Calculate percentile
pub fn percentile(values: &mut [f64], p: f64) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    
    if p <= 0.0 {
        return *values.iter().min_by(|a, b| a.partial_cmp(b).unwrap()).unwrap();
    }
    if p >= 100.0 {
        return *values.iter().max_by(|a, b| a.partial_cmp(b).unwrap()).unwrap();
    }
    
    values.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let index = (p / 100.0 * (values.len() - 1) as f64) as usize;
    values[index]
}

/// Calculate minimum value
pub fn min(values: &[f64]) -> Option<f64> {
    if values.is_empty() {
        None
    } else {
        values.iter().min_by(|a, b| a.partial_cmp(b).unwrap()).copied()
    }
}

/// Calculate maximum value
pub fn max(values: &[f64]) -> Option<f64> {
    if values.is_empty() {
        None
    } else {
        values.iter().max_by(|a, b| a.partial_cmp(b).unwrap()).copied()
    }
}

/// Calculate range (max - min)
pub fn range(values: &[f64]) -> Option<f64> {
    match (min(values), max(values)) {
        (Some(min_val), Some(max_val)) => Some(max_val - min_val),
        _ => None,
    }
}

/// Calculate sum of values
pub fn sum(values: &[f64]) -> f64 {
    values.iter().sum()
}

/// Calculate product of values
pub fn product(values: &[f64]) -> f64 {
    values.iter().product()
}

/// Round to specified decimal places
pub fn round_to_places(value: f64, places: u32) -> f64 {
    let multiplier = 10_f64.powi(places as i32);
    (value * multiplier).round() / multiplier
}

/// Clamp value between min and max
pub fn clamp(value: f64, min: f64, max: f64) -> f64 {
    value.max(min).min(max)
}

/// Linear interpolation between two values
pub fn lerp(a: f64, b: f64, t: f64) -> f64 {
    a + (b - a) * t.clamp(0.0, 1.0)
}

/// Calculate cosine similarity between two vectors
pub fn cosine_similarity(vec1: &[f64], vec2: &[f64]) -> f64 {
    if vec1.len() != vec2.len() || vec1.is_empty() {
        return 0.0;
    }
    
    let dot_product: f64 = vec1.iter().zip(vec2.iter()).map(|(a, b)| a * b).sum();
    let norm1: f64 = vec1.iter().map(|x| x * x).sum::<f64>().sqrt();
    let norm2: f64 = vec2.iter().map(|x| x * x).sum::<f64>().sqrt();
    
    if norm1 == 0.0 || norm2 == 0.0 {
        return 0.0;
    }
    
    dot_product / (norm1 * norm2)
}

/// Calculate Euclidean distance between two vectors
pub fn euclidean_distance(vec1: &[f64], vec2: &[f64]) -> f64 {
    if vec1.len() != vec2.len() {
        return f64::INFINITY;
    }
    
    vec1.iter()
        .zip(vec2.iter())
        .map(|(a, b)| (a - b).powi(2))
        .sum::<f64>()
        .sqrt()
}

/// Calculate Manhattan distance between two vectors
pub fn manhattan_distance(vec1: &[f64], vec2: &[f64]) -> f64 {
    if vec1.len() != vec2.len() {
        return f64::INFINITY;
    }
    
    vec1.iter()
        .zip(vec2.iter())
        .map(|(a, b)| (a - b).abs())
        .sum()
}

/// Normalize vector to unit length
pub fn normalize_vector(vec: &mut [f64]) {
    let norm = vec.iter().map(|x| x * x).sum::<f64>().sqrt();
    if norm > 0.0 {
        for value in vec.iter_mut() {
            *value /= norm;
        }
    }
}

/// Calculate moving average
pub fn moving_average(values: &[f64], window_size: usize) -> Vec<f64> {
    if window_size == 0 || values.is_empty() {
        return Vec::new();
    }
    
    let mut result = Vec::new();
    let window_size = window_size.min(values.len());
    
    for i in 0..=values.len() - window_size {
        let window = &values[i..i + window_size];
        result.push(mean(window));
    }
    
    result
}

/// Calculate exponential moving average
pub fn exponential_moving_average(values: &[f64], alpha: f64) -> Vec<f64> {
    if values.is_empty() || alpha <= 0.0 || alpha > 1.0 {
        return Vec::new();
    }
    
    let mut result = Vec::with_capacity(values.len());
    let mut ema = values[0];
    result.push(ema);
    
    for &value in &values[1..] {
        ema = alpha * value + (1.0 - alpha) * ema;
        result.push(ema);
    }
    
    result
}

/// Calculate z-score for a value
pub fn z_score(value: f64, mean: f64, std_dev: f64) -> f64 {
    if std_dev == 0.0 {
        0.0
    } else {
        (value - mean) / std_dev
    }
}

/// Calculate correlation coefficient between two vectors
pub fn correlation_coefficient(vec1: &[f64], vec2: &[f64]) -> f64 {
    if vec1.len() != vec2.len() || vec1.len() < 2 {
        return 0.0;
    }
    
    let mean1 = mean(vec1);
    let mean2 = mean(vec2);
    
    let numerator: f64 = vec1
        .iter()
        .zip(vec2.iter())
        .map(|(x, y)| (x - mean1) * (y - mean2))
        .sum();
    
    let sum_sq1: f64 = vec1.iter().map(|x| (x - mean1).powi(2)).sum();
    let sum_sq2: f64 = vec2.iter().map(|y| (y - mean2).powi(2)).sum();
    
    let denominator = (sum_sq1 * sum_sq2).sqrt();
    
    if denominator == 0.0 {
        0.0
    } else {
        numerator / denominator
    }
}

/// Check if two floating point numbers are approximately equal
pub fn approx_equal(a: f64, b: f64, epsilon: f64) -> bool {
    (a - b).abs() < epsilon
}

/// Safe division that returns 0.0 on division by zero
pub fn safe_divide(numerator: f64, denominator: f64) -> f64 {
    if denominator == 0.0 {
        0.0
    } else {
        numerator / denominator
    }
}

/// Calculate percentage change
pub fn percentage_change(old_value: f64, new_value: f64) -> f64 {
    if old_value == 0.0 {
        if new_value == 0.0 {
            0.0
        } else {
            f64::INFINITY
        }
    } else {
        ((new_value - old_value) / old_value) * 100.0
    }
}

/// Calculate compound annual growth rate (CAGR)
pub fn cagr(start_value: f64, end_value: f64, years: f64) -> f64 {
    if start_value <= 0.0 || end_value <= 0.0 || years <= 0.0 {
        0.0
    } else {
        (end_value / start_value).powf(1.0 / years) - 1.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mean() {
        assert_eq!(mean(&[1.0, 2.0, 3.0, 4.0, 5.0]), 3.0);
        assert_eq!(mean(&[]), 0.0);
        assert_eq!(mean(&[10.0]), 10.0);
    }

    #[test]
    fn test_median() {
        let mut odd = [1.0, 3.0, 5.0];
        assert_eq!(median(&mut odd), 3.0);
        
        let mut even = [1.0, 2.0, 3.0, 4.0];
        assert_eq!(median(&mut even), 2.5);
        
        let mut empty = [];
        assert_eq!(median(&mut empty), 0.0);
    }

    #[test]
    fn test_standard_deviation() {
        assert!((standard_deviation(&[1.0, 2.0, 3.0, 4.0, 5.0]) - 1.5811).abs() < 0.001);
        assert_eq!(standard_deviation(&[5.0]), 0.0);
        assert_eq!(standard_deviation(&[]), 0.0);
    }

    #[test]
    fn test_percentile() {
        let mut values = [1.0, 2.0, 3.0, 4.0, 5.0];
        assert_eq!(percentile(&mut values, 0.0), 1.0);
        assert_eq!(percentile(&mut values, 50.0), 3.0);
        assert_eq!(percentile(&mut values, 100.0), 5.0);
    }

    #[test]
    fn test_min_max() {
        assert_eq!(min(&[1.0, 2.0, 3.0]), Some(1.0));
        assert_eq!(max(&[1.0, 2.0, 3.0]), Some(3.0));
        assert_eq!(min::<f64>(&[]), None);
        assert_eq!(max::<f64>(&[]), None);
    }

    #[test]
    fn test_range() {
        assert_eq!(range(&[1.0, 2.0, 3.0]), Some(2.0));
        assert_eq!(range(&[5.0]), Some(0.0));
        assert_eq!(range::<f64>(&[]), None);
    }

    #[test]
    fn test_round_to_places() {
        assert_eq!(round_to_places(3.14159, 2), 3.14);
        assert_eq!(round_to_places(3.145, 2), 3.15);
        assert_eq!(round_to_places(3.0, 0), 3.0);
    }

    #[test]
    fn test_clamp() {
        assert_eq!(clamp(5.0, 1.0, 10.0), 5.0);
        assert_eq!(clamp(0.0, 1.0, 10.0), 1.0);
        assert_eq!(clamp(15.0, 1.0, 10.0), 10.0);
    }

    #[test]
    fn test_lerp() {
        assert_eq!(lerp(0.0, 10.0, 0.5), 5.0);
        assert_eq!(lerp(0.0, 10.0, 0.0), 0.0);
        assert_eq!(lerp(0.0, 10.0, 1.0), 10.0);
        assert_eq!(lerp(0.0, 10.0, -1.0), 0.0);
        assert_eq!(lerp(0.0, 10.0, 2.0), 10.0);
    }

    #[test]
    fn test_cosine_similarity() {
        assert_eq!(cosine_similarity(&[1.0, 0.0], &[1.0, 0.0]), 1.0);
        assert_eq!(cosine_similarity(&[1.0, 0.0], &[0.0, 1.0]), 0.0);
        assert_eq!(cosine_similarity(&[1.0, 1.0], &[1.0, 1.0]), 1.0);
        assert_eq!(cosine_similarity(&[], []), 0.0);
    }

    #[test]
    fn test_euclidean_distance() {
        assert_eq!(euclidean_distance(&[0.0, 0.0], &[3.0, 4.0]), 5.0);
        assert_eq!(euclidean_distance(&[1.0, 2.0], &[1.0, 2.0]), 0.0);
        assert_eq!(euclidean_distance(&[1.0], &[1.0, 2.0]), f64::INFINITY);
    }

    #[test]
    fn test_manhattan_distance() {
        assert_eq!(manhattan_distance(&[0.0, 0.0], &[3.0, 4.0]), 7.0);
        assert_eq!(manhattan_distance(&[1.0, 2.0], &[1.0, 2.0]), 0.0);
        assert_eq!(manhattan_distance(&[1.0], &[1.0, 2.0]), f64::INFINITY);
    }

    #[test]
    fn test_moving_average() {
        assert_eq!(moving_average(&[1, 2, 3, 4, 5], 3), vec![2.0, 3.0, 4.0]);
        assert_eq!(moving_average(&[1, 2, 3], 5), vec![2.0]);
        assert!(moving_average(&[], 3).is_empty());
        assert!(moving_average(&[1, 2, 3], 0).is_empty());
    }

    #[test]
    fn test_exponential_moving_average() {
        let result = exponential_moving_average(&[1.0, 2.0, 3.0, 4.0, 5.0], 0.5);
        assert_eq!(result.len(), 5);
        assert_eq!(result[0], 1.0);
        assert!(result[4] > 1.0 && result[4] < 5.0);
    }

    #[test]
    fn test_z_score() {
        assert_eq!(z_score(15.0, 10.0, 2.0), 2.5);
        assert_eq!(z_score(10.0, 10.0, 2.0), 0.0);
        assert_eq!(z_score(5.0, 10.0, 2.0), -2.5);
        assert_eq!(z_score(15.0, 10.0, 0.0), 0.0);
    }

    #[test]
    fn test_correlation_coefficient() {
        assert_eq!(correlation_coefficient(&[1.0, 2.0, 3.0], &[1.0, 2.0, 3.0]), 1.0);
        assert_eq!(correlation_coefficient(&[1.0, 2.0, 3.0], &[3.0, 2.0, 1.0]), -1.0);
        assert_eq!(correlation_coefficient(&[], []), 0.0);
    }

    #[test]
    fn test_approx_equal() {
        assert!(approx_equal(1.0, 1.000001, 0.00001));
        assert!(!approx_equal(1.0, 1.1, 0.00001));
    }

    #[test]
    fn test_safe_divide() {
        assert_eq!(safe_divide(10.0, 2.0), 5.0);
        assert_eq!(safe_divide(10.0, 0.0), 0.0);
    }

    #[test]
    fn test_percentage_change() {
        assert_eq!(percentage_change(100.0, 150.0), 50.0);
        assert_eq!(percentage_change(100.0, 50.0), -50.0);
        assert_eq!(percentage_change(0.0, 0.0), 0.0);
        assert_eq!(percentage_change(0.0, 100.0), f64::INFINITY);
    }

    #[test]
    fn test_cagr() {
        assert!((cagr(100.0, 121.0, 2.0) - 0.1).abs() < 0.001);
        assert_eq!(cagr(0.0, 100.0, 2.0), 0.0);
        assert_eq!(cagr(100.0, 0.0, 2.0), 0.0);
    }
}
