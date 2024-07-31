import authedProcedure from "../../../procedures/authedProcedure";
import { router, importHandler } from "../../../trpc";
import { assignUserToAttributeSchema } from "./assignUserToAttribute.schema";
import { createAttributeSchema } from "./create.schema";
import { deleteAttributeSchema } from "./delete.schema";
import { editAttributeSchema } from "./edit.schema";
import { getAttributeSchema } from "./get.schema";
import { getByUserIdSchema } from "./getByUserId.schema";
import { toggleActiveSchema } from "./toggleActive.schema";

const NAMESPACE = "attributes";

const namespaced = (s: string) => `${NAMESPACE}.${s}`;

export const attributesRouter = router({
  list: authedProcedure.query(async (opts) => {
    const handler = await importHandler(namespaced("list"), () => import("./list.handler"));
    return handler(opts);
  }),
  get: authedProcedure.input(getAttributeSchema).query(async (opts) => {
    const handler = await importHandler(namespaced("get"), () => import("./get.handler"));
    return handler(opts);
  }),
  getByUserId: authedProcedure.input(getByUserIdSchema).query(async ({ ctx, input }) => {
    const handler = await importHandler(namespaced("getByUserId"), () => import("./getByUserId.handler"));
    return handler({ ctx, input });
  }),
  // Mutations
  create: authedProcedure.input(createAttributeSchema).mutation(async ({ ctx, input }) => {
    const handler = await importHandler(namespaced("create"), () => import("./create.handler"));
    return handler({ ctx, input });
  }),
  edit: authedProcedure.input(editAttributeSchema).mutation(async ({ ctx, input }) => {
    const handler = await importHandler(namespaced("edit"), () => import("./edit.handler"));
    return handler({ ctx, input });
  }),
  delete: authedProcedure.input(deleteAttributeSchema).mutation(async ({ ctx, input }) => {
    const handler = await importHandler(namespaced("delete"), () => import("./delete.handler"));
    return handler({ ctx, input });
  }),
  toggleActive: authedProcedure.input(toggleActiveSchema).mutation(async ({ ctx, input }) => {
    const handler = await importHandler(namespaced("toggleActive"), () => import("./toggleActive.handler"));
    return handler({ ctx, input });
  }),

  assignUserToAttribute: authedProcedure
    .input(assignUserToAttributeSchema)
    .mutation(async ({ ctx, input }) => {
      const handler = await importHandler(
        namespaced("assignUserToAttribute"),
        () => import("./assignUserToAttribute.handler")
      );
      return handler({ ctx, input });
    }),
});