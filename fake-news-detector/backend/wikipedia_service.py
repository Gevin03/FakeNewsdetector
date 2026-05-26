import requests
import re

def search_wikipedia(query):
    """
    Queries Wikipedia's API for search articles matching the query.
    Cleans up HTML tags inside response snippets for clean display.
    """
    try:
        url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json",
            "utf8": 1
        }
        headers = {
            "User-Agent": "TruthGuardAI/1.0 (contact@truthguard.ai)"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        if response.status_code != 200:
            return []
            
        data = response.json()
        search_results = data.get("query", {}).get("search", [])
        
        references = []
        for r in search_results[:3]:
            # Clean HTML tags (like <span class="searchmatch">) from snippet using regex
            snippet_raw = r.get("snippet", "")
            clean_snippet = re.sub(r'<[^>]*>', '', snippet_raw)
            
            references.append({
                "title": r.get("title"),
                "snippet": clean_snippet,
                "url": f"https://en.wikipedia.org/?curid={r.get('pageid')}"
            })
            
        return references
    except Exception as e:
        print(f"Wikipedia search error: {e}")
        return []
