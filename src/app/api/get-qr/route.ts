import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const state = storage.State;

    // Only reveal QR if time reached or status explicitly REVEALED
    if (state.status === 'IDLE' || (state.targetDate && Date.now() < state.targetDate)) {
        return NextResponse.json({ error: 'Wait for the countdown!' }, { status: 403 });
    }

    // Get active code
    // For demo, just pick activeQrIndex or the first winning code
    // Get active code
    const code = state.winningCodes[state.activeQrIndex];

    if (!code) {
        return NextResponse.json({
            error: `No winning code set for Round #${state.activeQrIndex + 1}.`,
            debug: `Current Round: ${state.activeQrIndex + 1}, Total Codes: ${state.winningCodes.length}`
        }, { status: 404 });
    }

    return NextResponse.json({ code });
}
