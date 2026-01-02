export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const state = storage.State;

    // Check if we need to auto-transition from COUNTDOWN to REVEALED
    let currentStatus = state.status;
    if (state.targetDate && currentStatus === 'COUNTDOWN' && Date.now() >= state.targetDate) {
        currentStatus = 'REVEALED';
        // storage.update({ status: 'REVEALED' }); // Optional side effect to persist, but read-only is safer for GET
    }

    return NextResponse.json({
        targetDate: state.targetDate,
        status: currentStatus,
        activeQrIndex: state.activeQrIndex
    });
}
