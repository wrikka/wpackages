export class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord = false;
}
