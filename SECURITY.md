# Security Policy

## 🔒 Security Measures

### Data Protection
- **Encryption at Rest**: All journal entries and personal data encrypted in PostgreSQL
- **Encryption in Transit**: HTTPS/TLS 1.3 for all API communications
- **Environment Variables**: Sensitive credentials stored securely, never committed to version control

### Authentication & Authorization
- **Session Management**: Secure HTTP-only cookies with SameSite protection
- **Token Expiration**: JWT tokens expire after 24 hours
- **Password Security**: Bcrypt hashing with salt rounds = 12
- **Rate Limiting**: 100 requests/15 minutes per IP address

### Input Validation
- **Server-Side Validation**: All user inputs validated using Zod schemas
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **XSS Protection**: React's JSX auto-escaping + DOMPurify for rich text
- **CSRF Tokens**: Required for all state-changing operations

### API Security
```typescript
// Example: Input sanitization middleware
import { z } from 'zod';

const journalSchema = z.object({
  content: z.string().min(1).max(5000),
  userId: z.number().int().positive(),
});

app.post('/api/journals', async (req, res) => {
  try {
    const validated = journalSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input' });
  }
});
```

### Crisis Detection Safety
- **Pre-Computation Guardrail**: Regex-based keyword detection before AI processing
- **AI Safety Filters**: Gemini Pro content filtering enabled
- **Emergency Response**: Automatic helpline display for crisis indicators
- **Data Retention**: Crisis flags never deleted, used for support escalation

### Dependency Security
- **Automated Audits**: `npm audit` run on every CI/CD build
- **Snyk Integration**: Real-time vulnerability scanning
- **Dependency Pinning**: Exact versions in package-lock.json
- **Regular Updates**: Security patches applied within 48 hours

### CORS Configuration
```typescript
// Restricted origins
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://cogno.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Error Handling
- **No Stack Trace Leakage**: Production errors sanitized
- **Logging**: Winston logger with sensitive data redaction
- **Monitoring**: Sentry integration for error tracking

## Reporting a Vulnerability

If you discover a security vulnerability, please email:
**nagabhushanarajus.ds@mitmysore.in**

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

**Response Time:** We will respond within 48 hours and provide a fix within 7 days for critical issues.

## Security Headers
```typescript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## Compliance
- **GDPR**: User data deletion requests honored within 30 days
- **HIPAA-Ready**: Architecture supports healthcare compliance (encryption, audit logs)
- **Data Minimization**: Only essential data collected and stored

---

**Last Updated:** June 20, 2026  
**Security Contact:** nagabhushanarajus.ds@mitmysore.in
