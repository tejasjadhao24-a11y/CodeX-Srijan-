import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, acknowledged } = body;

    const alert = await prisma.guardianAlert.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Guardian alert not found' }, { status: 404 });
    }

    const updatedAlert = await prisma.guardianAlert.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(acknowledged !== undefined && { acknowledged }),
      },
    });

    // Sync transaction status if decision made
    if (status === 'APPROVED') {
      await prisma.transaction.update({
        where: { id: alert.transactionId },
        data: { status: 'APPROVED', actionTaken: 'PROCEED' },
      });
    } else if (status === 'REJECTED') {
      await prisma.transaction.update({
        where: { id: alert.transactionId },
        data: { status: 'CANCELLED', actionTaken: 'HOLD_ESCALATE' },
      });
    }

    return NextResponse.json({ success: true, alert: updatedAlert });
  } catch (error) {
    console.error('Error updating guardian alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
