import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { minorId, minorSpendLimit } = body;

    if (!minorId || minorSpendLimit === undefined) {
      return NextResponse.json({ error: 'minorId and minorSpendLimit are required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: minorId },
      data: {
        minorSpendLimit: parseFloat(minorSpendLimit),
      },
    });

    return NextResponse.json({
      success: true,
      minorId: updatedUser.id,
      minorSpendLimit: updatedUser.minorSpendLimit,
    });
  } catch (error) {
    console.error('Error updating minor spend limit:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
