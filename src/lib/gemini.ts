export const VALID_FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b'
];

/**
 * Maps UI model aliases to real working Google Gemini models
 */
export function mapModelAlias(modelName: string): string {
  if (modelName === 'gemini-3-flash-preview' || modelName === 'gemini-2.5-flash') return 'gemini-2.0-flash';
  if (modelName === 'gemini-3-pro-preview' || modelName === 'gemini-2.5-pro') return 'gemini-1.5-pro';
  if (modelName === 'gemini-2.0-flash-lite') return 'gemini-2.0-flash-lite-preview-02-05';
  return modelName || 'gemini-2.0-flash';
}

export async function generateContent(
  prompt: string, 
  systemInstruction?: string,
  onModelRetry?: (failedModel: string, nextModel: string, errorMsg: string) => void
): Promise<string> {
  const customApiKey = localStorage.getItem('gemini_api_key') || '';

  if (!customApiKey.trim()) {
    throw new Error('Chưa thiết lập Gemini API Key. Vui lòng nhấp vào nút "Settings (API Key)" trên Header để dán API Key.');
  }

  const selectedModelAlias = localStorage.getItem('selected_gemini_model') || 'gemini-2.0-flash';
  const primaryModel = mapModelAlias(selectedModelAlias);

  // Build model fallback queue starting with primary model
  const modelQueue = [
    primaryModel,
    ...VALID_FALLBACK_MODELS.map(mapModelAlias).filter(m => m !== primaryModel)
  ];

  // Remove duplicates
  const uniqueModelQueue = Array.from(new Set(modelQueue));

  let lastErrorMsg = '';

  for (let i = 0; i < uniqueModelQueue.length; i++) {
    const currentModel = uniqueModelQueue[i];
    try {
      // 1. Try Direct Browser Fetch to Google REST API (supports v1beta & v1)
      const directResult = await callGeminiDirectRest(
        customApiKey.trim(), 
        currentModel, 
        prompt, 
        systemInstruction
      );

      if (directResult) {
        return directResult;
      }

    } catch (directError: any) {
      lastErrorMsg = directError.message || String(directError);
      console.warn(`[AI Direct Fetch Failed] Model ${currentModel}:`, lastErrorMsg);

      // 2. Try Fallback via Proxy Endpoint (/api/generate)
      try {
        const proxyResult = await callGeminiProxyApi(
          customApiKey.trim(), 
          currentModel, 
          prompt, 
          systemInstruction
        );
        if (proxyResult) {
          return proxyResult;
        }
      } catch (proxyError: any) {
        lastErrorMsg = proxyError.message || lastErrorMsg;
        console.warn(`[AI Proxy API Failed] Model ${currentModel}:`, lastErrorMsg);
      }

      // If next model exists, notify retry
      if (i < uniqueModelQueue.length - 1) {
        const nextModel = uniqueModelQueue[i + 1];
        if (onModelRetry) {
          onModelRetry(currentModel, nextModel, lastErrorMsg);
        }
      }
    }
  }

  // If all models in queue failed, throw exact API error
  throw new Error(lastErrorMsg || 'Tất cả các model Gemini đều thất bại khi xử lý.');
}

/**
 * Direct browser REST API call to Google Generative Language API
 * Automatically tries v1beta then v1 endpoint versions
 */
async function callGeminiDirectRest(
  apiKey: string, 
  model: string, 
  prompt: string, 
  systemInstruction?: string
): Promise<string> {
  const apiVersions = ['v1beta', 'v1'];
  let lastErr = '';

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  for (const version of apiVersions) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errorDetails = data.error?.message || `Lỗi HTTP ${response.status}: ${response.statusText}`;
        const statusCode = data.error?.code || response.status;
        const statusText = data.error?.status || '';
        lastErr = `[${statusCode} ${statusText}] ${errorDetails}`;
      }
    } catch (netErr: any) {
      lastErr = netErr.message || String(netErr);
    }
  }

  throw new Error(lastErr || `Không thể kết nối đến model ${model}`);
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
