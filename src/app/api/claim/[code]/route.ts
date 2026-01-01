import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params; // Await params in newer Next.js
        const decodedCode = atob(code); // Decode Base64

        // Simple validation: Ensure it's a number as per user request ("number is base64 encoded")
        if (isNaN(Number(decodedCode))) {
            return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
        }

        const { success, message } = storage.attemptClaim(code);

        return NextResponse.json({ success, message });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
