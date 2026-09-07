# Kingwangjjang Design System

> Phantom-inspired editorial dashboard · v2.2 · 2026-09-07

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

**1차 적용 페이지는 `/` 홈이다.** 홈의 레퍼런스·화면 배치·반응형 동작은 아래 `8. Page Blueprints`의 `/ — 홈 전용 레퍼런스와 ASCII Design` 절을 우선 기준으로 사용한다. 공통 토큰은 홈에 한정해 적용하며, 다른 페이지는 별도 적용 단계로 둔다.

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

### `/` — 홈 전용 레퍼런스와 ASCII Design

> 조사·작성: 2026-09-07. 1차 UI 적용 대상은 `/` 홈이다. 아래는 현재 홈의 데이터와 동작을 바탕으로 만든 **후속 구현용 설계안**이다.

#### 목적과 현재 구성

홈에서 `최근 어떤 태그가 활발한가 → 어느 커뮤니티에서 나오는가 → 어떤 글을 읽을까`를 순서대로 파악하게 한다. 현재 구성은 [홈 라우트](src/app/page.tsx)와 [HomeView](src/sections/home/view/home-view.tsx), 각 하위 컴포넌트의 코드를 확인했다.

현재 홈은 `ActivityStory → CrossCommunityStory → TrendingPostFeed → footer` 순서다. 동향은 히어로·입자·태그 관계·순위·1위 태그를 같은 sticky 화면에서 전환하고, 출처 분포는 중앙 태그 주변에 출처 카드를 배치한다. 인기글은 데스크톱에서 목록과 미리보기가 2열이다.

새 설계의 방향은 **첫 화면에서 실제 태그와 집계 수치를 보여주는 커뮤니티 동향 홈**이다. 아래 레퍼런스의 정보 구성과 인터랙션을 우리 데이터에 맞게 조합한다.

#### `/`에 맞는 디자인 레퍼런스

확인일은 모두 2026-09-07이다. 공식 페이지와 설명에서 확인한 정보 구조를 기준으로 선정했다. `확인한 패턴`은 레퍼런스의 관찰 내용이고, `홈 적용안`은 이 사이트에 맞춘 설계 판단이다.

| 레퍼런스                                                                                                                                                                                | 확인한 패턴                                                                                                                               | 이 사이트에 맞는 이유와 홈 적용안                                                                                                                            | 채택 범위                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1. [Google Trends — 실시간 인기](https://trends.google.com/trending?geo=KR&hl=ko)**                                                                                                  | 집계 범위를 상단에 표시하고, 항목별 규모·증감·시각·관련 검색어를 함께 비교한다.                                                           | 최근 24시간 AI 태그 통계와 목적이 가깝다. 히어로의 집계 기간·갱신 시각, 태그 순위의 게시글 수·증가율·Activity Score를 명확히 정렬한다.                       | **주 레퍼런스: 동향·순위.** 우리 데이터의 단위는 수집 게시글이다. 기간은 API 응답값을 표시하며 새 기간 필터·검색량·시계열 그래프를 추가하지 않는다. |
| **R2. [Ground News](https://ground.news/), [제품 소개](https://ground.news/product)**                                                                                                   | 이야기에 여러 출처를 묶고 제목과 출처 수·coverage를 함께 보여준다.                                                                        | 여러 커뮤니티를 모아 보여주는 서비스의 특징을 설명하기 좋다. 1위 태그 옆에 출처별 게시글 수·비중·대표 제목을 배치하고 해당 출처로 연결한다.                  | **주 레퍼런스: 출처 비교.** 우리 출처 비중은 태그 게시글 수 기준이다. 정치성향·신뢰도 같은 새로운 평가 지표는 설계에 포함하지 않는다.               |
| **R3. [The Pudding — When Women Make Headlines](https://pudding.cool/2022/02/women-in-headlines/), [공식 스토리텔링 설명](https://pudding.cool/process/how-to-make-dope-shit-part-3/)** | 단어 빈도와 그룹을 시각화하고, 설명·비교·실제 제목 사례로 데이터 의미를 풀어낸다. 스크롤에 따라 하나의 차트를 변화시키는 구성도 설명한다. | 태그 관계를 이해한 뒤 출처와 실제 글로 이어지는 현재 홈 흐름에 맞는다. 그래프 곁에 범례와 짧은 설명을 두고, 태그가 순위로 바뀔 때 같은 대상을 추적하게 한다. | **보조 레퍼런스: 데이터 설명·전환.** 첫 화면에 데이터를 표시하고 순위는 바로 읽게 한다. 장면 전환은 이를 돕는 짧은 효과로 사용한다.                 |
| **R4. [GitHub Trending](https://github.com/trending?since=daily)**                                                                                                                      | 목록 항목에 제목·짧은 설명·보조 지표를 반복되는 순서로 배치하고 기간 기준을 표시한다.                                                     | 매일 바뀌는 인기글 10개를 빠르게 비교하기 좋다. 출처·시간·제목·태그가 일정한 위치에서 읽히는 목록을 만들고 현재 선택 미리보기 동작을 유지한다.               | **보조 레퍼런스: 인기글 목록.** 별·포크 등 원본 제품 지표를 가져오지 않는다. 목록+미리보기 2열은 우리 홈의 기존 동작을 발전시킨 구성이다.           |

조합 기준은 `R1의 지표 비교 + R2의 출처 맥락 + R3의 시각화 설명 + R4의 목록 가독성`이다. 공통 색상·서체·라운드는 이 문서의 토큰을 사용한다. 레퍼런스의 브랜드 자산이나 기사·이미지를 서비스 콘텐츠로 가져오지 않는다.

#### 현재 화면에서 바꿀 구성

| 영역      | 현재 구성                                  | `/` 적용 목표                                                                 |
| --------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| 첫 화면   | 큰 히어로를 거쳐 그래프와 순위가 순차 등장 | 제목·집계 기준·실제 태그 필드를 함께 표시하고 통계 4개를 같은 화면에 배치     |
| 태그 순위 | 스크롤 장면 중 하나로 나타남               | 그래프 아래에서 바로 읽고 클릭할 수 있는 순위 목록 제공                       |
| 출처 분포 | 중앙 태그와 주변 카드가 스크롤로 펼쳐짐    | 왼쪽 태그 요약, 오른쪽 출처별 비교 행. 모바일은 요약 아래 비교 행을 세로 배치 |
| 인기글    | 목록과 선택 미리보기, 인기·반응·최신 정렬  | 동작을 유지하면서 제목·출처·태그·지표의 위치와 간격을 정돈                    |
| 모바일    | 섹션마다 719/760/780/900px 기준이 혼재     | MUI breakpoint에 맞춰 아래 세로 배치로 통일                                   |

#### ASCII 작성 규칙

- 화면 배치는 `text` 코드 블록의 ASCII 도식으로 정의한다. 영역은 `+ - |`, 연결은 `- / \\`, 이동은 `->` 또는 `v`, 버튼·링크는 `[Label]`, 선택은 `*` 또는 `>`, 데이터는 `{placeholder}`로 표현한다.
- 도식 내부는 출력 가능한 ASCII 문자와 공백만 사용한다. 영어 라벨을 사용하고 실제 한국어 문구는 블록 밖에 정의해 정렬을 유지한다. 박스 도식은 데스크톱 90자, 모바일 42자 이내로 작성한다.
- 이미지 위치는 `[Image]`로 표시한다. 이 설계의 검토 자료는 ASCII 도식과 설명으로 완결하며, 이미지·SVG·Mermaid·HTML/CSS 목업을 필수 자료로 두지 않는다.
- 박스 선은 영역 경계, 막대는 데이터 표현의 자리표시자다. 선을 실제 카드 테두리로 일괄 구현하거나 예시 막대를 실측 수치로 사용하지 않는다.
- 배치를 바꿀 때 데스크톱·모바일·선택·오류 상태와 이동 경로를 함께 갱신한다.

#### Desktop ASCII — 첫 화면과 태그 순위

`>=1200px` 기준. 최대 작업 폭 1536px, 바깥 여백 32–48px, 주요 열 간격 24px를 사용한다. 헤더는 `동향 / 출처별 / 인기글 / 게시판`, 제목은 `최근 24시간 커뮤니티 동향`, 설명은 `수집한 게시글의 AI 태그를 기준으로 언급량, 증감, 출처 분포를 집계합니다.`로 둔다. 주요 행동은 `인기글 바로 보기`, 보조 행동은 `실시간 게시판`이다.

```text
+----------------------------------------------------------------------------------------+
| [Logo: /]     [Pulse] [Sources] [Popular] [Board]     [Theme] [Login / Profile]        |
+----------------------------------------------------------------------------------------+

+------------------------------------+  +----------------------------------------------+
| 01  COMMUNITY REPORT               |  | TAG FIELD / REAL DATA                        |
| Last {hours}h / Updated {time}     |  |                                              |
|                                    |  |         (Tag B)          (Tag D)             |
| LAST 24 HOURS                      |  |            \              /                  |
| COMMUNITY REPORT                   |  |  (Tag C)---(  Tag A  )---(Tag E)             |
|                                    |  |                                              |
| {short_description}                |  | Node size = post count                       |
|                                    |  | Line = known related tag                     |
| [Popular posts v]                  |  | Position = relative Activity                 |
| [Open board ->]                    |  | [Tag] -> /board?tag={tag}                    |
+------------------------------------+  +----------------------------------------------+

+----------------------------------------------------------------------------------------+
| {posts} ANALYZED POSTS | {tags} AI TAGS | {links} LINKS | {sources} VISIBLE SOURCES    |
+----------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------+
| 02  TAG RANKING / Last {hours}h                                                        |
|                                                                                        |
| RANK  TAG          POSTS       GROWTH        ACTIVITY                SOURCES           |
| 01    [Tag A]      {count}      {growth}%     [########..] {score}     {count}         |
| 02    [Tag B]      {count}      {growth}%     [######....] {score}     {count}         |
| 03    [Tag C]      {count}      {growth}%     [####......] {score}     {count}         |
| ...   up to 7 rows                                                                     |
|                                                                                        |
| Activity compares tags within this response. [Tag] -> filtered board                   |
+----------------------------------------------------------------------------------------+
```

히어로의 제목과 태그 필드는 약 5:7 비율이며, 통계는 `분석 게시글 / AI 태그 / 태그 연결 / 표시 출처` 순서다. 태그 필드는 최대 16개, 바로 아래 순위는 최대 7개를 표시한다. 원 크기는 게시글 수, 연결선은 API의 관련 태그, 중심 거리는 상대 Activity Score를 나타낸다. 증가율·점수·게시글 수는 텍스트로도 읽을 수 있어야 한다.

순위는 문서 흐름 안에서 접근할 수 있게 둔다. 히어로 전용 긴 스크롤 구간 없이 그래프와 순위를 읽게 하며, 시각화가 준비되기 전이나 모션 감소 설정에서는 정적 태그 목록을 제공한다.

#### Desktop ASCII — 출처별 분포

`#{태그} 출처별 게시글 분포`를 제목으로 사용한다. 대상은 현재 응답의 1위 태그다. 출처는 API에서 제공하는 최대 6개를 표시하며 각 비중은 해당 태그 전체 게시글 수를 분모로 사용한다. 표시된 출처 비중의 합을 억지로 100%로 재조정하지 않는다.

```text
+------------------------------------+  +----------------------------------------------+
| 03  SOURCE DISTRIBUTION            |  | SOURCE ROWS / UP TO 6                        |
| #{top_tag}                         |  |                                              |
| Last {hours}h / Updated {time}     |  | [Site A]  {count} posts / {share}%           |
|                                    |  | [######......]                               |
| #1  {top_tag}                      |  | {representative_title OR no linked post}     |
| ACTIVITY {score}                   |  | [View this source ->]                        |
| {posts} posts                      |  | -------------------------------------------- |
| {sources} visible sources          |  | [Site B]  {count} posts / {share}%           |
| {growth}% change                   |  | [####........]                               |
|                                    |  | {representative_title OR no linked post}     |
| {scope_note}                       |  | [View this source ->]                        |
+------------------------------------+  | ... only sources returned by the API         |
                                        +----------------------------------------------+
```

출처 행의 행동은 `이 출처에서 보기`다. 대표 제목은 기존 데이터에서 태그와 출처가 모두 일치하는 Top 10 글을 사용하며, 연결된 글이 없으면 `연결된 Top 10 글 없음`을 표시한다. 태그·출처 필터를 함께 전달해 해당 게시판으로 이동한다.

#### Desktop ASCII — 인기글과 푸터

제목은 `오늘의 인기글`, 정렬은 `인기 / 반응 / 최신`이다. 목록과 선택 미리보기는 약 5:7 비율로 배치한다. 처음에는 현재 정렬의 첫 글을 선택하고, 이후 사용자 선택을 유지한다.

```text
+----------------------------------------------------------------------------------------+
| 04  TODAY'S POPULAR POSTS                                  Top tag: #{top_tag}         |
| [Popular *] [Reaction] [Latest]                            {sort_description}          |
+----------------------------------------------------------------------------------------+

+------------------------------------+  +----------------------------------------------+
| RANKED LIST / UP TO 10             |  | SELECTED PREVIEW / STICKY                    |
|                                    |  |                                              |
| > 01  {site} / {time}              |  | [Image OR site-initial fallback]             |
|       {title}                      |  | Original TOP 10 rank: #{original_rank}       |
|       #tag_1 #tag_2                |  |                                              |
|                                    |  | {site} / {time}                              |
|   02  {site} / {time}              |  | {full_title}                                 |
|       {title}                      |  | #tag_1 #tag_2 ...                            |
|       #tag_1 #tag_2                |  |                                              |
|                                    |  | AI SUMMARY                                   |
|   ...                              |  | {summary}                                    |
|                                    |  |                                              |
|   10  {site} / {time}              |  | {available_post_metrics}                     |
|       {title}                      |  |                                              |
|                                    |  | [View rank details ->]                       |
| [View all Top 10 ->]               |  | [Original source ->]                         |
+------------------------------------+  +----------------------------------------------+

+----------------------------------------------------------------------------------------+
| 05  FOOTER                                                                             |
| [Brand / collection + summaries + tags]    [Activity explanation] [Open board ->]      |
+----------------------------------------------------------------------------------------+
```

목록의 출처·시간·제목·태그는 일정한 순서로 읽히게 한다. 미리보기에는 전체 제목·요약·제공된 지표를 표시하며 이미지 실패 시 사이트 첫 글자를 사용한다. `N위 글 자세히 보기`는 원래 Top 10 순위를 보존한다. `반응 / 최신`은 현재 받아 온 Top 10 안에서만 재정렬한다.

푸터 문구는 `커뮤니티 게시글 수집·요약·태그 통계`와 Activity Score 설명, `실시간 게시판으로` 링크로 구성한다. 게시글 읽기 흐름의 마지막 안내로 간결하게 둔다.

#### Mobile ASCII — 전체 세로 배치

`<900px`에서는 제목·통계·태그·순위·출처·인기글 순서의 세로 배치를 사용한다. `<600px`은 20px 여백, `600–899px`은 24px 여백이다. `900–1199px`에서는 헤더 메뉴와 히어로 2열을 사용할 수 있으며, 출처와 인기글은 세로 배치를 유지한다. `>=1200px`부터 위 데스크톱 도식을 적용한다.

```text
+----------------------------------------+
| [Logo]   [Theme] [Login] [Menu]        |
|                                        |
| 01  COMMUNITY REPORT                   |
| Last {hours}h / Updated {time}         |
| LAST 24 HOURS                          |
| COMMUNITY REPORT                       |
| {short_description}                    |
| [Popular posts v] [Open board ->]      |
|                                        |
| {posts} posts     {tags} tags          |
| {links} links     {sources} sources    |
|                                        |
| TAG FIELD / up to 10 nodes             |
|    (B)---(A)---(C)                     |
|           |                            |
|          (D)                           |
|                                        |
| 02  TAG RANKING / up to 5 rows         |
| [01 Tag A | {posts} | {growth}%]       |
| [Activity ######.... | {score}]        |
| [02 Tag B | {posts} | {growth}%]       |
| [Activity ####...... | {score}]        |
| ...                                    |
|                                        |
| 03  SOURCE DISTRIBUTION                |
| [#1 {top_tag} / {score} / {posts}]     |
| [Site A | {count} | {share}%]          |
| [######......] {representative}        |
| [View this source ->]                  |
| [Site B | {count} | {share}%]          |
| [####........] {representative}        |
| [View this source ->]                  |
| ... up to 6 source rows                |
|                                        |
| 04  TODAY'S POPULAR POSTS              |
| [Popular *] [Reaction] [Latest]        |
| {sort_description}                     |
| [01 {site} / {title} / #tags]          |
| [02 {site} / {title} / #tags]          |
| ...                                    |
| [10 {site} / {title} / #tags]          |
|                                        |
| SELECTED PREVIEW                       |
| [Image OR fallback]                    |
| {original_rank} / {site} / {time}      |
| {full_title} / {tags}                  |
| {AI summary} / {metrics}               |
| [View rank details ->]                 |
| [Original source ->]                   |
| [View all Top 10 ->]                   |
|                                        |
| 05  FOOTER                             |
| {brand / service_description}          |
| {Activity explanation}                 |
| [Open board ->]                        |
+----------------------------------------+
```

모바일 태그 필드는 최대 10개, 순위는 최대 5개다. 출처는 한 행씩 표시해 사이트명·비중·대표 제목이 좁아지지 않게 한다. 현재 모바일에서 숨기던 다섯 번째·여섯 번째 출처도 응답에 있으면 세로 흐름에 포함한다.

인기글은 목록 다음에 선택 미리보기를 둔다. 터치·포인터로 선택하면 미리보기를 화면에 보여주며, 키보드 선택에서는 포커스를 빼앗지 않는다. 메뉴·테마·계정 버튼은 최소 44px 터치 영역, 미리보기의 주요 버튼은 전체 너비를 확보한다.

#### 행동과 이동 경로

```text
[Pulse]                           -> #community-pulse (report + tag ranking)
[Sources]                         -> #cross-community
[Popular] / [Popular posts]       -> #popular-feed
[Board] / [Open board]            -> /board
[Tag node] / [Tag ranking row]    -> /board?tag={encoded_tag}
[Source row]                      -> /board?tag={encoded_tag}&sites={encoded_site}
[Popular / Reaction / Latest]     -> reorder the same Top 10 response
[Post row]                        -> update selected preview
                                     + show preview on mobile pointer/touch
[View rank details]               -> /top10?rank={original_rank}
[View all Top 10]                 -> /top10
[Original source]                 -> valid original URL / new tab
[Menu]                            -> [Community] [Board] [Top 10] [+ admin items]
```

홈의 글 선택은 미리보기 갱신이다. 댓글은 상세 화면에서 확인한다. 로그인 사용자는 프로필 액션을 제공하며 관리 메뉴는 기존 권한에 따라 표시한다.

#### 상태와 모션

```text
+----------------------------------------------------------------------------------------+
| LOADING     [Title ........] [Metrics ....] [Topic / row placeholders ........]        |
| EMPTY       [No data for this section] [Open board ->]                                 |
| ERROR       [Could not load this section] [Open board ->]                              |
| REFRESH     [Existing content remains visible] [Update status]                         |
| NO IMAGE    [Site initial / preserve image area]                                       |
| NO SUMMARY  [Summary not available]                                                    |
| NO METRIC   [Omit unavailable metric; preserve real zero]                              |
| SELECTED    [> Selected row] -> [Preview for the same post]                            |
|                                                                                        |
| REDUCED MOTION / SHORT VIEWPORT                                                        |
| [Report + metrics] -> [Static tags / ranking] -> [Sources] -> [Posts] -> [Footer]      |
+----------------------------------------------------------------------------------------+
```

동향과 인기글 API의 로딩·오류 상태를 독립적으로 표시한다. 일부 데이터가 없어도 다른 섹션은 계속 읽을 수 있어야 한다. 실제 0은 표시하고 누락된 지표는 숨긴다. 갱신 중 기존 콘텐츠를 유지하며 갱신 실패는 해당 영역에 안내한다.

모션은 태그 관계와 순위의 연결, 선택 미리보기 갱신을 이해하는 데 사용한다. `prefers-reduced-motion: reduce` 또는 화면 높이 700px 이하에서는 정적 배치로 읽게 하고, 모션 감소 시 부드러운 스크롤을 끈다. Activity Score가 현재 응답 안의 상대 지표라는 설명을 동향과 푸터에 유지한다.

#### `/` 1차 구현 범위와 확인 기준

직접 적용 위치는 [HomeView](src/sections/home/view/home-view.tsx), [ActivityStory](src/sections/home/activity/activity-story.tsx), [CrossCommunityStory](src/sections/home/activity/cross-community-story.tsx), [TrendingPostFeed](src/sections/home/activity/trending-post-feed.tsx)와 각 홈 CSS module이다. 헤더 조정은 [AppShell](src/layouts/app-shell.tsx)의 기존 `isHomeRoute` 분기 안에서 처리한다. 이 1차 작업의 스타일은 홈 내부에 한정한다.

- [ ] 390px, 768px, 1024px, 1440px, 1920px에서 위 배치와 읽는 순서를 확인한다.
- [ ] 첫 화면에서 집계 기간·갱신 시각·통계·실제 태그 또는 로딩 상태를 확인할 수 있다.
- [ ] 태그 선택과 출처 선택이 각각 올바른 `tag`, `sites` 필터로 이동한다.
- [ ] 인기글 정렬과 선택 미리보기가 동작하고 `/top10?rank=N`에 원래 순위를 전달한다.
- [ ] 데이터 없음·부분 오류·이미지 실패·키보드 탐색·모션 감소 상태에서도 읽기와 이동이 가능하다.
- [ ] `/board`, `/top10`, 계정·관리 화면의 배치와 공유 테마를 이번 홈 구현 범위로 확장하지 않는다.

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
