import type { JsonObject, TemplateEmailParams } from "../src/index";

type Accepts<Target, Value> = [Value] extends [Target] ? true : false;
type Not<Flag extends boolean> = Flag extends true ? false : true;

interface InterfaceTyped {
  name: string;
}

declare function assertType<Flag extends true>(): Flag;

assertType<Accepts<JsonObject, { firstName?: string }>>();
assertType<Accepts<JsonObject, { firstName: string | undefined }>>();
assertType<
  Accepts<JsonObject, { tags: string[]; nested: { count: number } }>
>();
assertType<Accepts<TemplateEmailParams["variables"], { firstName?: string }>>();
assertType<
  Accepts<
    TemplateEmailParams["recipientVariables"],
    Record<string, { n?: number }>
  >
>();
assertType<Not<Accepts<JsonObject, { sentAt: Date }>>>();
assertType<Not<Accepts<JsonObject, { attachment: Buffer }>>>();
assertType<Not<Accepts<JsonObject, { render: () => string }>>>();
assertType<Not<Accepts<JsonObject, InterfaceTyped>>>();
