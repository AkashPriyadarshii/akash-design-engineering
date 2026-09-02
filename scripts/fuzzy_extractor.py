import os, re
from collections import Counter

directories = [
    r"C:\Users\saves\.gemini\config\skills",
    r"C:\Users\saves\.agents\skills",
    r"C:\Users\saves\.config\opencode\skills"
]

# Standard stop words to remove fluff and reveal raw mechanics
stop_words = set([
    "the", "and", "to", "a", "of", "in", "is", "for", "that", "you", "it", 
    "with", "as", "on", "this", "are", "be", "or", "an", "if", "by", "not", 
    "use", "when", "can", "will", "your", "from", "how", "what", "all", "do", "we"
])

def get_ngrams(words, n):
    return [" ".join(words[i:i+n]) for i in range(len(words)-n+1)]

all_4grams = Counter()
all_5grams = Counter()
bold_constraints = Counter()
code_mechanics = Counter()

print("Running completely unbiased, fuzzy n-gram extraction on 2,285 skills...\n")

for d in directories:
    if not os.path.exists(d): continue
    for root, _, files in os.walk(d):
        if "SKILL.md" in files:
            path = os.path.join(root, "SKILL.md")
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    
                    # 1. Unbiased extraction of bolded constraints (things developers forced attention to)
                    blocks = re.findall(r'\*\*(.*?)\*\*', text)
                    for b in blocks:
                        b_clean = b.strip().lower()
                        if 3 < len(b_clean.split()) < 15: # Atomic phrases only
                            bold_constraints[b_clean] += 1
                            
                    # 2. Extract inline code tokens (identifying API/mechanical functions across repos)
                    inline_code = re.findall(r'`([^`]{3,30})`', text)
                    for code in inline_code:
                        code_mechanics[code.strip()] += 1

                    # 3. Fuzzy Text N-Grams (Removing formatting & stop words completely)
                    text_lower = text.lower()
                    clean_text = re.sub(r'[^a-z0-9\s]', '', text_lower)
                    words = [w for w in clean_text.split() if w not in stop_words and len(w) > 2]
                    
                    for gram in get_ngrams(words, 4): all_4grams[gram] += 1
                    for gram in get_ngrams(words, 5): all_5grams[gram] += 1
            except Exception: pass

print("=== ATOMIC BOLD CONSTRAINTS (Highest Priority Assertions) ===")
for rule, count in bold_constraints.most_common(10):
    print(f"[{count}x] {rule}")

print("\n=== ATOMIC CODE MECHANISMS (Most Repeated Code Tokens) ===")
for code, count in code_mechanics.most_common(10):
    print(f"[{count}x] {code}")

print("\n=== FUZZY 4-GRAM PATTERNS (Most Frequent Action Sequences) ===")
for gram, count in all_4grams.most_common(10):
    print(f"[{count}x] {gram}")
