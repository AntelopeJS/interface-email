export const SEND_BODY = `
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

export const TEMPLATE_BODY = `
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

export const BATCH_BODY = `
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

export const CAPABILITIES_BODY = `
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
