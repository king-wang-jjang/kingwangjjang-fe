import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

const checks = [
  {
    file: 'src/app/layout.tsx',
    pattern: /QueryProvider/,
    message: 'Root layout should wrap the app with QueryProvider.',
  },
  {
    file: 'src/providers/query-provider.tsx',
    pattern: /QueryClientProvider/,
    message: 'Query provider should expose TanStack QueryClientProvider.',
  },
  {
    file: 'src/hooks/use-infinite-scrollable-post-list.ts',
    pattern: /useInfiniteQuery/,
    message: 'Board infinite scroll should use useInfiniteQuery.',
  },
  {
    file: 'src/hooks/use-comments.ts',
    pattern: /useQuery/,
    message: 'Comments should use useQuery for reads.',
  },
  {
    file: 'src/hooks/use-comments.ts',
    pattern: /useMutation/,
    message: 'Comments should use useMutation for writes.',
  },
];

const failures = [];

for (const check of checks) {
  try {
    const content = read(check.file);
    if (!check.pattern.test(content)) {
      failures.push(`${check.file}: ${check.message}`);
    }
  } catch (error) {
    failures.push(`${check.file}: ${check.message} (${error.message})`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('React Query migration checks passed.');
