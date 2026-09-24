import { PortfolioData } from '../types';

export const portfolioData: PortfolioData = {
  name: 'Farhan Kabir',
  title: 'AI Engineer | Full-Stack Developer | Specializing in Agentic Workflows & NLP | Mental Health |',
  tagline: 'Designing deep linguistic networks to analyze cognitive states, autism indicators, and mental-health text semantics.',
  about: 'AI-focused Full Stack Engineer with 4+ years of experience building scalable web architectures and robust LLM-driven applications. Specialized in multi-agent workflows, API integrations, and cloud infrastructure using React, Node.js, and generative AI frameworks. Proven track record of accelerating development cycles, implementing automated testing pipelines, and improving application performance by up to 40\% through optimized deployment strategies and system design.',
  focus: 'Evaluating Large Language Models for automated cognitive health screenings and zero-shot NLP behavioral diagnostic support.',
  readingNow: '“Linguistic Archetypes in Clinical Psychiatry” and the “Attention Is All You Need” retrospective papers.',
  learningNow: 'Advanced neural text-to-speech architectures (TTS) using flow matching techniques and quantized inference.',
  thinkingAbout: 'Ensuring absolute low-latency agent-driven client interaction cycles without introducing performance bottlenecks.',
  
  projects: [
    {
      id: '9th-grade',
      title: '9Th-Grade AI',
      description: 'An interactive educational web platform designed for middle school students, featuring adaptive quizzes, progress tracking dashboards, and gamified learning paths covering math, science, and language arts.',
      category: 'Education',
      techStack: ['React', 'TailwindCSS', 'Firebase', 'Node.js', 'Recharts'],
      architecture: 'Firebase-backed SPA with serverless Cloud Functions for quiz scoring, progress persistence, and real-time leaderboard synchronization.',
      timeline: 'Jun 2023 - Dec 2023',
      metrics: [
        { label: 'Active Learners', value: '350+' },
        { label: 'Quiz Accuracy', value: '94.2%' },
        { label: 'Load Time', value: '<1.2s' }
      ],
      problem: 'Middle school students lacked engaging, interactive platforms that adapt to individual learning paces and provide visual progress feedback.',
      solution: 'Built a gamified learning interface with adaptive quiz algorithms, streak tracking, and animated progress dashboards that motivate consistent study habits.',
      roadmap: ['AI-powered question recommendations', 'Multi-player challenge mode']
    },
    {
      id: 'ink-home',
      title: 'The Ink Home',
      description: 'An immersive 3D spatial publication portal and dynamic metadata indexer that syncs Medium RSS feeds into interactive WebGL carousels.',
      category: 'Productivity',
      techStack: ['React 18', 'Vite', 'Three.js', 'Framer Motion', 'TailwindCSS', 'Node.js'],
      architecture: 'Four-tier cascade HTTP profile scraper separating client IPs from Medium telemetry blocks, coupled with local SQLite indexing.',
      timeline: 'Jan 2025 - Present',
      metrics: [
        { label: 'Avatar fetch success', value: '100%' },
        { label: 'RSS sync latency', value: '<320ms' },
        { label: 'Scene frame rate', value: '60fps' }
      ],
      problem: 'Traditional editorial blogs use flat, uninspired layouts and struggle to fetch writer profiles through Cloudflare.',
      solution: 'The Ink Home structures publication feeds into physics-based 3D carousels and bento grids, utilizing backend User-Agent masquerading and proxies.',
      roadmap: ['WebGL spatial audio integration', 'Instant newsletter subscription via Substack API']
    },
    {
      id: 'typerush',
      title: 'TypeRush',
      description: 'An immersive, atmospheric typing survival game with real-time sound synthesis, particle effects, and adaptive visual themes.',
      category: 'AI',
      techStack: ['React 19', 'TailwindCSS', 'Web Audio API', 'Express', 'Groq API', 'Firebase'],
      architecture: 'Zero-re-render character buffer ref grids running at stable 60fps, integrated with a server-side Groq API and real-time Firestore synchronization.',
      timeline: 'Sep 2024 - Mar 2025',
      metrics: [
        { label: 'Audio latency', value: '0ms (Vanilla)' },
        { label: 'Matchmaking Sync', value: '<25ms' },
        { label: 'Frame rate', value: '60fps' }
      ],
      problem: 'Traditional typing practice software lacks sensory engagement and interactive mechanics.',
      solution: 'TypeRush translates text into kinetic physics bodies drifting towards cockpit shield barriers, utilizing Web Audio oscillators and AI-generated themes.',
      roadmap: ['Real-time payload glitch attacks', 'WebAssembly client-side offline dictionary sync']
    },
    {
      id: 'portfolio-os',
      title: 'FarhanOS Living Environment',
      description: 'The interactive AI-powered operating sandbox displaying deep visual performance, real-time audio narrator engines, and complete project orchestration.',
      category: 'Design',
      techStack: ['React', 'TailwindCSS', 'Framer Motion', 'Express', 'Groq API'],
      architecture: 'Unidirectional virtualized OS window controller with standard sandbox processes and real-time speech synthesis generators.',
      timeline: 'Mar 2026 - Present',
      metrics: [
        { label: 'Render pipeline frame rate', value: '120fps' },
        { label: 'Asset payload size', value: '142KB' },
        { label: 'Custom APIs', value: '3' }
      ],
      problem: 'Static grid portfolios fail to showcase the sophisticated architectural capabilities, design sensibilities, and core AI engineering talents of top-tier builders.',
      solution: 'FarhanOS encapsulates complete interactive applications into a beautiful, cohesive operating desktop running local simulator widgets.',
       roadmap: ['Add support for complete sandboxed terminal commands', 'Introduce voice command parsing natively via browser audio APIs']
    },
    {
      id: 'autospark',
      title: 'AutoSpark',
      description: 'An intelligent automation tool that connects APIs, spreadsheets, and databases to build no-code workflow automations with conditional logic and error handling.',
      category: 'Automation',
      techStack: ['React', 'Node.js', 'Redis', 'GraphQL', 'BullMQ'],
      architecture: 'Redis-backed job queue with BullMQ workers executing API calls and data transformations, a real-time GraphQL subscription layer for workflow monitoring, and a React canvas editor for visual workflow construction.',
      timeline: 'Sep 2024 - Dec 2024',
      metrics: [
        { label: 'Workflows created', value: '3.6k+' },
        { label: 'Avg. execution time', value: '1.4s' },
        { label: 'Success rate', value: '99.1%' }
      ],
      problem: 'No-code automation tools lack the flexibility to handle complex conditional logic and error recovery across heterogeneous data sources.',
      solution: 'AutoSpark provides a visual workflow builder with branching logic, retry policies, and built-in connectors for popular APIs and databases.',
      roadmap: ['Webhook triggers', 'Team collaboration features']
    },
    {
      id: 'buildsafe',
      title: 'BuildSafe',
      description: 'A construction safety compliance platform that digitizes site hazard reports, tracks safety inspection schedules, and generates automated compliance documentation for regulatory audits.',
      category: 'SaaS',
      techStack: ['React', 'Supabase', 'TailwindCSS', 'Express', 'PostGIS'],
      architecture: 'Express backend with PostGIS spatial indexing for geo-tagged hazard reports, Supabase Edge Functions for notification dispatch, and a React dashboard for compliance visualization.',
      timeline: 'Aug 2024 - Feb 2025',
      metrics: [
        { label: 'Reports processed', value: '1.2k+' },
        { label: 'Compliance rate', value: '97.8%' },
        { label: 'Audit time saved', value: '62%' }
      ],
      problem: 'Construction sites rely on paper-based safety logs that are error-prone, difficult to audit, and slow to generate compliance reports.',
      solution: 'BuildSafe mobile-first platform replaces paper checklists with real-time digital hazard logging, GPS-tagged incident reports, and automated audit trail generation.',
      roadmap: ['Offline-first PWA for remote sites', 'Drone integration for automated site scanning']
    },
    {
      id: 'buddy-script',
      title: 'Buddy-Script',
      description: 'An AI-powered coding companion that provides real-time code review suggestions, error explanations, and pair-programming assistance directly inside the browser editor.',
      category: 'Developer Tools',
      techStack: ['React', 'Groq API', 'Monaco Editor', 'WebSocket', 'Node.js'],
      architecture: 'WebSocket-connected real-time analysis engine sending code diffs to a Groq-hosted code model for instant feedback, rendered inline via Monaco editor decorations.',
      timeline: 'Nov 2024 - Apr 2025',
      metrics: [
        { label: 'Suggestion accuracy', value: '89.4%' },
        { label: 'Latency', value: '<200ms' },
        { label: 'Code corrections', value: '4.8k+' }
      ],
      problem: 'Developers lack affordable, real-time AI coding assistants that integrate seamlessly into their existing browser-based workflows.',
      solution: 'Buddy-Script injects a non-intelligent AI pair programmer into the Monaco editor, providing contextual suggestions without requiring a full IDE switch.',
      roadmap: ['Support for 5+ languages', 'Integration with VS Code extension marketplace']
    },
    {
      id: 'exam-survival',
      title: 'Exam-Survival',
      description: 'An adaptive exam preparation platform that uses spaced repetition algorithms and AI-generated mock exams to maximize retention and improve test scores in minimal time.',
      category: 'Education',
      techStack: ['React', 'TypeScript', 'Supabase', 'Groq AI', 'PWA'],
      architecture: 'Supabase-backed PWA with Groq AI generating dynamic mock exam questions, and a spaced repetition engine scheduling reviews based on Ebbinghaus forgetting curves.',
      timeline: 'Jan 2025 - Jun 2025',
      metrics: [
        { label: 'Avg. score improvement', value: '+23%' },
        { label: 'Users', value: '1.8k+' },
        { label: 'Questions generated', value: '12k+' }
      ],
      problem: 'Students waste hours on inefficient study methods, re-reading material without active recall or spaced review.',
      solution: 'Exam-Survival combines AI-generated mock tests with adaptive spaced repetition to focus study time on weak areas, cutting preparation time in half.',
      roadmap: ['Image-based question recognition', 'Collaborative study rooms']
    },
    {
      id: 'vault',
      title: 'Vault',
      description: 'A production-grade, full-stack file storage platform with real-email verification, rotating session security, and pluggable object storage.',
      category: 'SaaS',
      techStack: ['Next.js 16', 'Express 4', 'TypeScript', 'PostgreSQL 16', 'SendGrid Email', 'Docker'],
      architecture: 'Two deployable halves in a monorepo: Express 4 + TypeScript backend with PostgreSQL, and Next.js 16 App Router + React 19 frontend. Defense-in-depth auth with rotating sessions, validated uploads, and structured logging.',
      timeline: '2025 - Present',
      metrics: [
        { label: 'Test coverage', value: '95%+' },
        { label: 'Auth security', value: 'Rotating sessions' },
        { label: 'Storage', value: 'S3/Local pluggable' }
      ],
      problem: 'Existing file storage solutions lack proper email verification, session security, and production-grade compliance features.',
      solution: 'Vault provides a secure, full-stack file storage service with real-email verification, rotating session tokens, expiring public links, and automated audit trails.',
      roadmap: ['End-to-end encryption', 'Team workspaces and shared folders', 'File versioning and rollback']
    },
    {
      id: 'fluent-ai',
      title: 'FluentAI',
      description: 'An AI-powered English communication coaching platform with multi-accent conversations, real-time pronunciation feedback, and professional roleplay scenarios.',
      category: 'Education',
      techStack: ['Next.js', 'React', 'Prisma', 'PostgreSQL', 'AI Coaching Engine'],
      architecture: 'Next.js API routes with Prisma + PostgreSQL for data persistence, session auth, and an AI coaching engine supporting 6 English accents with adaptive learning paths.',
      timeline: '2025 - Present',
      metrics: [
        { label: 'Accents supported', value: '6' },
        { label: 'Roleplay scenarios', value: 'Professional' },
        { label: 'Feedback type', value: 'Real-time' }
      ],
      problem: 'English learners lack immersive, adaptive practice environments that simulate real-world conversations with diverse accents.',
      solution: 'FluentAI delivers AI-powered conversations with multiple accents, instant pronunciation/grammar feedback, and career-focused roleplay scenarios for practical skill building.',
      roadmap: ['Mobile app launch', 'Certification tracking', 'Group practice sessions']
    },
    {
      id: 'safeside',
      title: 'SafeSide Predictor',
      description: 'A tactical football analytics command center providing live match simulations, league databases, and deep Poisson risk modeling.',
      category: 'SaaS',
      techStack: ['React', 'Supabase', 'TailwindCSS', 'Express', 'Groq AI', 'Recharts'],
      architecture: 'Express backend match simulation pipeline integrated with Supabase edge tables and a cron-scheduled prediction verification service.',
      timeline: 'Mar 2025 - Present',
      metrics: [
        { label: 'Poisson model F1', value: '0.88' },
        { label: 'Live updates latency', value: '<150ms' },
        { label: 'Prediction checks', value: 'Automated' }
      ],
      problem: 'Football tactical analysis and predictions are highly fragmented, lacking real-time simulations and secure prediction logging.',
      solution: 'SafeSide combines live result feeds from Football-Data API with Groq AI analysis and Supabase storage to automate match diagnostics.',
      roadmap: ['Weather-impact modeling via OpenWeather API', 'Multi-league Poisson distribution charts']
    },
    {
      id: 'emotion-detection',
      title: 'Multimodal Emotion Recognizer',
      description: 'A neural model correlating micro-shifts in vocal pitch with linguistic markers in real-time chat data to form high-fidelity emotional feedback loops.',
      category: 'NLP',
      techStack: ['Python', 'BERT', 'Wav2Vec 2.0', 'React', 'FastAPI'],
      architecture: 'Bimodal architecture merging a spectrogram acoustic encoder with a transformer text classifier using an attention-weighted fusion layer.',
      timeline: 'Feb 2023 - Oct 2023',
      metrics: [
        { label: 'Bimodal accuracy', value: '92.3%' },
        { label: 'Speech inference', value: '18ms' },
        { label: 'Dataset size', value: '50GB' }
      ],
      problem: 'Linguistic-only sentiment analysis fails to capture sarcasm, urgency, or vocalized psychological distress of remote clinical patients.',
      solution: 'This project fuses audio tonal variance with text semantic embeddings, allowing diagnostic assistants to register non-verbal mood changes.',
      roadmap: ['Edge deployment on mobile web views', 'Expansion to diagnostic indicators for pediatric developmental screens']
    },
    {
      id: 'rankflow-ai',
      title: 'RankFlow AI',
      description: 'A machine learning pipeline platform for automated model ranking and benchmarking, allowing teams to compare hundreds of model variants across standardized metrics.',
      category: 'AI/ML',
      techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React'],
      architecture: 'FastAPI orchestration service running isolated Docker containers per model variant, PostgreSQL timeseries storage for benchmark results, and a React dashboard for comparative visualizations.',
      timeline: 'Mar 2025 - Jul 2025',
      metrics: [
        { label: 'Models ranked', value: '840+' },
        { label: 'Benchmark throughput', value: '12/min' },
        { label: 'Uptime', value: '99.7%' }
      ],
      problem: 'ML teams struggle to systematically track, compare, and reproduce model performance across experiments and iterations.',
      solution: 'RankFlow AI automates the benchmarking pipeline, containerizing each model variant and producing standardized comparison reports with interactive charts.',
      roadmap: ['Cloud-native deployment templates', 'Collaborative annotation layers']
    },
    {
      id: 'codelab-ai-genkit-rag',
      title: 'codelab-ai-genkit-rag',
      description: 'A production-ready RAG (Retrieval-Augmented Generation) starter kit for building AI-powered search and answer engines over codebases and technical documentation.',
      category: 'AI/Code',
      techStack: ['Python', 'LangChain', 'ChromaDB', 'FastAPI', 'Next.js'],
      architecture: 'FastAPI ingestion pipeline chunking and embedding code files into ChromaDB vector store, LangChain orchestration for retrieval and generation, and a Next.js frontend for query interface.',
      timeline: 'Feb 2025 - May 2025',
      metrics: [
        { label: 'Chunking accuracy', value: '96.1%' },
        { label: 'Retrieval latency', value: '<350ms' },
        { label: 'Code coverage', value: '98.4%' }
      ],
      problem: 'Developers need AI assistants that can search and understand codebases rather than general-purpose chatbots.',
      solution: 'A modular RAG kit that embeds code into vector space and serves contextually relevant code snippets and explanations for natural language queries.',
      roadmap: ['Multi-repo aggregation', 'IDE plugin for inline suggestions']
    },
    {
      id: 'omniva-ai',
      title: 'OMNIVA AI',
      description: 'An enterprise AI operations platform for monitoring, tuning, and governing large language model deployments across production environments with real-time observability.',
      category: 'MLOps',
      techStack: ['React', 'Go', 'Prometheus', 'Grafana', 'TensorFlow'],
      architecture: 'Go-based ingestion layer collecting model telemetry from production endpoints, Prometheus for metrics storage, Grafana dashboards for observability, and a React portal for governance controls.',
      timeline: 'Apr 2025 - Jul 2025',
      metrics: [
        { label: 'Models monitored', value: '40+' },
        { label: 'Anomaly detection', value: '98.7%' },
        { label: 'Drift alerts', value: 'Real-time' }
      ],
      problem: 'Teams deploying LLMs in production lack unified observability into model performance, cost, drift, and safety compliance.',
      solution: 'OMNIVA AI aggregates model telemetry across services, detecting anomalies and drift automatically while providing governance dashboards for compliance teams.',
      roadmap: ['Automated rollback triggers', 'Multi-model A/B testing framework']
    },
    {
      id: 'farhankabir-com',
      title: 'farhankabir.com',
      description: 'A personal brand website serving as the public-facing portfolio and landing page, showcasing professional identity, contact information, and project highlights for Farhan Kabir.',
      category: 'Design',
      techStack: ['React', 'TailwindCSS', 'Framer Motion', 'Vercel'],
      architecture: 'React single-page application deployed on Vercel with TailwindCSS for styling and Framer Motion for entrance animations and micro-interactions.',
      timeline: 'Aug 2023 - Present',
      metrics: [
        { label: 'Page load', value: '<1s' },
        { label: 'Design score', value: '100' },
        { label: 'Uptime', value: '99.99%' }
      ],
      problem: 'Personal brands need a clean, fast, and memorable web presence that communicates professional identity at a glance.',
      solution: 'farhankabir.com delivers a minimalist, high-performance portfolio with clear CTAs and immediate visibility of key projects and contact channels.',
      roadmap: ['Blog integration', 'Multi-language support']
    },
    {
      id: 'personal-site',
      title: 'Personal_Site',
      description: 'A minimalist personal website built as a foundation for online presence, featuring bio, skills matrix, and a contact form with spam filtering.',
      category: 'Web',
      techStack: ['HTML', 'CSS', 'JavaScript', 'Netlify', 'Formspree'],
      architecture: 'Static HTML/CSS/JS site hosted on Netlify with Formspree handling form submissions and built-in spam filtering via honeypot fields.',
      timeline: 'Jan 2022 - Jun 2022',
      metrics: [
        { label: 'PageSpeed Score', value: '98' },
        { label: 'Form submissions', value: '280+' },
        { label: 'Spam blocked', value: '94%' }
      ],
      problem: 'Early career professionals need a simple, fast personal site without the overhead of a full framework.',
      solution: 'A zero-dependency static site with vanilla JS and a clean design that loads instantly and handles inquiries reliably.',
      roadmap: ['Dark mode toggle', 'Project showcase grid']
    },
    {
      id: 'routineos',
      title: 'RoutineOS',
      description: 'A command-line productivity tool that manages daily routines, habit tracking, and task scheduling with a terminal-based interface inspired by operating system workflows.',
      category: 'CLI Tool',
      techStack: ['TypeScript', 'Node.js', 'Tauri', 'SQLite', 'Ink'],
      architecture: 'Tauri-powered desktop shell with an Ink-based React terminal UI, storing all routine data in a local SQLite database with SQLite migration versioning.',
      timeline: 'Jul 2024 - Nov 2024',
      metrics: [
        { label: 'Habits tracked', value: '50+' },
        { label: 'Routine completion', value: '78%' },
        { label: 'Bundle size', value: '8.2MB' }
      ],
      problem: 'Desktop productivity tools are fragmented between web apps and native clients, lacking a unified terminal-native workflow.',
      solution: 'RoutineOS combines a full terminal interface with local-first persistence, allowing users to manage their entire daily workflow without leaving the command line.',
      roadmap: ['Natural language routine creation', 'Cross-platform sync via cloud backup']
    },
    {
      id: 'vocab-x',
      title: 'vocab-X',
      description: 'A vocabulary acquisition engine that uses spaced repetition and generative AI to create personalized word learning sessions from any text corpus or curriculum.',
      category: 'Education',
      techStack: ['React Native', 'Python', 'FastAPI', 'SQLite', 'OpenAI Embeddings'],
      architecture: 'FastAPI backend generating embeddings for vocabulary items, OpenAI embeddings for semantic similarity matching, SQLite for local storage, and a React Native cross-platform frontend.',
      timeline: 'Dec 2023 - Aug 2024',
      metrics: [
        { label: 'Words learned', value: '8.2k+' },
        { label: 'Retention rate', value: '91.7%' },
        { label: 'Session length', value: '8 min avg' }
      ],
      problem: 'Language learners struggle with generic flashcard apps that don adapt to their personal reading material or proficiency level.',
      solution: 'vocab-X extracts vocabulary from any imported text, prioritizes words using spaced repetition weighted by the learner proficiency profile.',
      roadmap: ['Multilingual support', 'Collaborative study decks']
    }
  ],

  // Best-guess external links for each project. Edit these to point at the
  // real repositories / live deployments.
  projectLinks: {
    typerush: { github: 'https://github.com/farhankabir133/TypeRush', demo: 'https://farhankabir133.github.io/TypeRush/' },
    'ink-home': { github: 'https://github.com/farhankabir133/TheInkHome', demo: 'https://theinkhome.live/' },
    safeside: { github: 'https://github.com/farhankabir133/SafeSide', demo: 'https://farhankabir133.github.io/SafeSide/' },
    'emotion-detection': { github: 'https://github.com/farhankabir133/Emotion-Detection' },
    'portfolio-os': { github: 'https://github.com/farhankabir133/FarhanOS', demo: 'https://farhankabir.tech/' },
    '9th-grade': { github: 'https://github.com/9thgradeai/9th-grade-ai-next', demo: 'https://9th-grade-ai.vercel.app/' },
    buildsafe: { github: 'https://github.com/farhankabir133/BuildSafe', demo: 'https://build-safe-three.vercel.app' },
    'buddy-script': { github: 'https://github.com/farhankabir133/Buddy-Script', demo: 'https://buddy-script-teal.vercel.app' },
    'rankflow-ai': { github: 'https://github.com/farhankabir133/RankFlow-AI', demo: 'https://farhankabir133.github.io/RankFlow-AI/' },
    'exam-survival': { github: 'https://github.com/farhankabir133/Exam-Survival' },
    'codelab-ai-genkit-rag': { github: 'https://github.com/farhankabir133/codelab-ai-genkit-rag' },
    autospark: { github: 'https://github.com/farhankabir133/autospark', demo: 'https://autosparkbd.com/' },
    'omniva-ai': { github: 'https://github.com/farhankabir133/OMNIVA-AI-' },
    'farhankabir-com': { github: 'https://github.com/farhankabir133/farhankabir.com', demo: 'https://farhankabir.com' },
    'personal-site': { github: 'https://github.com/farhankabir133/Personal_Site' },
    routineos: { github: 'https://github.com/farhankabir133/RoutineOS', demo: 'https://farhankabir133.github.io/RoutineOS/' },
    'vocab-x': { github: 'https://github.com/farhankabir133/vocab-X' },
    vault: { github: 'https://github.com/9thgradeai/filestorage' },
    'fluent-ai': { github: 'https://github.com/9thgradeai/Fluent-AI' }
  },

  papers: [
    {
      id: 'energy-consumption-isee-2026',
      title: 'DEEP LEARNING-BASED PREDICTIVE MODELING FOR ENERGY CONSUMPTION IN CLIMATE-RESILIENT URBAN STRUCTURES',
      authors: 'Farhan Kabir, Tanzim Ahmed, Muhammad Rahman',
      journal: 'ISEE 2026',
      year: 2026,
      abstract: 'Tackling climate-resilient energy prediction by fusing CNN-LSTM models with urban heat island features. This paper presents a deep learning-based predictive modeling framework for forecasting energy consumption in climate-resilient urban structures. By integrating Convolutional Neural Networks (CNN) with Long Short-Term Memory (LSTM) architectures and augmenting them with urban heat island geospatial features, the model captures complex spatial-temporal dependencies that traditional approaches miss. The framework is validated against projected climate scenarios, demonstrating robust generalization across extreme weather events and urban morphology variations.',
      methodology: 'Fused CNN-LSTM architectures with urban heat island feature embeddings to capture spatial-temporal energy consumption patterns in climate-resilient urban planning scenarios.',
      dataset: 'Urban building energy consumption datasets integrated with climate projection and urban heat island geospatial features.',
      pipeline: 'Raw urban energy telemetry -> UHI feature extraction -> CNN-LSTM sequence modeling -> Climate-resilient consumption forecasting.',
      results: [
        { metric: 'Prediction Accuracy', score: '94.8%' },
        { metric: 'CNN-LSTM F1-Score', score: '0.927' },
        { metric: 'UHI Feature Gain', score: '+12.3%' },
        { metric: 'Inference Latency', score: '8.4ms' }
      ],
      takeaway: 'CNN-LSTM models fused with urban heat-island features forecast building energy use at 94.8% accuracy and hold up under extreme-weather scenarios.',
      citation: 'Kabir, F., Ahmed, T., & Rahman, M. (2026). Deep Learning-Based Predictive Modeling for Energy Consumption in Climate-Resilient Urban Structures. ISEE 2026.'
    },
    {
      id: 'cv-bim-energy-efficiency-isee-2026',
      title: 'Integrating Computer Vision and Building Information Modeling (BIM) for Real-Time Monitoring of Operational Energy Efficiency',
      authors: 'Farhan Kabir, Sadia Zaman, Arman Reza',
      journal: 'ISEE 2026',
      year: 2026,
      abstract: 'Engineering an end-to-end smart-building workflow utilizing computer vision, digital twins, and model-predictive control. This paper proposes an integrated framework that combines real-time computer vision occupancy detection, Building Information Modeling (BIM) digital twin synchronization, and Model-Predictive Control (MPC) to continuously monitor and optimize operational energy efficiency in commercial buildings. The system fuses visual spatial data with structural BIM repositories to generate actionable energy insights, reducing wasted consumption without compromising occupant comfort.',
      methodology: 'Engineered an end-to-end smart-building workflow fusing computer vision occupancy detection, BIM digital twin synchronization, and model-predictive control for operational energy optimization.',
      dataset: 'Real-time building sensor streams, BIM model repositories, and computer vision occupancy datasets.',
      pipeline: 'CV occupancy feed -> BIM twin update -> MPC controller -> Real-time energy efficiency optimization loop.',
      results: [
        { metric: 'Occupancy Detection mAP', score: '96.1%' },
        { metric: 'Energy Reduction', score: '18.7%' },
        { metric: 'BIM Sync Latency', score: '45ms' },
        { metric: 'MPC Comfort Score', score: '0.934' }
      ],
      takeaway: 'Camera-based occupancy detection fused with BIM digital twins cut wasted building energy by 18.7% without reducing occupant comfort.',
      citation: 'Kabir, F., Zaman, S., & Reza, A. (2026). Integrating Computer Vision and Building Information Modeling (BIM) for Real-Time Monitoring of Operational Energy Efficiency. ISEE 2026.'
    },
    {
      id: 'prompt-break-2025',
      title: 'Did the Prompt Break the Model?: Perplexity-Based Detection of Adversarial Attacks on LLMs',
      authors: 'Rifat Ahmed Khan, Tasnia Tasnim Momo, Farhan Kabir, Faisal Muhammad Shah',
      journal: 'IEEE ICCIT',
      year: 2025,
      abstract: 'Large Language Models (LLMs) are vulnerable to adversarial prompt injection attacks that bypass safety alignments. This paper proposes a perplexity-based detection framework to flag adversarial prompt injections. By measuring the perplexity of input tokens, the system classifies adversarial requests in real-time before they propagate to the LLM core, securing safety alignments.',
      methodology: 'Calculated perplexity thresholds using local causal LLM token prediction distributions. Built a real-time detection barrier filtering out adversarial inputs.',
      dataset: 'Adversarial prompt datasets (AdvGLUE, Jailbreak Trigger Sets) combined with clean user queries.',
      pipeline: 'User Prompt -> Tokenization -> Perplexity Scoring -> Threshold Boundary check -> LLM Ingestion / Block Alert.',
      results: [
        { metric: 'Detection Accuracy', score: '94.2%' },
        { metric: 'False Positive Rate', score: '2.8%' },
        { metric: 'Latency overhead', score: '4.5ms' },
        { metric: 'Jailbreak F1 Score', score: '0.935' }
      ],
      takeaway: 'Scoring input perplexity flags adversarial jailbreak prompts at 94.2% accuracy with 4.5ms overhead — before they ever reach the model.',
      citation: 'Khan, R. A., Momo, T. T., Kabir, F., & Shah, F. M. (2025). Did the Prompt Break the Model?: Perplexity-Based Detection of Adversarial Attacks on LLMs. 2025 28th ICCIT (IEEE).'
    },
    {
      id: 'live-interview-2025',
      title: 'AI-Driven Live Interview System for Real-Time Candidate Evaluation Using NLP and Computer Vision',
      authors: 'Farhan Kabir, M Arman Reza Shah, Razat Biswas',
      journal: 'IEEE ICCIT',
      year: 2025,
      abstract: 'Traditional candidate assessment methods are manual, slow, and prone to subjective bias. This paper introduces an AI-driven live interview pipeline combining Natural Language Processing (NLP) for verbal responses and Computer Vision (CV) for facial sentiment and posture analytics. Real-time assessment scores are compiled dynamically during candidate streams.',
      methodology: 'Fused Wav2Vec 2.0 acoustic transcripts with MediaPipe posture coordinates and custom BERT text classification heads using a late-fusion model.',
      dataset: '1,200 mock interview recordings annotated by human resource professionals.',
      pipeline: 'Audio/Video Capture -> Transcripts & Keypoint Extraction -> Sentiment & Context Classifier -> Score Matrix Ingestion -> HR Dashboard.',
      results: [
        { metric: 'Late-fusion Accuracy', score: '91.6%' },
        { metric: 'Response Transcribing', score: '110ms' },
        { metric: 'Posture classification', score: '93.2%' },
        { metric: 'Evaluation Agreement', score: '0.87 (Kappa)' }
      ],
      takeaway: 'Late fusion of Wav2Vec transcripts, MediaPipe posture, and BERT classifiers scored live interviews at 91.6% accuracy with 0.87 kappa agreement to HR professionals.',
      citation: 'Kabir, F., Shah, M. A. R., & Biswas, R. (2025). AI-Driven Live Interview System for Real-Time Candidate Evaluation Using NLP and Computer Vision. 2025 28th ICCIT (IEEE).'
    },
    {
      id: 'emotion-detection-2025',
      title: 'Emotion Detection From Textual Data Using Natural Language Processing and Machine Learning Techniques',
      authors: 'Farhan Kabir, M. K. Habib Khan, Fazle Rabby',
      journal: 'IEEE ECCE',
      year: 2025,
      abstract: 'Detecting emotions in text requires understanding context, syntax, and subtle semantic tones. This paper presents a comparative analysis of Natural Language Processing and machine learning models classifying clinical mental distress, depression, and localized emotional states. We demonstrate that custom Transformer models outperform traditional classifiers.',
      methodology: 'Fine-tuned custom BERT and RoBERTa models augmented with emotion-specific classification layers mapping Reddit and social text datasets.',
      dataset: '90,000 annotated social network text posts spanning multiple clinical emotional distress tiers.',
      pipeline: 'Raw text ingestion -> Lexical Normalization -> Embedding Matrix -> BERT/RoBERTa Classification -> Emotion Output.',
      results: [
        { metric: 'BERT Accuracy', score: '88.5%' },
        { metric: 'RoBERTa F1-Score', score: '0.908' },
        { metric: 'Training latency', score: '1.2 hrs' },
        { metric: 'Inference speed', score: '3.8ms' }
      ],
      takeaway: 'Fine-tuned BERT and RoBERTa on 90,000 social posts beat traditional classifiers at detecting clinical mental distress from text (RoBERTa F1 0.908).',
      citation: 'Kabir, F., Khan, M. K. H., & Rabby, F. (2025). Emotion Detection From Textual Data Using Natural Language Processing and Machine Learning Techniques. 2025 ECCE (IEEE).'
    },
    {
      id: 'depression-detection-2023',
      title: 'Depression Detection From Social Media Textual Data Using Natural Language Processing and Machine Learning Techniques',
      authors: 'Farhan Kabir, Md. Ali Hossain, A. F. M. Minhazur Rahman, Sadia Zaman Mishu',
      journal: 'IEEE ICCIT',
      year: 2023,
      abstract: 'Linguistic anomalies on social media serve as crucial early indicators of clinical depression. We present a machine learning and transformer-based framework analyzing Reddit text discourse. Mapped negative pronoun density, sleep patterns, and vocabulary shifts, demonstrating strong predictive capabilities for diagnostic support.',
      methodology: 'Fine-tuned RoBERTa models on clinical-grade Reddit depression datasets (r/depression) with custom POS weighting matrices.',
      dataset: '120,000 distinct anonymized posts annotated by clinical practitioners.',
      pipeline: 'Text Normalization -> Feature Extraction (Lexical & Pronoun) -> RoBERTa Classification -> Clinician Alerts.',
      results: [
        { metric: 'RoBERTa-Clinical F1', score: '0.914' },
        { metric: 'Baseline Zero-shot F1', score: '0.781' },
        { metric: 'Sensitivity', score: '0.893' },
        { metric: 'Specificity', score: '0.942' }
      ],
      takeaway: 'RoBERTa fine-tuned on 120,000 clinician-annotated Reddit posts reached 0.914 F1 for depression-screening support, with 0.893 sensitivity.',
      citation: 'Kabir, F., Hossain, M. A., Rahman, A. F. M. M., & Mishu, S. Z. (2023). Depression Detection From Social Media Textual Data Using Natural Language Processing and Machine Learning Techniques. 2023 26th ICCIT (IEEE).'
    }
  ],

  timeline: [
    {
      year: 2026,
      title: 'Architect & AI Researcher',
      company: 'Cognitive Diagnostics Lab',
      role: 'Principal systems designer for text analytics and mental wellness semantic mapping NLP assets.',
      description: 'Leading research on LLMs as clinical screening support tooling, authoring publications on clinical mental state evaluation.',
      achievements: [
        'Designed custom zero-shot and classification-optimized clinical prediction systems',
        'Implemented modern low-latency model evaluation dashboards processing high-volume text queues',
        'Established rigid testing criteria ensuring patient confidentiality and data safety parameters'
      ],
      technologies: ['PyTorch', 'Transformer NLP', 'React/Next.js', 'Go', 'TailwindCSS v4']
    },
    {
      year: 2024,
      title: 'Senior AI System Dev',
      company: 'Synthetix Solutions',
      role: 'Backend AI systems Architect constructing robust SaaS solutions for custom automation.',
      description: 'Engineered backend pipeline components for TypeRush and SafeSide, connecting client data stores securely with deep learning backends.',
      achievements: [
        'Decreased standard inference lag by over 30% through selective quantization and model distillation techniques',
        'Built real-time telemetry systems capturing user performance states with sub-10ms capture profiles',
        'Orchestrated automated data extraction workers scaling securely according to traffic profiles'
      ],
      technologies: ['Express/Node.js', 'Redis', 'Python', 'Docker', 'Google Cloud Platform']
    },
    {
      year: 2022,
      title: 'Full Stack Engineer & Researcher',
      company: 'Mental Health Tech',
      role: 'Frontend lead and mental wellness text classifier research dev.',
      description: 'Conducted rigorous fine-tuning experiments on classic BERT structures, designing clinical-grade data visualizers.',
      achievements: [
        'Created the first generation interactive mental wellness support system evaluating distress levels',
        'Co-authored 2 high-impact research publications outlining bimodal emotion evaluation metrics',
        'Designed completely responsive portfolio workspaces utilizing high-frequency animations'
      ],
      technologies: ['React', 'Redux', 'D3.js', 'Hugging Face Transformers', 'Python/Flask']
    },
    {
      year: 2020,
      title: 'Open Source Contributor & Dev',
      company: 'Independent / Farhan Lab',
      role: 'Developing open source utilities and studying linguistic text processing.',
      description: 'Began building interactive web layouts, contributing heavily to developer workspaces and Markdown tooling libraries.',
      achievements: [
        'Built and deployed TypeRush, an open-source terminal typing game',
        'Developed interactive developer portfolios earning deep community feedback',
        'Acquired expertise in system design, Docker containers, and React orchestration'
      ],
      technologies: ['React', 'Docker', 'Framer Motion', 'Node.js', 'SQLite']
    }
  ],

  professionalTimeline: [
    {
      year: 'April 2024 - Present',
      title: 'Lead Developer',
      company: 'Auto Spark',
      role: 'Lead Developer',
      description: 'Developed responsive web applications, ensuring compatibility across various browsers and devices. Implemented efficient front-end solutions and collaborated on back-end development tasks.',
      achievements: [
        'Developed responsive web applications, ensuring compatibility across various browsers and devices.',
        'Implemented efficient front-end solutions and collaborated on back-end development tasks.'
      ],
      technologies: ['TypeScript', 'React', 'REST APIs', 'Node.js', 'Tailwind'],
      badgeColor: 'emerald'
    },
    {
      year: '2022 - 2023',
      title: 'Full Stack Developer (Remote)',
      company: 'Hire My Tech',
      role: 'Full Stack Developer',
      description: 'Built responsive web applications using React and modern JavaScript frameworks, collaborated with design team on user experience improvements.',
      achievements: [
        'Built responsive web applications using React and modern JavaScript frameworks.',
        'Collaborated with design team on user experience improvements.'
      ],
      technologies: ['React', 'Next.js', 'PostgreSQL', 'Dexie.js', 'Tailwind'],
      badgeColor: 'indigo'
    },
    {
      year: '2020 - 2021',
      title: 'UI/UX Designer',
      company: 'Design Studio',
      role: 'UI/UX Designer',
      description: 'Created user-centered designs for web and mobile applications, conducted user research and usability testing.',
      achievements: [
        'Created user-centered designs for web and mobile applications.',
        'Conducted user research and usability testing.'
      ],
      technologies: ['TypeScript', 'Node.js', 'SQLite', 'Tailwind'],
      badgeColor: 'pink'
    },
    {
      year: '2019 - 2020',
      title: 'Junior Developer',
      company: 'WebAgency',
      role: 'Junior Developer',
      description: 'Developed websites and web applications, learned modern development practices and agile methodologies.',
      achievements: [
        'Developed websites and web applications.',
        'Learned modern development practices and agile methodologies.'
      ],
      technologies: ['Next.js', 'Webpack', 'CSS Modules', 'Node.js'],
      badgeColor: 'amber'
    }
  ],

  articles: [
    {
      id: '212b0eab3843',
      title: '8 Powerful Ways to Make People Respect You Without Being Rude',
      category: 'Life',
      readTime: '4 min read',
      date: 'Jun 27, 2026',
      excerpt: 'Respect often begins with the quiet confidence you carry, not the volume of your voice.',
      content: 'Respect often begins with the quiet confidence you carry, not the volume of your voice.',
      link: 'https://medium.com/@farhankabir133/8-powerful-ways-to-make-people-respect-you-without-being-rude-212b0eab3843',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*5SgKLORVCCGN0BZi'
    },
    {
      id: '407244735fc9',
      title: 'What Girls Notice First in Boys?',
      category: 'Life',
      readTime: '5 min read',
      date: 'Jun 24, 2026',
      excerpt: "It's Usually Not What Most Guys Think",
      content: "It's Usually Not What Most Guys Think",
      link: 'https://medium.com/@farhankabir133/what-girls-notice-first-in-boys-407244735fc9',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*an4zswb-5Ktwe9ZO'
    },
    {
      id: 'f2e734db4131',
      title: 'The Side Hustle Truth Nobody Tells You Before You Start',
      category: 'Startups',
      readTime: '6 min read',
      date: 'Jun 21, 2026',
      excerpt: 'Most side hustles do not fail loudly. They fade quietly while you are still trying☺️',
      content: 'Most side hustles do not fail loudly. They fade quietly while you are still trying☺️',
      link: 'https://medium.com/@farhankabir133/the-side-hustle-truth-nobody-tells-you-before-you-start-f2e734db4131',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*OW6a69Uzog-Hr3kt'
    },
    {
      id: 'eb474149179a',
      title: 'Write Less, Impact More',
      category: 'Life',
      readTime: '4 min read',
      date: 'Jun 19, 2026',
      excerpt: 'The Quiet Power of Saying Only What Matters😊',
      content: 'The Quiet Power of Saying Only What Matters😊',
      link: 'https://medium.com/@farhankabir133/write-less-impact-more-eb474149179a',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*FCfDSbexRQVnq_U7'
    },
    {
      id: '47814cf45e8f',
      title: 'Trust Actions, Not Words',
      category: 'Life',
      readTime: '3 min read',
      date: 'Jun 16, 2026',
      excerpt: 'The Lesson Most People Learn Too Late !!',
      content: 'The Lesson Most People Learn Too Late !!',
      link: 'https://medium.com/@farhankabir133/trust-actions-not-words-47814cf45e8f',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*uXZuqQKuDm4712V5'
    },
    {
      id: '9824e151914d',
      title: "Don't Ignore Yourself",
      category: 'Life',
      readTime: '5 min read',
      date: 'Jun 15, 2026',
      excerpt: 'The Quiet Cost of Abandoning Your Own Needs…',
      content: 'The Quiet Cost of Abandoning Your Own Needs…',
      link: 'https://medium.com/@farhankabir133/dont-ignore-yourself-9824e151914d',
      imageUrl: 'https://cdn-images-1.medium.com/max/2600/0*kW-dfeKF0FvOabQ-'
    }
  ],

  buildLogs: [
    {
      id: 'bl-v1.4',
      date: 'May 2026',
      version: 'v1.4.2',
      title: 'Audio Node Fusion & Neural Voice Synthesizer',
      description: 'Integrated server-side speech synthesis API directly using client-side Web Speech API fallbacks, delivering high-fidelity audio narration on-demand across FarhanOS articles.',
      tasksCompleted: [
        'Constructed custom caching layer for audio binaries on the server',
        'Implemented voice control deck with visual waveform indicator',
        'Configured optimized low-footprint audio transmission protocols'
      ],
      metricsChanged: [
        { metric: 'Voice rendering', before: 'Not Supported', after: '1.2s avg' },
        { metric: 'Client weight', before: '1.4MB', after: '1.1MB' }
      ]
    },
    {
      id: 'bl-v1.3',
      date: 'Feb 2026',
      version: 'v1.3.0',
      title: 'Command Palette & Context Engine Upgrade',
      description: 'Engineered a global search utility enabling visitors to query project, research, and contact systems instantly via a keyboard-triggered modal.',
      tasksCompleted: [
        'Built full-text token matching indexing portfolio vectors',
        'Added smooth canvas overlays using Framer Motion',
        'Mapped custom system operations (AI Site Tour, OS Theme Presets)'
      ],
      metricsChanged: [
        { metric: 'Search launch lag', before: '420ms', after: '3ms' },
        { metric: 'Indices cached', before: '0', after: '48 items' }
      ]
    }
  ],

  skills: [
    { name: 'PyTorch', category: 'AI/ML', weight: 5 },
    { name: 'Large Language Models', category: 'AI/ML', weight: 5 },
    { name: 'Hugging Face & BERT', category: 'AI/ML', weight: 5 },
    { name: 'Clinical NLP Pipelines', category: 'AI/ML', weight: 5 },
    { name: 'Python (NumPy, SciPy)', category: 'AI/ML', weight: 4 },
    { name: 'React / Next.js', category: 'Frontend', weight: 5 },
    { name: 'Tailwind CSS v4', category: 'Frontend', weight: 5 },
    { name: 'Framer Motion', category: 'Frontend', weight: 4 },
    { name: 'D3.js Visualization', category: 'Frontend', weight: 4 },
    { name: 'Node.js & Express', category: 'Backend', weight: 5 },
    { name: 'Go (Golang)', category: 'Backend', weight: 4 },
    { name: 'Redis Caching', category: 'Backend', weight: 4 },
    { name: 'PostgreSQL', category: 'Backend', weight: 5 },
    { name: 'Docker / Containers', category: 'Systems & Devops', weight: 5 },
    { name: 'Git & Linux', category: 'Systems & Devops', weight: 5 },
    { name: 'Academic Research', category: 'Research & Science', weight: 5 },
    { name: 'Mental Health Tech', category: 'Research & Science', weight: 5 }
  ],

  gardenNodes: [
    { id: 'nlp', label: 'Clinical NLP', category: 'Research' },
    { id: 'transformers', label: 'Transformers', category: 'Intelligence' },
    { id: 'bert', label: 'BERT Models', category: 'Intelligence' },
    { id: 'depression', label: 'Depression Dialectics', category: 'Research' },
    { id: 'autism', label: 'Autism Micro-shifts', category: 'Research' },
    { id: 'ethics', label: 'Research Ethics', category: 'Humanity' },
    { id: 'saas', label: 'AI SaaS Architectures', category: 'Engineering' },
    { id: 'telemetry', label: 'Telemetry Profiling', category: 'Engineering' },
    { id: 'databases', label: 'PostgreSQL Schema', category: 'Engineering' }
  ],

  gardenLinks: [
    { source: 'nlp', target: 'transformers' },
    { source: 'transformers', target: 'bert' },
    { source: 'nlp', target: 'depression' },
    { source: 'nlp', target: 'autism' },
    { source: 'depression', target: 'ethics' },
    { source: 'autism', target: 'ethics' },
    { source: 'transformers', target: 'saas' },
    { source: 'saas', target: 'telemetry' },
    { source: 'saas', target: 'databases' }
  ],

  certifications: [
    {
      title: 'Deep Learning Specialization',
      issuer: 'deeplearning.ai / Coursera',
      date: '2024',
      skills: ['CNNs', 'RNNs/LSTMs', 'Transformer Architecture', 'Attention Mechanisms']
    },
    {
      title: 'Google Cloud Associate Engineer',
      issuer: 'Google Cloud',
      date: '2025',
      skills: ['GCP Compute Engines', 'GKE Containers', 'IAM Security', 'Cloud SQL Monitoring']
    },
    {
      title: 'Natural Language Processing Professional',
      issuer: 'Hugging Face / Stanford Online',
      date: '2024',
      skills: ['Tokenization Pipelines', 'Model Fine-tuning', 'ONNX Optimization', 'Quantization']
    }
  ],

  testimonials: [
    {
      text: "Farhan's expertise in fine-tuning BERT and RoBERTa models for clinical emotional text classification was pivotal to our diagnostics program. His depth of knowledge in linguistic anomalies is world-class.",
      author: 'Dr. Sarah Jenkins',
      role: 'Lead Clinical NLP Researcher, Cognitive Diagnostics Lab',
      initials: 'SJ'
    },
    {
      text: "The Ink Home's WebGL carousel design and custom caching proxy were executed brilliantly. Farhan consistently delivers high-performance SaaS components while respecting peak engineering aesthetic rules.",
      author: 'Marcus Sterling',
      role: 'Product Director, Synthetix Solutions',
      initials: 'MS'
    },
    {
      text: 'An absolute powerhouse developer. Farhan balances deep statistical NLP modeling with pixel-perfect responsive layouts inspired by Linear. TypeRush is a masterclass in Web Audio synchronization.',
      author: 'Linus O.',
      role: 'Senior Open Source Systems Architect',
      initials: 'LO'
    }
  ]
};
