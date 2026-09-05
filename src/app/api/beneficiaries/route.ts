import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr_alex_rivera';

    const beneficiaries = await prisma.beneficiary.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return NextResponse.json({ error: 'Failed to fetch beneficiaries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'usr_alex_rivera', name, accountNumber, isKnown = false } = body;

    if (!name || !accountNumber) {
      return NextResponse.json({ error: 'Name and account number are required' }, { status: 400 });
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId,
        name,
        accountNumber,
        isKnown,
      },
    });

    return NextResponse.json({ beneficiary }, { status: 201 });
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return NextResponse.json({ error: 'Failed to create beneficiary' }, { status: 500 });
  }
}
