import { Injectable, signal } from '@angular/core';
import { Job } from '../models';

@Injectable({ providedIn: 'root' })
export class JobService {
  jobs = signal<Job[]>([
    { id: '1', title: 'Senior Angular Developer', company: 'Razorpay', location: 'Bangalore', type: 'Remote', experience: '3-6 yrs', salary: '₹15–22 LPA', techStack: ['Angular', 'TypeScript', 'RxJS', 'NestJS'], description: 'Looking for a mid-senior Angular developer with strong TypeScript and RxJS knowledge. NestJS backend experience is a plus.', postedAt: new Date(), postedBy: { name: 'HR Team' } },
    { id: '2', title: 'Full Stack Engineer', company: 'Groww', location: 'Bangalore', type: 'Hybrid', experience: '2-5 yrs', salary: '₹12–18 LPA', techStack: ['Node.js', 'React', 'PostgreSQL'], description: 'Node.js + React stack, working on financial products used by millions.', postedAt: new Date(), postedBy: { name: 'HR Team' } },
    { id: '3', title: 'Frontend Developer', company: 'Zepto', location: 'Mumbai', type: 'Remote', experience: '3-5 yrs', salary: '₹10–16 LPA', techStack: ['React', 'Next.js', 'TypeScript'], description: 'React + Next.js developer for consumer-facing quick commerce platform.', postedAt: new Date(), postedBy: { name: 'HR Team' } },
    { id: '4', title: 'DevOps Engineer', company: 'CRED', location: 'Bangalore', type: 'Hybrid', experience: '2-4 yrs', salary: '₹14–20 LPA', techStack: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], description: 'Join our platform engineering team to build reliable, scalable infrastructure.', postedAt: new Date(), postedBy: { name: 'HR Team' } },
  ]);

  post(job: Partial<Job>): void {
    const newJob: Job = {
      id: Date.now().toString(),
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Remote',
      experience: job.experience || '',
      salary: job.salary || '',
      techStack: job.techStack || [],
      description: job.description || '',
      postedAt: new Date(),
      postedBy: { name: 'Arpita Sahoo' },
    };
    this.jobs.update(j => [newJob, ...j]);
  }
}
