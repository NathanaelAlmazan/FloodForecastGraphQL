import { FloodHistory } from "@prisma/client"
import { gql } from "apollo-server-core"
import { Client } from "pg"
import axios from "axios"
// project modules
import dbClient from "./prismaClient"
import { PostgresPubSub } from "./PostgresGraphqlSub"

const client = new Client({
    connectionString: process.env.DATABASE_URL
})
client.connect()
const pubsub = new PostgresPubSub(client)

const NEW_FLOOD_DATA = "NEW_FLOOD_DATA"

export const typeDef = gql`
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

export const resolvers = {
    Query: {
        floodHistory: async (): Promise<FloodHistory[]> => {
            return await dbClient.floodHistory.findMany()
        },

        weatherData: async (parent: unknown, args: { lat: number, lng: number }): Promise<WeatherData> => {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${args.lat}&lon=${args.lng}&appid=${process.env.OPEN_WEATHER_API}`)
            const weatherData: OpenWeatherApiResponse = response.data

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
            }
        }

    },

    Mutation: {
        recordFloodData: async (parent: unknown, args: { data: FloodHistory }) => {
            pubsub.publish(NEW_FLOOD_DATA, { floodData: args.data })
            return await dbClient.floodHistory.create({
                data: args.data
            })
        }
    },
    
    Subscription: {
        floodData: {
            subscribe: () => pubsub.asyncIterator<{ floodData: WeatherData }>([NEW_FLOOD_DATA])
        }
    }
}

export interface WeatherData {
    weatherMain: string;
    weatherDesc: string;
    temperature: number;
    pressure: number;
    humidity: number;
    visibility: number;
    windSpeed: number;
    windDirection: number;
    cloudiness: number;
}

export interface OpenWeatherApiResponse {
    coord: {
        lon: number,
        lat: number
    },
    weather: [
        {
            id: number,
            main: string,
            description: string,
            icon: string
        }
    ],
    main: {
        temp: number,
        feels_like: number,
        temp_min: number,
        temp_max: number,
        pressure: number,
        humidity: number
    },
    visibility: number,
    wind: {
        speed: number,
        deg: number
    },
    clouds: {
        all: number
    }
}