import * as v from 'valibot';

export namespace ContactListSchemas {
  export const Create = v.object({
    name: v.string(),
    userId: v.string(),
    description: v.optional(v.string()),
    personIds: v.optional(v.array(v.string())),
    id: v.optional(v.string()),
  });

  export const Patch = v.object({
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    personIds: v.optional(v.array(v.string())),
    status: v.optional(v.union([v.literal('ACTIVE'), v.literal('ARCHIVED')])),
  });

  export const GetInput = v.object({
    userId: v.string(),
    id: v.string(),
  });

  export const ListInput = v.object({
    userId: v.string(),
    cursor: v.optional(v.string()),
  });

  export const ListByStatusInput = v.object({
    userId: v.string(),
    status: v.optional(v.union([v.literal('ACTIVE'), v.literal('ARCHIVED')])),
    cursor: v.optional(v.string()),
  });

  export const DeleteInput = v.object({
    userId: v.string(),
    id: v.string(),
  });

  export namespace Types {
    export type CreateInput = v.InferInput<typeof Create>;
    export type PatchInput = v.InferInput<typeof Patch>;
    export type GetInput = v.InferInput<typeof GetInput>;
    export type ListInput = v.InferInput<typeof ListInput>;
    export type ListByStatusInput = v.InferInput<typeof ListByStatusInput>;
    export type DeleteInput = v.InferInput<typeof DeleteInput>;
  }
}