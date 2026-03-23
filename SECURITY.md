# Security Policy

## Supported Versions

Cipher Analytics is currently in active development. Security updates are applied to the `main` branch. 
Since this project handles **Homomorphic Encryption** and **Privacy-Preserving Analytics**, security is our highest priority.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| `< 1.0` | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Cipher Analytics, please **DO NOT** open a public issue. 
Instead, please send an email directly to the project maintainers. (Update this with the official maintainer email, e.g., `security@example.com`).

Please include the following in your report:
* Description of the vulnerability.
* Steps to reproduce the issue.
* Potential impact, especially concerning the HE (Homomorphic Encryption) implementation or key exposure.
* System information (OS, Python version, TenSEAL version, etc.).

We will endeavor to respond to your report within 48 hours and keep you informed of our progress towards a fix and announcement.

### Special Note on Encryption Validations
Cipher Analytics utilizes the CKKS scheme via the `TenSEAL` library. If you find theoretical or practical cryptographic weaknesses in how we configure our Poly Modulus Degree, Coeff Modulus, or Scale parameters, we strongly encourage immediate disclosure so we can address encryption integrity.
