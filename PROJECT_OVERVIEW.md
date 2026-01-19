# Kingwangjjang FE Project Overview

이 문서는 Kingwangjjang FE 프로젝트의 구조, 코딩 스타일 및 주요 기술 스택에 대한 개요를 제공합니다.

## 1. 기술 스택 (Tech Stack)

이 프로젝트는 다음 기술들을 기반으로 구축되었습니다.

- **Framework**: [Next.js](https://nextjs.org/) (v14+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Material-UI (MUI)](https://mui.com/) v5
- **Styling**: [@emotion/styled](https://emotion.sh/docs/styled)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching (GraphQL)**: [Apollo Client](https://www.apollographql.com/docs/react/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Code Formatting**: [Prettier](https://prettier.io/)
- **Linting**: [ESLint](https://eslint.org/) (with Airbnb Style Guide)

## 2. 프로젝트 구조 (Folder Structure)

프로젝트의 주요 디렉토리 구조는 다음과 같습니다.

```
/
├── public/            # 정적 파일 (이미지, 폰트 등)
├── src/
│   ├── __generated__/ # GraphQL Codegen으로 자동 생성된 타입 및 gql 함수
│   ├── app/             # Next.js App Router (페이지 및 레이아웃)
│   ├── apollo/          # Apollo Client 설정 및 GraphQL 쿼리 정의
│   ├── assets/          # 프로젝트 내부에서 사용하는 데이터, 아이콘 등
│   ├── auth/            # 인증 관련 로직 (Guard, Hooks, Store)
│   ├── components/      # 공통 재사용 컴포넌트
│   ├── hooks/           # 공통 재사용 Custom Hooks
│   ├── layouts/         # 페이지 레이아웃 컴포넌트
│   ├── routes/          # 라우팅 경로 및 관련 유틸리티
│   ├── sections/        # 특정 페이지를 구성하는 섹션 단위 컴포넌트
│   ├── store/           # Zustand를 사용한 글로벌 상태 관리 스토어
│   ├── theme/           # MUI 테마 및 스타일 오버라이드
│   ├── types/           # 전역으로 사용되는 TypeScript 타입 정의
│   └── utils/           # 프로젝트 전반에서 사용되는 유틸리티 함수
├── .eslintrc.js       # ESLint 설정 파일
├── prettier.config.mjs  # Prettier 설정 파일
├── next.config.mjs    # Next.js 설정 파일
└── tsconfig.json      # TypeScript 설정 파일
```

### 주요 디렉토리 설명

- **`src/app`**: Next.js 13+의 App Router를 따릅니다. 디렉토리 구조가 URL 경로가 되며, `page.tsx`, `layout.tsx` 등의 파일을 사용하여 페이지와 레이아웃을 구성합니다.
- **`src/components`**: 버튼, 아이콘, 로고 등 프로젝트 전반에서 재사용 가능한 가장 작은 단위의 컴포넌트를 포함합니다.
- **`src/sections`**: 여러 개의 컴포넌트가 모여 특정 페이지의 한 구획(Section)을 이루는 단위입니다. 예를 들어, 게시판 목록 뷰(`board-view`)는 여러 `board-post-card`와 필터 컴포넌트로 구성됩니다.
- **`src/layouts`**: 애플리케이션의 전체적인 구조(e.g., 대시보드 레이아웃, 인증 레이아웃)를 정의합니다. 헤더, 네비게이션, 푸터 등을 포함할 수 있습니다.
- **`src/store`**: Zustand를 사용하여 상태를 관리합니다. 인증 상태(`auth-store`), 네비게이션 상태(`nav-store`) 등 기능별로 스토어 파일을 분리합니다.
- **`src/theme`**: MUI의 테마를 커스터마이징하는 파일들이 위치합니다. 색상, 타이포그래피, 컴포넌트별 기본 스타일 등을 정의합니다.
- **`src/apollo`**: GraphQL 쿼리, 뮤테이션, 프래그먼트를 정의하고 Apollo Client 설정을 관리합니다. `codegen.ts`와 함께 `__generated__` 디렉토리에 타입과 Hook을 자동 생성합니다.

## 3. 코딩 스타일 및 규칙 (Coding Style & Conventions)

### 포매팅 및 린팅

- **Formatter**: Prettier를 사용하여 코드 포매팅을 일관되게 유지합니다.
  - `package.json`의 `fm:fix` 스크립트 실행: `yarn fm:fix`
- **Linter**: ESLint와 `eslint-config-airbnb-typescript` 규칙을 기반으로 코드 품질을 관리합니다.
  - `package.json`의 `lint:fix` 스크립트 실행: `yarn lint:fix`

### 네이밍 컨벤션

- **파일**: `kebab-case`를 사용합니다. (e.g., `board-view.tsx`)
- **컴포넌트**: `PascalCase`를 사용합니다. (e.g., `BoardView`)
- **변수/함수**: `camelCase`를 사용합니다.
- **타입/인터페이스**: `PascalCase`를 사용하며, 필요한 경우 `I` 접두사 대신 기능에 맞는 명확한 이름을 부여합니다. (e.g., `Board`, `User`)

### 컴포넌트 작성

- **함수형 컴포넌트**와 **Hooks** 사용을 원칙으로 합니다.
- 컴포넌트는 기능과 역할에 따라 `components`, `sections`, `layouts` 디렉토리에 명확히 구분하여 위치시킵니다.
- 스타일은 `@emotion/styled`를 사용하여 컴포넌트와 분리된 스타일 코드를 작성하는 것을 지향합니다.

### 임포트 순서

- `.eslintrc.js` 파일에 정의된 `perfectionist/sort-imports` 규칙에 따라 임포트 순서를 엄격하게 관리합니다.
- 이는 코드의 가독성을 높이고, 모듈 간의 의존성을 파악하기 쉽게 만듭니다.
- 순서: `style` -> `type` -> `builtin/external` -> `custom-mui` -> `custom-routes` -> `internal` -> `parent/sibling/index` 순으로 정렬됩니다.

### 상태 관리

- **로컬 상태**: `useState`, `useReducer`
- **글로벌 상태**: `Zustand`를 사용하여 필요한 최소한의 상태만 전역으로 관리합니다.

### API 연동

- GraphQL을 사용하며, `Apollo Client`를 통해 서버와 통신합니다.
- `src/apollo` 디렉토리에서 쿼리와 뮤테이션을 정의하고, `graphql-codegen`을 사용하여 관련 타입과 Hooks를 자동으로 생성하여 사용합니다.
