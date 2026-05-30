import { NextRequest, NextResponse } from "next/server";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";

const ADAPTER_PATH = "/__utrace/validation-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    return NextResponse.json({
      ready: true,
      adapter_path: ADAPTER_PATH,
      adapter_version: "v1",
    });
  } catch (error) {
    if (error instanceof AdapterAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
