import type { ProviderFeatures } from "../src/index";

type Accepts<Target, Value> = [Value] extends [Target] ? true : false;
type Not<Flag extends boolean> = Flag extends true ? false : true;

true satisfies Accepts<boolean, ProviderFeatures["providerTemplates"]>;
true satisfies Not<
  Accepts<ProviderFeatures, Omit<ProviderFeatures, "providerTemplates">>
>;
