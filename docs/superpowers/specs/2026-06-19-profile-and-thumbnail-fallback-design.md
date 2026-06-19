# Profile and Thumbnail Fallback Design

## Goal

Improve the authenticated profile experience with common account features that fit Kingwangjjang's board-reading workflow, and make crawler thumbnails more reliable by using page metadata when no stored body image is available.

## Profile Scope

The Kakao account remains the source of truth for provider identity, nickname, and profile image. Kingwangjjang adds one local editable field: `displayName`. Comments and account UI should prefer `displayName`, then Kakao nickname, then a generated fallback.

The profile menu keeps the compact avatar entry. The account settings page becomes a focused account surface with:

- Profile summary with avatar, provider, user id, and join date.
- Editable display name form with validation.
- Provider profile details, including Kakao nickname and image URL.
- Local reading stats from the existing read store.

The account history page uses the existing local read store to show recently read posts from currently loaded board data. This avoids adding a server-side activity system before the product needs it.

## API And Data Flow

User service adds nullable `display_name` storage and returns it from `GET /api/users/me` as `displayName`. It also exposes `PATCH /api/users/me` for authenticated users to update the local display name.

The frontend adds `updateMeProfile({ displayName })`, stores the returned user in Zustand, and reuses the same display-name preference in the app shell, account pages, and comment composer.

## Thumbnail Fallback

Current thumbnail extraction only uses the first stored image block in `contents`. The crawler will add a metadata image fallback:

- Parse `og:image`, `twitter:image`, `twitter:image:src`, and `link rel="image_src"` from the post page.
- Normalize relative and protocol-relative URLs against the post URL.
- Store the metadata image URL directly in `thumbnail` only when there is no saved local image.
- Keep saved body images preferred because they are already mirrored under the configured image server.

The frontend thumbnail resolver will accept absolute `http` and `https` thumbnails directly, while continuing to prefix relative media paths with `NEXT_PUBLIC_IMAGE_SERVER_URL`.

## Error Handling

Profile updates reject anonymous users and invalid display names. Blank values clear the local display name and fall back to Kakao nickname. Overlong names are rejected before storage.

Metadata thumbnail extraction is best-effort. Parsing failures or missing metadata leave `thumbnail` empty and preserve the current site-letter fallback UI.

## Testing

Backend tests cover profile response shape, display name update, validation, and anonymous update rejection. Crawler tests cover metadata image extraction and database fallback precedence. Frontend contract checks cover the account profile UI, update API, display-name preference, read history, and absolute thumbnail handling.
