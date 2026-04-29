# Kingwangjjang FE Project Overview

## 기술 스택

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **UI Library**: MUI 5
- **Styling**: Emotion, MUI `sx`
- **State Management**: Zustand
- **Data Fetching**: REST API clients built on `fetch`
- **Code Formatting**: Prettier
- **Linting**: ESLint with Airbnb TypeScript rules

## 구조

```text
src/
  app/                     # App Router entrypoints
  api/                     # REST API clients
  auth/                    # auth initializer and types
  components/comment/      # comment UI
  hooks/                   # board/comment data hooks
  layouts/                 # app shell
  sections/board/          # board screen
  store/                   # Zustand stores
  theme/                   # MUI theme provider
  types/                   # shared API/UI types
public/                    # favicon and manifest
```

## 규칙

- 파일명은 `kebab-case`, 컴포넌트는 `PascalCase`를 사용합니다.
- 공통 데이터 요청은 `src/api/http.ts`의 `apiFetch`를 통해 수행합니다.
- 전역 UI 래핑은 `src/app/layout.tsx`와 `src/theme/app-theme-provider.tsx`에서 관리합니다.
- 앱 화면 셸은 `src/layouts/app-shell.tsx`, 게시판 화면은 `src/sections/board/view/board-view.tsx`가 담당합니다.
