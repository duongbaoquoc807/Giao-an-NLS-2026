export const VALID_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-3-flash-preview',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

/**
 * Returns alternative candidate model IDs for fallback retry
 */
export function getFallbackCandidates(modelName: string): string[] {
  const clean = (modelName || '').trim().toLowerCase();
  
  if (clean.includes('pro')) {
    return [
      'gemini-2.5-pro',
      'gemini-2.0-pro-exp-02-05',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];
  }
  
  // Default flash fallback queue
  return [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
}

export async function generateContent(
  prompt: string, 
  systemInstruction?: string,
  onModelRetry?: (failedModel: string, nextModel: string, errorMsg: string) => void
): Promise<string> {
  const customApiKey = (localStorage.getItem('gemini_api_key') || '').trim();

  if (!customApiKey) {
    throw new Error('Chưa thiết lập Gemini API Key. Vui lòng nhấp vào nút "Settings (API Key)" trên Header để dán API Key.');
  }

  const selectedModel = localStorage.getItem('selected_gemini_model') || 'gemini-2.5-flash';
  const candidates = getFallbackCandidates(selectedModel);

  // Build model queue starting with selected model
  const modelQueue = Array.from(new Set([
    selectedModel,
    ...candidates
  ]));

  let lastErrorMsg = '';

  for (let i = 0; i < modelQueue.length; i++) {
    const currentModel = modelQueue[i];
    
    // 1. Try direct browser REST API
    try {
      const result = await callGeminiDirectRest(
        customApiKey, 
        currentModel, 
        prompt, 
        systemInstruction
      );
      if (result && result.trim()) {
        return result;
      }
    } catch (directErr: any) {
      lastErrorMsg = directErr.message || String(directErr);
      console.warn(`[AI Direct Fetch Failed] Model ${currentModel}:`, lastErrorMsg);

      // 2. Try proxy endpoint (/api/generate) as backup
      try {
        const proxyResult = await callGeminiProxyApi(
          customApiKey, 
          currentModel, 
          prompt, 
          systemInstruction
        );
        if (proxyResult && proxyResult.trim()) {
          return proxyResult;
        }
      } catch (proxyErr: any) {
        lastErrorMsg = proxyErr.message || lastErrorMsg;
        console.warn(`[AI Proxy Failed] Model ${currentModel}:`, lastErrorMsg);
      }

      // Notify caller if retrying with next model
      if (i < modelQueue.length - 1) {
        const nextModel = modelQueue[i + 1];
        if (onModelRetry) {
          onModelRetry(currentModel, nextModel, lastErrorMsg);
        }
      }
    }
  }

  throw new Error(lastErrorMsg || 'Tất cả các model Gemini đều thất bại khi xử lý.');
}

/**
 * Direct browser REST API call to Google Generative Language v1beta API
 */
async function callGeminiDirectRest(
  apiKey: string, 
  model: string, 
  prompt: string, 
  systemInstruction?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const fullPromptText = systemInstruction 
    ? `[Hướng dẫn sư phạm]: ${systemInstruction}\n\n[Nội dung yêu cầu]:\n${prompt}`
    : prompt;

  const payload = {
    contents: [
      {
        parts: [
          { text: fullPromptText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorDetails = data.error?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
    const statusCode = data.error?.code || response.status;
    const statusText = data.error?.status || '';
    throw new Error(`[${statusCode} ${statusText}] ${errorDetails}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Dữ liệu phản hồi từ AI không chứa nội dung văn bản.');
  }

  return text;
}

/**
 * Fallback via server API endpoint (/api/generate)
 */
async function callGeminiProxyApi(
  apiKey: string, 
  model: string, 
  prompt: string, 
  systemInstruction?: string
): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt, 
      systemInstruction,
      customApiKey: apiKey,
      model
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Lỗi máy chủ proxy (${response.status})`);
  }

  const data = await response.json();
  return data.text;
}

/**
 * Utility to extract clean JSON object from Gemini markdown output
 */
export function cleanAndParseJson<T>(rawText: string): T {
  let cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const extracted = cleaned.substring(start, end + 1);
      return JSON.parse(extracted) as T;
    }
    throw new Error('Không thể phân tích dữ liệu JSON trả về từ AI: ' + (e as Error).message);
  }
}
