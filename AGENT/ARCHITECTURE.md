# ARCHITECTURE.md - 아키텍처 설계 문서

이 문서는 Kingwangjjang FE 프로젝트의 소프트웨어 아키텍처, 모듈 구조, 데이터 흐름 및 핵심 로직에 대해 설명합니다.

## 1. 아키텍처 개요

본 프로젝트는 **Next.js 기반의 클라이언트 사이드 렌더링(CSR) 중심 아키텍처**를 채택하고 있습니다. UI 라이브러리로는 **MUI(Material-UI)**를 사용하여 디자인 시스템을 구축하고, 상태 관리는 **Zustand**와 React 로컬 상태를 조합하여 사용합니다.

주요 아키텍처 다이어그램은 다음과 같이 표현될 수 있습니다.

```
+-------------------+      +----------------------+      +---------------------+
|   Web Browser     |      |      Next.js Server    |      |   Backend API Server  |
| (User Interface)  |      | (SSR/ISR/Middleware) |      |   (REST API)        |
+-------------------+      +----------------------+      +---------------------+
| 1. Request Page   |----->| 2. Render & Serve    |      |                     |
|                   |      | (Initial Load)       |      |                     |
|                   |<-----|                      |      |                     |
|-------------------|      |----------------------|      |---------------------|
| 3. Render View    |      |                      |      |                     |
| (MUI Components)  |      |                      |      |                     |
|-------------------|      |----------------------|      |---------------------|
| 4. Fetch Data     |      |                      |      | 5. REST Request     |
| (API Client)      |----------------------------------->|                     |
|                   |      |                      |      |                     |
|                   |<-----------------------------------| 6. JSON Response    |
|-------------------|      |                      |      | (JSON)              |
| 7. Update State   |      |                      |      |                     |
| (Zustand/State)   |      |                      |      |                     |
|-------------------|      |                      |      |                     |
| 8. Re-render UI   |      |                      |      |                     |
+-------------------+      +----------------------+      +---------------------+
```

## 2. 모듈 구조

프로젝트는 기능과 역할에 따라 `src` 디렉토리 하위에 여러 모듈로 나뉘어 있습니다.

- **`src/app` (Next.js App Router)**: 페이지 라우팅과 각 페이지의 진입점(entry point) 역할을 합니다. `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` 등을 통해 페이지의 구조, 데이터 로딩, 에러 상태를 선언적으로 관리합니다.

- **`src/components` (공통 컴포넌트)**: 버튼, 인풋, 아이콘 등 애플리케이션 전반에서 재사용되는 가장 작은 단위의 UI 컴포넌트 집합입니다. 특정 도메인 로직에 의존하지 않습니다.

- **`src/sections` (섹션 컴포넌트)**: 여러 공통 컴포넌트를 조합하여 특정 페이지의 한 구획(section)을 구성하는 컴포넌트입니다. (예: `board-view`, `user-profile-form`). 페이지(`app`)와 컴포넌트(`components`)의 중간 계층입니다.

- **`src/layouts` (레이아웃)**: 헤더, 푸터, 네비게이션 바 등 여러 페이지에서 공유되는 전체적인 페이지 구조를 정의합니다.

- **`src/store` (상태 관리)**: `Zustand`를 사용한 글로벌 상태 관리 모듈입니다. 사용자 인증 정보(`auth-store`), UI 상태(`nav-store`) 등 작은 단위의 스토어를 만들어 관리합니다.

- **`src/hooks` (공통 훅)**: 여러 컴포넌트에서 재사용될 수 있는 비즈니스 로직과 상태 로직을 분리한 Custom Hook의 집합입니다. (예: `use-responsive`, `use-boolean`)

- **`src/api` (데이터 통신)**: REST API 요청과 응답 정규화를 담당하는 모듈입니다.

- **`src/theme` (테마 및 스타일)**: MUI의 테마(색상, 타이포그래피, 간격 등)를 커스터마이징하고, 전역 스타일 및 컴포넌트 스타일 오버라이드를 관리합니다.

## 3. 데이터 흐름 (Data Flow)

**게시글 목록을 불러오는 경우**를 예로 데이터 흐름을 설명합니다.

1.  **View (UI Layer)**
    - 사용자가 `/board` 경로에 접속하면 `src/app/board/page.tsx`가 렌더링됩니다.
    - 이 페이지는 `src/sections/board/view/board-view.tsx` 컴포넌트를 호출합니다.

2.  **Hooks (Logic Layer)**
    - `board-view.tsx` 내부에서는 `use-board.ts` 또는 유사한 커스텀 훅을 호출하여 게시글 데이터를 요청합니다.
    - 이 훅은 `src/api` 클라이언트를 사용하여 REST API에 데이터를 요청합니다.

3.  **REST API (Data Layer)**
    - `useInfiniteScrollablePostList` 훅은 `src/api/board-api.ts`의 REST 클라이언트를 호출합니다.
    - API 클라이언트는 HTTP 요청을 생성하여 API Gateway로 전송합니다.

4.  **State (State Management)**
    - 훅은 서버로부터 받은 응답(게시글 목록)을 React 상태에 저장합니다.
    - 훅은 로딩 상태, 에러 상태, 그리고 응답 데이터를 컴포넌트로 반환합니다.

5.  **Re-render (UI Update)**
    - `board-view.tsx` 컴포넌트는 훅으로부터 받은 데이터를 사용하여 UI를 렌더링합니다. (예: 게시글 목록을 순회하며 `board-post-card` 컴포넌트를 생성)
    - 로딩 중일 때는 `loading.tsx` 파일이나 스켈레톤 UI를, 에러 발생 시에는 에러 컴포넌트를 보여줍니다.

## 4. 핵심 알고리즘 및 로직

본 프로젝트의 복잡한 알고리즘은 대부분 라이브러리(Next.js, React)에 의해 처리됩니다. 다만, 프로젝트 내에서 구현된 주요 로직은 다음과 같습니다.

- **인증 관리 (`src/auth`)**:
    - `AuthGuard` 컴포넌트는 특정 페이지에 접근하기 전에 사용자의 인증 상태를 확인합니다.
    - `Zustand`의 `auth-store`와 `localStorage` (또는 `cookies`)를 사용하여 인증 토큰과 사용자 정보를 관리하고, 애플리케이션 로드 시 `auth-initializer`를 통해 상태를 초기화합니다.

- **무한 스크롤 (`src/hooks/use-infinite-scrollable-post-list.ts`)**:
    - IntersectionObserver와 REST 페이지네이션을 사용하여 구현됩니다.
    - 사용자가 스크롤을 페이지 하단까지 내리면, 다음 페이지의 데이터를 추가로 요청하여 기존 목록에 병합합니다.

- **테마 및 다크 모드 (`src/theme`)**:
    - MUI의 `createTheme`과 `ThemeProvider`를 사용하여 라이트/다크 모드를 지원하는 커스텀 테마를 구현합니다.
    - 사용자의 설정(또는 시스템 설정)에 따라 동적으로 테마를 전환하는 로직이 포함됩니다.
