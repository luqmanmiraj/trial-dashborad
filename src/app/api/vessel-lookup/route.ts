import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imo = searchParams.get("imo");

  if (!imo) {
    return NextResponse.json({ error: "IMO number required" }, { status: 400 });
  }

  try {
    const url = `https://www.marinetraffic.com/en/ais/details/ships/imo:${imo}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vessel data");
    }

    const html = await response.text();
    
    // Extract vessel name from title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1] : "";
    
    // Extract vessel name (before "Registered in")
    const nameMatch = titleText.match(/^([^-]+)\s-\sRegistered in/);
    const vesselName = nameMatch ? nameMatch[1].trim() : "";
    
    // Extract flag/country (between "Registered in" and next dash)
    const flagMatch = titleText.match(/Registered in\s+(.+?)\s+-/);
    const vesselFlag = flagMatch ? flagMatch[1].trim() : "";

    if (!vesselName || !vesselFlag) {
      return NextResponse.json(
        { error: "Could not extract vessel information" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      vessel_name: vesselName,
      vessel_flag: vesselFlag,
      imo: imo,
    });
  } catch (error) {
    console.error("Vessel lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup vessel" },
      { status: 500 }
    );
  }
}

