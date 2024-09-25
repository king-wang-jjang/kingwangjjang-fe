'use client';

import { ApolloProvider } from '@apollo/client';

import { client } from 'src/apollo';
import { DashboardLayout } from 'src/layouts/dashboard';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <DashboardLayout>{children}</DashboardLayout>
    </ApolloProvider>
  );
}
