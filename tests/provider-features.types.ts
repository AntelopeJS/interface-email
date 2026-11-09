import type { ProviderFeatures } from "../src/index";

type Accepts<Target, Value> = [Value] extends [Target] ? true : false;
type Not<Flag extends boolean> = Flag extends true ? false : true;
type IsAny<Value> = 0 extends 1 & Value ? true : false;
type Flag = ProviderFeatures["providerTemplates"];

true satisfies Accepts<boolean, Flag>;
true satisfies Accepts<Flag, boolean>;
true satisfies Not<IsAny<Flag>>;
true satisfies Not<
  Accepts<ProviderFeatures, Omit<ProviderFeatures, "providerTemplates">>
>;
