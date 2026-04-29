import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = { title: `404 page not found! | Error - ${CONFIG.appName}` };

export default function Page() {
  return (
    <main className="plain-state-page">
      <section className="plain-state-panel">
        <p className="plain-state-eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 더 이상 제공되지 않는 페이지입니다.</p>
        <a href="/board">게시판으로 이동</a>
      </section>
    </main>
  );
}
