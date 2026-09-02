# Security Policy

## Supported Versions

Only the latest major version of `design-engineer` is actively supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Security is a primary directive. If you discover a vulnerability, misconfiguration, or an AI prompt-injection flaw that allows the orchestrator to bypass the Atomic Constraints (e.g., forcing standard AI slop, executing malicious code, or breaking out of the sandbox):

1. **Do not open a public issue.**
2. Email the vulnerability details directly to Akash Priyadarshi (see GitHub profile).
3. Provide a Proof of Concept (PoC) demonstrating how the orchestrator was manipulated.

You will receive an acknowledgment within 48 hours. A fix will be drafted, tested against the Adversarial Gauntlet, and released immediately.

## Zero-Tolerance Data Policy
This tool runs **locally**. It does not phone home, it does not telemetry-track, and it does not harvest your project context to third-party databases. It leverages local subagent capabilities strictly within your defined workspace.
