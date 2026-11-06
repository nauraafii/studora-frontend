import { apiSuccess } from "@/server/http/api-response";

export const dynamic = "force-dynamic";

export function GET() {
  return apiSuccess({
    status: "ok",
    service: "studora-api",
    timestamp: new Date().toISOString(),
  });
}
