import os
import re
from collections import Counter

paths = [
    r"C:\Users\saves\.gemini\config\skills",
    r"C:\Users\saves\.agents\skills",
    r"C:\Users\saves\.config\opencode\skills"
]

total_skills = 0
keywords = Counter()

# Specific architectural and mechanical keywords to track
mechanic_words = [
    "ledger", "subagent", "orchestrator", "blind", "ratchet", 
    "gate", "loop", "state", "immutable", "validate", 
    "physics", "constraint", "sandbox", "isolated", "retry",
    "ci/cd", "hook", "strict", "verify", "parallel", "pipeline"
]

# Track how often specific headers appear (e.g., "## Architecture", "## Rules")
headers = Counter()
header_pattern = re.compile(r'^##\s+(.*)$', re.MULTILINE)

print("Scanning all 2285+ skills for architectural DNA...\n")

for base_path in paths:
    if not os.path.exists(base_path):
        continue
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.lower() == "skill.md":
                total_skills += 1
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        content_lower = content.lower()
                        
                        # Tally mechanical patterns
                        for word in mechanic_words:
                            if word in content_lower:
                                keywords[word] += 1
                                
                        # Tally structural headers
                        for match in header_pattern.findall(content):
                            headers[match.strip().lower()] += 1
                            
                except Exception:
                    pass

print(f"Total SKILL.md parsed: {total_skills}")
print("\n=== TOP STRUCTURAL MECHANISMS (Presence across skills) ===")
for word, count in keywords.most_common(15):
    print(f"{word.upper().ljust(15)} : Found in {count} skills")

print("\n=== MOST COMMON ARCHITECTURAL HEADERS ===")
for header, count in headers.most_common(10):
    if len(header) > 2:
        print(f"{header.title().ljust(25)} : {count} occurrences")
