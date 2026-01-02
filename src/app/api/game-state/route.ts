export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    const state = await storage.getSnapshot();
    // Public safe view
    return NextResponse.json({
        targetDate: state.targetDate,
        status: state.status,
        activeQrIndex: state.activeQrIndex
    });
}
