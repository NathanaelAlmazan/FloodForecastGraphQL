import { GraphQLScalarType, Kind } from 'graphql';

export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date and Time custom scalar type',
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return null;
  },
  parseValue(value) {
    if (typeof value === 'string') return new Date(value);
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) return new Date(parseInt(ast.value, 10));
    return null;
  },
});