/**
 * Available services for integration.
 * Organized by category for better maintainability.
 */
export enum Service {
  // Source Control & DevOps
  GitHub = 'github',
  GitLab = 'gitlab',
  Bitbucket = 'bitbucket',
  Vercel = 'vercel',
  Netlify = 'netlify',
  Heroku = 'heroku',
  DigitalOcean = 'digitalocean',
  Cloudflare = 'cloudflare',
  DockerHub = 'dockerhub',
  CircleCI = 'circleci',
  TravisCI = 'travisci',
  Jenkins = 'jenkins',

  // Communication
  Slack = 'slack',
  Discord = 'discord',
  Telegram = 'telegram',
  WhatsApp = 'whatsapp',
  Twilio = 'twilio',
  SendGrid = 'sendgrid',
  Postmark = 'postmark',
  Mailgun = 'mailgun',
  Mailchimp = 'mailchimp',

  // Cloud & Infrastructure
  AwsS3 = 'aws-s3',
  AwsLambda = 'aws-lambda',
  AwsEc2 = 'aws-ec2',
  AwsSqs = 'aws-sqs',
  GoogleCloudFunctions = 'google-cloud-functions',
  GoogleCloudStorage = 'google-cloud-storage',
  AzureBlobStorage = 'azure-blob-storage',
  AzureFunctions = 'azure-functions',
  AWS = 'aws',
  GoogleCloud = 'google-cloud',
  Azure = 'azure',
  Fly = 'fly',
  Railway = 'railway',
  Render = 'render',

  // Monitoring & Observability
  Sentry = 'sentry',
  Datadog = 'datadog',
  NewRelic = 'new-relic',
  Grafana = 'grafana',
  PagerDuty = 'pagerduty',
  LogRocket = 'logrocket',
  PostHog = 'posthog',
  Mixpanel = 'mixpanel',
  Amplitude = 'amplitude',
  Segment = 'segment',
  FullStory = 'fullstory',
  Hotjar = 'hotjar',

  // Authentication & Authorization
  Auth0 = 'auth0',
  Okta = 'okta',
  Clerk = 'clerk',
  FirebaseAdmin = 'firebase-admin',
  FirebaseAuth = 'firebase-auth',
  SupabaseAuth = 'supabase-auth',
  Magic = 'magic',
  Stytch = 'stytch',
  Lucia = 'lucia',

  // Database & Storage
  PlanetScale = 'planetscale',
  Neon = 'neon',
  Supabase = 'supabase',
  FirebaseFirestore = 'firebase-firestore',
  MongoDBAtlas = 'mongodb-atlas',
  UpstashRedis = 'upstash-redis',
  Turso = 'turso',
  Firebase = 'firebase',
  Upstash = 'upstash',
  Redis = 'redis',
  MongoDB = 'mongodb',
  CockroachDB = 'cockroachdb',

  // Payments & Billing
  Stripe = 'stripe',
  PayPal = 'paypal',
  Paddle = 'paddle',
  LemonSqueezy = 'lemon-squeezy',
  Shopify = 'shopify',
  Square = 'square',
  Clover = 'clover',

  // Search & Indexing
  Algolia = 'algolia',
  MeiliSearch = 'meilisearch',
  Typesense = 'typesense',

  // Headless CMS
  Contentful = 'contentful',
  Strapi = 'strapi',
  Sanity = 'sanity',
  Storyblok = 'storyblok',
  WordPress = 'wordpress',
  Webflow = 'webflow',
  Ghost = 'ghost',
  Substack = 'substack',

  // AI & Machine Learning
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Cohere = 'cohere',
  Replicate = 'replicate',
  HuggingFace = 'huggingface',
  AssemblyAI = 'assemblyai',
  Perplexity = 'perplexity',
  TogetherAI = 'together-ai',

  // Business & Productivity
  GoogleSheets = 'google-sheets',
  Airtable = 'airtable',
  Notion = 'notion',
  Trello = 'trello',
  Jira = 'jira',
  Asana = 'asana',
  Linear = 'linear',
  Raycast = 'raycast',
  ClickUp = 'clickup',
  Monday = 'monday',

  // Design & Creative
  Figma = 'figma',
  Sketch = 'sketch',
  AdobeXD = 'adobe-xd',
  Canva = 'canva',
  Framer = 'framer',
  Miro = 'miro',
  Mural = 'mural',
  Loom = 'loom',

  // Communication & Collaboration
  Zoom = 'zoom',
  GoogleMeet = 'google-meet',
  MicrosoftTeams = 'microsoft-teams'
}
