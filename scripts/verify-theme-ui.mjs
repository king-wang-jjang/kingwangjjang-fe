import fs from 'node:fs';
import assert from 'node:assert/strict';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

console.log('Verifying color mode UI contract...');

const themeProvider = read('src/theme/app-theme-provider.tsx');
const themeConstants = read('src/theme/constants.ts');
const colorModeToggle = read('src/theme/color-mode-toggle.tsx');
const appToaster = read('src/theme/app-toaster.tsx');
const rootLayout = read('src/app/layout.tsx');
const appShell = read('src/layouts/app-shell.tsx');

assert.match(
  themeProvider,
  /colorSchemes:\s*\{[\s\S]*light:\s*\{[\s\S]*dark:\s*\{/,
  'theme should define both light and dark color schemes'
);
assert.match(
  themeProvider,
  /colorSchemeSelector:\s*'data'/,
  'theme should use a selector that supports manual mode changes'
);
assert.match(
  themeProvider,
  /defaultMode="system"[\s\S]*modeStorageKey=\{COLOR_MODE_STORAGE_KEY\}/,
  'theme provider should start from system preference and persist explicit choices'
);
assert.match(
  themeConstants,
  /COLOR_MODE_STORAGE_KEY\s*=\s*'kwj-color-mode'/,
  'color mode storage should use an application-owned key'
);
assert.match(
  rootLayout,
  /suppressHydrationWarning[\s\S]*InitColorSchemeScript[\s\S]*attribute="data"[\s\S]*defaultMode="system"/,
  'root layout should initialize the scheme before hydration'
);
assert.match(
  colorModeToggle,
  /useColorScheme[\s\S]*setMode\(isDarkMode \? 'light' : 'dark'\)/,
  'header toggle should switch between light and dark modes'
);
assert.match(
  colorModeToggle,
  /다크 모드로 전환[\s\S]*라이트 모드로 전환|라이트 모드로 전환[\s\S]*다크 모드로 전환/,
  'mode toggle should expose an accessible action label'
);
assert.match(
  appShell,
  /ColorModeToggle/,
  'application header should expose color mode controls to every user'
);
assert.match(
  appToaster,
  /<Toaster[\s\S]*theme=\{mode \?\? 'system'\}/,
  'toast styling should follow the selected color mode'
);

console.log('Color mode UI contract passed.');
