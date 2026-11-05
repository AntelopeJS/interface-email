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

export const SEND_TYPES = `
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

export const TEMPLATE_TYPES = `
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

export const BATCH_TYPES = `
type _Message = Assert<Identical<Flat<Api.BatchEmailMessage>, Flat<Api.EmailParams & { batchId?: string }>>>;
type _Params = Assert<Identical<Api.BatchEmailParams, { messages: Api.BatchEmailMessage[]; defaults?: Partial<Api.EmailParams>; continueOnError?: boolean }>>;
type _MessageResponse = Assert<Identical<Flat<Api.BatchEmailMessageResponse>, Flat<Api.EmailResponse & { batchId?: string; index: number; recipient: string }>>>;
type _Response = Assert<Identical<Api.BatchEmailResponse, { success: boolean; total: number; successful: number; failed: number; responses: Api.BatchEmailMessageResponse[] }>>;
type _SendBatch = Assert<Identical<Parameters<typeof Api.SendBatch>, [params: Api.BatchEmailParams]>>;
type _SendBatchAnswer = Assert<Identical<Answer<typeof Api.SendBatch>, Api.BatchEmailResponse>>;
type _SendBatchFunction = Assert<Identical<Api.SendBatchFunction, (params: Api.BatchEmailParams) => Promise<Api.BatchEmailResponse>>>;
`;

export const CAPABILITIES_TYPES = `
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
