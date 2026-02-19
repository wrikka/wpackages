use ai_memories::{
    MemorySystem,
    HashMapMemoryStore,
    LshIndex,
    SpacedRepetitionDecay,
    MemoryContent,
    Emotion,
    Summarizer,
    Embedding,
};
use std::path::PathBuf;

// Constants for the tests
const VECTOR_DIM: usize = 3;

fn create_test_system() -> MemorySystem {
    let store = Box::new(HashMapMemoryStore::new());
    let index = Box::new(LshIndex::new(16, 10, VECTOR_DIM));
    MemorySystem::new(store, index)
}

#[test]
fn test_add_and_get_with_emotion_and_multimodal() {
    let mut system = create_test_system();
    let text_content = MemoryContent::Text("This is a happy memory.".to_string());
    let image_content = MemoryContent::Image(PathBuf::from("/path/to/image.png"));

    let id1 = system.add_memory(text_content, vec![0.1, 0.2, 0.3], Some(Emotion::Positive));
    let id2 = system.add_memory(image_content, vec![0.9, 0.8, 0.7], None);

    let mem1 = system.get_memory(&id1).unwrap();
    assert_eq!(mem1.emotion, Some(Emotion::Positive));

    let mem2 = system.get_memory(&id2).unwrap();
    assert!(matches!(mem2.content, MemoryContent::Image(_)));
}

#[test]
fn test_context_aware_search() {
    let mut system = create_test_system();

    let id_king = system.add_memory(MemoryContent::Text("King".to_string()), vec![0.9, 0.8, 0.1], None);
    let id_queen = system.add_memory(MemoryContent::Text("Queen".to_string()), vec![0.85, 0.82, 0.12], None);
    let id_palace = system.add_memory(MemoryContent::Text("Palace".to_string()), vec![0.88, 0.85, 0.15], None);
    system.add_memory(MemoryContent::Text("Apple".to_string()), vec![0.1, 0.2, 0.9], None);

    // King is related to Palace
    system.add_relationship(id_king, id_palace);

    // Search for 'royal' without context
    let query_vec = vec![0.86, 0.81, 0.11];
    let results_no_context = system.search(&query_vec, 2, None);
    assert_eq!(results_no_context[0].0.id, id_queen); // Queen is semantically closest

    // Search for 'royal' with King as context
    let results_with_context = system.search(&query_vec, 2, Some(id_king));
    assert_eq!(results_with_context[0].0.id, id_palace); // Palace gets a boost
}

#[test]
fn test_spaced_repetition_decay() {
    let mut system = create_test_system();
    let id = system.add_memory(MemoryContent::Text("Decay test".to_string()), vec![0.1, 0.1, 0.1], None);

    // Access the memory a few times to increase its stability
    let _ = system.get_memory(&id);
    let _ = system.get_memory(&id);

    let initial_stability = system.get_memory(&id).unwrap().stability;
    assert!(initial_stability > 1.0);

    // Apply decay
    let decay_strategy = SpacedRepetitionDecay::new(1.0); // Very fast decay for testing
    system.apply_decay(&decay_strategy);

    let memory_after_decay = system.get_memory(&id).unwrap();
    // Strength should have decayed, but less than a memory with base stability
    assert!(memory_after_decay.strength < 1.0 && memory_after_decay.strength > 0.4);
}

#[test]
fn test_consolidation() {
    let mut system = create_test_system();

    let id1 = system.add_memory(MemoryContent::Text("React hooks are functions.".to_string()), vec![0.1, 0.8, 0.1], None);
    system.add_memory(MemoryContent::Text("useState is a React hook.".to_string()), vec![0.11, 0.82, 0.12], None);
    system.add_memory(MemoryContent::Text("useEffect is for side effects.".to_string()), vec![0.13, 0.79, 0.11], None);

    // A mock summarizer function
    let summarizer: Summarizer = |contents| {
        let summary_text = format!("Learned about {} React concepts.", contents.len());
        let new_embedding = vec![0.12, 0.81, 0.11]; // Average embedding
        (MemoryContent::Text(summary_text), new_embedding, Some(Emotion::Curiosity))
    };

    let abstract_id = system.consolidate(id1, summarizer).unwrap();

    let abstract_mem = system.get_memory(&abstract_id).unwrap();
    if let MemoryContent::Text(text) = &abstract_mem.content {
        assert_eq!(text, "Learned about 3 React concepts.");
    }
    assert_eq!(abstract_mem.emotion, Some(Emotion::Curiosity));

    // Check that the graph links were created
    let neighbors = system.graph.get_neighbors(&abstract_id).unwrap();
    assert_eq!(neighbors.len(), 3);
}
