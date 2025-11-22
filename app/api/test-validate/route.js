import { NextResponse } from "next/server";
import { validateOperation } from "@/backend/actions";

export async function POST(request) {
  try {
    const { id } = await request.json();
    const result = await validateOperation(id);
    
    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}