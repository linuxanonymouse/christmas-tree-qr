export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const state = await storage.getSnapshot();

    // Safety check - only reveal once COUNTDOWN is done
    if (state.status !== 'REVEALED') {
        return NextResponse.json({ error: 'Too early!' }, { status: 403 });
    }

    const code = state.winningCodes[state.activeQrIndex];

    if (!code) {
        return NextResponse.json({ error: 'No prize set' }, { status: 404 });
    }

    return NextResponse.json({ code });
}
