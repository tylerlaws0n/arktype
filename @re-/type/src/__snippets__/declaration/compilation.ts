import { compile } from "./declaration.js"
import { groupDef } from "./group.js"
import { userDef } from "./user.js"

// Creates your space (or tells you which definition you forgot to include)
export const types = compile({ ...userDef, ...groupDef })

// Mouse over "Group" to see the inferred type...
export type Group = typeof types.group.infer

// Try changing the definitions in "group.ts"/"user.ts" or the data checked here!
export const { errors } = types.group.check({
    title: "Type Enjoyers",
    members: [
        {
            name: "Devin Aldai",
            grapes: []
        }
    ]
})
