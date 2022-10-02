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
const pg_1 = require("pg");
const axios_1 = __importDefault(require("axios"));
// project modules
const prismaClient_1 = __importDefault(require("./prismaClient"));
const PostgresGraphqlSub_1 = require("./PostgresGraphqlSub");
const client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL
});
client.connect();
const pubsub = new PostgresGraphqlSub_1.PostgresPubSub(client);
const NEW_FLOOD_DATA = "NEW_FLOOD_DATA";
exports.typeDef = (0, apollo_server_core_1.gql) `
    extend type Query {
        floodHistory: [FloodHistory]!
        weatherData(lat: Float!, lng: Float!): WeatherData
    }

    extend type Mutation {
        recordFloodData(data: FloodDataInput!): FloodHistory!
    }

    extend type Subscription {
        floodData: FloodHistory
    }

    type WeatherData {
        weatherMain: String!
        weatherDesc: String!
        temperature: Float!
        pressure: Float!
        humidity: Float!
        visibility: Float!
        windSpeed: Float!
        windDirection: Float!
        cloudiness: Float!
    }

    type FloodHistory {
        recordId: ID!
        floodLevel: Float!     
        precipitation: Float!
        timestamp: DateTime!
    }

    input FloodDataInput {
        floodLevel: Float!     
        precipitation: Float!
    }
`;
exports.resolvers = {
    Query: {
        floodHistory: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield prismaClient_1.default.floodHistory.findMany();
        }),
        weatherData: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${args.lat}&lon=${args.lng}&appid=${process.env.OPEN_WEATHER_API}`);
            const weatherData = response.data;
            return {
                weatherMain: weatherData.weather[0].main,
                weatherDesc: weatherData.weather[0].description,
                temperature: weatherData.main.temp,
                pressure: weatherData.main.pressure,
                humidity: weatherData.main.humidity,
                visibility: weatherData.visibility,
                windSpeed: weatherData.wind.speed,
                windDirection: weatherData.wind.deg,
                cloudiness: weatherData.clouds.all
            };
        })
    },
    Mutation: {
        recordFloodData: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            pubsub.publish(NEW_FLOOD_DATA, { floodData: args.data });
            return yield prismaClient_1.default.floodHistory.create({
                data: args.data
            });
        })
    },
    Subscription: {
        floodData: {
            subscribe: () => pubsub.asyncIterator([NEW_FLOOD_DATA])
        }
    }
};
//# sourceMappingURL=floodHistory.js.map