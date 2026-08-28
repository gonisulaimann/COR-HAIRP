# Contributing to COR-HARP

Thank you for your interest in contributing to COR-HARP! This project exists because of contributions from people like you.

## 🎯 Our Mission

COR-HARP is built for humanitarian aid workers in Northeast Nigeria. Every contribution should keep this mission in mind. We're building tools that help people in crisis.

## 🚀 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title** — Describe the issue concisely
- **Steps to reproduce** — What did you do? What happened?
- **Expected behavior** — What should have happened?
- **Environment** — OS, Python version, Node version
- **Screenshots** — If applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues and discussions first
2. Open an issue with the `feature-request` label
3. Describe the problem you're trying to solve
4. Describe your proposed solution
5. Consider how it benefits aid workers

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** if applicable
5. **Update documentation** if needed
6. **Commit**: `git commit -m 'feat: add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

## 📝 Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/COR-HAIRP.git
cd COR-HAIRP

# Setup Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd frontend
npm install
cd ..

# Run development servers
# Terminal 1: Backend
uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🎨 Code Style

### Python

- Follow PEP 8
- Use type hints
- Write docstrings for public functions
- Keep functions focused and small

### TypeScript/React

- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling
- Keep components modular

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Formatting changes
- `refactor:` — Code restructuring
- `test:` — Adding tests
- `chore:` — Maintenance tasks

Examples:
```
feat: add LGA comparison dashboard
fix: resolve forecast data loading error
docs: update API documentation
```

## 🧪 Testing

### Backend

```bash
# Run tests (when available)
pytest

# Type checking
mypy backend/
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## 📚 Documentation

- Update README if adding new features
- Add docstrings to new functions
- Update API documentation if changing endpoints
- Add examples for complex features

## 🌍 Humanitarian Focus

Remember, this project serves humanitarian workers. When contributing:

- **Accessibility** — Consider users with limited bandwidth
- **Offline support** — Features should degrade gracefully
- **Clear UI** — Simple, intuitive interfaces
- **Error handling** — Helpful error messages
- **Performance** — Optimize for slower connections

## ❓ Questions?

- Open a [Discussion](https://github.com/gonisulaimann/COR-HAIRP/discussions)
- Check existing documentation
- Search existing issues

## 📜 License

By contributing, you agree that your contributions will be licensed under the [Hippocratic License](LICENSE).

## 🙏 Thank You!

Every contribution matters. Whether it's:

- 🐛 Reporting a bug
- 💡 Suggesting a feature
- 📝 Improving documentation
- 🧪 Writing tests
- 🌍 Translating content
- 💬 Helping others

You're making humanitarian aid more effective. Thank you!
