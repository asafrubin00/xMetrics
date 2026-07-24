import { ACCESS_COOKIE, accessToken } from "@/middleware";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const configuredPassword = process.env.XMETRICS_PASSWORD;
  if (!configuredPassword) {
    return Response.json({ success: true });
  }

  let submittedPassword: unknown;
  try {
    ({ password: submittedPassword } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof submittedPassword !== "string" ||
    submittedPassword !== configuredPassword) {
    return Response.json(
      { error: "That password is not recognised." },
      { status: 401 },
    );
  }

  const response = Response.json({ success: true });
  response.headers.append(
    "Set-Cookie",
    `${ACCESS_COOKIE}=${await accessToken(configuredPassword)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${THIRTY_DAYS}`,
  );
  return response;
}
