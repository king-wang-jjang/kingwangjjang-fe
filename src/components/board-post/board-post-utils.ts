import type { BoardPost } from 'src/api/board-api';

import { CONFIG } from 'src/config-global';

const DEFAULT_GPT_ANSWER = 'GPT 생성 중입니다. 이미지가 많은 경우 오래 걸립니다.';

export function resolveThumbnailSrc(thumbnail?: string | null) {
  const trimmedThumbnail = thumbnail?.trim();
  if (!trimmedThumbnail) {
    return '';
  }

  const thumbnailPath = trimmedThumbnail.split(/[?#]/, 1)[0].replace(/\\/g, '/').toLowerCase();
  const fileName = thumbnailPath.split('/').pop();
  if (
    fileName === 'icon_app_20160427.png' ||
    fileName === 'cdn_img_404.jpg' ||
    /\.(?:m3u8|m4v|mov|mp4|webm)$/.test(thumbnailPath)
  ) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedThumbnail)) {
    return trimmedThumbnail;
  }

  const imageServerUrl = CONFIG.imageServerUrl.replace(/\/+$/, '');
  const normalizedThumbnailPath = trimmedThumbnail.replace(/\\/g, '/').replace(/^\/+/, '');

  return `${imageServerUrl}/${normalizedThumbnailPath}`;
}

export function getPostSummary(post: BoardPost) {
  const summary = typeof post.gptAnswer === 'string' ? post.gptAnswer.trim() : '';
  return summary && summary !== DEFAULT_GPT_ANSWER ? summary : '';
}
