import type { RouteHandler } from "../../types";
import { Schema } from "@wpackages/schema";

export const schema = {
  params: Schema.struct({
    id: Schema.NumberFromString,
  }),
};

export const handler: RouteHandler = (req, params) => {
  return { userId: params.id };
};
