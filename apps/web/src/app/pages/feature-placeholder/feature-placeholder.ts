import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feature-placeholder-page',
  imports: [],
  template: `
    <section class="min-h-[calc(100vh-11rem)] rounded-[2rem] border border-white/7 bg-[var(--sm-panel)] p-7 sm:p-12">
      <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-400">{{ route.snapshot.data['eyebrow'] }}</p>
      <h1 class="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">{{ route.snapshot.data['title'] }}</h1>
      <p class="mt-6 max-w-2xl text-base leading-7 text-[var(--sm-muted)] sm:text-lg">{{ route.snapshot.data['description'] }}</p>
      <div class="mt-10 rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-sm text-[var(--sm-muted)]">
        This route is established in the new Angular shell. Its provider-backed workflow is the next vertical slice.
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePlaceholderPage {
  protected readonly route = inject(ActivatedRoute);
}
