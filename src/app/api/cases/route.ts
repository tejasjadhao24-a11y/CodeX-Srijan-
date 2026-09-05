import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const whereClause: Record<string, unknown> = {
      riskLevel: { in: ['HIGH', 'CRITICAL'] },
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const cases = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        beneficiary: true,
        user: { select: { id: true, name: true, avgTransactionAmount: true } },
      },
    });

    const formattedCases = cases.map((c) => {
      let parsedFactors = [];
      try {
        parsedFactors = JSON.parse(c.riskFactors);
      } catch {
        parsedFactors = [];
      }

      return {
        ...c,
        riskFactors: parsedFactors,
      };
    });

    return NextResponse.json({
      total: formattedCases.length,
      cases: formattedCases,
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
