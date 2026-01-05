import { TracerImpl } from "../../../src/tracer";

const tracer = new TracerImpl();

export default defineEventHandler(async () => {
  await tracer.trace("sample-trace", async (span) => {
    span.setAttribute("description", "This is a sample trace for testing.");
    await new Promise(resolve => setTimeout(resolve, 50));
    span.addEvent("starting-work");
    await new Promise(resolve => setTimeout(resolve, 100));
    span.addEvent("finished-work");
  });

  return { status: "ok", message: "Sample spans generated." };
});
