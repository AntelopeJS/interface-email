import type * as EmailInterface from "../../../src/index.ts";
import type { VerifyConfig } from "@antelopejs/tooling-configs/verify";

import { BATCH_BODY, CAPABILITIES_BODY, SEND_BODY, TEMPLATE_BODY } from "./scenario-bodies.ts";
import { declared, scenario, throughCore } from "./journey-kinds.ts";
import { BATCH_TYPES, CAPABILITIES_TYPES, SEND_TYPES, TEMPLATE_TYPES } from "./shape-probes.ts";

const config: VerifyConfig<typeof EmailInterface> = {
  doors: {
    data: null,
    format: null,
    contract: {
      globs: ["src/index.ts", "package.json"],
      funnels: [],
      why: "Send, SendBatch, SendTemplate, GetCapabilities and their parameter and answer types are what every sending module imports and every provider implements",
    },
    outbound: {
      globs: ["src/index.ts"],
      funnels: [],
      why: "the recipients, bodies and attachments of every message leave the process through the functions and parameter types declared here",
    },
    exposure: null,
    publish: {
      globs: ["package.json", ".release-it.json", "changelogen.config.json", ".github/workflows/release.yml"],
      funnels: [],
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
