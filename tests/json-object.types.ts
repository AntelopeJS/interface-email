import type { JsonObject, TemplateEmailParams } from "../src/index";

type Accepts<Target, Value> = [Value] extends [Target] ? true : false;
type Not<Flag extends boolean> = Flag extends true ? false : true;

interface InterfaceTyped {
  name: string;
}

true satisfies Accepts<JsonObject, { firstName?: string }>;
true satisfies Accepts<JsonObject, { firstName: string | undefined }>;
true satisfies Accepts<
  JsonObject,
  { tags: string[]; nested: { count: number } }
>;
true satisfies Accepts<
  TemplateEmailParams["variables"],
  { firstName?: string }
>;
true satisfies Accepts<
  TemplateEmailParams["recipientVariables"],
  Record<string, { n?: number }>
>;
true satisfies Not<Accepts<JsonObject, { sentAt: Date }>>;
true satisfies Not<Accepts<JsonObject, { attachment: Buffer }>>;
true satisfies Not<Accepts<JsonObject, { render: () => string }>>;
true satisfies Not<Accepts<JsonObject, InterfaceTyped>>;
