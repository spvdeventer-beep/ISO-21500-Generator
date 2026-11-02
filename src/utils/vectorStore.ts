/**
 * Vector Store Utility for Forensic RAG Retrieval
 * Interfaces with server-side semantic search for project artifacts
 */

export interface SearchResult {
  sourceName: string;
  snippet: string;
  relevanceScore: number;
  justification: string;
}

export interface Artifact {
  id: string;
  name: string;
  text: string;
}

/**
 * Performs a semantic search across provided artifacts using server-side LLM retrieval
 */
export async function performForensicSearch(
  query: string,
  artifacts: Artifact[],
  topK: number = 5
): Promise<SearchResult[]> {
  if (!query.trim() || artifacts.length === 0) return [];

  try {
    const response = await fetch('/api/vector-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, artifacts, topK })
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Forensic search error:', error);
    
    // Fallback: simple keyword matching if API fails
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];
    
    artifacts.forEach(art => {
      if (art.text.toLowerCase().includes(lowerQuery)) {
        results.push({
          sourceName: art.name,
          snippet: art.text.slice(0, 300) + '...',
          relevanceScore: 0.5,
          justification: 'Keyword match found in source artifact (Fallback mode).'
        });
      }
    });
    
    return results.slice(0, topK);
  }
}
