## 개요

`kingwangjjang-fe`는 Next.js 14(App Router) 기반의 프론트엔드 애플리케이션입니다. 자체 MUI 기반 UI, REST API, Zustand 상태 관리를 사용하며 기본 랜딩은 게시판 화면으로 이동합니다.

- **주요 기술**: Next.js 14, React 18, TypeScript 5, MUI 5, REST API, Zustand 5, ESLint(Airbnb), Prettier
- **포트**: 개발/실행 기본 포트 8083

## 주요 기능

- **게시판 실시간 페이지네이션**: REST API 기반 무한 스크롤
- **댓글 패널**: 모바일 Drawer, 데스크톱 사이드바 댓글 UI
- **자체 테마/레이아웃**: `src/theme/app-theme-provider.tsx`, `src/layouts/app-shell.tsx`

## 빠른 시작

### 사전 요구사항

- Node.js 20.x 이상
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

### 빌드/실행

```bash
yarn build
yarn start
```

## 환경 변수

```dotenv
# API 서버 베이스 URL
NEXT_PUBLIC_SERVER_URL=

# 이미지 서버 베이스 URL
NEXT_PUBLIC_IMAGE_SERVER_URL=

# 정적 export 빌드 여부("true"/"false")
NEXT_PUBLIC_BUILD_STATIC_EXPORT=false
```

- 실제 사용 기본값은 `src/config-global.ts`를 참고하세요.
- 런타임 HTTP 요청은 `src/api/http.ts`의 `apiFetch`를 통해 수행합니다.

## 스크립트

- `dev`: 개발 서버 실행(8083)
- `start`: 프로덕션 실행(8083)
- `build`: 프로덕션 빌드
- `lint` / `lint:fix`: ESLint 검사/자동수정
- `fm:check` / `fm:fix`: Prettier 포맷 체크/적용
- `ts` / `ts:watch`: TypeScript 타입 체크
- `check`: 타입 체크와 ESLint 실행

## 폴더 구조

```text
src/
  app/                     # App Router 엔트리
  api/                     # REST API 클라이언트
  auth/                    # 인증 초기화 및 타입
  components/comment/      # 댓글 UI
  hooks/                   # 게시판/댓글 데이터 훅
  layouts/                 # 앱 셸
  sections/board/          # 게시판 화면
  store/                   # 전역 스토어(zustand)
  theme/                   # MUI 테마 프로바이더
  types/                   # 타입 정의
public/                    # 파비콘/매니페스트
```

## Docker

```bash
docker build -t kingwangjjang-fe:local .
docker run --rm -p 8083:8083 --name kingwangjjang-fe kingwangjjang-fe:local
```

`docker-compose.yml`은 외부 네트워크 `kingwangjjang-network` 사용을 전제로 합니다.

```bash
docker network create kingwangjjang-network
docker compose up -d
```
