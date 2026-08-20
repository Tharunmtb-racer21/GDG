import { NextRequest, NextResponse } from "next/server";
import { runXGBoostInference } from "@/lib/services/realMlEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const temperature = Number(body.temperature ?? 35.0);
    const humidity = Number(body.humidity ?? 50.0);
    const windSpeed = Number(body.windSpeed ?? 10.0);
    const apparentTemperature = body.apparentTemperature ? Number(body.apparentTemperature) : undefined;
    const latitude = body.latitude ? Number(body.latitude) : undefined;
    const longitude = body.longitude ? Number(body.longitude) : undefined;

    const prediction = runXGBoostInference({
      temperature,
      humidity,
      windSpeed,
      apparentTemperature,
      latitude,
      longitude,
    });

    return NextResponse.json(prediction);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid prediction request format", status: "ERROR" },
      { status: 400 }
    );
  }
}
