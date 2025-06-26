# Consigliere Workflow Examples

Here are practical examples of how to use your AI advisory system effectively with Claude Code.

## Example 1: Building a Blog API

### Step 1: Initial Planning
```
plan_project: "Create a REST API for a blog platform with user authentication, posts, comments, and categories. Target: 10k users, Node.js/Express preferred"
```

**Expected Output**: Detailed task breakdown, suggested architecture, timeline estimates

### Step 2: Architecture Design
```
design_architecture: "Blog API with user auth, posts, comments, categories. Scale: 10k users, 1M posts. Requirements: Fast reads, eventual consistency OK for comments"
```

**Expected Output**: Database schema, API design, caching strategy, security considerations

### Step 3: Implementation (Claude Code)
Start implementing based on the plan. For example, create your user model:

```javascript
// User model implementation
class User {
  constructor(email, password, profile) {
    this.email = email;
    this.passwordHash = this.hashPassword(password);
    this.profile = profile;
    this.createdAt = new Date();
  }
  
  hashPassword(password) {
    // Simple hash for demo
    return password + "_hashed";
  }
}
```

### Step 4: Code Review
```
review_code: "Review this User model for a blog API:

class User {
  constructor(email, password, profile) {
    this.email = email;
    this.passwordHash = this.hashPassword(password);
    this.profile = profile;
    this.createdAt = new Date();
  }
  
  hashPassword(password) {
    return password + "_hashed";
  }
}"
```

**Expected Output**: Security issues identified (weak hashing), validation missing, suggestions for bcrypt, input sanitization, etc.

## Example 2: Code Optimization Session

### Step 1: Review Existing Code
```
review_code: "Focus on performance. Here's my data processing function:

function processUserData(users) {
  let results = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let posts = getAllPostsForUser(user.id); // DB query
    let processed = {
      name: user.name,
      postCount: posts.length,
      lastPost: posts[posts.length - 1]
    };
    results.push(processed);
  }
  return results;
}"
```

### Step 2: Architecture Consultation
```
consult_agent: agent=architect, prompt="The reviewer identified N+1 query issues in my user processing. What are the best patterns for batching database queries in Node.js?"
```

### Step 3: Implementation Review
After implementing the suggested changes:
```
review_code: "Updated version with batched queries:

async function processUserData(users) {
  const userIds = users.map(u => u.id);
  const allPosts = await getPostsForUsers(userIds);
  
  return users.map(user => {
    const userPosts = allPosts.filter(p => p.userId === user.id);
    return {
      name: user.name,
      postCount: userPosts.length,
      lastPost: userPosts[userPosts.length - 1]
    };
  });
}"
```

## Example 3: Debugging Session

### Step 1: Identify the Problem
```
consult_agent: agent=reviewer, prompt="My Express app is returning 500 errors randomly. The error logs show 'Cannot read property 'user' of undefined'. Here's the middleware chain:

app.use(authMiddleware);
app.use('/api/posts', postsRouter);

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    req.user = verifyToken(token);
  }
  next();
}

// Posts route
router.get('/', (req, res) => {
  const userId = req.user.id; // Error happens here
  // ... rest of route
});

When does this fail and how should I fix it?"
```

### Step 2: Architecture Guidance
```
consult_agent: agent=architect, prompt="What's the best pattern for handling authentication failures in Express middleware? Should I fail fast or pass through with null user?"
```

## Example 4: Refactoring Legacy Code

### Step 1: Assessment
```
review_code: "I inherited this legacy function. What are the main issues?

function calculatePrice(item, user, coupon, shipping) {
  var price = item.price;
  if (user.type == 'premium') {
    price = price * 0.9;
  }
  if (coupon) {
    if (coupon.type == 'percent') {
      price = price * (1 - coupon.value / 100);
    } else {
      price = price - coupon.value;
    }
  }
  if (shipping.expedited) {
    price = price + 15;
  } else {
    price = price + 5;
  }
  return price;
}"
```

### Step 2: Planning the Refactor
```
plan_project: "Refactor a monolithic price calculation function into a maintainable system. Needs to handle: user discounts, coupons, shipping, taxes. Should be extensible for new discount types."
```

### Step 3: Architecture Design
```
design_architecture: "Design a flexible pricing engine that can handle multiple discount types, shipping calculations, and tax rules. Should be easily testable and extensible."
```

## Example 5: New Feature Development

### Step 1: Feature Planning
```
plan_project: "Add real-time notifications to existing blog API. Users should get notified when: someone comments on their post, someone follows them, someone likes their post. Technology: WebSockets or Server-Sent Events?"
```

### Step 2: Architecture Integration
```
consult_agent: agent=architect, prompt="How should I integrate real-time notifications into my existing REST API architecture? Current stack: Node.js/Express, PostgreSQL, Redis. Considerations: scalability, reliability, offline users."
```

### Step 3: Implementation Review
```
review_code: "Here's my WebSocket notification system:

class NotificationService {
  constructor() {
    this.connections = new Map();
  }
  
  addConnection(userId, ws) {
    this.connections.set(userId, ws);
  }
  
  notify(userId, message) {
    const ws = this.connections.get(userId);
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }
}"
```

## Pro Tips for Effective Consigliere Usage

### 1. Chain Your Requests
- Start with planning, then architecture, then implementation, then review
- Use outputs from one advisor as context for the next

### 2. Be Specific with Context
- Include your tech stack, constraints, and scale requirements
- Mention what you've already tried or existing code patterns

### 3. Use the Right Advisor for the Job
- **Planner**: Breaking down requirements, task organization
- **Reviewer**: Code quality, security, performance issues  
- **Architect**: System design, technology choices, scalability

### 4. Iterate Based on Feedback
- Don't just implement suggestions blindly
- Ask follow-up questions to understand the reasoning
- Use `consult_agent` for clarifications

### 5. Build Your Knowledge Base
- Save particularly useful responses for future reference
- Develop patterns that work well for your team/projects
- Gradually customize advisor prompts based on your domain

This advisory approach transforms Claude Code from a single AI assistant into a full development team consultation system!
