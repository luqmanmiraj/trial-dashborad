import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Forward the request to the Python backend
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    const response = await fetch(`${apiBase}/generate-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to generate invoice" },
        { status: response.status }
      );
    }

    // Check if response is a PDF
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/pdf")) {
      // Return the PDF as a blob
      const pdfBuffer = await response.arrayBuffer();
      
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${body.vessel_name?.replace(/\s+/g, '_')}-${Date.now()}.pdf"`,
        },
      });
    } else {
      // Return JSON response
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

