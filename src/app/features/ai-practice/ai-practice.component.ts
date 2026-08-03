import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';

type ChatRole = 'ai' | 'user';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  tags?: string[];
};

@Component({
  selector: 'app-ai-practice',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, DrawerComponent, BottomNavComponent, FormsModule],
  templateUrl: './ai-practice.component.html',
  styleUrls: ['./ai-practice.component.css'],
})
export class AiPracticeComponent {
  drawerOpen = signal(false);

  resumeFileName = signal('');
  resumeFileSizeLabel = signal('');

  techOptions = ['React', 'Node.js', 'TypeScript', 'Tailwind', 'PostgreSQL', 'AWS'];
  selectedTech = signal<string[]>(['React', 'TypeScript']);

  inputText = signal('');
  messages = signal<ChatMessage[]>([
    {
      id: 'm1',
      role: 'ai',
      text: `Hello! I’m your Interview AI Coach. Pick your tech stack and hit “Start Mock Interview” to begin.`,
      tags: ['AI Insight'],
    },
  ]);

  sessionActive = computed(() => this.messages().length > 1);

  toggleTech(t: string): void {
    const tech = String(t || '').trim();
    if (!tech) return;
    this.selectedTech.update((list) => {
      const has = list.includes(tech);
      if (has) return list.filter((x) => x !== tech);
      return [...list, tech];
    });
  }

  onResumePicked(fileList: FileList | null | undefined): void {
    const file = fileList && fileList.length ? fileList.item(0) : null;
    if (!file) return;
    this.setResume(file);
  }

  onResumeDrop(ev: DragEvent): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files?.length ? ev.dataTransfer.files.item(0) : null;
    if (!file) return;
    this.setResume(file);
  }

  onResumeDragOver(ev: DragEvent): void {
    ev.preventDefault();
  }

  private setResume(file: File): void {
    this.resumeFileName.set(file.name);
    const mb = file.size / (1024 * 1024);
    const label = mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    this.resumeFileSizeLabel.set(label);
  }

  startMockInterview(): void {
    const stack = this.selectedTech();
    const stackLabel = stack.length ? stack.join(', ') : 'your stack';
    const prompt = this.pickPrompt(stack);
    const next: ChatMessage[] = [
      {
        id: `ai_${Date.now()}_1`,
        role: 'ai',
        text: `Great — I’ll tailor this session for ${stackLabel}. First question:\n\n${prompt}`,
        tags: ['AI Insight', 'Communication'],
      },
    ];
    this.messages.update((m) => [...m, ...next]);
  }

  send(): void {
    const text = this.inputText().trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text };
    this.messages.update((m) => [...m, userMsg]);
    this.inputText.set('');

    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}_2`,
      role: 'ai',
      text: this.generateCoachReply(text, this.selectedTech()),
      tags: ['Coach Tip'],
    };
    this.messages.update((m) => [...m, aiMsg]);
  }

  private pickPrompt(stack: string[]): string {
    const s = stack.map((x) => x.toLowerCase());
    if (s.includes('react')) {
      return 'Explain how you would structure state management in a large React app. When would you choose Context vs Redux Toolkit?';
    }
    if (s.includes('node.js') || s.includes('node')) {
      return 'Design a Node.js API for a feed. How would you handle pagination, caching, and rate limiting?';
    }
    if (s.includes('typescript')) {
      return 'Show how you would model an API response safely in TypeScript. When would you use unions vs generics?';
    }
    if (s.includes('postgresql')) {
      return 'How would you design a schema for posts, comments, and votes? Mention indexes and transaction boundaries.';
    }
    return 'Walk me through a system you built recently. What trade-offs did you make and why?';
  }

  private generateCoachReply(userText: string, stack: string[]): string {
    const t = userText.trim();
    const lower = t.toLowerCase();
    const stackLabel = stack.length ? stack.join(', ') : 'your stack';
    if (lower.includes('context') && (lower.includes('redux') || lower.includes('toolkit'))) {
      return `Nice comparison. Now add decision criteria: app size, update frequency, debugging needs, team conventions, and performance.\n\nFollow-up: for ${stackLabel}, how would you prevent unnecessary re-renders when using Context?`;
    }
    if (lower.includes('performance') || lower.includes('rerender') || lower.includes('re-render')) {
      return `Good direction. Mention memoization boundaries, selector patterns, splitting contexts, and avoiding derived state.\n\nNext: can you give a concrete example where you measured performance and what you changed?`;
    }
    return `Got it. Try structuring your answer in 3 parts: (1) goal, (2) approach, (3) trade-offs.\n\nOne more: what is the biggest risk in your approach, and how would you mitigate it?`;
  }
}

