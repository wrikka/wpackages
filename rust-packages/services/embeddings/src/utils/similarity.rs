use crate::types::Embedding;

/// Calculates the cosine similarity between two embeddings.
///
/// Cosine similarity measures the cosine of the angle between two vectors,
/// indicating the orientation similarity. A value of 1 means the vectors are
/// identical in orientation, 0 means they are orthogonal, and -1 means they
/// are diametrically opposed.
///
/// # Arguments
///
/// * `a` - The first embedding vector.
/// * `b` - The second embedding vector.
///
/// # Returns
///
/// The cosine similarity score as an `f32`.
#[inline]
pub fn cosine_similarity(a: &Embedding, b: &Embedding) -> f32 {
    let dot_product = a.iter().zip(b).map(|(x, y)| x * y).sum::<f32>();
    let norm_a = a.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    let norm_b = b.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    dot_product / (norm_a * norm_b)
}

/// Calculates the dot product of two embeddings.
///
/// The dot product is a measure of how much two vectors point in the same
/// direction. It is larger for vectors pointing in similar directions and
/// smaller for those pointing in opposite directions.
///
/// # Arguments
///
/// * `a` - The first embedding vector.
/// * `b` - The second embedding vector.
///
/// # Returns
///
/// The dot product as an `f32`.
#[inline]
pub fn dot_product(a: &Embedding, b: &Embedding) -> f32 {
    a.iter().zip(b).map(|(x, y)| x * y).sum()
}

/// Calculates the Euclidean distance between two embeddings.
///
/// Euclidean distance is the straight-line distance between two points in
/// Euclidean space. It is a common metric for measuring the dissimilarity
/// between two vectors.
///
/// # Arguments
///
/// * `a` - The first embedding vector.
/// * `b` - The second embedding vector.
///
/// # Returns
///
/// The Euclidean distance as an `f32`.
#[inline]
pub fn euclidean_distance(a: &Embedding, b: &Embedding) -> f32 {
    a.iter()
        .zip(b)
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f32>()
        .sqrt()
}
