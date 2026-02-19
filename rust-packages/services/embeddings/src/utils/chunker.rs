/// Splits a long text into smaller chunks of a specified size.
///
/// This function is useful for preparing text for embedding models that have a
/// limited input length. It splits the text by words and creates chunks of the
/// desired size with a given overlap between them.
///
/// # Arguments
///
/// * `text` - The text to be chunked.
/// * `chunk_size` - The desired size of each chunk in words.
/// * `overlap` - The number of words to overlap between consecutive chunks.
///
/// # Returns
///
/// A `Vec<String>` containing the text chunks.
pub fn chunk_text(text: &str, chunk_size: usize, overlap: usize) -> Vec<String> {
    let words: Vec<&str> = text.split_whitespace().collect();
    if words.len() <= chunk_size {
        return vec![text.to_string()];
    }

    let mut chunks = Vec::new();
    let mut start = 0;

    while start < words.len() {
        let end = std::cmp::min(start + chunk_size, words.len());
        let chunk = words[start..end].join(" ");
        chunks.push(chunk);
        if end == words.len() {
            break;
        }
        start += chunk_size - overlap;
    }

    chunks
}
