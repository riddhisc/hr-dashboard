// Mock data for interview questions by role
const interviewQuestions = {
  // Technical roles
  "Frontend Developer": [
    {
      id: "fe_q1",
      question: "Can you explain the difference between React state and props?",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "Props are passed from parent components and are immutable within the component. State is managed within the component and can change over time. Changes to state trigger re-renders."
    },
    {
      id: "fe_q2",
      question: "How would you optimize the performance of a React application?",
      category: "Technical",
      difficulty: "Hard",
      expectedAnswer: "Techniques include: using React.memo for component memoization, virtualizing long lists, code splitting, lazy loading, using keys properly in lists, optimizing re-renders, and proper use of useCallback and useMemo hooks."
    },
    {
      id: "fe_q3",
      question: "Explain the concept of CSS specificity and how it works.",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "CSS specificity determines which CSS rule applies when multiple rules target the same element. It's calculated as a score based on the type of selectors (inline styles > IDs > classes/attributes/pseudo-classes > elements)."
    },
    {
      id: "fe_q4",
      question: "What is the virtual DOM in React and why is it beneficial?",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to determine what changes need to be made to the real DOM. It improves performance by minimizing direct DOM manipulations."
    },
    {
      id: "fe_q5",
      question: "Can you describe your experience with responsive design?",
      category: "Experience",
      difficulty: "Easy",
      expectedAnswer: "Look for understanding of media queries, flexible layouts, mobile-first approach, viewport settings, and actual examples from their work."
    }
  ],
  "Backend Developer": [
    {
      id: "be_q1",
      question: "Explain RESTful API design principles.",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "REST principles include: client-server architecture, statelessness, cacheability, uniform interface, layered system, and code on demand (optional). Should also mention proper use of HTTP methods and status codes."
    },
    {
      id: "be_q2",
      question: "How do you handle database transactions and why are they important?",
      category: "Technical",
      difficulty: "Hard",
      expectedAnswer: "Transactions ensure ACID properties: Atomicity, Consistency, Isolation, and Durability. They're crucial for maintaining data integrity when multiple operations need to succeed or fail together."
    },
    {
      id: "be_q3",
      question: "Describe the differences between SQL and NoSQL databases.",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "SQL databases are relational with structured schemas, while NoSQL databases are non-relational with flexible schemas. Differences include: data structure, scalability approach, query language, and ACID compliance."
    },
    {
      id: "be_q4",
      question: "How would you secure an API endpoint?",
      category: "Technical",
      difficulty: "Hard",
      expectedAnswer: "Techniques include: authentication (OAuth, JWT), authorization, input validation, HTTPS, rate limiting, proper error handling, and security headers."
    },
    {
      id: "be_q5",
      question: "What is your approach to writing testable code?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for mentions of: dependency injection, single responsibility principle, proper abstraction, mocking, and unit test experience."
    }
  ],
  "DevOps Engineer": [
    {
      id: "devops_q1",
      question: "Explain your experience with CI/CD pipelines.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for experience with specific CI/CD tools (Jenkins, GitHub Actions, GitLab CI, etc.), understanding of pipeline stages, and experience automating builds, tests, and deployments."
    },
    {
      id: "devops_q2",
      question: "How would you manage secrets in a Kubernetes environment?",
      category: "Technical",
      difficulty: "Hard",
      expectedAnswer: "Options include: Kubernetes Secrets, encrypted etcd, external secret stores (HashiCorp Vault, AWS Secrets Manager), secrets operators, and SOPS."
    },
    {
      id: "devops_q3",
      question: "Describe your approach to infrastructure as code.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for experience with IaC tools (Terraform, CloudFormation, Pulumi), version control for infrastructure, modular design, and testing strategies."
    },
    {
      id: "devops_q4",
      question: "How do you monitor applications and what metrics do you focus on?",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "Should mention monitoring tools (Prometheus, Grafana, ELK stack) and important metrics like latency, traffic, errors, and saturation. Also application-specific metrics and alerting strategies."
    },
    {
      id: "devops_q5",
      question: "Explain how you would troubleshoot a slow-performing application in production.",
      category: "Experience",
      difficulty: "Hard",
      expectedAnswer: "Look for a methodical approach: gathering evidence, checking logs, monitoring system resources, analyzing database queries, testing network latency, profiling code, and validating recent changes."
    }
  ],
  "UI/UX Designer": [
    {
      id: "uiux_q1",
      question: "Walk us through your design process for a recent project.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for a structured approach: research, user personas, information architecture, wireframing, prototyping, user testing, and iteration based on feedback."
    },
    {
      id: "uiux_q2",
      question: "How do you ensure your designs are accessible?",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "Should mention: WCAG guidelines, color contrast, keyboard navigation, screen reader compatibility, alt text, and user testing with people who have disabilities."
    },
    {
      id: "uiux_q3",
      question: "Describe how you incorporate user feedback into your design process.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for specific methods of gathering feedback (interviews, testing, surveys) and examples of how they've used feedback to improve designs."
    },
    {
      id: "uiux_q4",
      question: "How do you handle conflicting feedback from stakeholders?",
      category: "Behavioral",
      difficulty: "Hard",
      expectedAnswer: "Should demonstrate ability to prioritize feedback based on user needs, business goals, and data, as well as strong communication skills to handle conflicting opinions."
    },
    {
      id: "uiux_q5",
      question: "Explain the difference between UX and UI design.",
      category: "Technical",
      difficulty: "Easy",
      expectedAnswer: "UX (user experience) focuses on the overall feel and user journey, while UI (user interface) focuses on the visual elements and interactive components. They should explain how these work together."
    }
  ],
  
  // Management roles
  "Product Manager": [
    {
      id: "pm_q1",
      question: "How do you prioritize features for a product roadmap?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for frameworks like RICE, MoSCoW, or value vs. effort, consideration of stakeholder input, user needs, business goals, and data-driven decision making."
    },
    {
      id: "pm_q2",
      question: "Describe how you would conduct user research for a new product feature.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Should mention various methods: user interviews, surveys, usability testing, analytics review, and how to synthesize findings into actionable insights."
    },
    {
      id: "pm_q3",
      question: "How do you communicate product decisions to different stakeholders?",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Look for tailoring communication to different audiences (executives, engineers, designers), using data to support decisions, and handling pushback respectfully."
    },
    {
      id: "pm_q4",
      question: "Tell me about a time when you had to kill a feature or product. How did you handle it?",
      category: "Behavioral",
      difficulty: "Hard",
      expectedAnswer: "Should demonstrate data-driven decision making, effective communication with stakeholders, and lessons learned from the experience."
    },
    {
      id: "pm_q5",
      question: "How do you measure the success of a product or feature?",
      category: "Technical",
      difficulty: "Medium",
      expectedAnswer: "Should mention defining success metrics upfront, both quantitative (usage metrics, conversions) and qualitative (user feedback), and continuous monitoring."
    }
  ],
  "Project Manager": [
    {
      id: "prj_q1",
      question: "How do you handle scope creep in a project?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for clear processes: proper documentation of requirements, change control procedures, impact analysis of changes, and stakeholder communication."
    },
    {
      id: "prj_q2",
      question: "Describe your approach to risk management in projects.",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Should include risk identification, assessment (impact and probability), mitigation strategies, contingency planning, and ongoing monitoring."
    },
    {
      id: "prj_q3",
      question: "How do you keep a project on track when facing resource constraints?",
      category: "Behavioral",
      difficulty: "Hard",
      expectedAnswer: "Look for prioritization skills, stakeholder communication, creative problem-solving, and experience negotiating for resources or adjusting scope/timeline."
    },
    {
      id: "prj_q4",
      question: "Tell me about a challenging project you managed and how you ensured its success.",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Should demonstrate leadership, problem-solving, stakeholder management, and specific actions taken to overcome obstacles."
    },
    {
      id: "prj_q5",
      question: "How do you manage dependencies between different teams or components?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for clear documentation of dependencies, coordination meetings, buffer time in scheduling, and proactive communication across teams."
    }
  ],
  "Engineering Manager": [
    {
      id: "em_q1",
      question: "How do you approach hiring and building an effective engineering team?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Should cover defining needed skills, diverse recruitment strategies, effective interview processes, onboarding, and creating a positive team culture."
    },
    {
      id: "em_q2",
      question: "How do you balance technical debt against new feature development?",
      category: "Experience",
      difficulty: "Hard",
      expectedAnswer: "Look for strategies like allocating dedicated time for tech debt, incorporating it into feature work, educating stakeholders on its importance, and data-driven prioritization."
    },
    {
      id: "em_q3",
      question: "Describe how you handle performance issues with team members.",
      category: "Behavioral",
      difficulty: "Hard",
      expectedAnswer: "Should demonstrate a fair approach: regular feedback, clear expectations, understanding root causes, creating improvement plans, and fair escalation if needed."
    },
    {
      id: "em_q4",
      question: "How do you stay technically relevant as a manager?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Look for ongoing learning strategies, technical discussions with team, code reviews, occasional hands-on work, and keeping up with industry trends."
    },
    {
      id: "em_q5",
      question: "How do you measure the productivity and success of your engineering team?",
      category: "Experience",
      difficulty: "Medium",
      expectedAnswer: "Should go beyond simple metrics to include quality measures (bugs, incidents), team health, meeting commitments, business impact, and continuous improvement."
    }
  ],
  
  // General questions for all roles
  "General": [
    {
      id: "gen_q1",
      question: "Tell me about yourself and your background.",
      category: "Behavioral",
      difficulty: "Easy",
      expectedAnswer: "Look for a concise professional summary with relevant experience and skills for the role."
    },
    {
      id: "gen_q2",
      question: "Why are you interested in this position and our company?",
      category: "Behavioral",
      difficulty: "Easy",
      expectedAnswer: "Candidate should demonstrate knowledge of the company and alignment between their career goals and the position."
    },
    {
      id: "gen_q3",
      question: "Describe a challenging situation you faced at work and how you handled it.",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Look for problem-solving skills, resilience, taking initiative, and learning from challenges."
    },
    {
      id: "gen_q4",
      question: "How do you handle feedback and criticism?",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Should demonstrate openness to feedback, ability to not take criticism personally, and using feedback for improvement."
    },
    {
      id: "gen_q5",
      question: "Describe your ideal work environment.",
      category: "Behavioral",
      difficulty: "Easy",
      expectedAnswer: "Look for alignment with your company culture and whether they can be effective in your environment."
    },
    {
      id: "gen_q6",
      question: "Where do you see yourself professionally in 5 years?",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Should show ambition, career planning, and ideally a path that could be fulfilled at your company."
    },
    {
      id: "gen_q7",
      question: "How do you stay organized and manage your time?",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Look for specific tools and techniques they use, prioritization skills, and examples of handling multiple responsibilities."
    },
    {
      id: "gen_q8",
      question: "Tell me about a time you had to learn something new quickly.",
      category: "Behavioral",
      difficulty: "Medium",
      expectedAnswer: "Should demonstrate learning agility, resourcefulness, and initiative."
    }
  ]
};

export default interviewQuestions; 