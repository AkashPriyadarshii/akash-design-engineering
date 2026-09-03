import os
import re
import json

user_home = os.path.expanduser("~")
custom_skills = os.environ.get("SKILLS_DIR")
directories = [d for d in [
    custom_skills,
    os.path.join(user_home, ".gemini", "config", "skills"),
    os.path.join(user_home, ".agents", "skills"),
    os.path.join(user_home, ".config", "opencode", "skills")
] if d and os.path.exists(d)]

results = []
# Aggressive extraction patterns
rule_pattern = re.compile(r'\b(MUST|NEVER|ALWAYS|FAIL|CRITICAL)\b.*', re.IGNORECASE)
mechanic_keywords = ['state management', 'subagent routing', 'escalation', 'dual-lane', 'source-blind', 'ratchet', 'contamination']
validation_keywords = ['validation', 'gate', 'rubric', 'eval', 'anti-slop', 'constraint', 'oklch']

for directory in directories:
    if not os.path.exists(directory): continue
    for root, _, files in os.walk(directory):
        for file in files:
            if file == "SKILL.md":
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.read().split('\n')
                    
                    rules, mechanics, validations = set(), set(), set()
                    for line in lines:
                        if rule_pattern.search(line) and len(line) > 15: rules.add(line.strip())
                        if any(kw in line.lower() for kw in mechanic_keywords): mechanics.add(line.strip())
                        if any(kw in line.lower() for kw in validation_keywords): validations.add(line.strip())
                            
                    if rules or mechanics or validations:
                        results.append({
                            "skill": root.split(os.sep)[-1],
                            "rules": list(rules)[:3],
                            "mechanics": list(mechanics)[:3],
                            "validations": list(validations)[:3]
                        })
                except Exception: pass

output_path = r"C:\Users\saves\Desktop\design-engineer\scripts\deep_extraction.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Extracted aggressive mechanics from {len(results)} skills to {output_path}.")
