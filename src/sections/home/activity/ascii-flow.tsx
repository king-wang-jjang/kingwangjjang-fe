import { AsciiSignal } from './ascii-signal';
import { AsciiSolids } from './ascii-solids';

export function AsciiFlow({
  variant,
  motionEnabled = true,
}: {
  variant: 'ambient' | 'signal';
  motionEnabled?: boolean;
}) {
  if (variant === 'signal') return <AsciiSignal motionEnabled={motionEnabled} />;

  return <AsciiSolids motionEnabled={motionEnabled} />;
}
