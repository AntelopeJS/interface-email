import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderInlineTemplate } from "../src/render.ts";

void describe("renderInlineTemplate", () => {
  void it("inserts a value holding $& verbatim", () => {
    assert.equal(
      renderInlineTemplate("{{ price }} off", { price: "$& off" }),
      "$& off off",
    );
  });

  void it("matches a name with regex metacharacters literally", () => {
    assert.equal(
      renderInlineTemplate("{{ a.b }} | {{ aXb }} | {{ (x }}", {
        "a.b": "dot",
        "(x": 1,
      }),
      "dot | {{ aXb }} | 1",
    );
  });

  void it("does not expand a placeholder held by a value", () => {
    assert.equal(
      renderInlineTemplate("{{ first }}", {
        first: "{{ second }}",
        second: "leaked",
      }),
      "{{ second }}",
    );
  });

  void it("looks a name up among own keys only", () => {
    assert.equal(
      renderInlineTemplate("{{ constructor }}", {}),
      "{{ constructor }}",
    );
  });

  void it("renders structured values as JSON and null as empty", () => {
    assert.equal(
      renderInlineTemplate("{{ o }} {{ a }} {{ n }}", {
        o: { id: 7 },
        a: ["a", "b"],
        n: null,
      }),
      '{"id":7} ["a","b"] ',
    );
  });

  void it("finishes a 3000-space unclosed {{ under 100 ms", () => {
    const content = `{{${" ".repeat(3000)}`;
    const start = performance.now();
    const rendered = renderInlineTemplate(content, { name: "Antelope" });
    assert.ok(performance.now() - start < 100);
    assert.equal(rendered, content);
  });
});
