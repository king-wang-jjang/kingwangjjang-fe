import { AsciiSignal } from './ascii-signal';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './ascii-flow.module.css';

// Periodic, deterministic text tiles keep server/client output identical and the
// CSS loop seamless. This is decorative texture, not a visualization of API data.
function createWave(phase: number) {
  const columns = 96;
  return Array.from({ length: 11 }, (_row, row) =>
    Array.from({ length: columns }, (_column, column) => {
      const angle = (column / columns) * Math.PI * 4 + phase;
      const center = 5 + Math.sin(angle) * 2.6 + Math.cos(angle * 2) * 0.8;
      const distance = Math.abs(row - center);
      if (distance < 0.5) return '#';
      if (distance < 1.2) return '+';
      if (distance < 2) return ':';
      return (column + row * 3) % 8 === 0 ? '.' : ' ';
    }).join('')
  ).join('\n');
}

const waves = [0, 1.8, 3.6].map(createWave);
const ambientWaves = waves.map((wave) =>
  wave
    .split('\n')
    .map((line) => line.repeat(3))
    .join('\n')
);

export function AsciiFlow({
  variant,
  motionEnabled = true,
}: {
  variant: 'ambient' | 'signal';
  motionEnabled?: boolean;
}) {
  if (variant === 'signal') return <AsciiSignal motionEnabled={motionEnabled} />;

  return (
    <div className={styles[variant]} data-ascii-flow={variant} aria-hidden="true">
      {ambientWaves.map((wave, index) => (
        <div key={index} className={styles.track} data-ascii-track>
          <pre>{wave}</pre>
          <pre>{wave}</pre>
        </div>
      ))}
    </div>
  );
}
