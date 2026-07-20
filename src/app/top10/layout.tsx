import { AppShell } from 'src/layouts/app-shell';

type Props = {
  children: React.ReactNode;
};

export default function Top10Layout({ children }: Props) {
  return <AppShell>{children}</AppShell>;
}
