import re

def analyze_style(text):
    """
    STYLE-BASED ANALYSIS (Linguistic-based Features)
    Captures Sensationalism, Clickbait patterns, and Objectivity as per the paper.
    """
    # Sensationalism/Yellow Journalism markers
    caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if len(text) > 0 else 0
    exclamation_count = text.count('!')
    
    # Clickbait phrases
    clickbait_patterns = ['you won\'t believe', 'shocking', 'unbelievable', 'seconds ago', 'revealed']
    clickbait_hits = sum(1 for p in clickbait_patterns if p in text.lower())
    
    # Heuristic style score (0 to 1, higher is more 'news-like'/objective)
    style_score = 1.0
    if caps_ratio > 0.2: style_score -= 0.2
    if exclamation_count > 2: style_score -= 0.15
    if clickbait_hits > 0: style_score -= 0.2
    
    return max(0.1, style_score)

def calculate_veracity(ml_prediction, live_news, text):
    """
    DATA MINING PERSPECTIVE FRAMEWORK
    Combines:
    1. Style-based Analysis (Linguistic)
    2. Knowledge-based Verification (Fact-checking)
    3. Social Context (Source metrics - handled in app.py/credibility.py)
    """
    # 1. STYLE-BASED SCORE
    style_factor = analyze_style(text)
    
    # 2. KNOWLEDGE-BASED SCORE (Live News Consistency)
    knowledge_factor = 0.5 # Default neutral
    if live_news and len(live_news) > 0:
        # Check for confirmation in headlines
        keywords = {w for w in set(re.findall(r'\w+', text.lower())) if len(w) > 3}
        matches = 0
        for article in live_news:
            title_words = set(re.findall(r'\w+', article["title"].lower()))
            if len(keywords.intersection(title_words)) >= 3:
                matches += 1
        
        knowledge_factor = 0.5 + (min(matches, 5) * 0.1) # Boost based on matches
    
    # 3. ML PREDICTION (Style + Syntax learning)
    ml_factor = ml_prediction["score"] if ml_prediction["label"] == "TRUE" else (1 - ml_prediction["score"])

    # ENSEMBLE SCORE (Weighted average as suggested by paper's model construction)
    # 40% Knowledge, 40% ML, 20% Style
    final_realness = (knowledge_factor * 0.4) + (ml_factor * 0.4) + (style_factor * 0.2)
    
    # NARROW DEFINITION: Verifiably false + Intent to mislead
    label = "TRUE" if final_realness > 0.5 else "FAKE"
    
    if label == "TRUE":
        verdict = "CONFIRMED TRUE" if final_realness > 0.85 else "LIKELY TRUE"
    else:
        verdict = "CONFIRMED FAKE" if final_realness < 0.2 else "LIKELY FAKE"

    return {
        "label": label,
        "score": round(final_realness, 4),
        "realness_percentage": round(final_realness * 100, 2),
        "verdict": verdict,
        "factors": {
            "style_objectivity": round(style_factor * 100, 2),
            "knowledge_consistency": round(knowledge_factor * 100, 2),
            "ml_confidence": round(ml_factor * 100, 2)
        }
    }

import concurrent.futures

def verify_claims(claims, news_search_func, main_prediction):
    """
    Analyzes a list of claims and returns a list of results in parallel.
    Avoids running the heavy ML model again to save time.
    """
    results = []
    claims_to_check = claims[:3]
    
    if not claims_to_check:
        return results

    # Run news queries for each claim in parallel to optimize latency
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(claims_to_check)) as executor:
        # Submit searches concurrently
        future_to_claim = {
            executor.submit(news_search_func, claim[:60]): claim 
            for claim in claims_to_check
        }
        
        # Collect results in order of completion
        temp_results = {}
        for future in concurrent.futures.as_completed(future_to_claim):
            claim = future_to_claim[future]
            try:
                live_news = future.result()
            except Exception as e:
                print(f"Error fetching news for claim '{claim[:30]}...': {e}")
                live_news = []
            
            # Evaluate verdict
            if len(live_news) >= 2:
                verdict = "Likely Real"
                reasoning = f"Strongly supported by {len(live_news)} external news sources."
            elif len(live_news) == 1:
                verdict = "Neutral / Unverified"
                reasoning = "Only one matching news source found. Evidence is limited."
            else:
                verdict = "Likely Fake" if main_prediction["label"] == "FAKE" else "Unverified"
                reasoning = "No direct matching news reports found for this specific claim."
                
            temp_results[claim] = {
                "claim": claim,
                "verdict": verdict,
                "reasoning": reasoning
            }
            
        # Re-order to match original claims order
        for claim in claims_to_check:
            if claim in temp_results:
                results.append(temp_results[claim])
                
    return results
