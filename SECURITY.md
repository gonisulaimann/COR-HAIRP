# Security Policy

## Reporting a Vulnerability

The COR-HARP team takes security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **[SECURITY EMAIL ADDRESS]**

You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., SQL injection, XSS, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Assessment**: We'll validate the issue and determine its severity
- **Remediation**: We'll work on a fix and coordinate disclosure with you
- **Disclosure**: We'll publish a security advisory once the fix is released

## Security Considerations

### Data Sensitivity

COR-HARP processes humanitarian data that may include:

- Location data for vulnerable populations
- Displacement tracking information
- Food security assessments
- Operational coordination details

**This data must be handled with extreme care.**

### Authentication

- Passwords are hashed using SHA-256
- Session tokens are used for authentication
- OTP codes expire after 5 minutes

### API Security

- CORS is configured to allow only specific origins
- Rate limiting should be implemented for production
- Input validation is performed on all endpoints

### Deployment Security

- Environment variables are used for secrets
- `.env` files are gitignored
- HTTPS is enforced in production

## Best Practices

### For Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Validate and sanitize all user inputs
- Follow secure coding practices
- Review code for security issues before submitting PRs

### For Deployers

- Keep dependencies updated
- Use HTTPS for all communications
- Implement proper logging and monitoring
- Regularly backup your database
- Follow the principle of least privilege

### For Users

- Use strong, unique passwords
- Don't share credentials
- Report suspicious activity immediately
- Keep your browser and OS updated

## Dependency Security

We use automated tools to monitor dependencies:

- GitHub Dependabot for dependency updates
- Regular security audits of dependencies

To check for vulnerabilities:

```bash
# Python
pip-audit

# Node.js
npm audit
```

## Contact

For security-related inquiries, contact:

- **Email**: [SECURITY EMAIL ADDRESS]
- **PGP Key**: [If available]

## Acknowledgments

We appreciate the security research community and responsible disclosure of vulnerabilities. Thank you for helping keep COR-HARP and its users safe.

---

*Last updated: August 2026*
