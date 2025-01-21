# AIDesk Technology Stack Rules & Best Practices

## TypeScript & General Coding Standards

### TypeScript Rules
- Always enable strict mode in `tsconfig.json`
- Avoid using `any` type - use `unknown` if type is truly uncertain
- Create proper interfaces/types for all data structures
- Use discriminated unions for complex state management
- Leverage TypeScript utility types (Pick, Omit, Partial, etc.)
- Always define return types for functions
- Use `readonly` for immutable properties

### Common Pitfalls
- Overusing type assertions (`as`)
- Not handling null/undefined properly
- Circular type dependencies
- Over-engineering types (keep it simple)

## React Best Practices

### Component Structure
- Use functional components with hooks
- Keep components small and focused
- Implement proper error boundaries
- Use React.memo() for expensive renders only
- Extract reusable logic into custom hooks

### Performance Rules
- Avoid inline function definitions in renders
- Use proper key props in lists (no array indices)
- Implement virtualization for long lists
- Lazy load components and routes
- Use proper dependency arrays in useEffect

### State Management
- Prefer local state when possible
- Don't duplicate state across stores
- Keep global state minimal
- Use context sparingly

## Zustand Guidelines

### Store Structure
- Create separate stores for different domains
- Keep store actions colocated with state
- Use TypeScript for store definitions
- Implement proper state hydration patterns

### Best Practices
- Don't mutate state directly
- Use immer for complex state updates
- Implement proper store cleanup
- Avoid storing derived state
- Use selective subscriptions

## Shadcn & Tailwind CSS Rules

### Component Usage
- Don't modify shadcn component internals
- Create wrapper components for customization
- Maintain consistent component APIs
- Document component modifications

### Tailwind Guidelines
- Use design tokens for colors/spacing
- Create custom utilities sparingly
- Follow mobile-first approach
- Use proper breakpoint conventions
- Avoid inline styles
- Keep className strings organized

### Common Mistakes
- Overriding shadcn styles directly
- Not using Tailwind's configuration
- Inconsistent spacing/color usage
- Deep nesting of components

## Form Handling (React Hook Form + Zod)

### Form Rules
- Define Zod schemas for all forms
- Implement proper error handling
- Use form context appropriately
- Leverage built-in validation
- Implement proper form cleanup

### Best Practices
- Use controlled components when needed
- Implement proper form reset logic
- Handle async validation properly
- Use proper error messages
- Implement loading states

## Supabase Integration

### Database Rules
- Implement proper RLS policies
- Use appropriate column types
- Create proper indexes
- Follow naming conventions
- Implement proper cascading
- Use appropriate constraints

### Real-time Guidelines
- Handle subscription cleanup
- Implement proper error handling
- Use appropriate channels
- Handle reconnection properly
- Monitor subscription count

### Storage Rules
- Implement proper file type validation
- Set appropriate file size limits
- Use proper bucket organization
- Implement cleanup procedures
- Handle upload/download errors

### Authentication
- Implement proper session handling
- Use appropriate auth providers
- Handle token refresh properly
- Implement proper role management
- Secure route protection

## AWS Lambda Guidelines

### Function Design
- Keep functions focused
- Implement proper error handling
- Use appropriate timeout values
- Implement proper logging
- Handle cold starts

### Best Practices
- Optimize function size
- Use environment variables
- Implement proper retries
- Handle API rate limits
- Use proper memory allocation

## Testing Standards

### Jest Guidelines
- Write meaningful test descriptions
- Follow AAA pattern (Arrange-Act-Assert)
- Mock external dependencies
- Use proper test isolation
- Implement proper cleanup

### Common Testing Mistakes
- Testing implementation details
- Insufficient error cases
- Brittle tests
- Poor test organization
- Missing edge cases

## Error Handling & Monitoring

### Sentry Usage
- Set appropriate sampling rates
- Configure proper environment separation
- Use proper error context
- Implement user identification
- Set up proper alert rules

### Error Handling Rules
- Use proper error boundaries
- Implement proper fallbacks
- Log appropriate context
- Handle async errors properly
- Implement proper recovery

## AI Integration Guidelines

### OpenAI API Usage
- Implement proper rate limiting
- Handle API errors gracefully
- Use appropriate models
- Implement proper validation
- Handle token limits

### Best Practices
- Cache responses when appropriate
- Implement proper fallbacks
- Handle timeouts properly
- Validate AI responses
- Monitor usage and costs

## Security Guidelines

### General Security
- Implement proper CORS policies
- Use proper CSP headers
- Handle sensitive data properly
- Implement proper input validation
- Use proper encryption

### Frontend Security
- Sanitize user input
- Prevent XSS attacks
- Handle sensitive data properly
- Implement proper auth checks
- Use proper CSRF protection

## Performance Guidelines

### Frontend Performance
- Implement proper code splitting
- Optimize bundle size
- Use proper caching strategies
- Optimize images and assets
- Monitor Core Web Vitals

### API Performance
- Implement proper pagination
- Use appropriate batch operations
- Optimize database queries
- Implement proper caching
- Monitor response times

## Deployment Rules

### AWS Amplify
- Use proper branch protection
- Implement proper environment variables
- Use proper build settings
- Implement proper redirects
- Monitor build processes

### Release Process
- Follow semantic versioning
- Create proper release notes
- Implement proper rollback procedures
- Use proper staging environments
- Monitor deployment health

## Documentation Standards

### Code Documentation
- Document complex logic
- Use proper JSDoc comments
- Document API interfaces
- Keep documentation updated
- Document known limitations

### Project Documentation
- Maintain architecture diagrams
- Document setup procedures
- Keep README files updated
- Document troubleshooting steps
- Maintain change logs

## Maintenance Guidelines

### Regular Maintenance
- Update dependencies regularly
- Monitor deprecation notices
- Clean up unused code
- Monitor technical debt
- Review performance metrics

### Monitoring
- Set up proper alerts
- Monitor error rates
- Track performance metrics
- Monitor resource usage
- Review security alerts 