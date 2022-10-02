import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import express from 'express';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { gql } from "apollo-server-core";
import { merge } from 'lodash';
import { dateTimeScalar } from "./customScalarTypes";
import { 
    typeDef as Account,
    resolvers as accountResolvers
} from "./authentication";
import { 
  typeDef as FloodHistory,
  resolvers as floodDataResolvers
} from "./floodHistory";

const initialDef = gql`
  scalar DateTime

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

const resolvers = {
  DateTime: dateTimeScalar
};

const schema = makeExecutableSchema({
    typeDefs: [initialDef, Account, FloodHistory],
    resolvers:  merge(resolvers, accountResolvers, floodDataResolvers)
});

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});

// start server
server.start().then(() => 
    server.applyMiddleware({ app })
  )
  .catch(err => console.log("Failed to start server."))

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(
    `Server is now running on http://localhost:${PORT}${server.graphqlPath}`,
  );
});