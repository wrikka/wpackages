use crate::error::VectorSearchResult;
use crate::types::DistanceMetric;

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> VectorSearchResult<f32> {
    if a.len() != b.len() {
        return Err(crate::error::VectorSearchError::DimensionMismatch {
            expected: a.len(),
            got: b.len(),
        });
    }

    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        Ok(0.0)
    } else {
        Ok(dot_product / (norm_a * norm_b))
    }
}

pub fn euclidean_distance(a: &[f32], b: &[f32]) -> VectorSearchResult<f32> {
    if a.len() != b.len() {
        return Err(crate::error::VectorSearchError::DimensionMismatch {
            expected: a.len(),
            got: b.len(),
        });
    }

    Ok(a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f32>()
        .sqrt())
}

pub fn manhattan_distance(a: &[f32], b: &[f32]) -> VectorSearchResult<f32> {
    if a.len() != b.len() {
        return Err(crate::error::VectorSearchError::DimensionMismatch {
            expected: a.len(),
            got: b.len(),
        });
    }

    Ok(a.iter().zip(b.iter()).map(|(x, y)| (x - y).abs()).sum())
}

pub fn dot_product(a: &[f32], b: &[f32]) -> VectorSearchResult<f32> {
    if a.len() != b.len() {
        return Err(crate::error::VectorSearchError::DimensionMismatch {
            expected: a.len(),
            got: b.len(),
        });
    }

    Ok(a.iter().zip(b.iter()).map(|(x, y)| x * y).sum())
}

pub fn normalize_vector(vec: &mut [f32]) {
    let norm: f32 = vec.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm > 0.0 {
        for v in vec.iter_mut() {
            *v /= norm;
        }
    }
}

pub fn compute_distance(a: &[f32], b: &[f32], metric: DistanceMetric) -> VectorSearchResult<f32> {
    match metric {
        DistanceMetric::Cosine => cosine_similarity(a, b),
        DistanceMetric::Euclidean => {
            let dist = euclidean_distance(a, b)?;
            Ok(-dist)
        }
        DistanceMetric::Manhattan => {
            let dist = manhattan_distance(a, b)?;
            Ok(-dist)
        }
        DistanceMetric::DotProduct => dot_product(a, b),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cosine_similarity() {
        let a = vec![1.0, 0.0];
        let b = vec![0.0, 1.0];
        let sim = cosine_similarity(&a, &b).unwrap();
        assert!((sim - 0.0).abs() < 1e-6);

        let a = vec![1.0, 1.0];
        let b = vec![1.0, 1.0];
        let sim = cosine_similarity(&a, &b).unwrap();
        assert!((sim - 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_euclidean_distance() {
        let a = vec![0.0, 0.0];
        let b = vec![3.0, 4.0];
        let dist = euclidean_distance(&a, &b).unwrap();
        assert!((dist - 5.0).abs() < 1e-6);
    }

    #[test]
    fn test_manhattan_distance() {
        let a = vec![0.0, 0.0];
        let b = vec![3.0, 4.0];
        let dist = manhattan_distance(&a, &b).unwrap();
        assert!((dist - 7.0).abs() < 1e-6);
    }

    #[test]
    fn test_dot_product() {
        let a = vec![1.0, 2.0, 3.0];
        let b = vec![4.0, 5.0, 6.0];
        let dp = dot_product(&a, &b).unwrap();
        assert!((dp - 32.0).abs() < 1e-6);
    }

    #[test]
    fn test_normalize_vector() {
        let mut vec = vec![3.0, 4.0];
        normalize_vector(&mut vec);
        let norm: f32 = vec.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((norm - 1.0).abs() < 1e-6);
    }
}
