# Kingwangjjang Design System

> Phantom-inspired editorial dashboard · v2.1 · 2026-09-03

이 문서는 Kingwangjjang 프론트엔드의 시각 언어와 화면 구성 원칙을 정의한다. 기준 레퍼런스는 [Phantom 공식 홈페이지](https://phantom.com/)의 2026-08-31 상태다. 레퍼런스의 로고, 고유 서체, 일러스트, 영상, 카피를 복제하지 않고 다음 특징을 Kingwangjjang의 게시판 경험에 맞게 번역한다.

- 부드러운 연보라 캔버스와 짙은 보라색 잉크
- 떠 있는 캡슐형 내비게이션과 CTA
- 크고 단정한 에디토리얼 타이포그래피
- 16–24px 라운드의 넉넉한 카드
- 보라·파랑·초록·노랑·분홍 컬러 블록
- 실제 커뮤니티 세기와 상승세를 움직임으로 보여주는 라이브 시그널
- 그림자보다 색면, 여백, 겹침으로 만드는 깊이
- 콘텐츠를 먼저 보여주고 세부 기능은 필요할 때 펼치는 흐름

이 문서는 목표 상태를 설명하는 단일 기준이다. 현재 구현과 충돌하면 신규 작업은 이 문서를 따르되, 아래의 제품 계약은 반드시 보존한다.

---

## 1. Design Direction

### 한 문장 정의

**“하루의 커뮤니티 소음을 편안하게 탐색하는 퍼플 뉴스 라운지.”**

Kingwangjjang은 관리자 도구처럼 건조하거나 뉴스 포털처럼 과밀하게 보이지 않아야 한다. 첫인상은 밝고 친근하지만, 게시글 제목·순위·요약·댓글은 빠르게 스캔할 수 있어야 한다.

### 핵심 원칙

1. **Content first**

   장식보다 게시글 제목, 출처, 시간, 반응 수, 요약을 먼저 읽게 한다.

2. **One strong action**

   한 영역에는 가장 중요한 기본 행동 하나만 강한 보라색으로 표시한다. 나머지는 밝은 보라색 또는 텍스트 액션으로 낮춘다.

3. **Soft outside, crisp inside**

   페이지와 큰 컨테이너는 부드러운 색과 큰 라운드를 사용하고, 숫자·메타데이터·상태는 명확한 대비와 정렬을 사용한다.

4. **Color blocks, not decoration**

   컬러는 기능, 순위, 콘텐츠 그룹을 구분할 때만 쓴다. 화면을 보라색으로만 채우지 않는다.

5. **Reveal progressively**

   긴 요약, 댓글, 상세 도구는 펼침·드로어·사이드 패널로 제공한다. 목록의 밀도는 유지한다.

### 보존해야 하는 제품 계약

- `/top10/?rank=N` 진입 시 해당 순위가 자동으로 펼쳐져야 한다.
- 모바일에서 게시글 선택은 요약을 펼치며, 댓글은 명시적인 `댓글 열기` 행동으로만 연다.
- 데스크톱 게시판은 도구/Top 10, 피드, 댓글의 3영역 작업 흐름을 유지한다.
- 크롤링 성공 기반 사이트 필터, 로그인 상태, 로딩·오류·빈 상태를 시각적으로 숨기지 않는다.
- 색상이나 모션만으로 선택·상태·순위를 전달하지 않는다.

---

## 2. Visual Language

### 분위기

- 밝고 낙관적이지만 장난감처럼 보이지 않는다.
- 금융 앱에서 느껴지는 신뢰감과 매거진의 대담한 편집감을 함께 사용한다.
- 큰 제목과 넓은 여백은 페이지 수준에서 사용하고, 피드 내부는 촘촘하게 유지한다.
- 완전한 흰색 일색 대신 연보라 캔버스 위에 아이보리 카드가 떠 있는 구조를 만든다.
- 브랜드 개성은 Phantom 자산이 아니라 Kingwangjjang 로고, 실제 크롤링 이미지, 한국어 카피에서 나온다.

### 형태

- 캡슐: 내비게이션, 주요 버튼, 검색, 필터 그룹
- 24px 라운드: 히어로, 대형 패널, 모달, 모바일 드로어
- 16px 라운드: 게시글 카드, Top 10, 댓글 패널, 드롭다운
- 12px 라운드: 입력창, 썸네일, 작은 상태 카드
- 원형: 아이콘 버튼, 아바타, 작은 로고 액션

작은 4px 코너와 모든 요소를 둘러싼 회색 테두리는 사용하지 않는다. 경계가 필요하면 색면 차이, 간격, 약한 내곽선 순서로 해결한다.

---

## 3. Color System

아래 값은 Phantom의 분위기를 Kingwangjjang에 맞게 재구성한 목표 토큰이다. 원본 사이트의 브랜드 토큰을 그대로 복사한 목록이 아니다.

### Light scheme

| Token                | Value                    | Role                           |
| -------------------- | ------------------------ | ------------------------------ |
| `background.default` | `#F5F2FF`                | 앱 캔버스, 브라우저 테마 색상  |
| `background.paper`   | `#FFFDF8`                | 기본 카드, 메뉴, 댓글 패널     |
| `background.raised`  | `#FFFFFF`                | 선택 카드, 팝오버, 강조 패널   |
| `background.subtle`  | `#E2DFFE`                | 선택, 읽음, 필터, 보조 버튼    |
| `background.muted`   | `#F4F2F4`                | 비활성 행, 스켈레톤, 입력 배경 |
| `background.dark`    | `#1C1C1C`                | 미디어 히어로, 강한 역상 영역  |
| `primary.main`       | `#AB9FF2`                | 주요 CTA, 활성 컨트롤          |
| `primary.light`      | `#E2DFFE`                | 약한 강조, hover 배경          |
| `primary.dark`       | `#3C315B`                | 로고, 제목, CTA 텍스트         |
| `text.primary`       | `#3C315B`                | 제목과 본문                    |
| `text.secondary`     | `#6E6E6E`                | 출처, 날짜, 설명, 보조 정보    |
| `text.onDark`        | `#FFFDF8`                | 어두운 미디어 위 텍스트        |
| `divider`            | `rgba(60, 49, 91, 0.14)` | 필요한 경우에만 쓰는 경계      |
| `focus`              | `#4A87F2`                | 키보드 포커스 링               |

### Supporting accents

| Token           | Value     | Use                          |
| --------------- | --------- | ---------------------------- |
| `accent.blue`   | `#4A87F2` | 링크, 정보, 하락/중립 데이터 |
| `accent.green`  | `#2EC08B` | 성공, 상승, 정상 수집        |
| `accent.yellow` | `#FFD13F` | 주의, 2차 강조               |
| `accent.pink`   | `#FFDADC` | 커뮤니티 반응, 가벼운 강조   |
| `accent.orange` | `#FF7243` | 오류, 위험, 즉시 확인 필요   |
| `accent.cream`  | `#FFFFC4` | 읽음, 보조 하이라이트        |
| `accent.lime`   | `#C7FF6B` | 빠른 상승 신호, 라이브 맥박 |
| `accent.hotPink`| `#FF79C6` | 폭발적 상승 신호            |

보조색은 한 화면에서 최대 세 종류까지만 사용한다. 의미가 없는 랜덤 카드 색상은 금지한다.

### Dark scheme

| Token                | Value                       | Role                      |
| -------------------- | --------------------------- | ------------------------- |
| `background.default` | `#0D0621`                   | 앱 캔버스                 |
| `background.paper`   | `#171126`                   | 기본 카드와 패널          |
| `background.raised`  | `#221A38`                   | 떠 있는 표면              |
| `background.subtle`  | `#3C315B`                   | 선택, 보조 표면           |
| `background.muted`   | `#282233`                   | 입력, 스켈레톤, 비활성 행 |
| `primary.main`       | `#AB9FF2`                   | CTA와 활성 상태           |
| `primary.light`      | `#D4CAFE`                   | hover, 약한 강조          |
| `primary.dark`       | `#8D7EE5`                   | 눌림 상태                 |
| `text.primary`       | `#FFFDF8`                   | 제목과 본문               |
| `text.secondary`     | `#B4B4B4`                   | 메타데이터와 설명         |
| `divider`            | `rgba(226, 223, 254, 0.18)` | 최소 경계                 |
| `focus`              | `#6CA0FB`                   | 키보드 포커스 링          |

다크 모드는 검정 바탕에 보라색을 얹는 단순 반전이 아니다. 카드 사이의 레이어를 `#171126` → `#221A38` → `#3C315B` 순서로 구분한다.

### 색상 사용 규칙

- 본문 배경은 `background.default`, 실제 콘텐츠는 `background.paper`를 사용한다.
- 주요 CTA는 `primary.main` 배경과 `primary.dark` 텍스트를 사용한다.
- 어두운 CTA는 특별한 한 가지 행동에만 `#1C1C1C`과 `#FFFDF8` 조합을 허용한다.
- 선택 상태는 테두리만 바꾸지 말고 배경색, 아이콘 또는 텍스트 레이블을 함께 바꾼다.
- 그라디언트는 데이터 시각화 또는 실제 미디어 오버레이에만 사용한다. 일반 카드 배경에는 사용하지 않는다.
- 오류에 브랜드 보라색을 사용하지 않는다. 오류는 `accent.orange`, 성공은 `accent.green`으로 분리한다.

---

## 4. Typography

Phantom의 독점 서체는 사용하지 않는다. 현재 프로젝트 의존성인 `IBM Plex Sans Variable`을 기본으로 유지하고, 한국어 시스템 폰트 fallback을 반드시 둔다.

```css
font-family:
  'IBM Plex Sans Variable',
  'Pretendard Variable',
  Pretendard,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

숫자 순위와 통계는 `font-variant-numeric: tabular-nums`를 사용한다. 코드, ID, 날짜 원문 외에는 monospace를 사용하지 않는다.

### Type scale

| Role          | Desktop                    | Mobile    | Weight  | Line height | Tracking   |
| ------------- | -------------------------- | --------- | ------- | ----------- | ---------- |
| Hero display  | `clamp(56px, 5.6vw, 80px)` | `36–44px` | 400–500 | 1.04        | `-0.04em`  |
| Page title    | `40–48px`                  | `30–36px` | 500–600 | 1.08        | `-0.03em`  |
| Section title | `32–40px`                  | `26–32px` | 500–600 | 1.12        | `-0.025em` |
| Panel title   | `22–28px`                  | `20–24px` | 600     | 1.25        | `-0.015em` |
| Card title    | `17–20px`                  | `16–18px` | 600–700 | 1.35        | `-0.01em`  |
| Body          | `16px`                     | `16px`    | 400     | 1.6         | `0`        |
| UI label      | `14–15px`                  | `14–15px` | 500–600 | 1.4         | `0`        |
| Metadata      | `12–13px`                  | `12–13px` | 400–600 | 1.4         | `0.01em`   |

### 타이포그래피 규칙

- 페이지 제목은 굵기 800 대신 넓은 크기와 타이트한 자간으로 힘을 만든다.
- 게시글 제목에는 최대 두 줄 말줄임을 기본으로 하고, 펼침 상태에서 전체 제목을 제공한다.
- 긴 한국어 본문은 `word-break: keep-all`과 `overflow-wrap: anywhere`를 함께 사용한다.
- 작은 텍스트를 대문자 장식처럼 쓰지 않는다. 영문 overline은 필요한 관리 화면에만 쓴다.
- 한 줄에 70자를 넘는 요약은 읽기 폭을 제한한다.

---

## 5. Layout & Spacing

### Grid

- 최대 작업 폭: `1536px`
- 일반 콘텐츠 폭: `1092–1200px`
- 긴 본문 읽기 폭: `680–760px`
- 데스크톱 바깥 여백: `32–48px`
- 태블릿 바깥 여백: `24px`
- 모바일 바깥 여백: `20px`
- 기본 간격 단위: `4px`; 주 사용 간격은 `8, 12, 16, 24, 32, 48, 64px`

### Vertical rhythm

| Relationship       | Gap         |
| ------------------ | ----------- |
| 아이콘 ↔ 라벨     | `8px`       |
| 메타데이터 ↔ 제목 | `6–8px`     |
| 카드 내부 그룹     | `12–16px`   |
| 카드 ↔ 카드       | `12px`      |
| 패널 내부 여백     | `20–24px`   |
| 섹션 ↔ 섹션       | `64–96px`   |
| 랜딩형 대형 구간   | `120–160px` |

피드에서는 섹션 간격을 그대로 적용하지 않는다. 게시글 목록은 스캔 속도를 위해 카드 간 `12px`, 카드 내부 `16–20px`를 기준으로 한다.

### Breakpoints

프로젝트의 MUI breakpoint를 단일 기준으로 사용한다.

| Range         | Layout behavior                                         |
| ------------- | ------------------------------------------------------- |
| `<600px`      | 단일 열, 20px gutter, 전체 너비 CTA, 댓글 bottom drawer |
| `600–899px`   | 단일 콘텐츠 열, 일부 컨트롤 가로 배치, 24px gutter      |
| `900–1199px`  | 피드 우선 레이아웃, 보조 패널은 drawer 또는 접힘        |
| `1200–1535px` | 3영역 게시판, sticky Top 10과 댓글 패널                 |
| `≥1536px`     | 1536px 작업 폭을 가운데 정렬, 열 너비는 더 늘리지 않음  |

CSS와 JavaScript의 breakpoint가 어긋나지 않도록 모두 MUI theme 값을 참조한다.

---

## 6. Navigation

### Desktop

- 헤더는 캔버스와 같은 연보라 배경 위에 떠 있는 구조다.
- 로고는 왼쪽, 핵심 내비게이션은 가운데의 아이보리 캡슐, 계정 액션은 오른쪽에 둔다.
- 내비게이션 캡슐 높이는 `56–60px`, 내부 padding은 `8px`, 전체 radius는 `999px`다.
- 기본 메뉴는 `실시간 게시판`, `TOP 10`; 관리자는 `Shorts Studio`를 추가한다.
- 현재 메뉴는 작은 보라색 pill 또는 움직이는 활성 배경으로 표시한다.
- 프로필/로그인 버튼은 primary pill, 테마와 메뉴 아이콘은 48–52px 원형 버튼으로 사용한다.
- 헤더는 스크롤 시 숨길 수 있지만 키보드 focus가 들어오면 즉시 다시 보여야 한다.

### Mobile

- 좌측에는 심볼 로고, 우측에는 로그인/프로필 CTA와 원형 메뉴 버튼만 둔다.
- 메뉴는 오른쪽 또는 전체 높이 drawer로 열며 radius `24px`의 카드처럼 보이게 한다.
- 모바일 상단에 데스크톱 메뉴를 억지로 축소하지 않는다.
- 터치 대상은 최소 `44×44px`, 주요 버튼은 `48–52px` 높이를 유지한다.

---

## 7. Components

### Buttons

| Variant | Styling                                            | Use                           |
| ------- | -------------------------------------------------- | ----------------------------- |
| Primary | `#AB9FF2` bg, `#3C315B` text, 48–52px height, pill | 로그인, 저장, 확정            |
| Soft    | `#E2DFFE` bg, `#3C315B` text, pill                 | 필터, 보조 CTA                |
| Dark    | `#1C1C1C` bg, `#FFFDF8` text, pill                 | 한 화면의 가장 강한 행동 하나 |
| Ghost   | transparent bg, ink text                           | 취소, 접기, 작은 도구         |
| Icon    | 44–52px circle, paper/soft bg                      | 메뉴, 테마, 검색, 닫기        |

- hover: 배경을 한 단계 진하게 하고 `translateY(-1px)` 또는 `scale(0.985)` 중 하나만 사용한다.
- active: `scale(0.97)`.
- disabled: opacity만 낮추지 말고 muted 배경과 secondary 텍스트를 함께 사용한다.
- destructive 행동은 보라색 primary 버튼으로 표현하지 않는다.

### Cards

- 기본: `background.paper`, radius `16px`, border 없음.
- 필요한 경계: `1px solid divider` 또는 `inset 0 0 0 1px divider`.
- hover 가능한 카드: `background.raised`, `scale(0.989)`, 260ms.
- 선택 카드: `background.subtle` + 텍스트/아이콘 상태 + `aria-selected` 또는 `aria-expanded`.
- 대형 feature 카드: radius `24px`, media overflow hidden, 최소 하나의 넓은 색면.
- 카드 안에 또 같은 모양의 카드를 반복해서 중첩하지 않는다.

### Chips & filters

- chip 높이 `28–32px`, radius `999px`, padding inline `12–16px`.
- 기본 필터는 paper, 선택 필터는 primary 또는 subtle 배경을 사용한다.
- 선택된 사이트는 텍스트와 닫기 아이콘을 함께 표시한다.
- 필터가 많으면 가로 스크롤 또는 popover를 사용한다. 여러 줄로 화면 상단을 밀어내지 않는다.

### Inputs & menus

- 입력 높이 `48–52px`, muted 또는 paper 배경, radius `12–16px`.
- 포커스는 `3px` focus ring과 명확한 label로 표시한다.
- dropdown은 radius `16–24px`, paper 배경, 약한 ambient shadow를 사용한다.
- placeholder만으로 필드의 목적을 설명하지 않는다.

### Images

- 실제 크롤링 썸네일을 우선하고 `object-fit: cover`를 기본으로 한다.
- 목록 썸네일 radius는 `12px`, feature media는 `20–24px`.
- 이미지가 없으면 사이트 첫 글자 또는 카테고리 아이콘을 pastel color block 위에 표시한다.
- 깨진 이미지는 레이아웃을 유지한 채 fallback으로 교체한다.
- Phantom의 고스트, 제품 화면, 영상, 로고를 프로젝트 자산으로 복제하지 않는다.

### Feedback states

- loading: 실제 카드 구조를 닮은 muted skeleton을 사용한다.
- empty: 한 문장 설명 + 가능한 다음 행동 하나를 제공한다.
- error: orange tint, 오류 요약, `다시 시도` 행동을 함께 제공한다.
- background refresh: 기존 콘텐츠를 유지하고 작은 progress indicator만 표시한다.
- toast는 보조 피드백이며, 중요한 오류를 toast에만 두지 않는다.

---

## 8. Page Blueprints

### `/` — 라이브 홈

- 히어로는 큰 한국어 헤드라인과 실제 이슈 데이터에서 온 원형 신호를 함께 보여준다.
- 기존 사각형 트리맵은 팩 서클 기반의 `실시간 시그널 필드`로 대체한다.
- 버블 면적은 영향력, 색은 상승세, 맥박 속도는 상승 속도를 나타내며 같은 정보를 텍스트로도 제공한다.
- 버블은 hover, focus, touch에 반응하고 선택 시 해당 카테고리로 필터된 `/board`로 연결한다.
- 자동 드리프트, 휘도는 하나의 조합된 데이터 모션 시스템으로 취급하고 동시에 보이는 별도의 자동 모션은 추가하지 않는다.

### `/board` — 실시간 게시판

Desktop:

```text
┌──────────── Top 10 / tools ────────────┬──────────── live feed ────────────┬──────── comments ────────┐
│ sticky · 280–320px                     │ fluid · min 0                     │ sticky · 280–320px       │
│ 오늘의 순위                            │ issue overview / filters          │ 선택한 글의 댓글          │
│ compact rows                           │ post cards                         │ empty state               │
└────────────────────────────────────────┴───────────────────────────────────┴───────────────────────────┘
```

- 중앙 피드가 시각적 우선순위 1이다.
- 이슈 overview는 Phantom의 feature card처럼 넓은 컬러 블록으로 구성하되 데이터 의미를 유지한다.
- 게시글 카드는 제목과 메타데이터를 먼저, 반응 수와 이미지가 그 다음에 읽히게 한다.
- 카드 선택 시 요약을 내부에서 펼치고 선택 surface를 subtle purple로 전환한다.
- desktop 댓글은 우측 sticky 패널, content-first 구간에서는 명시적 행동으로 drawer를 연다.

Mobile:

- Top 10과 도구는 피드 위의 접을 수 있는 soft panel로 이동한다.
- 게시글 탭은 요약만 펼친다.
- 댓글은 별도 `댓글 열기` 버튼으로만 bottom drawer를 연다.
- 이미지가 본문 너비를 밀어내지 않도록 기본 `72×72px`, 펼침 시 전체 폭 preview를 사용한다.

### `/top10/` — 일간 Top 10

- 페이지 제목은 큰 editorial heading으로, 날짜 선택은 오른쪽 또는 다음 줄의 pill control로 둔다.
- 순위 목록 전체는 하나의 24px panel이며 각 행마다 독립 카드 테두리를 반복하지 않는다.
- 1–3위는 primary/blue/green rank tile로 강조하고, 4–10위는 soft purple을 사용한다.
- 행을 펼치면 요약, 실제 이미지, 원문, 댓글 행동을 제공한다.
- `?rank=N` deep link의 자동 펼침과 분석 요청을 유지한다.
- mobile 행동은 세로로 쌓되 `원문 바로가기`와 `댓글 열기`를 서로 다른 버튼으로 유지한다.

### Comments

- 댓글 본문은 paper, 작성 폼은 raised surface로 구분한다.
- 댓글 작성 CTA만 primary로 사용하고 좋아요/답글/메뉴는 ghost로 낮춘다.
- 긴 스레드는 들여쓰기를 무한히 늘리지 않고 두 단계 이후 선과 배경으로 구분한다.
- drawer는 상단 모서리 radius `24px`, 명확한 drag handle/닫기 버튼, focus trap을 제공한다.

### Account & admin

- 계정 화면은 680–760px 읽기 폭의 단일 열을 기본으로 한다.
- 관리 화면도 같은 토큰을 사용하되 데이터 표와 생성 도구의 밀도는 유지한다.
- 관리 기능을 마케팅형 대형 카드로 과장하지 않는다.

---

## 9. Motion & Interaction

### Timing

| Motion            | Duration    | Easing                         |
| ----------------- | ----------- | ------------------------------ |
| hover / color     | `150ms`     | `cubic-bezier(.25, 1, .5, 1)`  |
| card / indicator  | `260ms`     | `cubic-bezier(.22, 1, .36, 1)` |
| collapse / drawer | `300–400ms` | `cubic-bezier(.22, 1, .36, 1)` |
| theme transition  | `300ms`     | ease                           |

### Rules

- 모션은 계층, 선택, 공간 변화를 설명해야 한다.
- hover scale은 `0.985–0.995` 범위를 넘지 않는다.
- 한 화면에서 자동 재생하는 장식 모션은 하나 이하로 제한한다.
- 하나의 데이터 필드 안에서 같은 메트릭을 설명하는 드리프트·맥박·휘도는 하나의 조합된 모션으로 간주한다.
- 목록 항목을 순차적으로 늦게 등장시키지 않는다. 실시간 피드의 읽기 속도를 방해한다.
- `prefers-reduced-motion: reduce`에서는 transform, smooth scroll, 자동 재생을 끈다.
- drawer가 열리면 focus를 내부로 이동하고 닫힌 뒤 실행 버튼으로 돌려보낸다.

---

## 10. Depth & Elevation

| Level | Treatment                            | Use                         |
| ----- | ------------------------------------ | --------------------------- |
| 0     | canvas color only                    | 페이지 배경                 |
| 1     | paper on lavender, no shadow         | 일반 카드, 피드             |
| 2     | raised surface + `0 0 0 1px divider` | 선택, 입력, 내부 패널       |
| 3     | `0 12px 40px rgba(60, 49, 91, .14)`  | 메뉴, popover, floating nav |
| 4     | `0 24px 64px rgba(13, 6, 33, .24)`   | modal, drawer               |

- 동일한 화면에서 Level 3 이상 shadow를 세 곳 이상 사용하지 않는다.
- 작은 카드에 큰 그림자를 적용하지 않는다.
- glassmorphism, neon glow, 과한 blur는 사용하지 않는다.

---

## 11. Accessibility

- 일반 텍스트는 WCAG AA 4.5:1, 큰 텍스트와 UI 아이콘은 3:1 이상을 만족한다.
- 키보드 포커스는 `3px solid focus`, offset `2–3px`로 표시한다.
- hover에서만 드러나는 기능을 만들지 않는다.
- 모든 icon-only button에 한국어 `aria-label`을 제공한다.
- loading 상태는 `aria-live="polite"`; 치명적 오류만 assertive를 고려한다.
- touch target은 최소 `44×44px`.
- 드로어와 모달은 focus trap, Escape 닫기, focus return을 지원한다.
- rank, 성공/실패, 읽음/선택 상태는 텍스트 또는 아이콘을 함께 사용한다.
- 콘텐츠 이미지가 정보 전달 목적이면 대체 텍스트를 제공하고, 장식이면 빈 `alt`를 사용한다.

---

## 12. MUI Implementation Map

```text
palette.primary.main         → #AB9FF2
palette.primary.light        → #E2DFFE
palette.primary.dark         → #3C315B
palette.background.default   → #F5F2FF
palette.background.paper     → #FFFDF8
palette.background.subtle    → #E2DFFE
palette.background.muted     → #F4F2F4
palette.background.raised    → #FFFFFF
palette.text.primary         → #3C315B
palette.text.secondary       → #6E6E6E
palette.divider              → rgba(60, 49, 91, .14)
shape.borderRadius           → 16
```

Component overrides:

- `MuiButton`: pill by default, 48px minimum height, no uppercase transform.
- `MuiCard`: radius 16, no default shadow, no mandatory outline.
- `MuiPaper`: radius 16; menu/dialog는 elevation level에 맞춰 shadow 적용.
- `MuiChip`: radius 999, 28–32px height.
- `MuiOutlinedInput`: radius 14, muted background, 3px focus ring.
- `MuiIconButton`: circular by default; 카드 내부의 compact action만 12px radius 허용.
- `MuiDrawer`: 모바일 top corners 24px, desktop navigation drawer 24px panel.

색상 값을 개별 컴포넌트에 직접 쓰지 말고 theme token을 사용한다. 예외는 데이터 시각화의 명시적인 accent scale뿐이다.

---

## 13. Do / Don't

### Do

- 연보라 캔버스 위에 아이보리 콘텐츠 surface를 올린다.
- 큰 제목은 얇고 넓게, 목록 제목은 작고 단단하게 쓴다.
- 내비게이션과 CTA는 pill, 콘텐츠는 16–24px rounded panel로 구분한다.
- 실제 콘텐츠 이미지와 색면을 함께 사용해 리듬을 만든다.
- hover보다 선택/확장/오류 같은 실제 상태를 더 분명히 표현한다.
- 모바일에서는 피드와 요약을 먼저 보여준다.

### Don't

- Phantom 로고, 고스트 캐릭터, 영상, 카피, 독점 폰트를 복제하지 않는다.
- 예전 올리브/세이지/오렌지 hover 체계를 섞지 않는다.
- 모든 카드에 회색 1px 테두리와 4px radius를 적용하지 않는다.
- 보라색 그라디언트, glow, glass surface를 남발하지 않는다.
- 작은 화면에서 3열 구조를 축소해서 유지하지 않는다.
- 게시글을 누르는 것만으로 모바일 댓글 drawer를 열지 않는다.
- 상태를 toast, 색상, hover 중 하나에만 의존하지 않는다.

---

## 14. Review Checklist

디자인 또는 UI 변경을 완료하기 전에 확인한다.

- [ ] 캔버스, surface, text, accent가 정의된 theme token을 사용하는가?
- [ ] 한 영역에 강한 primary action이 하나 이하인가?
- [ ] border 대신 surface와 spacing으로 계층이 먼저 드러나는가?
- [ ] desktop, tablet, mobile에서 읽는 순서가 자연스러운가?
- [ ] mobile 게시글 선택과 `댓글 열기` 행동이 분리되어 있는가?
- [ ] `/top10/?rank=N` deep link가 해당 행을 펼치는가?
- [ ] loading, empty, error, background refresh 상태가 모두 있는가?
- [ ] keyboard focus와 44px touch target을 만족하는가?
- [ ] light/dark scheme 모두에서 대비를 확인했는가?
- [ ] `prefers-reduced-motion`을 존중하는가?
- [ ] Phantom의 자산을 복제하지 않고 분위기만 재해석했는가?
- [ ] `yarn check`와 관련 UI contract script를 통과했는가?
