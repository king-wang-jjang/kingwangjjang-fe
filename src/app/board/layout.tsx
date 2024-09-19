'use client'
import { ApolloProvider } from "@apollo/client"
import { client } from "../apollo"

export default function BoardLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <ApolloProvider client={client}>
            <section>
                {children}
            </section>
        </ApolloProvider>
        )
  }