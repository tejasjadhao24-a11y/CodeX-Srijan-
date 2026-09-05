import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guardianUserId = searchParams.get('guardianId') || 'usr_alex_rivera';

    const guardian = await prisma.user.findUnique({
      where: { id: guardianUserId },
      include: {
        dependents: true,
      },
    });

    if (!guardian) {
      return NextResponse.json({ error: 'Guardian user not found' }, { status: 404 });
    }

    const minorIds = guardian.dependents.map((d) => d.id);

    // Fetch all alerts for this guardian
    const alerts = await prisma.guardianAlert.findMany({
      where: { guardianUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        transaction: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Fetch minor transactions in the past 7 days for weekly spend calculation
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyMinorTxs = await prisma.transaction.findMany({
      where: {
        userId: { in: minorIds },
        timestamp: { gte: sevenDaysAgo },
      },
    });

    // Aggregate category spend
    const categorySpend: Record<string, number> = {};
    const merchantSpend: Record<string, number> = {};

    for (const tx of weeklyMinorTxs) {
      const cat = tx.category || 'general';
      categorySpend[cat] = (categorySpend[cat] || 0) + tx.amount;

      const merchant = tx.beneficiaryName || 'Other';
      merchantSpend[merchant] = (merchantSpend[merchant] || 0) + tx.amount;
    }

    // Prepare minor stats
    const minorsData = guardian.dependents.map((minor) => {
      const minorTxs = weeklyMinorTxs.filter((t) => t.userId === minor.id);
      const totalSpendThisWeek = minorTxs.reduce((sum, t) => sum + t.amount, 0);
      const pendingAlertsCount = alerts.filter(
        (a) => a.transaction.user.id === minor.id && a.status === 'PENDING'
      ).length;

      return {
        id: minor.id,
        name: minor.name,
        avgTransactionAmount: minor.avgTransactionAmount,
        minorSpendLimit: minor.minorSpendLimit,
        totalSpendThisWeek: Math.round(totalSpendThisWeek * 100) / 100,
        pendingAlertsCount,
      };
    });

    return NextResponse.json({
      guardian: {
        id: guardian.id,
        name: guardian.name,
      },
      minors: minorsData,
      alerts,
      categorySpend,
      merchantSpend,
    });
  } catch (error) {
    console.error('Error fetching guardian stats:', error);
    return NextResponse.json({ error: 'Failed to fetch guardian stats' }, { status: 500 });
  }
}
