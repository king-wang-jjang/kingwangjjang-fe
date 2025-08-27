import type { CodegenConfig } from '@graphql-codegen/cli';

// import { CONFIG } from './src/config-global';


const config: CodegenConfig = {
  schema: [
    `http://localhost:33330/boardservice/board-graphql`,  // Board Service
    `http://localhost:33330/user/user-graphql`           // User Service
  ],

  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;