import { NapiIndex, JsDocument, SearchResult, IndexStats, SearchOptions } from './index';

// Example usage
const index = new NapiIndex();

// Add documents
const docs: JsDocument[] = [
  {
    fields: {
      title: 'Getting Started with Rust',
      content: 'Rust is a systems programming language that runs blazingly fast...',
      category: 'programming'
    }
  },
  {
    fields: {
      title: 'JavaScript Best Practices',
      content: 'JavaScript is a versatile language for web development...',
      category: 'programming'
    }
  }
];

index.addDocuments(docs);
index.buildIndex();

// Basic search
const results = index.search('Rust programming');
console.log('Basic search results:', results);

// Advanced search with options
const searchOptions: SearchOptions = {
  limit: 5,
  offset: 0,
  fieldWeights: {
    title: 2.0,
    content: 1.0
  },
  fuzzy: true,
  fuzzyThreshold: 2,
  includeScores: true
};

const advancedResults = index.searchWithOptions('Rust programing', searchOptions);
console.log('Advanced search results:', advancedResults);

// Fuzzy search
const fuzzyResults = index.searchFuzzy('Rust prgramming', 2);
console.log('Fuzzy search results:', fuzzyResults);

// Auto-complete suggestions
const suggestions = index.suggest('Rust', 5);
console.log('Suggestions:', suggestions);

// Get index statistics
const stats = index.getStats();
console.log('Index statistics:', stats);

// Persistence
index.saveToFile('./index.json');

// Load from file
const newIndex = new NapiIndex();
newIndex.loadFromFile('./index.json');

// Real-time updates
index.updateDocument(0, {
  fields: {
    title: 'Getting Started with Rust (Updated)',
    content: 'Rust is a modern systems programming language...',
    category: 'programming'
  }
});

// Remove document
index.removeDocument(1);

export {
  NapiIndex,
  JsDocument,
  SearchResult,
  IndexStats,
  SearchOptions
};
