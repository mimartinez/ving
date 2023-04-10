import { defineCommand } from "citty";
import { generateSchema } from '../server/vingschema/genskeleton';
import { getContext } from '@feathershq/pinion';

export default defineCommand({
    meta: {
        name: "Ving Schema",
        description: "Ving Schema code generation",
    },
    args: {
        new: {
            type: "string",
            description: "Generate a new schema skeleton file",
        },
    },
    async run({ args }) {
        if (args.new) {
            await generateSchema({ ...getContext({}), name: args.new });
        }
    },
});