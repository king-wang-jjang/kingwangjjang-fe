# CONTRIBUTING.md - 기여 가이드

이 문서는 Kingwangjjang FE 프로젝트에 기여하기 위한 규칙과 절차를 안내합니다.

## 1. 개발 환경 설정

1.  저장소를 복제(clone)합니다.
    ```bash
    git clone https://github.com/your-repo/kingwangjjang-fe.git
    cd kingwangjjang-fe
    ```
2.  의존성을 설치합니다. 프로젝트는 `yarn` 패키지 매니저를 사용합니다.
    ```bash
    yarn install
    ```
3.  개발 서버를 시작합니다.
    ```bash
    yarn dev
    ```
    - 개발 서버는 `http://localhost:8083` 에서 실행됩니다.

## 2. 코드 스타일 및 컨벤션

### 포매팅 및 린팅

- **Formatter**: [Prettier](https://prettier.io/)를 사용하여 코드 스타일을 통일합니다. 커밋하기 전에 반드시 포매팅을 적용해야 합니다.
  ```bash
  # 전체 프로젝트 포매팅
  yarn fm:fix
  ```
- **Linter**: [ESLint](https://eslint.org/)와 Airbnb 스타일 가이드를 사용하여 코드 품질을 유지합니다.
  ```bash
  # 린트 에러 확인 및 자동 수정
  yarn lint:fix
  ```

### 네이밍 컨벤션

- **파일**: `kebab-case`를 사용합니다. (e.g., `board-view.tsx`, `use-auth.ts`)
- **컴포넌트**: `PascalCase`를 사용합니다. (e.g., `BoardView`, `UserProfile`)
- **변수/함수**: `camelCase`를 사용합니다. (e.g., `const boardData = ...`, `function getUserInfo()`)
- **타입/인터페이스**: `PascalCase`를 사용합니다. (e.g., `type User`, `interface BoardPost`)

### 임포트 순서

- `.eslintrc.js`에 정의된 `perfectionist/sort-imports` 규칙에 따라 임포트 순서를 자동으로 정렬합니다. VSCode 사용 시, 파일 저장 시 자동으로 정렬되도록 설정하는 것을 권장합니다.

## 3. 테스트 규칙

- **단위/통합 테스트**: [Jest](https://jestjs.io/)와 [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)를 사용하여 테스트를 작성하는 것을 목표로 합니다.
- **테스트 파일 위치**: 테스트할 파일과 동일한 디렉토리에 `*.test.tsx` 또는 `*.test.ts` 형식으로 파일을 생성합니다.
  ```
  src/components/button/
  ├── button.tsx
  └── button.test.tsx
  ```
- **테스트 대상**:
    - **필수**: Custom Hooks, 유틸리티 함수 등 순수 로직
    - **권장**: 복잡한 시나리오를 가진 컴포넌트, 주요 비즈니스 로직이 포함된 섹션

## 4. 브랜치 및 커밋 규칙

### 브랜치 전략

[Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)에 기반한 간단한 브랜치 전략을 사용합니다.

- **`main`**: 프로덕션 배포를 위한 브랜치. 오직 `develop` 브랜치로부터 병합됩니다.
- **`develop`**: 다음 릴리즈를 준비하는 개발 브랜치.
- **`feature/{feature-name}`**: 새로운 기능 개발을 위한 브랜치. `develop`에서 분기하고, 개발 완료 후 `develop`으로 Pull Request를 보냅니다.
  - 예: `feature/login`, `feature/board-comment`
- **`bugfix/{issue-number}`**: 버그 수정을 위한 브랜치. `develop`에서 분기합니다.
- **`hotfix/{issue-number}`**: 프로덕션의 긴급한 버그를 수정하는 브랜치. `main`에서 분기하고, `main`과 `develop`에 모두 병합합니다.

### 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 규칙을 따릅니다.

**형식**: `<type>(<scope>): <subject>`

- **`<type>`**:
    - `feat`: 새로운 기능 추가
    - `fix`: 버그 수정
    - `docs`: 문서 변경
    - `style`: 코드 스타일 수정 (포매팅, 세미콜론 등)
    - `refactor`: 코드 리팩토링
    - `test`: 테스트 코드 추가/수정
    - `chore`: 빌드 관련, 패키지 매니저 설정 등
- **`<scope>`** (선택사항): 커밋의 영향을 받는 부분 (e.g., `auth`, `board`, `theme`)
- **`<subject>`**: 커밋에 대한 간결한 설명

**예시**:

```
feat(auth): add social login functionality
fix(board): prevent duplicate post submission on double click
docs: update ARCHITECTURE.md with data flow diagram
style: apply prettier to all tsx files
```

## 5. Pull Request (PR) 프로세스

1.  `feature` 또는 `bugfix` 브랜치에서 작업을 완료합니다.
2.  `develop` 브랜치로 PR을 생성합니다.
3.  PR 템플릿에 따라 변경 사항, 테스트 내용, 스크린샷 등을 상세히 기재합니다.
4.  동료 리뷰어의 검토 및 승인을 받습니다.
5.  리뷰 완료 후, 브랜치를 `develop`에 병합합니다.
