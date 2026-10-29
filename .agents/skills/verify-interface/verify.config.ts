import { equal, interrupted } from "@antelopejs/tooling-configs/verify";
import type { CallRequest, Journey, VerifyConfig } from "@antelopejs/tooling-configs/verify";

import type * as EmailInterface from "../../../src/index.ts";

/** A consumer call of one email function and the arguments it sends. */
interface Call {
  name: string;
  args: NonNullable<CallRequest["args"]>;
}

/** Loads the packed interface next to a stub provider and calls each function through core: the stub must answer, with the arguments it received. */
function throughCore(title: string, calls: Call[]): Journey {
  return {
    title,
    entryPoint: "a consumer module calling the packed interface in `ajs project dev`",
    async run(context) {
      const app = await context.dev("ajs project dev", context.fixture());
      for (const { name, args } of calls) {
        const result = await context.call(`call ${name}`, app, { path: [name], args });
        context.expect(result.folder, [
          { name: `${name} resolved through core`, pass: result.ok, detail: JSON.stringify(result.value) },
          equal(`${name} reached the provider with its arguments`, result.value, { stub: `.:${name}`, args }),
        ]);
      }
      const stopped = await context.stop("SIGINT", app);
      context.expect(stopped.folder, [interrupted(stopped)]);
    },
  };
}

/** The setup every scenario shares: the packed interface and a recording stand-in provider attached to a function. */
const SCENARIO_PRELUDE = `
const assert = require("node:assert/strict");
const email = require(process.argv[2]);
const received = [];
const attach = (name, answer) => email[name].proxy.onCall(async (...args) => { received.push([name, args]); return answer(...args); }, true);
const same = (a, b) => { try { assert.deepStrictEqual(a, b); return true; } catch { return false; } };
const rejection = async (promise) => { try { await promise; return null; } catch (error) { return error.message; } };
`;

const SCENARIO_TAIL = `
main().then((out) => { console.log(JSON.stringify(out, (key, value) => (value === undefined ? null : value))); process.exit(0); }, (error) => { console.error(error); process.exit(1); });
`;

/** The probe header: `Assert<Identical<A, B>>` fails to compile unless A and B are the same type, so an added optional field or a widening to `any` is caught. */
const PROBE_HEADER = `
type Identical<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type Flat<T> = { [K in keyof T]: T[K] };
type Answer<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>>;
`;

/** Runs a scenario against the packed interface and a recording stand-in provider, then checks what it printed against the documented behaviour. */
function scenario(title: string, body: string, printed: string): Journey {
  return {
    title,
    entryPoint: "the packed interface driven from a Node process with a stand-in provider attached to its functions",
    async run(context) {
      const file = `${context.work}/scenario.js`;
      context.edit("write the scenario", file, `${SCENARIO_PRELUDE}\nasync function main() {\n${body}\n}\n${SCENARIO_TAIL}`);
      const ran = await context.command("run the scenario", "node", [file, `${context.repo}/dist/index.js`], { timeoutMs: 60_000 });
      context.expect(ran.folder, [
        { name: "the scenario ended cleanly", pass: ran.exitCode === 0, detail: ran.stderr.slice(-300) },
        equal("the answers are what the docs promise", ran.stdout.trim().split("\n").at(-1) ?? "", printed),
      ]);
    },
  };
}

/** Compiles a probe against the packed declarations in the consumer's strict mode. */
function declared(title: string, probe: string): Journey {
  return {
    title,
    entryPoint: "a TypeScript consumer compiling against the packed declarations",
    async run(context) {
      const file = `${context.work}/probe.ts`;
      await context.command("link the repository's dependencies", "ln", ["-s", `${context.repo}/node_modules`, `${context.work}/node_modules`]);
      context.edit("write the shape probe", file, `import type * as Api from "${context.repo}/dist/index";\n${PROBE_HEADER}\n${probe}`);
      const compiled = await context.command("compile the shape probe", "node", [
        `${context.repo}/node_modules/typescript/bin/tsc`,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--target",
        "es2022",
        "--module",
        "commonjs",
        "--moduleResolution",
        "node",
        "--typeRoots",
        `${context.repo}/node_modules/@types`,
        "--types",
        "node",
        file,
      ]);
      context.expect(compiled.folder, [{ name: "every export has the documented shape", pass: compiled.exitCode === 0, detail: compiled.stdout.slice(0, 600) }]);
    },
  };
}

const SEND_BODY = `
  const params = {
    to: ["alice@example.com", { email: "bob@example.com", name: "Bob" }],
    subject: "Invoice",
    html: "<p>Hi</p>",
    text: "Hi",
    from: { email: "billing@example.com", name: "Billing" },
    replyTo: "support@example.com",
    attachments: [
      { filename: "a.txt", content: Buffer.from("hello") },
      { filename: "b.txt", content: "SGVsbG8h", encoding: "base64", inline: true, cid: "b" },
      { filename: "c.csv", path: "/tmp/c.csv", contentType: "text/csv" },
      { filename: "d.pdf", url: "https://cdn.example.com/d.pdf" },
    ],
    priority: "high",
    tracking: { opens: true, trackingDomain: "t.example.com" },
    tags: ["invoice"],
    metadata: { orderId: "1" },
    schedule: { sendAt: new Date("2027-04-05T06:45:00Z"), timezone: "Europe/Paris" },
    providerOptions: { pool: "tx", nested: { retries: 2, flags: [true, null] } },
  };
  const accepted = { success: true, status: "queued", messageId: "m-1", timestamp: new Date(0), provider: "stub" };
  const refused = { success: false, status: "rejected", error: { code: "E_ADDR", message: "bad address", field: "to", retryable: false } };
  let answer = accepted;
  attach("Send", () => answer);
  const sent = await email.Send(params);
  answer = refused;
  const failed = await email.Send({ to: "x@example.com", subject: "s" });
  answer = null;
  email.Send.proxy.onCall(async () => { throw new Error("provider down"); }, true);
  const down = await rejection(email.Send({ to: "x@example.com", subject: "s" }));
  return {
    paramsReached: same(received[0][1], [params]),
    bufferKept: Buffer.isBuffer(received[0][1][0].attachments[0].content),
    dateKept: received[0][1][0].schedule.sendAt instanceof Date,
    answerUnchanged: same(sent, accepted),
    timestampKept: sent.timestamp instanceof Date,
    refusedReturned: same(failed, refused),
    down,
  };
`;

const TEMPLATE_BODY = `
  const hosted = { to: "user@example.com", template: { id: "welcome-v2", version: "3" }, variables: { name: "Alice", plan: { tier: 2, tags: ["a", null] } } };
  const inline = {
    to: ["alice@example.com", "bob@example.com"],
    template: { content: "<h1>Hello {{name}}</h1>", type: "html", engine: "handlebars" },
    variables: { week: "March 23-29" },
    recipientVariables: { "alice@example.com": { name: "Alice", unreadCount: "5" }, "bob@example.com": { name: "Bob", unreadCount: "12" } },
    subject: "Digest",
    attachments: [{ filename: "a.txt", content: Buffer.from("x") }],
    schedule: { sendAt: "2027-04-05T06:45:00Z" },
  };
  const response = { success: true, status: "scheduled", messageId: "t-1" };
  attach("SendTemplate", () => response);
  const first = await email.SendTemplate(hosted);
  const second = await email.SendTemplate(inline);
  email.SendTemplate.proxy.onCall(async () => { throw new Error("template missing"); }, true);
  const missing = await rejection(email.SendTemplate(hosted));
  return {
    hostedReached: same(received[0][1], [hosted]),
    inlineReached: same(received[1][1], [inline]),
    answers: same([first, second], [response, response]),
    missing,
  };
`;

const BATCH_BODY = `
  const params = {
    messages: [
      { to: "alice@example.com", subject: "Your invoice", html: "<p>1</p>", batchId: "invoice-001" },
      { to: "bob@example.com", subject: "Your invoice", html: "<p>2</p>", batchId: "invoice-002", from: "other@example.com" },
    ],
    defaults: { from: { email: "billing@myapp.com", name: "Billing" }, tags: ["invoice"] },
    continueOnError: false,
  };
  const result = {
    success: false,
    total: 2,
    successful: 1,
    failed: 1,
    responses: [
      { success: true, status: "sent", index: 0, recipient: "alice@example.com", batchId: "invoice-001", messageId: "b-1" },
      { success: false, status: "failed", index: 1, recipient: "bob@example.com", error: { code: "E_RATE", message: "slow down", retryable: true } },
    ],
  };
  attach("SendBatch", () => result);
  const answer = await email.SendBatch(params);
  email.SendBatch.proxy.onCall(async () => { throw new Error("batch unsupported"); }, true);
  const unsupported = await rejection(email.SendBatch({ messages: [] }));
  return {
    paramsReached: same(received[0][1], [params]),
    defaultsNotApplied: received[0][1][0].messages[0].from === undefined,
    answerUnchanged: same(answer, result),
    unsupported,
  };
`;

const CAPABILITIES_BODY = `
  const full = {
    name: "stub",
    version: "1.2.3",
    maxRecipients: 1000,
    maxBatchSize: 100,
    maxAttachmentSize: 10485760,
    maxEmailSize: 20971520,
    features: { batch: true, templates: true, scheduling: false, openTracking: true, clickTracking: true, inlineAttachments: true, tags: false, metadata: true, priority: false },
  };
  const minimal = { name: "bare", features: { batch: false, templates: false, scheduling: false, openTracking: false, clickTracking: false, inlineAttachments: false, tags: false, metadata: false, priority: false } };
  let answer = full;
  attach("GetCapabilities", () => answer);
  const first = await email.GetCapabilities();
  answer = minimal;
  const second = await email.GetCapabilities();
  return {
    calledWithoutArguments: received.every(([, args]) => args.length === 0),
    calls: received.length,
    fullUnchanged: same(first, full),
    absentLimits: ["version", "maxRecipients", "maxBatchSize", "maxAttachmentSize", "maxEmailSize"].map((key) => key in second),
    minimalUnchanged: same(second, minimal),
  };
`;

const ADDRESS_ATTACHMENT_TYPES = `
type _AddressObject = Assert<Identical<Api.EmailAddressObject, { email: string; name?: string }>>;
type _Address = Assert<Identical<Api.EmailAddress, string | Api.EmailAddressObject>>;
type _Base = Assert<Identical<Api.BaseAttachment, { filename: string; contentType?: string; cid?: string; inline?: boolean }>>;
type _Buffer = Assert<Identical<Api.BufferAttachment, { filename: string; contentType?: string; cid?: string; inline?: boolean; content: Buffer }>>;
type _Base64 = Assert<Identical<Api.Base64Attachment, { filename: string; contentType?: string; cid?: string; inline?: boolean; content: string; encoding: "base64" }>>;
type _Path = Assert<Identical<Api.PathAttachment, { filename: string; contentType?: string; cid?: string; inline?: boolean; path: string }>>;
type _Url = Assert<Identical<Api.UrlAttachment, { filename: string; contentType?: string; cid?: string; inline?: boolean; url: string }>>;
type _Attachment = Assert<Identical<Api.Attachment, Api.BufferAttachment | Api.Base64Attachment | Api.PathAttachment | Api.UrlAttachment>>;
type _Tracking = Assert<Identical<Api.TrackingOptions, { opens?: boolean; clicks?: boolean; trackingDomain?: string; disabled?: boolean }>>;
type _Schedule = Assert<Identical<Api.ScheduleOptions, { sendAt?: Date | string; timezone?: string }>>;
type _Priority = Assert<Identical<Api.EmailPriority, "high" | "normal" | "low">>;
type _Value = Assert<Identical<Api.JsonValue, string | number | boolean | null | Api.JsonValue[] | Api.JsonObject>>;
type _Object = Assert<Identical<Api.JsonObject, { [key: string]: Api.JsonValue | undefined }>>;
`;

const SEND_TYPES = `
type _Params = Assert<Identical<Api.EmailParams, {
  to: Api.EmailAddress | Api.EmailAddress[];
  subject: string;
  text?: string;
  html?: string;
  from?: Api.EmailAddress;
  replyTo?: Api.EmailAddress | Api.EmailAddress[];
  cc?: Api.EmailAddress | Api.EmailAddress[];
  bcc?: Api.EmailAddress | Api.EmailAddress[];
  attachments?: Api.Attachment[];
  messageId?: string;
  inReplyTo?: string;
  references?: string | string[];
  priority?: Api.EmailPriority;
  tracking?: Api.TrackingOptions;
  tags?: string[];
  metadata?: Record<string, string>;
  schedule?: Api.ScheduleOptions;
  providerOptions?: Api.JsonObject;
}>>;
type _Status = Assert<Identical<Api.EmailStatus, "queued" | "sent" | "delivered" | "failed" | "rejected" | "scheduled" | "unknown">>;
type _Error = Assert<Identical<Api.EmailError, { code: string; message: string; field?: string; retryable?: boolean }>>;
type _Response = Assert<Identical<Api.EmailResponse, { success: boolean; status: Api.EmailStatus; messageId?: string; error?: Api.EmailError; timestamp?: Date; provider?: string }>>;
type _Send = Assert<Identical<Parameters<typeof Api.Send>, [params: Api.EmailParams]>>;
type _SendAnswer = Assert<Identical<Answer<typeof Api.Send>, Api.EmailResponse>>;
type _SendFunction = Assert<Identical<Api.SendFunction, (params: Api.EmailParams) => Promise<Api.EmailResponse>>>;
${ADDRESS_ATTACHMENT_TYPES}
`;

const TEMPLATE_TYPES = `
type _Provider = Assert<Identical<Api.ProviderTemplate, { id: string; version?: string }>>;
type _Inline = Assert<Identical<Api.InlineTemplate, { content: string; type: "html" | "text"; engine?: string }>>;
type _Params = Assert<Identical<Api.TemplateEmailParams, {
  to: Api.EmailAddress | Api.EmailAddress[];
  template: Api.ProviderTemplate | Api.InlineTemplate;
  variables?: Api.JsonObject;
  recipientVariables?: Record<string, Api.JsonObject>;
  from?: Api.EmailAddress;
  replyTo?: Api.EmailAddress | Api.EmailAddress[];
  cc?: Api.EmailAddress | Api.EmailAddress[];
  bcc?: Api.EmailAddress | Api.EmailAddress[];
  subject?: string;
  attachments?: Api.Attachment[];
  priority?: Api.EmailPriority;
  tracking?: Api.TrackingOptions;
  tags?: string[];
  metadata?: Record<string, string>;
  schedule?: Api.ScheduleOptions;
  providerOptions?: Api.JsonObject;
}>>;
type _SendTemplate = Assert<Identical<Parameters<typeof Api.SendTemplate>, [params: Api.TemplateEmailParams]>>;
type _SendTemplateAnswer = Assert<Identical<Answer<typeof Api.SendTemplate>, Api.EmailResponse>>;
type _SendTemplateFunction = Assert<Identical<Api.SendTemplateFunction, (params: Api.TemplateEmailParams) => Promise<Api.EmailResponse>>>;
`;

const BATCH_TYPES = `
type _Message = Assert<Identical<Flat<Api.BatchEmailMessage>, Flat<Api.EmailParams & { batchId?: string }>>>;
type _Params = Assert<Identical<Api.BatchEmailParams, { messages: Api.BatchEmailMessage[]; defaults?: Partial<Api.EmailParams>; continueOnError?: boolean }>>;
type _MessageResponse = Assert<Identical<Flat<Api.BatchEmailMessageResponse>, Flat<Api.EmailResponse & { batchId?: string; index: number; recipient: string }>>>;
type _Response = Assert<Identical<Api.BatchEmailResponse, { success: boolean; total: number; successful: number; failed: number; responses: Api.BatchEmailMessageResponse[] }>>;
type _SendBatch = Assert<Identical<Parameters<typeof Api.SendBatch>, [params: Api.BatchEmailParams]>>;
type _SendBatchAnswer = Assert<Identical<Answer<typeof Api.SendBatch>, Api.BatchEmailResponse>>;
type _SendBatchFunction = Assert<Identical<Api.SendBatchFunction, (params: Api.BatchEmailParams) => Promise<Api.BatchEmailResponse>>>;
`;

const CAPABILITIES_TYPES = `
type _Features = Assert<Identical<Api.ProviderFeatures, {
  batch: boolean;
  templates: boolean;
  scheduling: boolean;
  openTracking: boolean;
  clickTracking: boolean;
  inlineAttachments: boolean;
  tags: boolean;
  metadata: boolean;
  priority: boolean;
}>>;
type _Capabilities = Assert<Identical<Api.ProviderCapabilities, {
  name: string;
  version?: string;
  maxRecipients?: number;
  maxBatchSize?: number;
  maxAttachmentSize?: number;
  maxEmailSize?: number;
  features: Api.ProviderFeatures;
}>>;
type _GetCapabilities = Assert<Identical<Parameters<typeof Api.GetCapabilities>, []>>;
type _GetCapabilitiesAnswer = Assert<Identical<Answer<typeof Api.GetCapabilities>, Api.ProviderCapabilities>>;
type _GetCapabilitiesFunction = Assert<Identical<Api.GetCapabilitiesFunction, () => Promise<Api.ProviderCapabilities>>>;
`;

const config: VerifyConfig<typeof EmailInterface> = {
  doors: {
    data: null,
    format: null,
    contract: {
      globs: ["src/index.ts", "package.json"],
      funnels: [],
      containments: [],
      why: "Send, SendBatch, SendTemplate, GetCapabilities and their parameter and answer types are what every sending module imports and every provider implements",
    },
    outbound: {
      globs: ["src/index.ts"],
      funnels: [],
      containments: [],
      why: "the recipients, bodies and attachments of every message leave the process through the functions and parameter types declared here",
    },
    exposure: null,
    publish: {
      globs: ["package.json", ".release-it.json", "changelogen.config.json", ".github/workflows/release.yml"],
      funnels: [],
      containments: [],
      why: "the package name and release workflow claim @antelopejs/interface-email on npm",
    },
  },
  journeys: {
    "send-through-core": throughCore("Send reaches the provider through core with a full message", [
      {
        name: "Send",
        args: [
          {
            to: ["alice@example.com", { email: "bob@example.com", name: "Bob" }],
            subject: "Invoice",
            html: "<p>Hi</p>",
            attachments: [{ filename: "d.pdf", url: "https://cdn.example.com/d.pdf" }],
            tags: ["invoice"],
            schedule: { sendAt: "2027-04-05T06:45:00Z", timezone: "Europe/Paris" },
          },
        ],
      },
    ]),
    "send-pass-through": scenario("Send hands the message to the provider unchanged, Buffer and Date included, and returns its answer, a refusal or a rejection untouched", SEND_BODY, '{"paramsReached":true,"bufferKept":true,"dateKept":true,"answerUnchanged":true,"timestampKept":true,"refusedReturned":true,"down":"provider down"}'),
    "send-types": declared("Send, EmailParams, EmailResponse, the address, attachment, tracking and schedule types have the documented shapes", SEND_TYPES),
    "template-through-core": throughCore("SendTemplate reaches the provider through core with a provider-hosted and an inline template", [
      { name: "SendTemplate", args: [{ to: "user@example.com", template: { id: "welcome-v2", version: "3" }, variables: { name: "Alice" } }] },
      { name: "SendTemplate", args: [{ to: ["a@example.com", "b@example.com"], template: { content: "<h1>{{name}}</h1>", type: "html" }, recipientVariables: { "a@example.com": { name: "A" } } }] },
    ]),
    "template-pass-through": scenario("SendTemplate hands both template kinds, variables and per-recipient variables to the provider unchanged and returns its answer", TEMPLATE_BODY, '{"hostedReached":true,"inlineReached":true,"answers":true,"missing":"template missing"}'),
    "template-types": declared("SendTemplate, TemplateEmailParams and the two template kinds have the documented shapes", TEMPLATE_TYPES),
    "batch-through-core": throughCore("SendBatch reaches the provider through core with messages and defaults", [
      {
        name: "SendBatch",
        args: [{ messages: [{ to: "alice@example.com", subject: "Hi", text: "A", batchId: "a" }, { to: "bob@example.com", subject: "Hi", text: "B" }], defaults: { from: "noreply@myapp.com" }, continueOnError: true }],
      },
    ]),
    "batch-pass-through": scenario("SendBatch hands the messages and defaults to the provider unchanged, applies none itself and returns the per-message answers untouched", BATCH_BODY, '{"paramsReached":true,"defaultsNotApplied":true,"answerUnchanged":true,"unsupported":"batch unsupported"}'),
    "batch-types": declared("SendBatch and the batch parameter and response types have the documented shapes", BATCH_TYPES),
    "capabilities-through-core": throughCore("GetCapabilities reaches the provider through core without arguments", [{ name: "GetCapabilities", args: [] }]),
    "capabilities-pass-through": scenario("GetCapabilities calls the provider without arguments each time and returns its capabilities untouched, absent limits staying absent", CAPABILITIES_BODY, '{"calledWithoutArguments":true,"calls":2,"fullUnchanged":true,"absentLimits":[false,false,false,false,false],"minimalUnchanged":true}'),
    "capabilities-types": declared("GetCapabilities, ProviderCapabilities and ProviderFeatures have the documented shapes", CAPABILITIES_TYPES),
  },
};

export default config;
