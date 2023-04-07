import { AWS } from "@serverless/typescript";

type FunctionsType = AWS["functions"];
export type FunctionType = FunctionsType[keyof FunctionsType];
