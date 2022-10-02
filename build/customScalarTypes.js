"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeScalar = void 0;
const graphql_1 = require("graphql");
exports.dateTimeScalar = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'Date and Time custom scalar type',
    serialize(value) {
        if (value instanceof Date)
            return value.toISOString();
        return null;
    },
    parseValue(value) {
        if (typeof value === 'string')
            return new Date(value);
        return null;
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.INT)
            return new Date(parseInt(ast.value, 10));
        return null;
    },
});
//# sourceMappingURL=customScalarTypes.js.map