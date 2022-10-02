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
exports.resolvers = exports.typeDef = void 0;
const apollo_server_core_1 = require("apollo-server-core");
const prismaClient_1 = __importDefault(require("./prismaClient"));
exports.typeDef = (0, apollo_server_core_1.gql) `
    extend type Query {
        accountByUid(uid: String!): Account
        accountList: [Account]
    }

    extend type Mutation {
        createAccount(account: AccountInput!): Account
    }

    input AccountInput {
        accountUid: String!
        firstName: String!
        lastName: String!
        address: String!
        phone: String
        telephone: String
    }

    type Account {
        accountId: ID!
        accountUid: String!
        firstName: String!
        lastName: String!
        address: String!
        phone: String
        telephone: String
    }
`;
exports.resolvers = {
    Query: {
        accountByUid: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            return yield prismaClient_1.default.account.findUnique({
                where: {
                    accountUid: args.uid
                }
            });
        }),
        accountList: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prismaClient_1.default.account.findMany();
        })
    },
    Mutation: {
        createAccount: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            return yield prismaClient_1.default.account.create({
                data: args.account
            });
        })
    }
};
//# sourceMappingURL=authentication.js.map