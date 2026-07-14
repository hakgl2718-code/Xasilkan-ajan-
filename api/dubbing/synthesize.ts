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
    const { text, targetLanguage, speakerUrl, replicateToken } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Seslendirilecek metin bulunamadı' });
    }

    const defaultSpeakerUrl = "https://replicate.delivery/pbxt/Jt79CgCseXm6o05Yg2YgX8g2mY76y8uYf8U7Kx5v7q/female.wav";
    const referenceSpeaker = speakerUrl || defaultSpeakerUrl;

    const prediction = await runReplicateModel("lucataco/xtts-v2", {
      text: text,
      speaker: referenceSpeaker,
      language: targetLanguage || "tr"
    }, false, replicateToken);

    const output = prediction.output;
    let audioResultUrl = "";

    if (typeof output === "string") {
      audioResultUrl = output;
    } else if (Array.isArray(output)) {
      audioResultUrl = output[0] || "";
    } else if (output && typeof output === "object") {
      audioResultUrl = output.audio || output.url || JSON.stringify(output);
    }

    return res.status(200).json({
      audioUrl: audioResultUrl
    });
  } catch (error: any) {
    console.error('Dubbing synthesize error:', error);
    return res.status(500).json({ error: error.message || 'Seslendirme hatası oluştu' });
  }
}
