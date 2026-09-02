import os, re, json
from collections import Counter

directories = [
    r"C:\Users\saves\.gemini\config\skills",
    r"C:\Users\saves\.agents\skills",
    r"C:\Users\saves\.config\opencode\skills"
]

stop_words = set([
    "the", "and", "to", "a", "of", "in", "is", "for", "that", "you", "it", 
    "with", "as", "on", "this", "are", "be", "or", "an", "if", "by", "not", 
    "use", "when", "can", "will", "your", "from", "how", "what", "all", "do", "we"
])

def get_ngrams(words, n):
    return [" ".join(words[i:i+n]) for i in range(len(words)-n+1)]

atlas = {
    "total_skills_parsed": 0,
    "all_headings": Counter(),
    "all_bold_constraints": Counter(),
    "all_code_tokens": Counter(),
    "all_must_never_rules": set(),
    "ngrams": {
        "2_grams": Counter(),
        "3_grams": Counter(),
        "4_grams": Counter(),
        "5_grams": Counter()
    }
}

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        if "SKILL.md" in files:
            path = os.path.join(root, "SKILL.md")
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    atlas["total_skills_parsed"] += 1
                    
                    # 1. All Headings
                    headings = re.findall(r'^(#{1,4})\s+(.+)$', text, re.MULTILINE)
                    for _, h in headings:
                        atlas["all_headings"][h.strip().lower()] += 1
                        
                    # 2. All Bolded Assertions
                    blocks = re.findall(r'\*\*(.*?)\*\*', text)
                    for b in blocks:
                        if len(b.split()) > 1:
                            atlas["all_bold_constraints"][b.strip().lower()] += 1
                            
                    # 3. All Code Tokens
                    inline_code = re.findall(r'`([^`]{2,50})`', text)
                    for code in inline_code:
                        atlas["all_code_tokens"][code.strip()] += 1
                        
                    # 4. Strict Explicit Rules
                    lines = text.split('\n')
                    for line in lines:
                        if re.search(r'\b(MUST|NEVER|ALWAYS|STRICTLY|FAIL)\b', line) and 15 < len(line) < 200:
                            atlas["all_must_never_rules"].add(line.strip())

                    # 5. Complete N-Gram extraction (removing fluff)
                    text_lower = text.lower()
                    clean_text = re.sub(r'[^a-z0-9\s]', '', text_lower)
                    words = [w for w in clean_text.split() if w not in stop_words and len(w) > 2]
                    
                    for gram in get_ngrams(words, 2): atlas["ngrams"]["2_grams"][gram] += 1
                    for gram in get_ngrams(words, 3): atlas["ngrams"]["3_grams"][gram] += 1
                    for gram in get_ngrams(words, 4): atlas["ngrams"]["4_grams"][gram] += 1
                    for gram in get_ngrams(words, 5): atlas["ngrams"]["5_grams"][gram] += 1
            except Exception: pass

# Clean up outputs to remove noise (only keep things occurring > 1 time to filter pure typos, but capture ALL repeated atomic logic)
filtered_atlas = {
    "total_skills_parsed": atlas["total_skills_parsed"],
    "all_headings": {k: v for k, v in atlas["all_headings"].items() if v > 1},
    "all_bold_constraints": {k: v for k, v in atlas["all_bold_constraints"].items() if v > 1},
    "all_code_tokens": {k: v for k, v in atlas["all_code_tokens"].items() if v > 1},
    "all_must_never_rules": list(atlas["all_must_never_rules"]),
    "ngrams": {
        "2_grams": {k: v for k, v in atlas["ngrams"]["2_grams"].items() if v > 2},
        "3_grams": {k: v for k, v in atlas["ngrams"]["3_grams"].items() if v > 2},
        "4_grams": {k: v for k, v in atlas["ngrams"]["4_grams"].items() if v > 2},
        "5_grams": {k: v for k, v in atlas["ngrams"]["5_grams"].items() if v > 2}
    }
}

# Sort everything by frequency for readability
for key in ["all_headings", "all_bold_constraints", "all_code_tokens"]:
    filtered_atlas[key] = dict(sorted(filtered_atlas[key].items(), key=lambda item: item[1], reverse=True))

for n in ["2_grams", "3_grams", "4_grams", "5_grams"]:
    filtered_atlas["ngrams"][n] = dict(sorted(filtered_atlas["ngrams"][n].items(), key=lambda item: item[1], reverse=True))

output_path = r"C:\Users\saves\Desktop\design-engineer\ATOMIC_ATLAS.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(filtered_atlas, f, indent=2)

print(f"ATOMIC ATLAS COMPILED. Saved to {output_path}")
