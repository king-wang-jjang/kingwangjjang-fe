import { AppShell } from 'src/layouts/app-shell';

type Props = {
  children: React.ReactNode;
};

export default function AccountLayout({ children }: Props) {
  return <AppShell>{children}</AppShell>;
}
