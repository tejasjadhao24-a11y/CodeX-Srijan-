import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    let fileName = 'voice_sample.wav';

    // Handle JSON or FormData
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      fileName = body.fileName || fileName;
    }

    // Simulated neural voice analysis (60-90 score)
    const simulatedScores = [68, 74, 81, 86, 79];
    const deepfakeScore = simulatedScores[Math.floor(Math.random() * simulatedScores.length)];
    const note = 'Synthetic voice patterns detected: spectral frequency discontinuity in 2.4kHz–4.8kHz harmonic range';

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        deepfakeScore,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: updated.id,
      deepfakeScore: updated.deepfakeScore,
      note,
      simulated: true,
      audioFileName: fileName,
    });
  } catch (error) {
    console.error('Error in deepfake-check:', error);
    return NextResponse.json({ error: 'Deepfake analysis check failed' }, { status: 500 });
  }
}
