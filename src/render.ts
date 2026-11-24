import type { JsonObject, JsonValue } from "./index";

const PLACEHOLDER = /\{\{([^{}]*)\}\}/g;

function isStructured(value: JsonValue): value is JsonValue[] | JsonObject {
  return Object(value) === value;
}

function renderValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }
  return isStructured(value) ? JSON.stringify(value) : String(value);
}

/**
 * Replace each `{{ name }}` in `content` with the value of the variable
 * `name`, in one pass over `content`.
 *
 * The name is the text between the braces, trimmed, and is matched literally
 * against the own keys of `variables`. A value is inserted verbatim: `$&` stays
 * `$&` and a value holding `{{ other }}` is not expanded again. Arrays and
 * objects render as JSON, `null` and `undefined` as an empty string. A
 * placeholder with no matching variable is kept as written. The scan is linear
 * in the length of `content`, so an unclosed `{{` cannot stall it.
 */
export function renderInlineTemplate(
  content: string,
  variables: JsonObject,
): string {
  return content.replace(PLACEHOLDER, (placeholder, raw: string) => {
    const name = raw.trim();
    return Object.hasOwn(variables, name)
      ? renderValue(variables[name])
      : placeholder;
  });
}
