'use client';

import Link from 'next/link';

import { useColorScheme } from '@mui/material/styles';

import { useAuthStore } from 'src/store/auth-store';
import { resolveApiBaseUrl } from 'src/api/api-base-url';

import { isAdmin } from 'src/auth/permissions';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-text-header.module.css';

const pageLinks = [
  { label: '게시판', href: '/board' },
  { label: 'Top 10', href: '/top10' },
];

const sectionLinks = [
  { label: '태그', href: '#tag-rankings' },
  { label: '출처', href: '#cross-community' },
  { label: '인기글', href: '#popular-feed' },
];

export function HomeTextHeader() {
  const { isAuthenticated, user, authStatus } = useAuthStore();
  const { mode, systemMode, setMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDarkMode = resolvedMode === 'dark';

  return (
    <header className={`app-header ${styles.header}`} data-home-text-header>
      <div className={styles.row}>
        <div className={styles.brandNavigation}>
          <Link href="/" className={styles.brand} aria-label="마약.kr 홈으로 이동">
            마약.kr
          </Link>
          <nav className={styles.pageLinks} aria-label="전체 보기">
            {pageLinks.map((item) => (
              <Link key={item.href} href={item.href} className={styles.pageLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={`header-login-actions ${styles.actions}`}>
          <button
            type="button"
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
          >
            [{isDarkMode ? '밝게' : '어둡게'}]
          </button>

          {authStatus === 'checking' ? (
            <span className={styles.status} role="status">
              [로그인 확인 중...]
            </span>
          ) : isAuthenticated && user ? (
            <details className={styles.account}>
              <summary>[계정]</summary>
              <div className={styles.accountContent}>
                <span className={styles.identity}>
                  {user.displayName || user.nickname || `카카오 사용자 ${user.userId}`}
                </span>
                <Link href="/account/settings">[설정]</Link>
                <Link href="/account/history">[기록]</Link>
                {isAdmin(user) && (
                  <>
                    <Link href="/admin/shorts">[Shorts Studio]</Link>
                    <Link href="/admin/resources">[AI Resource]</Link>
                  </>
                )}
              </div>
            </details>
          ) : (
            <button
              type="button"
              className="kakao-login-button"
              aria-label="카카오 로그인"
              onClick={() => {
                window.location.href = `${resolveApiBaseUrl()}/login`;
              }}
            >
              [로그인]
            </button>
          )}
        </div>
      </div>
      <div className={styles.navigation}>
        <nav className={styles.navigationRow} aria-labelledby="home-section-links-label">
          <span id="home-section-links-label" className={styles.navigationLabel}>
            이 페이지
          </span>
          <div className={`${styles.navigationLinks} ${styles.sectionLinks}`}>
            {sectionLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                [{item.label}]
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <p className={styles.rule} aria-hidden="true">
        {': . '.repeat(32)}
      </p>
    </header>
  );
}
