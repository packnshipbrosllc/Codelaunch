// data/decision-tree.ts
import { DecisionTree, DecisionNode, EducationalTooltip } from '../types/decision-tree';

// Educational tooltips that appear throughout the journey
export const educationalTooltips: Record<string, EducationalTooltip> = {
  backend: {
    term: "Backend",
    simpleExplanation: "The behind-the-scenes part of your app that stores data and handles logic",
    technicalExplanation: "Server-side code that processes requests, manages databases, and handles business logic",
    example: "When you log in, the backend checks if your password is correct",
    whyItMatters: "Without a backend, your app can't save user data or process payments"
  },
  database: {
    term: "Database",
    simpleExplanation: "Where your app stores all its information (users, products, posts, etc.)",
    technicalExplanation: "Structured storage system for persistent data with query capabilities",
    example: "Instagram's database stores all your photos, likes, and comments",
    whyItMatters: "Your data needs a safe, organized place to live"
  },
  authentication: {
    term: "Authentication",
    simpleExplanation: "The system that lets users create accounts and log in securely",
    technicalExplanation: "Identity verification and session management system",
    example: "When you sign in with your email and password, that's authentication",
    whyItMatters: "Keeps user accounts secure and personalizes their experience"
  },
  api: {
    term: "API (Application Programming Interface)",
    simpleExplanation: "How different parts of your app talk to each other",
    technicalExplanation: "Set of endpoints that allow communication between frontend and backend",
    example: "When you click 'Like', the API tells the backend to save that like",
    whyItMatters: "Connects your user interface to your backend logic"
  },
  hosting: {
    term: "Hosting",
    simpleExplanation: "Where your app lives on the internet so people can access it",
    technicalExplanation: "Server infrastructure that runs your application code and serves it to users",
    example: "Like renting space for your app on the internet",
    whyItMatters: "Without hosting, nobody can visit your app"
  },
  pwa: {
    term: "Progressive Web App (PWA)",
    simpleExplanation: "A website that works like a mobile app - can work offline and install to home screen",
    technicalExplanation: "Web application with native app capabilities using service workers",
    example: "Twitter Lite - works in browser but feels like a native app",
    whyItMatters: "Build once, works everywhere - no app store approval needed"
  }
};

// Root question - appears first
export const rootQuestion: DecisionNode = {
  id: 'root',
  question: 'What do you want your app to do?',
  category: 'Purpose',
  explanation: 'Let\'s start by understanding what problem your app solves. This helps us recommend the right features and technology.',
  nodeType: 'decision',
  priority: 1,
  choices: [
    {
      id: 'ecommerce',
      label: '🛒 Sell Products',
      value: 'ecommerce',
      description: 'Build an online store to sell physical products, digital goods, or services',
      learnMore: 'E-commerce apps need payment processing, product catalogs, shopping carts, and order management. We\'ll guide you through setting up everything you need to start selling online.',
      recommended: true,
      estimatedTime: '15 minutes',
      difficulty: 'beginner'
    },
    {
      id: 'saas',
      label: '📊 Manage Data',
      value: 'saas',
      description: 'Create a SaaS dashboard or business tool to organize and track information',
      learnMore: 'SaaS apps help businesses manage workflows, track metrics, and organize data. Perfect for CRMs, project management tools, or analytics dashboards.',
      estimatedTime: '20 minutes',
      difficulty: 'intermediate'
    },
    {
      id: 'social',
      label: '👥 Connect People',
      value: 'social',
      description: 'Build a social network or community platform where users interact',
      learnMore: 'Social apps let people create profiles, share content, and communicate. Think forums, dating apps, or professional networks.',
      estimatedTime: '25 minutes',
      difficulty: 'intermediate'
    },
    {
      id: 'content',
      label: '📝 Share Content',
      value: 'content',
      description: 'Create a blog, portfolio, or media platform to publish content',
      learnMore: 'Content platforms focus on publishing articles, videos, or showcasing work. Great for blogs, news sites, or creative portfolios.',
      estimatedTime: '10 minutes',
      difficulty: 'beginner'
    },
    {
      id: 'custom',
      label: '🎯 Something Else',
      value: 'custom',
      description: 'I have a unique idea that doesn\'t fit these categories',
      learnMore: 'No problem! We\'ll ask you custom questions to understand your specific needs.',
      estimatedTime: '30 minutes',
      difficulty: 'advanced'
    }
  ]
};

// Second question - platform type
export const platformQuestion: DecisionNode = {
  id: 'platform',
  question: 'What type of app do you want to create?',
  category: 'Platform',
  explanation: 'This determines how users will access your app. Each platform has different capabilities and reaches different audiences.',
  nodeType: 'decision',
  priority: 2,
  choices: [
    {
      id: 'web',
      label: '💻 Web App',
      value: 'web',
      description: 'Runs in any web browser (Chrome, Safari, Firefox). Works on all devices.',
      learnMore: 'Web apps are the easiest to build and maintain. Users don\'t need to download anything - just visit your URL. Perfect for getting started quickly.',
      recommended: true,
      estimatedTime: 'Fastest to build',
      difficulty: 'beginner'
    },
    {
      id: 'mobile',
      label: '📱 Mobile App',
      value: 'mobile',
      description: 'Native app for iOS and Android. Downloaded from App Store or Google Play.',
      learnMore: 'Mobile apps offer the best performance and can use device features like camera, GPS, and push notifications. Requires app store approval.',
      estimatedTime: 'Longer development time',
      difficulty: 'advanced'
    },
    {
      id: 'desktop',
      label: '🖥️ Desktop App',
      value: 'desktop',
      description: 'Standalone application for Windows, Mac, or Linux computers.',
      learnMore: 'Desktop apps are great for power users who need offline access and deep system integration.',
      estimatedTime: 'Complex setup',
      difficulty: 'advanced'
    },
    {
      id: 'pwa',
      label: '🌐 Progressive Web App',
      value: 'pwa',
      description: 'Web app that works like a mobile app. Best of both worlds.',
      learnMore: 'PWAs can be installed to home screen, work offline, and send notifications - but you only build once. No app store needed!',
      recommended: false,
      estimatedTime: 'Moderate complexity',
      difficulty: 'intermediate'
    }
  ]
};

// E-COMMERCE + WEB APP PATH
export const ecommerceWebPath: DecisionNode[] = [
  {
    id: 'ecom-products',
    question: 'What are you selling?',
    category: 'Products',
    explanation: 'Different product types need different features. Physical products need shipping, digital products need delivery, services need booking.',
    nodeType: 'decision',
    priority: 3,
    choices: [
      {
        id: 'physical',
        label: '📦 Physical Products',
        value: 'physical',
        description: 'Items that need to be shipped (clothes, electronics, etc.)',
        learnMore: 'Physical products require inventory tracking, shipping calculations, and order fulfillment. We\'ll set up everything you need.',
        unlocks: ['shipping', 'inventory'],
        recommended: true,
        difficulty: 'beginner'
      },
      {
        id: 'digital',
        label: '💾 Digital Products',
        value: 'digital',
        description: 'Downloadable files (ebooks, software, music, courses)',
        learnMore: 'Digital products are delivered instantly after purchase. No shipping needed - files are downloaded directly.',
        unlocks: ['file-delivery'],
        difficulty: 'beginner'
      },
      {
        id: 'services',
        label: '🎯 Services',
        value: 'services',
        description: 'Bookings and appointments (consulting, classes, etc.)',
        learnMore: 'Service-based products need calendar integration and booking management.',
        unlocks: ['booking', 'calendar'],
        difficulty: 'intermediate'
      },
      {
        id: 'subscription',
        label: '🔄 Subscriptions',
        value: 'subscription',
        description: 'Recurring memberships or subscription boxes',
        learnMore: 'Subscription products charge customers regularly. Great for recurring revenue.',
        unlocks: ['recurring-billing'],
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'payment',
    question: 'How will customers pay?',
    category: 'Payment Processing',
    explanation: 'Payment processors handle credit cards, security, and money transfer. They charge a small fee per transaction (usually 2.9% + 30¢).',
    nodeType: 'decision',
    priority: 4,
    choices: [
      {
        id: 'stripe',
        label: '💳 Stripe',
        value: 'stripe',
        description: 'Industry standard. Accepts all major cards, Apple Pay, Google Pay.',
        learnMore: 'Stripe is trusted by millions of businesses. Easy to integrate, excellent documentation, and handles all the complex security stuff for you.',
        recommended: true,
        estimatedTime: '10 minutes setup',
        difficulty: 'beginner'
      },
      {
        id: 'paypal',
        label: '🅿️ PayPal',
        value: 'paypal',
        description: 'Popular worldwide. Many customers already have PayPal accounts.',
        learnMore: 'PayPal is recognized globally and trusted by buyers. Good option if your customers prefer PayPal.',
        estimatedTime: '15 minutes setup',
        difficulty: 'beginner'
      },
      {
        id: 'both',
        label: '💳 + 🅿️ Both',
        value: 'both',
        description: 'Give customers both options for maximum flexibility.',
        learnMore: 'Offering multiple payment methods increases conversion rates. More customers can complete purchases.',
        estimatedTime: '20 minutes setup',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'inventory',
    question: 'Do you need inventory tracking?',
    category: 'Inventory Management',
    explanation: 'Inventory tracking prevents overselling and helps you know when to restock. Essential for physical products.',
    nodeType: 'decision',
    priority: 5,
    dependsOn: ['ecom-products'],
    choices: [
      {
        id: 'yes-inventory',
        label: '✅ Yes, track inventory',
        value: 'yes',
        description: 'Monitor stock levels, get low-stock alerts, prevent overselling',
        learnMore: 'We\'ll set up a system that updates inventory automatically when orders are placed and alerts you when stock is low.',
        recommended: true,
        difficulty: 'beginner'
      },
      {
        id: 'no-inventory',
        label: '❌ No inventory tracking',
        value: 'no',
        description: 'Unlimited stock or made-to-order products',
        learnMore: 'Good for digital products, services, or if you make products on demand.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'auth',
    question: 'How should customers create accounts?',
    category: 'User Authentication',
    explanation: 'Authentication lets customers save their info, track orders, and check out faster. It keeps their data secure.',
    nodeType: 'decision',
    priority: 6,
    choices: [
      {
        id: 'clerk',
        label: '🔐 Email & Password (Clerk)',
        value: 'clerk',
        description: 'Traditional signup with email and password. Secure and familiar.',
        learnMore: 'Clerk handles all the security, password resets, and email verification automatically. It\'s what we use for CodeLaunch!',
        recommended: true,
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'social',
        label: '🌐 Social Login',
        value: 'social',
        description: '"Sign in with Google" or "Sign in with Facebook"',
        learnMore: 'Social login is fastest for users - one click and they\'re in. No password to remember.',
        estimatedTime: '10 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'guest',
        label: '👤 Guest Checkout',
        value: 'guest',
        description: 'Let customers buy without creating an account',
        learnMore: 'Guest checkout reduces friction but customers can\'t track orders or save payment info.',
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'all-auth',
        label: '🎯 All Options',
        value: 'all',
        description: 'Email, social login, AND guest checkout',
        learnMore: 'Maximum flexibility for customers. Some prefer accounts, others want to checkout quickly.',
        recommended: false,
        estimatedTime: '15 minutes',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'admin',
    question: 'Do you need an admin dashboard?',
    category: 'Admin Tools',
    explanation: 'An admin dashboard lets you manage products, view orders, and track sales without touching code.',
    nodeType: 'decision',
    priority: 7,
    choices: [
      {
        id: 'yes-admin',
        label: '✅ Yes, I need a dashboard',
        value: 'yes',
        description: 'View orders, manage products, see analytics',
        learnMore: 'We\'ll build you a full admin panel where you can add products, process orders, and view sales reports.',
        recommended: true,
        difficulty: 'beginner'
      },
      {
        id: 'no-admin',
        label: '❌ No dashboard needed',
        value: 'no',
        description: 'I\'ll manage everything through code or external tools',
        learnMore: 'You can always add this later if you change your mind.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'email',
    question: 'How will you send emails to customers?',
    category: 'Email Notifications',
    explanation: 'Customers expect order confirmations, shipping updates, and password reset emails. Professional emails build trust.',
    nodeType: 'decision',
    priority: 8,
    choices: [
      {
        id: 'resend',
        label: '📧 Resend',
        value: 'resend',
        description: 'Modern email API built for developers. 100 emails/day free.',
        learnMore: 'Resend makes it easy to send beautiful transactional emails. Great for order confirmations and notifications.',
        recommended: true,
        estimatedTime: '10 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'sendgrid',
        label: '📬 SendGrid',
        value: 'sendgrid',
        description: 'Enterprise-grade email service. 100 emails/day free.',
        learnMore: 'SendGrid is battle-tested and used by huge companies. Very reliable.',
        estimatedTime: '15 minutes',
        difficulty: 'intermediate'
      },
      {
        id: 'no-email',
        label: '❌ No emails yet',
        value: 'none',
        description: 'I\'ll add email functionality later',
        learnMore: 'You can skip this for now, but we recommend adding it before launch.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'analytics',
    question: 'Do you want to track visitor behavior?',
    category: 'Analytics',
    explanation: 'Analytics show you where visitors come from, what they click, and where they drop off. Essential for growing your store.',
    nodeType: 'decision',
    priority: 9,
    choices: [
      {
        id: 'ga4',
        label: '📊 Google Analytics',
        value: 'ga4',
        description: 'Free, powerful analytics from Google. Industry standard.',
        learnMore: 'See page views, visitor demographics, conversion rates, and more. Completely free.',
        recommended: true,
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'plausible',
        label: '📈 Plausible',
        value: 'plausible',
        description: 'Privacy-friendly analytics. Simple and lightweight.',
        learnMore: 'Plausible doesn\'t use cookies or track personal data. GDPR compliant out of the box.',
        estimatedTime: '3 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'no-analytics',
        label: '❌ No analytics',
        value: 'none',
        description: 'Skip analytics for now',
        learnMore: 'You can always add this later, but we strongly recommend it from day one.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'hosting',
    question: 'Where should we deploy your store?',
    category: 'Hosting',
    explanation: 'Your hosting platform is where your app lives on the internet. It runs your code and serves pages to customers.',
    nodeType: 'decision',
    priority: 10,
    choices: [
      {
        id: 'vercel',
        label: '▲ Vercel',
        value: 'vercel',
        description: 'Built for Next.js. Free tier is generous. Automatic deployments.',
        learnMore: 'Vercel is the creator of Next.js. One-click deployments, automatic HTTPS, and edge caching. Perfect for e-commerce.',
        recommended: true,
        estimatedTime: '2 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'netlify',
        label: '🦈 Netlify',
        value: 'netlify',
        description: 'Popular hosting platform. Great free tier.',
        learnMore: 'Netlify is developer-friendly with instant rollbacks and preview deployments.',
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'aws',
        label: '☁️ AWS',
        value: 'aws',
        description: 'Enterprise-grade cloud infrastructure. Most scalable.',
        learnMore: 'AWS offers unlimited scale but requires more technical knowledge. Great for high-traffic stores.',
        estimatedTime: '30 minutes',
        difficulty: 'advanced'
      }
    ]
  }
];

// SAAS + WEB APP PATH
export const saasWebPath: DecisionNode[] = [
  {
    id: 'saas-purpose',
    question: 'What will your SaaS help users accomplish?',
    category: 'Purpose',
    explanation: 'Understanding your SaaS\'s core function helps us recommend the right database, features, and integrations.',
    nodeType: 'decision',
    priority: 3,
    choices: [
      {
        id: 'crm',
        label: '👥 Customer Management (CRM)',
        value: 'crm',
        description: 'Track customers, deals, and relationships',
        learnMore: 'CRMs help businesses organize customer data, track sales pipelines, and manage interactions.',
        unlocks: ['contacts', 'pipeline'],
        difficulty: 'intermediate'
      },
      {
        id: 'project',
        label: '📋 Project Management',
        value: 'project',
        description: 'Organize tasks, teams, and workflows',
        learnMore: 'Project management tools help teams collaborate, track progress, and meet deadlines.',
        unlocks: ['tasks', 'teams'],
        recommended: true,
        difficulty: 'intermediate'
      },
      {
        id: 'analytics',
        label: '📊 Analytics Dashboard',
        value: 'analytics',
        description: 'Visualize data and track metrics',
        learnMore: 'Analytics dashboards turn raw data into actionable insights with charts and reports.',
        unlocks: ['charts', 'reports'],
        difficulty: 'advanced'
      },
      {
        id: 'automation',
        label: '🤖 Workflow Automation',
        value: 'automation',
        description: 'Automate repetitive tasks and processes',
        learnMore: 'Automation tools connect different apps and trigger actions based on events.',
        unlocks: ['workflows', 'triggers'],
        difficulty: 'advanced'
      }
    ]
  },
  {
    id: 'database',
    question: 'What database should we use?',
    category: 'Database',
    explanation: 'Your database stores all user data, settings, and content. Different databases are optimized for different use cases.',
    nodeType: 'decision',
    priority: 4,
    choices: [
      {
        id: 'supabase',
        label: '🔋 Supabase (PostgreSQL)',
        value: 'supabase',
        description: 'Open-source Firebase alternative. Powerful and modern.',
        learnMore: 'Supabase gives you a full PostgreSQL database, authentication, and real-time features out of the box. Great for SaaS apps. We use it for CodeLaunch!',
        recommended: true,
        estimatedTime: '10 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'firebase',
        label: '🔥 Firebase',
        value: 'firebase',
        description: 'Google\'s real-time database. Great for collaboration features.',
        learnMore: 'Firebase excels at real-time data sync. Perfect if multiple users need to see updates instantly.',
        estimatedTime: '15 minutes',
        difficulty: 'intermediate'
      },
      {
        id: 'mongodb',
        label: '🍃 MongoDB',
        value: 'mongodb',
        description: 'Flexible NoSQL database. Great for complex, nested data.',
        learnMore: 'MongoDB stores data as JSON-like documents. Flexible schema works well for evolving products.',
        estimatedTime: '20 minutes',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'saas-auth',
    question: 'How should users sign in?',
    category: 'Authentication',
    explanation: 'SaaS apps need secure authentication with features like team management and role-based permissions.',
    nodeType: 'decision',
    priority: 5,
    choices: [
      {
        id: 'clerk-saas',
        label: '🔐 Clerk',
        value: 'clerk',
        description: 'Complete auth solution with team management built-in',
        learnMore: 'Clerk handles everything: signup, login, password reset, 2FA, team invites, and role management. Perfect for B2B SaaS.',
        recommended: true,
        estimatedTime: '10 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'auth0',
        label: '🛡️ Auth0',
        value: 'auth0',
        description: 'Enterprise authentication with SSO and advanced security',
        learnMore: 'Auth0 offers enterprise features like single sign-on (SSO) and compliance certifications.',
        estimatedTime: '20 minutes',
        difficulty: 'advanced'
      },
      {
        id: 'supabase-auth',
        label: '🔋 Supabase Auth',
        value: 'supabase-auth',
        description: 'Built-in authentication if you\'re using Supabase database',
        learnMore: 'If you chose Supabase as your database, you get authentication included. One less service to manage.',
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'billing',
    question: 'How will you charge customers?',
    category: 'Billing',
    explanation: 'SaaS businesses typically charge monthly or annually. Stripe makes recurring billing simple and secure.',
    nodeType: 'decision',
    priority: 6,
    choices: [
      {
        id: 'stripe-billing',
        label: '💳 Stripe Billing',
        value: 'stripe',
        description: 'Handle subscriptions, invoices, and payment methods',
        learnMore: 'Stripe Billing automates recurring charges, handles failed payments, and sends invoices. Industry standard for SaaS.',
        recommended: true,
        estimatedTime: '15 minutes',
        difficulty: 'intermediate'
      },
      {
        id: 'paddle',
        label: '🚣 Paddle',
        value: 'paddle',
        description: 'Merchant of record - they handle taxes and compliance',
        learnMore: 'Paddle acts as the seller, so they handle all tax compliance and regulations. Great for selling globally.',
        estimatedTime: '20 minutes',
        difficulty: 'intermediate'
      },
      {
        id: 'no-billing',
        label: '❌ Free product (no billing)',
        value: 'none',
        description: 'I\'ll add billing later or keep it free',
        learnMore: 'You can launch for free and add billing when you\'re ready to monetize.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'realtime',
    question: 'Do you need real-time collaboration?',
    category: 'Real-time Features',
    explanation: 'Real-time means multiple users see updates instantly without refreshing. Think Google Docs or Figma.',
    nodeType: 'decision',
    priority: 7,
    choices: [
      {
        id: 'yes-realtime',
        label: '✅ Yes, real-time updates',
        value: 'yes',
        description: 'Multiple users see changes instantly (like Google Docs)',
        learnMore: 'We\'ll set up WebSocket connections so changes appear immediately for all users. Great for collaboration.',
        unlocks: ['websockets'],
        estimatedTime: '25 minutes',
        difficulty: 'advanced'
      },
      {
        id: 'no-realtime',
        label: '❌ No, regular updates are fine',
        value: 'no',
        description: 'Users can refresh to see new data',
        learnMore: 'Standard apps refresh data periodically. Simpler to build and maintain.',
        recommended: true,
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'teams',
    question: 'Will users work in teams?',
    category: 'Team Management',
    explanation: 'Team features let users invite colleagues, assign roles, and share workspaces. Common in B2B SaaS.',
    nodeType: 'decision',
    priority: 8,
    choices: [
      {
        id: 'yes-teams',
        label: '👥 Yes, team workspaces',
        value: 'yes',
        description: 'Users can invite team members and assign roles',
        learnMore: 'We\'ll set up team creation, invitations, role permissions (admin, member, viewer), and shared workspaces.',
        unlocks: ['roles', 'invites'],
        recommended: true,
        difficulty: 'intermediate'
      },
      {
        id: 'no-teams',
        label: '👤 No, individual accounts only',
        value: 'no',
        description: 'Each user has their own private workspace',
        learnMore: 'Individual accounts are simpler to build. You can add teams later if needed.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'saas-api',
    question: 'Do you need a public API?',
    category: 'API',
    explanation: 'A public API lets other developers integrate with your SaaS. Think Stripe API or Twilio API.',
    nodeType: 'decision',
    priority: 9,
    choices: [
      {
        id: 'yes-api',
        label: '✅ Yes, public API',
        value: 'yes',
        description: 'Let developers integrate with your SaaS',
        learnMore: 'We\'ll build a REST API with authentication, rate limiting, and documentation. Great for partnerships and integrations.',
        unlocks: ['api-docs', 'rate-limiting'],
        difficulty: 'advanced'
      },
      {
        id: 'no-api',
        label: '❌ No API needed',
        value: 'no',
        description: 'Users only interact through the web interface',
        learnMore: 'Most SaaS apps start without a public API. You can add one later when there\'s demand.',
        recommended: true,
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'saas-hosting',
    question: 'Where should we deploy your SaaS?',
    category: 'Hosting',
    explanation: 'SaaS apps need reliable hosting with good uptime. Your hosting choice affects speed and scalability.',
    nodeType: 'decision',
    priority: 10,
    choices: [
      {
        id: 'vercel-saas',
        label: '▲ Vercel',
        value: 'vercel',
        description: 'Fast, reliable, automatic scaling. Built for Next.js.',
        learnMore: 'Vercel automatically scales based on traffic. Great for most SaaS apps. Free tier is generous.',
        recommended: true,
        estimatedTime: '5 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'railway',
        label: '🚂 Railway',
        value: 'railway',
        description: 'Full-stack platform with database hosting included',
        learnMore: 'Railway hosts your app AND database together. Simpler infrastructure management.',
        estimatedTime: '10 minutes',
        difficulty: 'beginner'
      },
      {
        id: 'aws-saas',
        label: '☁️ AWS',
        value: 'aws',
        description: 'Maximum control and scalability for enterprise SaaS',
        learnMore: 'AWS gives you full control over infrastructure. Required for enterprise customers with compliance needs.',
        estimatedTime: '60+ minutes',
        difficulty: 'advanced'
      }
    ]
  }
];

// Complete decision tree structure
export const decisionTree: DecisionTree = {
  rootQuestion,
  paths: {
    ecommerce: {
      web: ecommerceWebPath,
      // mobile: ecommerceMobilePath, // TODO: Add later
      // pwa: ecommercePWAPath, // TODO: Add later
    },
    saas: {
      web: saasWebPath,
      // mobile: saasMobilePath, // TODO: Add later
    },
    // social: { ... }, // TODO: Add later
    // content: { ... }, // TODO: Add later
    // custom: { ... }, // TODO: Add later
  }
};

