'use client';

import { ApolloProvider } from '@apollo/client';

import { DashboardLayout } from 'src/layouts/dashboard';
import { userServiceClient, boardServiceClient } from 'src/apollo';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={boardServiceClient}>
      <ApolloProvider client={userServiceClient}>
        <DashboardLayout>{children}</DashboardLayout>
      </ApolloProvider>
    </ApolloProvider>
  );
}
