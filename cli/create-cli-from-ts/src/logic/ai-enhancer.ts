import OpenAI from "openai";
import type { MainPackageJson, PackageStructure } from "../types";

export const useAIEnhancement = () => {
  return async (readme: string, packageStructure: PackageStructure, apiKey: string): Promise<string> => {
    const openai = new OpenAI({ apiKey });

    const prompt =
      `Enhance this README.md for a JavaScript/TypeScript package. Make it more comprehensive and professional:

${readme}

Package contains these files: ${packageStructure.files.map(f => f.path.split("/").pop()).join(", ")}

Add sections for:
- Better description
- Installation instructions
- API documentation
- Examples
- Contributing guidelines

Keep the existing structure but make it more detailed and professional.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 1500,
    });

    return completion.choices[0]?.message?.content || readme;
  };
};

export const useAIPackageEnhancement = () => {
  return async (
    packageJson: MainPackageJson,
    packageStructure: PackageStructure,
    apiKey: string,
  ): Promise<MainPackageJson> => {
    const openai = new OpenAI({ apiKey });

    const prompt = `Enhance this package.json metadata for better discoverability and professionalism:

${JSON.stringify(packageJson, null, 2)}

Package contains these files: ${packageStructure.files.map(f => f.path.split("/").pop()).join(", ")}

Improve:
- description (make it more descriptive and professional)
- keywords (add relevant, searchable keywords)
- Add appropriate repository, bugs, and homepage URLs if missing
- Enhance any other metadata fields appropriately

Return only the enhanced JSON object, no explanations.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 800,
    });

    try {
      const enhanced = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return { ...packageJson, ...enhanced };
    } catch {
      return packageJson;
    }
  };
};
