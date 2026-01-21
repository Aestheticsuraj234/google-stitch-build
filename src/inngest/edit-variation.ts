import { editUICode } from '@/lib/ai/generate'
import { inngest } from './client'
import { prisma } from '@/db'

export const editVariation = inngest.createFunction(
  {
    id: 'edit-variation',
    retries: 2,
    concurrency: {
      limit: 5,
    },
  },
  { event: 'mockup/variation.edit.requested' },

  async ({ event, step }) => {
    const { versionId, mockupId, currentHtml, editPrompt, aiModel } = event.data

    const editResult = await step.run('edit-ui-code', async () => {
      const result = await editUICode({
        currentHtml,
        editPrompt,
        model:aiModel
      })

      return result;
    })

    if (!editResult.success || !editResult.code) {
      return {
        success: false,
        versionId,
        mockupId,
        error: editResult.error || 'Failed to generate edited code',
      }
    }

    const updatedVersion = await step.run("updated-version" , async()=>{
        const versionData = await prisma.mockupVersion.findUnique({
            where:{id:versionId},
            select:{
                version:true
            }
        })

        const version = await prisma.mockupVersion.update({
            where:{id:versionId},
            data:{
                code:editResult.code!,
                prompt:editPrompt
            }
        })

        if(versionData?.version === 1){
              await prisma.mockup.update({
          where: { id: mockupId },
          data: { code: editResult.code! },
        });

        return version
        }
    })

     return {
      success: true,
      versionId,
      mockupId,
      updatedVersionId: updatedVersion?.id,
      tokensUsed: editResult.tokensUsed,
      message: "Variation edited successfully",
    };
  },
)
