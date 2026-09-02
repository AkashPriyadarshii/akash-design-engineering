import os, re, json
from collections import Counter

directories = [
    r"C:\Users\saves\.gemini\config\skills",
    r"C:\Users\saves\.agents\skills",
    r"C:\Users\saves\.config\opencode\skills"
]

stop_words = set(["the", "and", "to", "a", "of", "in", "is", "for", "that", "you", "it", "with", "as", "on", "this", "are", "be", "or", "an", "if", "by", "not", "use", "when", "can", "will", "your", "from", "how", "what", "all", "do", "we"])

def get_ngrams(words, n):
    return [" ".join(words[i:i+n]) for i in range(len(words)-n+1)]

atlas = {
    "total_skills_parsed": 0,
    "all_headings": Counter(),
    "all_bold_constraints": Counter(),
    "all_code_tokens": Counter(),
    "all_must_never_rules": set(),
    "ngrams": {
        "3_grams": Counter(),
        "4_grams": Counter(),
        "5_grams": Counter()
    }
}

# Strict categorization filters
exclude_keywords = ["nist", "cyber", "security", "threat", "malware", "forensic", "splunk", "aws", "gcp", "azure", "compliance", "penetration", "exploit", "cisa", "soc", "siem", "ransomware", "phishing", "incident response"]

include_keywords = ["ui ", "ux ", "design", "motion", "animation", "frontend", "css", "layout", "color", "typography", "physics", "spring", "component", "dom ", "canvas", "webgpu", "glsl", "shader", "haptic", "react", "compose", "brutalist", "visual", "aesthetic", "interface", "orchestrator", "subagent", "tailwind", "oklch", "pixel"]

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        if "SKILL.md" in files:
            path = os.path.join(root, "SKILL.md")
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    text_lower = text.lower()
                    
                    has_exclude = any(kw in text_lower for kw in exclude_keywords)
                    has_include = any(kw in text_lower for kw in include_keywords)
                    
                    # Target only the pure design/engineering/orchestration subset
                    if has_include and not has_exclude:
                        atlas["total_skills_parsed"] += 1
                        
                        headings = re.findall(r'^(#{1,4})\s+(.+)$', text, re.MULTILINE)
                        for _, h in headings: atlas["all_headings"][h.strip().lower()] += 1
                            
                        blocks = re.findall(r'\*\*(.*?)\*\*', text)
                        for b in blocks:
                            if len(b.split()) > 1: atlas["all_bold_constraints"][b.strip().lower()] += 1
                                
                        inline_code = re.findall(r'`([^`]{2,50})`', text)
                        for code in inline_code: atlas["all_code_tokens"][code.strip()] += 1
                            
                        for line in text.split('\n'):
                            if re.search(r'\b(MUST|NEVER|ALWAYS|STRICTLY|FAIL)\b', line) and 15 < len(line) < 200:
                                atlas["all_must_never_rules"].add(line.strip())

                        clean_text = re.sub(r'[^a-z0-9\s]', '', text_lower)
                        words = [w for w in clean_text.split() if w not in stop_words and len(w) > 2]
                        
                        for gram in get_ngrams(words, 3): atlas["ngrams"]["3_grams"][gram] += 1
                        for gram in get_ngrams(words, 4): atlas["ngrams"]["4_grams"][gram] += 1
                        for gram in get_ngrams(words, 5): atlas["ngrams"]["5_grams"][gram] += 1
            except Exception: pass

# Clean up and export the top 50 atomic mechanics across the relevant skills
filtered_atlas = {
    "total_skills_parsed": atlas["total_skills_parsed"],
    "all_headings": dict(sorted(atlas["all_headings"].items(), key=lambda item: item[1], reverse=True)[:50]),
    "all_bold_constraints": dict(sorted(atlas["all_bold_constraints"].items(), key=lambda item: item[1], reverse=True)[:50]),
    "all_code_tokens": dict(sorted(atlas["all_code_tokens"].items(), key=lambda item: item[1], reverse=True)[:50]),
    "all_must_never_rules": list(atlas["all_must_never_rules"])[:100], # Keep top 100 raw rules
    "ngrams": {
        "3_grams": dict(sorted(atlas["ngrams"]["3_grams"].items(), key=lambda item: item[1], reverse=True)[:30]),
        "4_grams": dict(sorted(atlas["ngrams"]["4_grams"].items(), key=lambda item: item[1], reverse=True)[:30]),
        "5_grams": dict(sorted(atlas["ngrams"]["5_grams"].items(), key=lambda item: item[1], reverse=True)[:30])
    }
}

output_path = r"C:\Users\saves\Desktop\design-engineer\DESIGN_ATLAS.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(filtered_atlas, f, indent=2)

print(f"DESIGN ATLAS COMPILED. Parsed {atlas['total_skills_parsed']} relevant skills. Saved to {output_path}")
