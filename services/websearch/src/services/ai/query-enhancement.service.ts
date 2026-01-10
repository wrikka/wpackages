import { Effect } from "effect";
import { QueryEnhancement, SearchQuery } from "../../types";

export class QueryEnhancementService {
  enhance(query: SearchQuery): Effect.Effect<QueryEnhancement, Error> {
    const originalQuery = query.query;
    const terms = originalQuery.toLowerCase().split(/\s+/);

    const suggestedQueries = this.generateSuggestions(originalQuery, terms);

    const enhancedQuery = this.buildEnhancedQuery(originalQuery, terms);

    return Effect.succeed({
      originalQuery,
      enhancedQuery,
      suggestedQueries,
      reasoning: this.generateReasoning(originalQuery, terms),
    });
  }

  private generateSuggestions(original: string, terms: string[]): string[] {
    const suggestions: string[] = [];

    for (const term of terms) {
      if (term.length > 3) {
        suggestions.push(`${original} tutorial`);
        suggestions.push(`${original} examples`);
        suggestions.push(`${original} best practices`);
        suggestions.push(`how to ${original}`);
        suggestions.push(`${original} guide`);
      }
    }

    return [...new Set(suggestions)].slice(0, 5);
  }

  private buildEnhancedQuery(original: string, terms: string[]): string {
    let enhanced = original;

    const hasQuestion = original.endsWith('?');
    if (!hasQuestion) {
      enhanced += " explanation";
    }

    const commonStopWords = new Set(["what", "how", "why", "when", "where", "who", "which"]);
    const hasStopWord = terms.some((t) => commonStopWords.has(t));

    if (!hasStopWord && terms.length > 0) {
      enhanced = `what is ${enhanced}`;
    }

    return enhanced;
  }

  private generateReasoning(original: string, terms: string[]): string {
    const reasons: string[] = [];

    if (!original.endsWith('?')) {
      reasons.push("Added 'explanation' to clarify intent");
    }

    if (terms.length < 3) {
      reasons.push("Query is brief, may need more context");
    }

    if (/\b(?:tutorial|guide|how to)\b/i.test(original)) {
      reasons.push("Query appears to be seeking learning resources");
    }

    return reasons.join("; ") || "Query enhancement based on common patterns";
  }
}
