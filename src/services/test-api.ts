import { GoogleGenerativeAI } from "@google/generative-ai";

export async function testGeminiAPI() {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Say hello");
    const response = await result.response;
    console.log("API Test Response:", response.text());
    return true;
  } catch (error) {
    console.error("API Test Error:", error);
    return false;
  }
} 