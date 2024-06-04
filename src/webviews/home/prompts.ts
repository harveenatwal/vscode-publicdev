import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Commit } from "../../git";
import { Profile } from "../lib/types";
import { getPreferredPlatforms, getProfile } from "../lib/configuration";

export function systemMessage(): ChatCompletionMessageParam {
  return {
    role: "system",
    content: `You are PublicDevAI, an expert in crafting compelling social media content for developers and technical audiences. Your primary goal is to help users transform their code commits into engaging posts that resonate with their followers and showcase their work. Remember, your ultimate goal is to empower users to share their work effectively and authentically on social media.`,
  };
}

export function brainstormIdeasPromptJsonSchema(): ChatCompletionMessageParam {
  const preferredPlatforms = getPreferredPlatforms();

  const schema = {
    type: "object",
    properties: {
      posts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            commitMessage: {
              type: "string",
              description:
                "The short description of the code commit to be used as a basis for the social media post.",
            },
            postIdeas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ideaType: {
                    type: "string",
                    description:
                      "A concise phrase (3-8 words) summarizing the post's main theme and hinting at the format/style. Avoid emojis.",
                  },
                  format: {
                    type: "string",
                    enum: [
                      "Short Text",
                      "Image with Caption",
                      "Question",
                      "Meme",
                      "Tech Tip",
                      "Animated Demo",
                    ],
                    description: "The format of the social media post.",
                  },
                  platform: {
                    type: "string",
                    enum: preferredPlatforms,
                    description: "The suggested platform for the post.",
                  },
                  content: {
                    type: "string",
                    description:
                      "The text content of the post, including any suggested emojis or hashtags.",
                  },
                  visual: {
                    type: "string",
                    description:
                      "Optional description of a visual element (image, GIF, video) to accompany the post.",
                  },
                },
                required: ["title", "format", "platform", "content"],
              },
            },
          },
          required: ["commitMessage", "postIdeas"],
        },
      },
    },
  };

  return {
    role: "system",
    content:
      "Provide your output in json format with the following schema:\n\n" +
      `\`\`\`json\n${JSON.stringify(schema)}\n\`\`\``,
  };
}

export function brainstormIdeasPrompt(
  commits: Commit[]
): ChatCompletionMessageParam {
  const profile = getProfile();
  const preferredPlatforms = getPreferredPlatforms();
  const commitSummaries = commits.map((commit) => commit.message).join("\n - ");

  let prompt = `Brainstorm creative social media ideas based on these recent code commits:\n\n - ${commitSummaries}\n\n`;

  if (profile) {
    prompt = profilePromptPartial(profile) + "\n\n" + prompt;
  }

  prompt += `Consider the following when generating ideas:
  
  ${
    profile
      ? "* **Tone:** Align with the user's profile"
      : "* **Tone:** Suggest various tones (professional, witty, technical, etc.)"
  }
  ${
    preferredPlatforms.length > 0
      ? `* **Platform:** Provide ideas suitable for these platforms: ${preferredPlatforms.join(
          ","
        )}`
      : "* **Platform:** Provide ideas suitable for any platform (i.e Twitter, LinkedIn)"
  }
  * **Format:** Suggest various formats (short text, questions, images with captions, etc.)
  * **Call to Action:** Include options for engaging the audience (e.g., "Check out my latest update!", "What are your thoughts?")
  * **Hashtags:** Suggest relevant hashtags for better reach
  
  Generate a diverse list of ideas with varying styles and approaches.`;

  return {
    role: "user",
    content: prompt,
  };
}

const profilePromptPartial = (profile: Profile) => {
  let content = `Given the following user profile\n`;
  return content + `\`\`\`json\n${JSON.stringify(profile)}\n\`\`\``;
};
