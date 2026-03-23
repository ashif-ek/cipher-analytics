# Contributing to Cipher Analytics

First off, thank you for considering contributing to Cipher Analytics! It's people like you that make such privacy-preserving tools possible.

## Code of Conduct
By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:
- Steps to reproduce the behavior.
- Expected vs actual behavior.
- Screenshots if it's a UI issue.
- Your OS, browser, Python/Node versions.

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement request, please provide a clear description of the feature, the motivation behind it, and potential alternatives. 

### Pull Requests
1. **Fork the repo** and create your branch from `main`.
2. **Setup your environment:**
   - Backend: Python 3.x, Django 5+, PostgreSQL. Install requirements: `pip install -r requirements.txt`.
   - Frontend: Node.js, React 19. Install dependencies: `npm install`.
3. **If you've added code that should be tested, add tests.** (Pytest for backend).
4. **Ensure the test suite passes.** 
5. **Format your code**: 
   - Backend: Use `flake8` and `black` (or similar standard formatters).
   - Frontend: Ensure `eslint` passes (`npm run lint`).
6. **Submit that pull request!**

## Understanding the Architecture
If you want to contribute to the core encryption logic:
- Look into `backend/datasets/encryption.py` where the **TenSEAL CKKS** logic resides.
- Be careful with parameter modifications (Modulus Degree, Scale) as they drastically affect computation limits and memory. 

## Commit Messages
We prefer conventional commits format:
- `feat:` for a new feature
- `fix:` for a bug fix
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for adding or fixing tests
- `chore:` for updating build tasks, package manager configs, etc.

Thank you for contributing!
