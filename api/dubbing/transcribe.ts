import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runReplicateModel } from '../_lib/replicate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { video, replicateToken } = req.body; 
    if (!video) {
      return res.status(400).json({ error: 'Video veya ses verisi bulunamadı' });
    }

    const prediction = await runReplicateModel("openai/whisper", {
      audio: video,
      model: "base",
      transcription: "plain text"
    }, false, replicateToken);

    const output = prediction.output;
    let transcript = "";
    let detectedLanguage = "tr";

    if (typeof output === "string") {
      transcript = output;
    } else if (output && typeof output === "object") {
      transcript = output.transcription || output.text || JSON.stringify(output);
      if (output.detected_language) {
        detectedLanguage = output.detected_language;
      }
    }

    const replicateUploadedAudioUrl = prediction.input?.audio || null;

    return res.status(200).json({
      transcript: transcript.trim(),
      detectedLanguage,
      audioUrl: replicateUploadedAudioUrl
    });
  } catch (error: any) {
    console.error('Dubbing transcribe error:', error);
    return res.status(500).json({ error: error.message || 'Deşifre hatası oluştu' });
  }
}
