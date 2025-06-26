# Claude Code + Consigliere Workflow

## Available AI Advisors

I have access to specialized AI advisors through Consigliere MCP tools that should be integrated into our development workflow:

### Planning Agent (`plan_project`)
- **Purpose**: Project breakdown, task organization, architecture recommendations
- **When to use**: Starting projects, breaking down features, organizing work
- **Auto-suggest when**: I describe new projects or complex requirements

### Review Agent (`review_code`) 
- **Purpose**: Code quality, security, performance, best practices analysis
- **When to use**: After implementing code, before commits, when debugging
- **Auto-suggest when**: I share code for discussion or ask about code quality

### Architecture Agent (`design_architecture`)
- **Purpose**: System design, scalability, technology decisions
- **When to use**: Making architectural decisions, planning system structure
- **Auto-suggest when**: I ask about system design, scaling, or tech stack choices

### Expert Consultation (`consult_agent`)
- **Purpose**: Direct access to any specialist for specific questions
- **When to use**: Need focused expertise on specific problems
- **Auto-suggest when**: Complex problems need specialized insight

## Default Workflow Patterns

### New Project Workflow
1. **Always start with planning**: Use `plan_project` to break down requirements
2. **Design before coding**: Use `design_architecture` for system design
3. **Implement incrementally**: Follow the plan step-by-step
4. **Review each component**: Use `review_code` before moving to next component
5. **Consult experts**: Use `consult_agent` for complex decisions

### Code Review Workflow
- **After writing any substantial code**: Automatically suggest `review_code`
- **Before major commits**: Always review with the agent
- **When debugging**: Use `review_code` to identify issues
- **For performance concerns**: Focus review on optimization opportunities

### Architecture Decision Workflow
- **System design questions**: Always use `design_architecture`
- **Technology choices**: Consult the architecture agent
- **Scalability planning**: Get architectural guidance
- **Integration patterns**: Ask for architectural recommendations

## Proactive Collaboration Guidelines

**Automatically suggest advisor consultation when:**
- I mention starting a new project → `plan_project`
- I paste code for any reason → `review_code` 
- I ask about system design/architecture → `design_architecture`
- I'm debugging complex issues → `review_code` then `consult_agent` if needed
- I mention performance/scaling concerns → `design_architecture`
- I ask "how should I..." for complex problems → appropriate advisor

**Integration principles:**
- Use advisors to enhance our collaboration, not replace our discussion
- Chain advisor outputs (use planning to inform architecture, etc.)
- Always provide context about tech stack, constraints, and scale
- Reference previous advisor recommendations when building on their advice
- Treat advisors as senior consultants - get their input on important decisions

## Communication Patterns

When suggesting advisor consultation:
- Be specific about why the advisor would help
- Suggest the right context to provide
- Offer to chain multiple advisors when beneficial
- Frame it as "let's get expert input on..." rather than just "use this tool"

**Example suggestions:**
- "Let's use the planning advisor to break this down systematically"
- "This looks like a good candidate for code review - want me to check it with the review advisor?"
- "The architecture advisor could help us design this system properly"
- "Let me consult the [X] advisor about this specific issue"

## Project Context Integration

Always consider:
- Current project architecture and constraints
- Established patterns and conventions
- Previous advisor recommendations in this project
- Team preferences and standards
- Performance and scalability requirements

The goal is seamless integration where expert AI consultation feels natural and enhances our development process.
