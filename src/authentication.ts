import { Account } from "@prisma/client";
import { gql } from "apollo-server-core";
import dbClient from "./prismaClient";

export const typeDef = gql`
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

export const resolvers = {
  Query: {
    accountByUid: async (parent: unknown, args: { uid: string }) => { 
        return await dbClient.account.findUnique({
            where: {
                accountUid: args.uid
            }
        })
    },
    accountList: async () => {
        return await dbClient.account.findMany()
    }
  },
  Mutation: {
    createAccount: async (parent: unknown, args: { account: Account }) => {
        return await dbClient.account.create({
            data: args.account
        })
    }
  }
};