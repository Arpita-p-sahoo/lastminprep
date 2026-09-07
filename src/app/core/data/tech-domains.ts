import { DomainConfig } from '../models';

/**
 * Shared catalog of tech domains and frameworks, used by the Explore page's
 * browse flow and reused by other pages (e.g. Jobs) that want to filter by
 * the same skill taxonomy.
 */
export const TECH_DOMAINS: DomainConfig[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    icon: 'html5',
    count: 3840,
    frameworks: [
      { name: 'Angular', icon: 'angular', count: 980, domain: 'frontend' },
      { name: 'React', icon: 'react', count: 1240, domain: 'frontend' },
      { name: 'Vue', icon: 'vuedotjs', count: 620, domain: 'frontend' },
      { name: 'Next.js', icon: 'nextdotjs', count: 540, domain: 'frontend' },
      { name: 'Svelte', icon: 'svelte', count: 180, domain: 'frontend' },
      { name: 'Nuxt', icon: 'nuxtdotjs', count: 280, domain: 'frontend' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: 'nodedotjs',
    count: 2910,
    frameworks: [
      { name: 'Node.js', icon: 'nodedotjs', count: 840, domain: 'backend' },
      { name: 'NestJS', icon: 'nestjs', count: 420, domain: 'backend' },
      { name: 'Django', icon: 'django', count: 380, domain: 'backend' },
      { name: 'FastAPI', icon: 'fastapi', count: 310, domain: 'backend' },
      { name: 'Spring', icon: 'spring', count: 290, domain: 'backend' },
      { name: 'Express', icon: 'express', count: 670, domain: 'backend' },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: 'android',
    count: 1240,
    frameworks: [
      { name: 'Flutter', icon: 'flutter', count: 480, domain: 'mobile' },
      { name: 'React Native', icon: 'react', count: 420, domain: 'mobile' },
      { name: 'Swift', icon: 'swift', count: 220, domain: 'mobile' },
      { name: 'Kotlin', icon: 'kotlin', count: 120, domain: 'mobile' },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'docker',
    count: 980,
    frameworks: [
      { name: 'Docker', icon: 'docker', count: 310, domain: 'devops' },
      { name: 'Kubernetes', icon: 'kubernetes', count: 240, domain: 'devops' },
      { name: 'AWS', icon: 'amazonaws', count: 280, domain: 'devops' },
      { name: 'Terraform', icon: 'terraform', count: 150, domain: 'devops' },
    ],
  },
  {
    id: 'datascience',
    name: 'Data Science',
    icon: 'python',
    count: 1560,
    frameworks: [
      { name: 'Python', icon: 'python', count: 480, domain: 'datascience' },
      { name: 'TensorFlow', icon: 'tensorflow', count: 320, domain: 'datascience' },
      { name: 'PyTorch', icon: 'pytorch', count: 280, domain: 'datascience' },
      { name: 'Pandas', icon: 'pandas', count: 480, domain: 'datascience' },
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'openai',
    count: 1420,
    frameworks: [
      { name: 'LLMs', icon: 'openai', count: 520, domain: 'ai' },
      { name: 'Hugging Face', icon: 'huggingface', count: 340, domain: 'ai' },
      { name: 'Prompt Engineering', icon: '', count: 260, domain: 'ai' },
      { name: 'RAG', icon: '', count: 300, domain: 'ai' },
    ],
  },
  {
    id: 'system',
    name: 'System Design',
    icon: 'kubernetes',
    count: 740,
    frameworks: [
      { name: 'Microservices', icon: '', count: 240, domain: 'system' },
      { name: 'Databases', icon: 'postgresql', count: 310, domain: 'system' },
      { name: 'Caching', icon: 'redis', count: 180, domain: 'system' },
      { name: 'API Design', icon: '', count: 210, domain: 'system' },
    ],
  },
];
