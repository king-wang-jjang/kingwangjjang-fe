## 개요

`kingwangjjang-fe`는 Next.js 14(App Router) 기반의 프론트엔드 애플리케이션입니다. MUI 디자인 시스템과 Apollo Client(GraphQL), 상태 관리(Zustand), 폼/검증(React Hook Form + Zod)을 사용하며, PWA(오프라인/설치형)와 Docker 배포를 지원합니다. 기본 랜딩은 게시판 화면으로 이동합니다.

- **주요 기술**: Next.js 14, React 18, TypeScript 5, MUI 5, Apollo Client 3, GraphQL, Axios, Zustand 5, React Hook Form, Zod, Framer Motion, Day.js, next-pwa, ESLint(Airbnb), Prettier
- **포트**: 개발/실행 기본 포트 8083
- **PWA**: 개발 환경에선 비활성, 프로덕션 빌드에서 활성화(서비스 워커 자동 등록)

## 데모/주요 기능

- **게시판 실시간 페이지네이션**: GraphQL `realtimePagination` 쿼리 기반
- **JWT 인증 스켈레톤**: 토큰 디코딩/만료 처리 유틸 포함(`src/auth/context/jwt/utils.ts`)
- **테마/컬러 스킴**: MUI `ThemeProvider`, 다크/라이트 모드(`src/theme`)
- **반응형 레이아웃**: 공통 레이아웃 및 섹션 컴포넌트(`src/layouts`, `src/sections`)
- **PWA 지원**: `next-pwa`, `public/manifest.json`, 아이콘/서비스워커 포함

## 빠른 시작

### 사전 요구사항

- Node.js 20.x
- Yarn 1.x(권장) 또는 npm

### 설치 및 실행

```bash
yarn install
yarn dev
```

```bash
npm install
npm run dev
```

- 브라우저: `http://localhost:8083`

### 빌드/실행(프로덕션)

```bash
yarn build
yarn start
```

```bash
npm run build
npm start
```

## 환경 변수

런타임/빌드에 사용하는 주요 환경 변수는 다음과 같습니다. 루트에 `.env` 파일을 생성해 설정하세요.

```dotenv
# API 서버 베이스 URL (예: https://api.example.com 또는 http://localhost:33330)
NEXT_PUBLIC_SERVER_URL=

# 정적 자산 경로 prefix (필요 시)
NEXT_PUBLIC_ASSETS_DIR=

# 이미지 서버 베이스 URL
NEXT_PUBLIC_IMAGE_SERVER_URL=

# 정적 export 빌드 여부("true"/"false")
BUILD_STATIC_EXPORT=false

# Mapbox (선택)
NEXT_PUBLIC_MAPBOX_API_KEY=

# Firebase (선택)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APPID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Amplify (선택)
NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_ID=
NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID=
NEXT_PUBLIC_AWS_AMPLIFY_REGION=

# Auth0 (선택)
NEXT_PUBLIC_AUTH0_CLIENT_ID=
NEXT_PUBLIC_AUTH0_DOMAIN=
NEXT_PUBLIC_AUTH0_CALLBACK_URL=

# Supabase (선택)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- 실제 사용 기본값은 `src/config-global.ts`를 참고하세요. 기본 `serverUrl`은 환경 변수가 없으면 `https://api.마약.kr`로 설정됩니다.
- 프론트 런타임 GraphQL 엔드포인트는 `${CONFIG.serverUrl}/boardservice/graphql`, `${CONFIG.serverUrl}/user/graphql`을 사용합니다.

## 스크립트

`package.json`의 주요 스크립트:

- `dev`: 개발 서버 실행(8083)
- `start`: 프로덕션 실행(8083)
- `build`: 프로덕션 빌드
- `lint` / `lint:fix`: ESLint 검사/자동수정
- `fm:check` / `fm:fix`: Prettier 포맷 체크/적용
- `ts` / `ts:watch`: TypeScript 타입 체크
- `compile` / `watch`: GraphQL Codegen 실행/감시

## GraphQL/Apollo

- Apollo 클라이언트는 `src/apollo/index.ts`에서 생성합니다. `CONFIG.serverUrl`을 베이스로 `boardservice`/`user` 서비스를 사용합니다.
- 런타임 HTTP 요청은 `axios` 인스턴스(`src/utils/axios.ts`)도 병행 사용합니다.

### Codegen

- 설정: `codegen.ts`
- 문서 소스: `src/**/*.{ts,tsx}`
- 출력: `src/__generated__/` (preset: client)

```bash
yarn compile        # 일회성 생성
yarn watch          # 변경 감시
```

로컬 코드젠 시, `codegen.ts`의 스키마 주소는 기본적으로 `http://localhost:33330/...`를 가리킵니다(개발 편의를 위한 설정). 런타임은 `CONFIG.serverUrl`을 따릅니다.

## PWA

- 설정: `next.config.mjs` (`next-pwa`)
- 개발 환경에선 자동 비활성화, 프로덕션 빌드에서 서비스 워커 등록(`register: true`, `skipWaiting: true`)
- 매니페스트: `public/manifest.json`
- 아이콘: `public/logo/*`

프로덕션 모드에서 `yarn build && yarn start`로 구동 시 PWA 기능을 확인할 수 있습니다.

## 폴더 구조(요약)

```
src/
  app/                     # App Router 엔트리, 공통 레이아웃 및 페이지
  apollo/                  # Apollo Client 설정 및 GQL 정의
  __generated__/           # GraphQL codegen 산출물
  assets/                  # 아이콘/일러스트 컴포넌트 등
  auth/                    # 인증 관련 컴포넌트/컨텍스트/가드/스토어
  components/              # 재사용 가능한 UI 컴포넌트
  hooks/                   # 커스텀 훅
  layouts/                 # 레이아웃 및 내비게이션 설정
  routes/                  # 경로/훅/유틸
  sections/                # 페이지 섹션 단위 컴포넌트
  store/                   # 전역 스토어(zustand)
  theme/                   # MUI 테마/팔레트/프로바이더
  types/                   # 타입 정의
  utils/                   # axios 등 유틸리티
public/                    # 정적 자산, PWA 파일(서비스워커/매니페스트)
```

주요 진입점/설정:

- `src/app/layout.tsx`: 전역 레이아웃 및 `ThemeProvider`, PWA 매니페스트 링크
- `src/app/page.tsx`: 초기 진입 시 게시판으로 리다이렉트
- `src/config-global.ts`: 앱 이름/버전, 서버 URL, 인증, 외부 서비스 키 등 중앙 설정

## Lint/Format/품질

- ESLint: Airbnb + TypeScript + React + 정렬(perfectionist) 규칙(`.eslintrc.js`)
- Prettier: `prettier.config.mjs`
- 정적 분석(QA): `qodana.yaml`

```bash
yarn lint
yarn fm:check
```

## 경로 별칭

`tsconfig.json`의 `paths`:

- `@/*` → 프로젝트 루트
- `@/assets/*` → `public/*`
- `@/components/*` → `src/components/*` 등

## Docker

### 이미지 빌드/실행(로컬)

```bash
docker build -t kingwangjjang-fe:local .
docker run --rm -p 8083:8083 --name kingwangjjang-fe kingwangjjang-fe:local
```

### docker-compose 사용

`docker-compose.yml`은 외부 네트워크 `kingwangjjang-network` 사용을 전제로 합니다.

```bash
docker network create kingwangjjang-network
docker compose up -d
```

- 이미지: `hwanju1596/kingwangjjang-fe:0.0.1`
- 포트: `8083:8083`
- 환경변수: `.env` 파일 로드
- 로그 마운트: `./log:/home/ubuntu/kingwangjjang/logs`

## 배포 가이드(요약)

1) 환경 변수 설정(`.env` 또는 호스팅 환경 변수)
2) 빌드: `yarn build`
3) 실행: `yarn start` (리버스 프록시/Nginx 뒤에서 8083 노출 권장)
4) 정적 Export가 필요하면 `BUILD_STATIC_EXPORT`를 `"true"`로 설정 후 사용(코드 상 불리언 문자열 처리 주의)

## 라이선스/저작권

본 프로젝트는 내부 사용을 전제로 하며, UI 구성 요소 일부는 Minimals UI 스타터를 바탕으로 구성되었습니다.

## 문의

- hwanju1596@gmail.com
