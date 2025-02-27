import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
  });
} else {
  console.warn("No OPENAI_API_KEY found. AI tagging functionality will be disabled.");
}

export async function generateImageTags(imageDescription: string): Promise<string[]> {
  // If OpenAI client isn't available, return empty tags array
  if (!openai) {
    console.log("OpenAI client not available. Skipping AI tag generation.");
    return [];
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates relevant tags for UI/UX screenshots. Generate concise, relevant tags that would be useful for searching and categorizing UI elements and design patterns."
        },
        {
          role: "user",
          content: `Generate relevant UI/UX tags for the following screenshot description, return only the tags separated by commas without any other text: ${imageDescription}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const tagsText = completion.choices[0]?.message?.content || "";
    return tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}
