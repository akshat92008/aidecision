import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { PdfReport } from '@/components/PdfReport';
import { FinalReportSchema } from '@/lib/shared/schemas';
import React from 'react';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { report, query } = body;

    // Validate report data
    const validatedReport = FinalReportSchema.parse(report);

    // Render the PDF to a buffer
    // Note: React.createElement is used here for server-side PDF rendering compatibility
    const stream = await renderToBuffer(
      React.createElement(PdfReport, { report: validatedReport, query })
    );

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Nexus_Strategic_Audit_${query.replace(/ /g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('[API: PDF] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF audit.',
      details: error.message 
    }, { status: 500 });
  }
}
