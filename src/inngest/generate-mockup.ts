import { generateUIVariations } from '@/lib/ai/generate'
import { inngest } from './client'
import { prisma } from '@/db'

export const generateMockup = inngest.createFunction(
  {
    id: 'generate-mockup',
    retries: 2,
    concurrency: {
      limit: 5,
    },
  },
  {
    event: 'mockup/generation.requested',
  },

  async ({ event, step }) => {
    const { mockupId, prompt, aiModel, deviceType, uiLibrary } = event.data

    await step.run('update-status-generating', async () => {
      await prisma.mockup.update({
        where: {
          id: mockupId,
        },
        data: {
          status: 'GENERATING',
        },
      })
    })

    const generationResult = await step.run(
      'generate-ui-variations',
      async () => {
        const result = await generateUIVariations({
          prompt,
          deviceType,
          uiLibrary,
          model:aiModel
        })

        return result
      },
    )

    if (!generationResult.success || !generationResult.variations?.length) {
      await step.run('update-status-failed', async () => {
        await prisma.mockup.update({
          where: {
            id: mockupId,
          },
          data: {
            status: 'FAILED',
            code: `// generation failed ${generationResult.error || 'No variations generated'}`,
          },
        })
      })

      return {
        success: false,
        mockupId,
        error: generationResult.error || 'No variations generated',
      }
    }

    await step.run('save-variations', async () => {
      const variations = generationResult.variations!

      await prisma.mockup.update({
        where: { id: mockupId },
        data: {
          code: variations[0].code,
          status: 'COMPLETED',
        },
      })

      const versionPromises = variations.map((variation, index) =>
        prisma.mockupVersion.create({
          data: {
            mockupId,
            version: index + 1,
            code: variation.code,
            prompt: index === 0 ? prompt : `${prompt} (${variation.label})`,
          },
        }),
      )
      await Promise.all(versionPromises)
    });

    return {
          success:true,
        mockupId,
        variationsCount: generationResult.variations!.length,
        tokensUsed: generationResult.tokensUsed,
        message: `Generated ${generationResult.variations!.length} variations successfully`,

    }
  },
)
