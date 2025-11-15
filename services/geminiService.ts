
import { GoogleGenAI, Type, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyGenerationModel = 'gemini-2.5-flash';
const imageGenerationModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';

export const generateStoryPages = async (prompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: `You are a creative storyteller for children aged 3 to 7. Create a short, happy story based on the following topic: '${prompt}'. The story must be exactly 5 pages long. Respond with ONLY a valid JSON object in the format {"pages": ["page 1 text", "page 2 text", "page 3 text", "page 4 text", "page 5 text"]}, with no other text, comments, or markdown formatting. Each page should be a short paragraph.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && Array.isArray(result.pages)) {
      return result.pages;
    } else {
      throw new Error("Invalid story format received from API.");
    }
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to create a story. Please try another idea!");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `A whimsical, friendly, and colorful children's book illustration of: ${prompt}. Simple, vibrant, and joyful cartoon style.`;
    const response = await ai.models.generateImages({
      model: imageGenerationModel,
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64Image = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64Image}`;
    } else {
      throw new Error("No image generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder or re-throw
    throw new Error("Could not draw an image for this page.");
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: `Say cheerfully in a friendly storyteller's voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
          throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Could not generate audio for this page.");
    }
};
