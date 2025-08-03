import { NextResponse } from "next/server";

export async function GET() {
    // Make request  to API
    const response = await fetch('https://api.starprince.dev/api/vehicle/listing');
    const data = await response.json();
    return NextResponse.json(data);
}
