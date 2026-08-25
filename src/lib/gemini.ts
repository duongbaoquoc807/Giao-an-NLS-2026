export interface DiscoveredModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

// Default fallback list of verified Google Gemini models
export const DEFAULT_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-1.5-flash-8b'
];

/**
 * Dynamically queries Google AI to list all models available for the user's API Key
 */
export async function fetchAvailableModels(apiKey: string): Promise<string[]> {
  if (!apiKey || !apiKey.trim()) return DEFAULT_MODELS;
  
  const cleanKey = apiKey.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (res.ok && Array.isArray(data.models)) {
      const validModels = data.models
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => {
          // Normalize name: 'models/gemini-2.0-flash' -> 'gemini-2.0-flash'
          return m.name.replace(/^models\//, '');
        });

      if (validModels.length > 0) {
        // Cache discovered models in localStorage
        try {
          localStorage.setItem('cached_available_models', JSON.stringify(validModels));
        } catch (e) {}
        return validModels;
      }
    }
  } catch (err) {
    console.warn('Cannot fetch dynamic models list, using default model list:', err);
  }
  
  return DEFAULT_MODELS;
}

/**
 * Gets cached or default list of valid models
 */
export function getCachedModels(): string[] {
  try {
    const cached = localStorage.getItem('cached_available_models');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_MODELS;
}

/**
 * Resolves user selection to the best matching active Google model
 */
export function resolveModelName(selectedModel: string, availableModels: string[]): string {
  if (!selectedModel) return availableModels[0] || 'gemini-2.0-flash';
  
  const clean = selectedModel.trim().toLowerCase();
  
  // Exact match
  const exact = availableModels.find(m => m.toLowerCase() === clean);
  if (exact) return exact;

  // Pro match
  if (clean.includes('pro')) {
    const pro = availableModels.find(m => m.includes('pro'));
    if (pro) return pro;
  }

  // Flash 2.5 / 2.0 / 3.0 match
  if (clean.includes('2.5') || clean.includes('3') || clean.includes('flash')) {
    const flash2 = availableModels.find(m => m.includes('2.0-flash') || m.includes('2.5-flash'));
    if (flash2) return flash2;
    const anyFlash = availableModels.find(m => m.includes('flash'));
    if (anyFlash) return anyFlash;
  }

  return availableModels[0] || 'gemini-2.0-flash';
}

/**
 * Main AI Content Generation Function
 */
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
  
  // 1. Get verified model list (cached or default)
  let availableModels = getCachedModels();
  
  // 2. Resolve preferred model
  const preferredModel = resolveModelName(selectedModel, availableModels);
  
  // 3. Build unique execution queue starting with preferred model
  const executionQueue = Array.from(new Set([
    preferredModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    ...availableModels
  ]));

  let lastErrorMsg = '';

  for (let i = 0; i < executionQueue.length; i++) {
    const currentModel = executionQueue[i];
    
    // Attempt A: Direct REST call
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

      // Attempt B: Proxy call via /api/generate as secondary
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

      // If next model exists, notify retry
      if (i < executionQueue.length - 1) {
        const nextModel = executionQueue[i + 1];
        if (onModelRetry) {
          onModelRetry(currentModel, nextModel, lastErrorMsg);
        }
      }
    }
  }

  // If initial queue failed, try fetching dynamic list from Google and retry once with first discovered model
  try {
    const liveModels = await fetchAvailableModels(customApiKey);
    if (liveModels.length > 0 && !executionQueue.includes(liveModels[0])) {
      const liveModel = liveModels[0];
      const liveResult = await callGeminiDirectRest(customApiKey, liveModel, prompt, systemInstruction);
      if (liveResult && liveResult.trim()) {
        return liveResult;
      }
    }
  } catch (e: any) {
    lastErrorMsg = e.message || lastErrorMsg;
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
  // Normalize model name
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const fullPromptText = systemInstruction 
    ? `[Hướng dẫn chuyên môn]: ${systemInstruction}\n\n[Nhiệm vụ]:\n${prompt}`
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
  const cleanModel = model.replace(/^models\//, '');
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt, 
      systemInstruction,
      customApiKey: apiKey,
      model: cleanModel
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
