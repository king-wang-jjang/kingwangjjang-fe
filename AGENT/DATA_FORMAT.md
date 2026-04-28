# DATA_FORMAT.md - 데이터 포맷 정의

이 문서는 Kingwangjjang FE 프로젝트에서 사용하는 주요 REST API 응답 형식을 정의합니다.

## 1. 주요 데이터 포맷: REST JSON

애플리케이션의 데이터 교환은 REST API를 통해 이루어지며, 데이터는 JSON 형식으로 전송됩니다. 클라이언트의 타입과 정규화 로직은 `src/api/*-api.ts` 파일에서 관리합니다.

### 1.1. Board

- API 클라이언트: `src/api/board-api.ts`
- 주요 엔드포인트: `/boardservice/api/boards/realtime`, `/boardservice/api/boards/daily`

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `Id` | `string | null` | 게시글 ID |
| `category` | `string` | 게시글 카테고리 |
| `no` | `number` | 원본 사이트 게시글 번호 |
| `site` | `string` | 원본 사이트 |
| `title` | `string` | 게시글 제목 |
| `url` | `string` | 원문 URL |
| `createTime` | `string` | 생성 일시 |
| `thumbnail` | `string | null` | 대표 이미지 |
| `commentCount` | `number | null` | 댓글 수 |
| `likeCount` | `number | null` | 좋아요 수 |

### 1.2. User

- API 클라이언트: `src/api/user-api.ts`
- 주요 엔드포인트: `/userservice/api/users/me`

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `Id` | `string` | 사용자 내부 ID |
| `userId` | `string` | 인증 제공자 사용자 ID |
| `nickname` | `string | null` | 닉네임 |
| `authProvider` | `string` | 인증 제공자 |
| `profileImage` | `string | null` | 프로필 이미지 |
| `createTime` | `string` | 생성 일시 |

### 1.3. Comment

- API 클라이언트: `src/api/comment-api.ts`
- 주요 엔드포인트: `/commentservice/api/comments`

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `Id` | `string` | 댓글 ID |
| `boardId` | `string` | 게시글 ID |
| `parentId` | `string | null` | 부모 댓글 ID |
| `content` | `string` | 댓글 내용 |
| `userId` | `string` | 작성자 ID |
| `userNickname` | `string | null` | 작성자 닉네임 |
| `likeCount` | `number` | 좋아요 수 |
| `replyCount` | `number` | 답글 수 |
| `isLiked` | `boolean` | 현재 사용자의 좋아요 여부 |
| `isDeleted` | `boolean` | 삭제 여부 |
| `createdAt` | `string` | 생성 일시 |
| `updatedAt` | `string` | 수정 일시 |
