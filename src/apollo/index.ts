import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { CONFIG } from 'src/config-global';

const httpLink = createHttpLink({
  uri: `${CONFIG.serverUrl}/boardservice/graphql`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
