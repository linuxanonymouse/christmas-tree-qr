export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'christmas2025';

export async function POST(req: Request) {
    const key = req.headers.get('x-admin-key');
    if (key !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const newState = await storage.update(body);
        return NextResponse.json({ success: true, state: newState });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const key = req.headers.get('x-admin-key');
    if (key !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = await storage.getSnapshot();
    return NextResponse.json(state);
}
