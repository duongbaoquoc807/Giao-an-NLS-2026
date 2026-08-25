export interface DiscoveredModel {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

export const DEFAULT_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
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
        .map((m: any) => m.name.replace(/^models\//, ''));

      if (validModels.length > 0) {
        try {
          localStorage.setItem('cached_available_models', JSON.stringify(validModels));
        } catch (e) {}
        return validModels;
      }
    }
  } catch (err) {
    console.warn('Cannot fetch dynamic models list:', err);
  }
  
  return DEFAULT_MODELS;
}

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
  
  // Exact match in available models
  const exact = availableModels.find(m => m.toLowerCase() === clean);
  if (exact) return exact;

  // Flash family matches
  if (clean.includes('3.7') || clean.includes('3.6') || clean.includes('3') || clean.includes('2.5') || clean.includes('flash')) {
    const flash = availableModels.find(m => m.includes('2.0-flash') || m.includes('1.5-flash') || m.includes('flash'));
    if (flash) return flash;
  }

  // Pro family matches
  if (clean.includes('pro')) {
    const pro = availableModels.find(m => m.includes('pro'));
    if (pro) return pro;
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

  const selectedModel = localStorage.getItem('selected_gemini_model') || 'gemini-3.7-flash';
  let availableModels = getCachedModels();
  const preferredModel = resolveModelName(selectedModel, availableModels);
  
  // Execution queue: user model first, then verified fallbacks
  const executionQueue = Array.from(new Set([
    selectedModel,
    preferredModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    ...availableModels
  ]));

  let lastErrorMsg = '';

  for (let i = 0; i < executionQueue.length; i++) {
    const currentModel = executionQueue[i];
    
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

      // 2. Try proxy endpoint (/api/generate)
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

      if (i < executionQueue.length - 1) {
        const nextModel = executionQueue[i + 1];
        if (onModelRetry) {
          onModelRetry(currentModel, nextModel, lastErrorMsg);
        }
      }
    }
  }

  // Final fallback with auto-discovered live models
  try {
    const liveModels = await fetchAvailableModels(customApiKey);
    if (liveModels.length > 0 && !executionQueue.includes(liveModels[0])) {
      const liveResult = await callGeminiDirectRest(customApiKey, liveModels[0], prompt, systemInstruction);
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
 * Automatically includes responseMimeType: "application/json" for JSON requests
 */
async function callGeminiDirectRest(
  apiKey: string, 
  model: string, 
  prompt: string, 
  systemInstruction?: string
): Promise<string> {
  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

  const isJsonExpected = prompt.includes('JSON') || prompt.includes('json');

  const fullPromptText = systemInstruction 
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  const generationConfig: any = {
    temperature: 0.7,
    topP: 0.95
  };

  if (isJsonExpected) {
    generationConfig.responseMimeType = 'application/json';
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: fullPromptText }
        ]
      }
    ],
    generationConfig
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
 * Robust, fault-tolerant JSON parser & extractor from AI outputs
 */
export function cleanAndParseJson<T>(rawText: string): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('Dữ liệu trả về từ AI rỗng.');
  }

  let text = rawText.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(text) as T;
  } catch (e) {}

  // 2. Extract from markdown code fence ```json ... ``` or ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T;
    } catch (e) {
      text = codeBlockMatch[1].trim();
    }
  }

  // 3. Extract between first '{' and last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let candidate = text.substring(firstBrace, lastBrace + 1);
    
    // Attempt parse extracted candidate
    try {
      return JSON.parse(candidate) as T;
    } catch (e) {}

    // 4. Sanitize common LLM JSON syntax imperfections
    try {
      // Replace smart quotes
      candidate = candidate
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");

      // Remove trailing commas before } or ]
      candidate = candidate.replace(/,\s*([}\]])/g, '$1');

      return JSON.parse(candidate) as T;
    } catch (e) {}
  }

  throw new Error('Không thể phân tích dữ liệu JSON trả về từ AI: ' + rawText.substring(0, 100));
}
