import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { MatchedPhrase, VoiceCheckResponse } from './types';

interface PhraseCategoryDef {
  category: 'urgency' | 'authority' | 'secrecy' | 'isolation';
  points: number;
  phrases: string[];
}

const PHRASE_CATEGORIES: PhraseCategoryDef[] = [
  {
    category: 'authority',
    points: 15,
    phrases: [
      'this is your ceo',
      'ceo',
      'bank security',
      'police department',
      'police',
      'compliance officer',
      'federal agent',
      'executive director'
    ],
  },
  {
    category: 'urgency',
    points: 10,
    phrases: [
      'immediately',
      'right now',
      'urgent',
      "before it's too late",
      'asap',
      'hurry'
    ],
  },
  {
    category: 'secrecy',
    points: 15,
    phrases: [
      "don't tell anyone",
      'do not tell anyone',
      'keep this confidential',
      'strictly confidential',
      'keep this secret',
      'between us'
    ],
  },
  {
    category: 'isolation',
    points: 10,
    phrases: [
      "don't call the office",
      'do not call the office',
      'use this number only',
      'stay on the line',
      'do not hang up',
      'stay on the call'
    ],
  },
];

export const VOSK_DISCLAIMER =
  'Speech-to-text and phrase analysis via Vosk — analyzes what was said, not speaker identity or voice authenticity.';

export async function transcribeAudioFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Find python executable
    const pythonPaths = [
      'C:\\Users\\ASUS\\AppData\\Local\\Programs\\Python\\Python313\\python.exe',
      'python',
      'python3'
    ];

    let pythonBin = 'python';
    for (const p of pythonPaths) {
      if (fs.existsSync(p)) {
        pythonBin = p;
        break;
      }
    }

    const scriptPath = path.resolve(process.cwd(), 'src/lib/transcribe.py');
    const child = spawn(pythonBin, [scriptPath, filePath]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      try {
        // Look for JSON output in stdout
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed.success && typeof parsed.transcript === 'string') {
            resolve(parsed.transcript);
            return;
          } else if (parsed.error) {
            resolve(''); // Graceful fallback on silence/empty
            return;
          }
        }
        resolve(stdout.trim());
      } catch (err) {
        console.error('Error parsing transcription output:', err, stdout, stderr);
        resolve('');
      }
    });

    child.on('error', (err) => {
      console.error('Failed to spawn python transcription process:', err);
      resolve('');
    });
  });
}

export function analyzeTranscriptPhrases(transcript: string): {
  voiceSignalScore: number;
  matchedPhrases: MatchedPhrase[];
} {
  if (!transcript || !transcript.trim()) {
    return { voiceSignalScore: 0, matchedPhrases: [] };
  }

  const lower = transcript.toLowerCase();
  const matchedPhrases: MatchedPhrase[] = [];
  const triggeredCategories = new Set<'urgency' | 'authority' | 'secrecy' | 'isolation'>();

  for (const cat of PHRASE_CATEGORIES) {
    for (const phrase of cat.phrases) {
      const idx = lower.indexOf(phrase);
      if (idx !== -1) {
        // Extract surrounding context snippet
        const start = Math.max(0, idx - 20);
        const end = Math.min(transcript.length, idx + phrase.length + 20);
        const snippet = `...${transcript.substring(start, end).trim()}...`;

        matchedPhrases.push({
          phrase,
          category: cat.category,
          snippet,
          points: cat.points,
        });

        triggeredCategories.add(cat.category);
        break; // Count once per category
      }
    }
  }

  // Calculate score from triggered categories, capped at 50
  let totalScore = 0;
  for (const cat of PHRASE_CATEGORIES) {
    if (triggeredCategories.has(cat.category)) {
      totalScore += cat.points;
    }
  }

  const voiceSignalScore = Math.min(50, totalScore);

  return {
    voiceSignalScore,
    matchedPhrases,
  };
}

export async function processVoiceAnalysis(filePath: string): Promise<VoiceCheckResponse> {
  try {
    const transcript = await transcribeAudioFile(filePath);
    const { voiceSignalScore, matchedPhrases } = analyzeTranscriptPhrases(transcript);

    return {
      success: true,
      transcript,
      voiceSignalScore,
      matchedPhrases,
      disclaimer: VOSK_DISCLAIMER,
    };
  } catch (error: any) {
    console.error('Voice analysis execution error:', error);
    return {
      success: false,
      transcript: '',
      voiceSignalScore: 0,
      matchedPhrases: [],
      disclaimer: VOSK_DISCLAIMER,
      error: error?.message || 'Speech-to-text processing failed',
    };
  }
}
