import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { answer } = body;

    const answerScores: Record<string, number> = {
      self: 0,
      whatsapp_call: 30,
      employer_impersonation: 35,
      bank_police_impersonation: 40,
      secrecy_demanded: 50,
    };

    const socialEngineeringScore = answerScores[answer] !== undefined ? answerScores[answer] : 25;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        socialEngineeringAnswer: answer,
        socialEngineeringScore,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: updatedTransaction.id,
      socialEngineeringAnswer: updatedTransaction.socialEngineeringAnswer,
      socialEngineeringScore: updatedTransaction.socialEngineeringScore,
    });
  } catch (error) {
    console.error('Error in social-check:', error);
    return NextResponse.json({ error: 'Social engineering check failed' }, { status: 500 });
  }
}
