import { generateText } from 'ai'
import { getAIModel, type AIModel } from './providers'
import {
  generateEditSystemPrompt,
  generateEditUserPrompt,
  generateVariationsSystemPrompt,
  generateVariationsUserPrompt,
} from './prompt'
import type { DeviceType, UILibrary } from '@/server/mockup'

export type GenerationInput = {
  prompt: string
  deviceType: DeviceType
  uiLibrary: UILibrary
  model: AIModel
}

export type GenerationResult = {
  success: boolean
  code?: string
  error?: string
  tokensUsed?: number
}

export type VariationResult = {
  id: string
  code: string
  label: string
}

export type VariationsGenerationResult = {
  success: boolean
  variations?: VariationResult[]
  error?: string
  tokensUsed?: number
}

function extractVariationsFromResponse(response: string): VariationResult[] {
  const variations: VariationResult[] = []

  // Match code blocks with variation labels: ```html variation-1, ```html variation-2, etc.
  const labeledBlockRegex = /```html\s+variation-(\d+)\s*\n([\s\S]*?)```/g
  let match

  while ((match = labeledBlockRegex.exec(response)) !== null) {
    const variationNum = match[1]
    const code = match[2].trim()

    if (code) {
      variations.push({
        id: `v${variationNum}`,
        code,
        label: `Variation ${variationNum}`,
      })
    }
  }

  // If no labeled blocks found, try to extract any code blocks
  if (variations.length === 0) {
    const genericBlockRegex = /```(?:html)?\s*\n([\s\S]*?)```/g
    let index = 1

    while ((match = genericBlockRegex.exec(response)) !== null) {
      const code = match[1].trim()
      if (code && code.includes('<div')) {
        variations.push({
          id: `v${index}`,
          code,
          label: `Variation ${index}`,
        })
        index++
      }
    }
  }

  return variations
}

function validateGeneratedCode(code: string): {
  valid: boolean
  error?: string
} {
  if (
    !code.includes('<div') &&
    !code.includes('<section') &&
    !code.includes('<main')
  ) {
    return { valid: false, error: 'Missing container element' }
  }

  if (!code.includes('class=')) {
    return { valid: false, error: 'No CSS classes found' }
  }

  if (code.includes('// TODO') || code.includes('/* TODO')) {
    return { valid: false, error: 'Contains placeholder comments' }
  }

  if (code.includes('<script')) {
    return { valid: false, error: 'Script tags not allowed' }
  }

  return { valid: true }
}

function extractCodeFromResponse(response: string): string {
  const codeBlockRegex = /```(?:html)?\n?([\s\S]*?)```/;
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return response.trim();
}


export async function generateUIVariations(
  input: GenerationInput,
): Promise<VariationsGenerationResult> {
  const { prompt, deviceType, model, uiLibrary } = input

  try {
    const aiModel = getAIModel(model)
    const systemPrompt = generateVariationsSystemPrompt(uiLibrary, deviceType)
    const userPrompt = generateVariationsUserPrompt(prompt)

    const result = await generateText({
      model: aiModel,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    })

    const variations = extractVariationsFromResponse(result.text)

    const validVariations: VariationResult[] = []

    for (const variation of variations) {
      const validation = validateGeneratedCode(variation.code)

      if (validation.valid) {
        validVariations.push(variation)
      } else {
        console.warn(
          `Variation ${variation.id} failed validation: ${validation.error}`,
        )
      }
    }

    if(validVariations.length === 0){
        return {
            success:false,
            error:"No valid variations were generated",
             tokensUsed:result.usage?.totalTokens,
        }
    }
    return {
        success:true,
        variations:validVariations,
        tokensUsed:result.usage?.totalTokens
    }
  } catch (error) {
    console.error("AI variations generation error:", error);
    
    return {
      success: false,
      error: "An unexpected error occurred during generation",
    };
  }
}

export type EditInput = {
  currentHtml: string;
  editPrompt: string;
  model: AIModel;
};

export async function editUICode(input:EditInput):Promise<GenerationResult> {
    const {currentHtml , editPrompt , model} = input;

    try {
      const aiModel = getAIModel(model)
       const systemPrompt = generateEditSystemPrompt();
    const userPrompt = generateEditUserPrompt(currentHtml, editPrompt);

    const result = await generateText({
      model:aiModel,
      system:systemPrompt,
       prompt: userPrompt,
      temperature: 0.5, // Lower temperature for more precise edits
    })

     const extractedCode = extractCodeFromResponse(result.text);
    const  validation = validateGeneratedCode(extractedCode);

      if (!validation.valid) {
      return {
        success: false,
        error: `Edited code validation failed: ${validation.error}`,
      };
    }

    return {
      success: true,
      code: extractedCode,
      tokensUsed: result.usage?.totalTokens
    }

    } catch (error) {
       console.error("AI edit error:", error);
    
    return {
      success: false,
      error: "An unexpected error occurred during editing",
    };
    }
}