import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params; // Await params in newer Next.js
        const decoded = atob(code); // It's base64 encoded by default in our app
        console.log(`Attempting claim for ${decoded}`);

        const result = await storage.attemptClaim(code);
        if (result.success) {
            return NextResponse.json({ message: result.message });
        } else {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }
    } catch (e) {
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
}
