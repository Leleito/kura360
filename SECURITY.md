# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in KURA360, please report it responsibly:

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email security reports to **security@laitigosystems.com**
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce the issue
5. Include the potential impact assessment

### What to expect

- **Acknowledgment**: Within 48 hours of your report
- **Status Update**: Within 5 business days
- **Resolution Target**: Critical issues within 72 hours, High within 1 week

## Security Measures

### Authentication
- Phone OTP (SMS-based) authentication via Supabase Auth
- Google OAuth 2.0 integration
- Session management with secure HTTP-only cookies
- Middleware-enforced route protection

### Data Protection
- Row Level Security (RLS) on all database tables
- HTTPS enforced with HSTS headers
- Content Security Policy (CSP) headers
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries (Supabase client)

### Infrastructure
- Vercel edge network with DDoS protection
- Supabase managed PostgreSQL with automatic backups
- Environment variables for all sensitive configuration
- No secrets in client-side code

### Compliance
- Election Campaign Financing Act (ECFA) compliance
- Audit trail for all financial transactions
- Evidence integrity via cryptographic hashing
- Role-based access control (RBAC)

## Dependencies

We regularly audit dependencies using:
- `npm audit` for known vulnerabilities
- GitHub Dependabot for automated security updates
- CodeQL for static analysis

## Contact

For security concerns, contact: **security@laitigosystems.com**
