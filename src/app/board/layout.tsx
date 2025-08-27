'use client';

import { ApolloProvider } from '@apollo/client';

import { DashboardLayout } from 'src/layouts/dashboard';
import { userServiceClient, boardServiceClient, commentServiceClient } from 'src/apollo';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={boardServiceClient}>
      <ApolloProvider client={userServiceClient}>
        <ApolloProvider client={commentServiceClient}>
          <DashboardLayout>{children}</DashboardLayout>
        </ApolloProvider>
      </ApolloProvider>
    </ApolloProvider>
  );
}
