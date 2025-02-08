import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

import { CONFIG } from 'src/config-global';

const createApolloClient = (uri: string) =>
  new ApolloClient({
    link: createHttpLink({
      uri,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });

export const boardServiceClient = createApolloClient(`${CONFIG.serverUrl}/boardservice/graphql`);
export const userServiceClient = createApolloClient(`${CONFIG.serverUrl}/user/graphql`);
