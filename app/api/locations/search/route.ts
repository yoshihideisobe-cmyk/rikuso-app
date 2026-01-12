import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Location from '@/models/Location';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json([]);
    }

    await dbConnect();

    // "Split by space and AND search"
    const keywords = q.trim().split(/\s+/);

    const query = {
        $and: keywords.map(word => ({
            search_text: { $regex: word, $options: 'i' }
        }))
    };

    try {
        const locations = await Location.find(query).limit(50).lean();
        return NextResponse.json(locations);
    } catch (e) {
        console.error('Search failed:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
