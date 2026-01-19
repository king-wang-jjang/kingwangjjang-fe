# DATA_FORMAT.md - 데이터 포맷 정의

이 문서는 Kingwangjjang FE 프로젝트에서 사용하는 주요 데이터의 형식과 구조를 정의합니다. 이는 클라이언트와 서버 간의 데이터 일관성을 유지하기 위한 단일 진실의 원천(Single Source of Truth) 역할을 합니다.

## 1. 주요 데이터 포맷: GraphQL JSON

애플리케이션의 주된 데이터 교환은 **GraphQL API**를 통해 이루어지며, 데이터는 **JSON** 형식으로 전송됩니다. `src/__generated__/graphql.ts` 파일에 `graphql-codegen`을 통해 자동 생성된 TypeScript 타입을 기준으로 데이터 구조를 정의합니다.

### 1.1. Board (게시글)

- **GraphQL 타입**: `Board`
- **`src/types/board.ts`** 와 연관됩니다.

| 필드명 | 타입 | 설명 | 예시 |
| --- | --- | --- | --- |
| `id` | `string` | 게시글의 고유 ID | `"bd_1a2b3c"` |
| `title` | `string` | 게시글 제목 | `"Next.js 14 출시!"` |
| `content` | `string` | 게시글 내용 (HTML 또는 Markdown) | `"<p>주요 기능은...</p>"` |
| `author` | `User` | 작성자 정보 (아래 User 타입 참조) | `{ "id": "usr_xyz", ... }` |
| `tags` | `string[]` | 게시글에 포함된 태그 목록 | `["nextjs", "react"]` |
| `viewCount` | `number` | 조회수 | `1024` |
| `likeCount` | `number` | 좋아요 수 | `128` |
| `createdAt` | `string` (ISO 8601) | 생성 일시 | `"2023-10-26T10:00:00Z"` |
| `updatedAt` | `string` (ISO 8601) | 마지막 수정 일시 | `"2023-10-26T11:30:00Z"` |

**예시 JSON**:
```json
{
  "id": "bd_1a2b3c",
  "title": "Next.js 14 출시!",
  "content": "<p>주요 기능은 Server Actions와 Partial Prerendering 입니다.</p>",
  "author": {
    "id": "usr_xyz",
    "name": "홍길동",
    "avatarUrl": "/assets/images/avatar_1.jpg"
  },
  "tags": ["nextjs", "react", "release"],
  "viewCount": 1024,
  "likeCount": 128,
  "createdAt": "2023-10-26T10:00:00Z",
  "updatedAt": "2023-10-26T11:30:00Z"
}
```

### 1.2. User (사용자)

- **GraphQL 타입**: `User`
- **`src/types/user.ts`** 와 연관됩니다.

| 필드명 | 타입 | 설명 | 예시 |
| --- | --- | --- | --- |
| `id` | `string` | 사용자의 고유 ID | `"usr_xyz"` |
| `name` | `string` | 사용자 이름 | `"홍길동"` |
| `email` | `string` | 사용자 이메일 (비공개 정보일 수 있음) | `"user@example.com"` |
| `avatarUrl` | `string` | 프로필 이미지 URL | `"/assets/images/avatar_1.jpg"` |
| `role` | `string` | 사용자 권한 (`'admin'`, `'user'`) | `"user"` |

**예시 JSON**:
```json
{
  "id": "usr_xyz",
  "name": "홍길동",
  "email": "user@example.com",
  "avatarUrl": "/assets/images/avatar_1.jpg",
  "role": "user"
}
```

### 1.3. Comment (댓글)

- **GraphQL 타입**: `Comment`
- **`src/types/comment.ts`** 와 연관됩니다.

| 필드명 | 타입 | 설명 | 예시 |
| --- | --- | --- | --- |
| `id` | `string` | 댓글의 고유 ID | `"cmt_abcde"` |
| `content` | `string` | 댓글 내용 | `"좋은 정보 감사합니다." `|
| `author` | `User` | 작성자 정보 | `{ "id": "usr_pqr", ... }` |
| `createdAt` | `string` (ISO 8601) | 생성 일시 | `"2023-10-26T12:00:00Z"` |
