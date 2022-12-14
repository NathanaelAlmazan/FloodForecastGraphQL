"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const apollo_server_core_1 = require("apollo-server-core");
const schema_1 = require("@graphql-tools/schema");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const apollo_server_core_2 = require("apollo-server-core");
const lodash_1 = require("lodash");
const customScalarTypes_1 = require("./customScalarTypes");
const authentication_1 = require("./authentication");
const floodHistory_1 = require("./floodHistory");
const initialDef = (0, apollo_server_core_2.gql) `
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
    DateTime: customScalarTypes_1.dateTimeScalar
};
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: [initialDef, authentication_1.typeDef, floodHistory_1.typeDef],
    resolvers: (0, lodash_1.merge)(resolvers, authentication_1.resolvers, floodHistory_1.resolvers)
});
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const wsServer = new ws_1.WebSocketServer({
    server: httpServer,
    path: '/graphql',
});
const serverCleanup = (0, ws_2.useServer)({ schema }, wsServer);
// Set up ApolloServer.
const server = new apollo_server_express_1.ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
        (0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
        {
            serverWillStart() {
                return __awaiter(this, void 0, void 0, function* () {
                    return {
                        drainServer() {
                            return __awaiter(this, void 0, void 0, function* () {
                                yield serverCleanup.dispose();
                            });
                        },
                    };
                });
            },
        },
        (0, apollo_server_core_1.ApolloServerPluginLandingPageLocalDefault)({ embed: true }),
    ],
});
// start server
server.start().then(() => server.applyMiddleware({ app }))
    .catch(err => console.log("Failed to start server."));
const PORT = process.env.PORT;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}${server.graphqlPath}`);
});
//# sourceMappingURL=index.js.map