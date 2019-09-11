import { default as fetch } from "node-fetch";

describe("confirm email", () => {
  it("rejects bad id", async () => {
    const response = await fetch(`${process.env.TEST_HOST}/confirm/1230875434`);
    const text = await response.text();
    expect(text).toEqual("error");
  });
});
