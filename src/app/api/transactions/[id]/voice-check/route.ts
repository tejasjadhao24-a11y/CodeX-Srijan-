import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processVoiceAnalysis, VOSK_DISCLAIMER } from '@/lib/voiceAnalyzer';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  let tempFilePath: string | null = null;
  try {
    const { id } = await context.params;

    // Verify transaction exists
    const tx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    let targetAudioPath = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('audio') as File | null;
      const demoPreset = formData.get('demoPreset') as string | null;

      if (demoPreset === 'scam') {
        targetAudioPath = path.resolve(process.cwd(), 'public/audio/scam_call_sample.wav');
      } else if (demoPreset === 'normal') {
        targetAudioPath = path.resolve(process.cwd(), 'public/audio/normal_call_sample.wav');
      } else if (file && typeof file.arrayBuffer === 'function') {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (buffer.length < 100) {
          return NextResponse.json({
            success: false,
            transcript: '',
            voiceSignalScore: 0,
            matchedPhrases: [],
            disclaimer: VOSK_DISCLAIMER,
            error: 'Audio file is empty or too short to analyze.',
          });
        }

        const ext = file.name ? path.extname(file.name) || '.wav' : '.wav';
        const tempDir = path.join(os.tmpdir(), 'fraudguard_audio');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        tempFilePath = path.join(tempDir, `rec_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
        fs.writeFileSync(tempFilePath, buffer);
        targetAudioPath = tempFilePath;
      } else {
        return NextResponse.json(
          { error: 'No audio file or demo preset provided' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      if (body.demoPreset === 'scam') {
        targetAudioPath = path.resolve(process.cwd(), 'public/audio/scam_call_sample.wav');
      } else if (body.demoPreset === 'normal') {
        targetAudioPath = path.resolve(process.cwd(), 'public/audio/normal_call_sample.wav');
      } else if (body.audioPath && fs.existsSync(body.audioPath)) {
        targetAudioPath = body.audioPath;
      } else {
        targetAudioPath = path.resolve(process.cwd(), 'public/audio/scam_call_sample.wav');
      }
    } else {
      targetAudioPath = path.resolve(process.cwd(), 'public/audio/scam_call_sample.wav');
    }

    if (!fs.existsSync(targetAudioPath)) {
      return NextResponse.json({
        success: false,
        transcript: '',
        voiceSignalScore: 0,
        matchedPhrases: [],
        disclaimer: VOSK_DISCLAIMER,
        error: 'Target audio file could not be accessed.',
      });
    }

    // Process transcription and threat phrase detection
    const result = await processVoiceAnalysis(targetAudioPath);

    // Persist real analysis to database
    await prisma.transaction.update({
      where: { id },
      data: {
        transcript: result.transcript,
        voiceSignalScore: result.voiceSignalScore,
        matchedPhrases: JSON.stringify(result.matchedPhrases),
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: id,
      transcript: result.transcript,
      voiceSignalScore: result.voiceSignalScore,
      matchedPhrases: result.matchedPhrases,
      disclaimer: result.disclaimer,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error in /voice-check route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Voice analysis failed',
        transcript: '',
        voiceSignalScore: 0,
        matchedPhrases: [],
        disclaimer: VOSK_DISCLAIMER,
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary audio file if created
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        // ignore cleanup error
      }
    }
  }
}
