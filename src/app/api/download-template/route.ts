import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'public', 'guest-list-template.xlsx');
    const fileBuffer = readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="guest-list-template.xlsx"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving template file:', error);
    return NextResponse.json(
      { error: 'Template file not found' },
      { status: 404 }
    );
  }
}
