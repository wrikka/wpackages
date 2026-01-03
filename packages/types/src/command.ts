import { Schema } from "@effect/schema"

export class Command extends Schema.Class<Command>("Command")({
  name: Schema.String,
  args: Schema.Array(Schema.String),
}) {}
