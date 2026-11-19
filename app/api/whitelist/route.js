import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';

const isExpired = (date) => date && new Date(date) < new Date();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const { data, error } = await supabase.from('whitelist').select('*').order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (format === 'txt') {
        const activeSIDs = data.filter(d => d.status === 'ACTIVE' && !isExpired(d.expired_at));
        const rawText = activeSIDs.map(d => d.sid).join('\n');
        return new NextResponse(rawText, {
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    return NextResponse.json(data);
}

export async function POST(request) {
    const body = await request.json();
    
    let expiredAt = null;
    if (body.duration !== 'Lifetime') {
        const days = parseInt(body.duration);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiredAt = date.toISOString();
    }

    const { data, error } = await supabase.from('whitelist').insert([{
        sid: body.sid,
        username: body.username,
        plan: body.duration === 'Lifetime' ? 'Lifetime' : `${body.duration} Hari`,
        expired_at: expiredAt,
        status: 'ACTIVE'
    }]).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
}

export async function PATCH(request) {
    const body = await request.json();
    const { error } = await supabase.from('whitelist').update({ status: body.status }).eq('sid', body.sid);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const sid = searchParams.get('sid');
    const { error } = await supabase.from('whitelist').delete().eq('sid', sid);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
}