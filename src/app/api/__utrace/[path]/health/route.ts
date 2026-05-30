import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const sandboxMode = process.env.UTRACE_SANDBOX_MODE;
  if (sandboxMode !== "true") {
    return NextResponse.json(
      { error: "Sandbox mode is not enabled" },
      { status: 403 }
    );
  }

  const { path } = await params;

  return NextResponse.json({
    status: "ok",
    path,
    timestamp: new Date().toISOString(),
  });
}
