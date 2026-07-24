import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  accessToken,
  isExemptPath,
  middleware,
} from "./middleware";

const originalPassword = process.env.XMETRICS_PASSWORD;

afterEach(() => {
  if (originalPassword === undefined) {
    delete process.env.XMETRICS_PASSWORD;
  } else {
    process.env.XMETRICS_PASSWORD = originalPassword;
  }
});

describe("access middleware", () => {
  it.each([
    "/gate",
    "/api/gate",
    "/_next/static/chunk.js",
    "/favicon.ico",
    "/brand.svg",
  ])("allows the exempt path %s", (pathname) => {
    expect(isExemptPath(pathname)).toBe(true);
  });

  it("redirects a gated path without the access cookie", async () => {
    process.env.XMETRICS_PASSWORD = "test-password";
    const response = await middleware(
      new NextRequest("https://example.test/scenario"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.test/gate");
  });

  it("allows a gated path with a valid mocked cookie", async () => {
    process.env.XMETRICS_PASSWORD = "test-password";
    const token = await accessToken("test-password");
    const response = await middleware(
      new NextRequest("https://example.test/debrief", {
        headers: { cookie: `${ACCESS_COOKIE}=${token}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows traffic when the gate is not configured", async () => {
    delete process.env.XMETRICS_PASSWORD;
    const response = await middleware(
      new NextRequest("http://localhost/signals"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
