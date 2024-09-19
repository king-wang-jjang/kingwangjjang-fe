import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { API_URL } from "../constants";

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache,
});