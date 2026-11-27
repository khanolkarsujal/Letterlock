import { initializeApp } from "firebase/app";
import {
  getAI,
  GoogleAIBackend,
  getGenerativeModel,
  InferenceMode,
} from "firebase/ai";

const calls = [];

globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), method: init?.method, headers: init?.headers, body: init?.body });
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: "Subject: Audit\n\nDear Sir,\n\nBody." }] } }],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
};

const app = initializeApp({
  apiKey: "FAKE_API_KEY_FOR_AUDIT",
  projectId: "audit-project",
  appId: "1:1234567890:web:abcdef",
});

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_IN_CLOUD,
  inCloudParams: {
    model: "gemini-3.5-flash-lite",
    generationConfig: { maxOutputTokens: 768 },
  },
});

const systemInstruction = `You are a formal correspondence writer specializing in employment and unpaid salary disputes.
Write a firm, professional demand letter to an employer, payroll department, or manager requesting payment of unpaid salary or wages based strictly on the facts in the story.
[SHARED_RULES omitted in this snippet for the wire-format proof]

ALLOWED AND REQUIRED PLACEHOLDERS (exact list):
- {Person A}
- {Organization 1}`;

const userText = `<UNTRUSTED_USER_STORY>
My name is {Person A}, and I worked at {Organization 1}.
</UNTRUSTED_USER_STORY>`;

const result = await model.generateContent({
  systemInstruction,
  contents: [{ role: "user", parts: [{ type: "text", text: userText }] }],
});

console.log("SDK responded:", result.response.text());

for (const call of calls) {
  console.log("\nURL:", call.url);
  console.log("METHOD:", call.method);
  const headerNames = call.headers
    ? [...call.headers.keys()].map((key) => `${key}=${key === "x-goog-api-key" ? "<redacted>" : call.headers.get(key)}`)
    : [];
  console.log("HEADERS:", headerNames);
  const parsed = JSON.parse(call.body);
  console.log("BODY KEYS:", Object.keys(parsed));
  console.log("BODY (full):");
  console.log(JSON.stringify(parsed, null, 2));
}
