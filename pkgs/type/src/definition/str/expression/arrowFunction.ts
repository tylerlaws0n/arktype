import { Evaluate } from "@re-/utils"
import {
    typeDefProxy,
    validationError,
    createParser,
    ParseSplittable,
    ValidateSplittable,
    ParseConfig
} from "./internal.js"
import { Str } from "../str.js"
import { Expression } from "./expression.js"

export namespace ArrowFunction {
    export type Definition<
        Parameters extends string = string,
        Return extends string = string
    > = `(${Parameters})=>${Return}`

    export type Validate<
        Parameters extends string,
        Return extends string,
        Root extends string,
        Typespace,
        ValidatedParameters extends string = ValidateParameterTuple<
            Parameters,
            Parameters,
            Typespace
        > &
            string,
        ValidatedReturn extends string = Str.Validate<Return, Return, Typespace>
    > = Parameters extends ValidatedParameters
        ? Return extends ValidatedReturn
            ? Root
            : ValidatedReturn
        : ValidatedParameters

    export type Parse<
        Parameters extends string,
        Return extends string,
        Typespace,
        Options extends ParseConfig
    > = Evaluate<
        (
            ...args: ParseParameterTuple<Parameters, Typespace, Options>
        ) => Str.Parse<Return, Typespace, Options>
    >

    export const type = typeDefProxy as Definition

    export const parse = createParser(
        {
            type,
            parent: () => Expression.parse,
            components: (def, ctx) => {
                const parts = def.split("=>")
                const parameterDefs = parts[0]
                    .slice(1, -1)
                    .split(",")
                    .filter((arg) => !!arg)
                const returnDef = parts.slice(1).join("=>")
                return {
                    parameters: parameterDefs.map((arg) => Str.parse(arg, ctx)),
                    returned: Str.parse(returnDef, ctx)
                }
            }
        },
        {
            matches: (def) => /\(.*\)\=\>.*/.test(def as any),
            allows: ({ def, ctx: { path } }, valueType) =>
                valueType === "function"
                    ? {}
                    : validationError({
                          def,
                          valueType,
                          path
                      }),
            generate:
                ({ components: { returned } }, opts) =>
                (...args: any[]) =>
                    returned.generate(opts)
        }
    )

    export const delegate = parse as any as Definition
}

type ValidateParameterTuple<
    Def extends string,
    Root extends string,
    Typespace
> = Def extends "" ? "" : ValidateSplittable<",", Def, Root, Typespace>

type ParseParameterTuple<
    Def extends string,
    Typespace,
    Options extends ParseConfig
> = Def extends "" ? [] : ParseSplittable<",", Def, Typespace, Options>
