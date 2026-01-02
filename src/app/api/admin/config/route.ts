export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'christmas2025';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('x-admin-key');

        if (authHeader !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate and update
        storage.update(body);

        return NextResponse.json({ success: true, state: storage.State });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('x-admin-key');

    if (authHeader !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(storage.State);
}
