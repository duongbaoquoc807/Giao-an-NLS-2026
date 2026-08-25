var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, customApiKey, model } = req.body;
      const apiKey = (customApiKey || req.headers["x-api-key"] || process.env.GEMINI_API_KEY || "").trim();
      if (!apiKey) {
        return res.status(401).json({
          error: "Ch\u01B0a c\u1EA5u h\xECnh GEMINI_API_KEY. Vui l\xF2ng nh\u1EADp API Key trong ph\u1EA7n C\xE0i \u0111\u1EB7t."
        });
      }
      let modelName = model || "gemini-2.0-flash";
      if (modelName.includes("3-pro") || modelName.includes("pro")) modelName = "gemini-1.5-pro";
      else if (modelName.includes("1.5-flash")) modelName = "gemini-1.5-flash";
      else modelName = "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const fullPromptText = systemInstruction ? `[H\u01B0\u1EDBng d\u1EABn s\u01B0 ph\u1EA1m]: ${systemInstruction}

[N\u1ED9i dung y\xEAu c\u1EA7u]:
${prompt}` : prompt;
      const payload = {
        contents: [
          {
            parts: [{ text: fullPromptText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      };
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error?.message || `L\u1ED7i API (${response.status}): ${response.statusText}`;
        return res.status(response.status).json({ error: errorMsg });
      }
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return res.json({ text: generatedText });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: error.message || "L\u1ED7i khi k\u1EBFt n\u1ED1i v\u1EDBi m\xE1y ch\u1EE7 AI Gemini." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Server EduPlan AI running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
