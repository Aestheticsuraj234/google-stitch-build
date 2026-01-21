import { prisma } from '@/db'
import { inngest } from '@/inngest'
import { authFnMiddleware } from '@/middleware/auth'
import { createServerFn } from '@tanstack/react-start'

export type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOTH'
export type UILibrary = 'SHADCN' | 'MATERIAL_UI' | 'ANT_DESIGN' | 'ACETERNITY'
export type MockupStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED'
export type AIModel = 'sketch-mini' | 'sketch-pro'

export const MockupStatus = {
  PENDING: 'PENDING' as const,
  GENERATING: 'GENERATING' as const,
  COMPLETED: 'COMPLETED' as const,
  FAILED: 'FAILED' as const,
}

export type MockupWithProject = {
  id: string
  name: string
  prompt: string
  deviceType: DeviceType
  uiLibrary: UILibrary
  status: MockupStatus
  createdAt: Date
  updatedAt: Date
  project: {
    id: string
    name: string
  }
}

type CreateMockupInput = {
  prompt: string
  deviceType: DeviceType
  uiLibrary: UILibrary
  aiModel: AIModel
  projectName?: string
}

type CreateMockupResult = {
  success: boolean
  mockupId?: string
  projectId?: string
  error?: string
}

export const createMockup = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator((data: CreateMockupInput) => data)
  .handler(async ({ data, context }): Promise<CreateMockupResult> => {
    try {
      const userId = context.session.user.id

      if (!userId) {
        return {
          success: false,
          error: 'Unauthorized. Please sign in to create mockups.',
        }
      }

      const { aiModel, deviceType, prompt, uiLibrary, projectName } = data

      const project = await prisma.project.create({
        data: {
          name: projectName || `Project ${new Date().toLocaleDateString()}`,
          description: prompt.slice(0, 200),
          userId,
        },
      })

      // create the mockup with pending status

      const mockup = await prisma.mockup.create({
        data: {
          name: `Mockup - ${prompt.slice(0, 50)}...`,
          prompt,
          code: '', // Will be filled by Inngest job
          deviceType,
          uiLibrary,
          status: 'PENDING',
          projectId: project.id,
        },
      })

      await inngest.send({
        name: 'mockup/generation.requested',
        data: {
          mockupId: mockup.id,
          projectId: project.id,
          userId,
          prompt,
          deviceType,
          uiLibrary,
          aiModel,
        },
      })

      return {
        success: true,
        mockupId: mockup.id,
        projectId: project.id,
      }
    } catch (error) {
      console.error('Error creating mockup:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create mockup',
      }
    }
  })

export const getUserMockups = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const userId = context.session.user.id

    if (!userId) {
      return []
    }

    const mockups = await prisma.mockup.findMany({
      where: {
        project: {
          userId: userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return mockups as MockupWithProject[]
  })


export const getMockupWithVariations = createServerFn({method:"GET"})
.middleware([authFnMiddleware])
.inputValidator((data:string)=>data)
.handler(
  async({data:mockupId , context})=>{
    try {
      const userId = context.session.user.id;

      if (!userId){
        return null
      }

      const mockup = await prisma.mockup.findFirst({
        where:{
          id:mockupId,
          project:{
            userId:userId
          },
        },
        include:{
          versions:{
            orderBy:{
              version:"asc"
            },
            select:{
              id:true,
              version:true,
              code:true,
              prompt:true,
              createdAt:true
            }
          }
        }
      })

      if(!mockup){
        return null
      }

      return {
        ...mockup,
        varitions:mockup.versions
      }
    } catch (error) {
       console.error("Error fetching mockup with variations:", error);
      return null;
    }
  }
)


type EditVariationInput = {
  versionId: string;
  mockupId: string;
  editPrompt: string;
  aiModel: AIModel;
};

type EditVariationResult = {
  success: boolean;
  error?: string;
};


export const editVariation = createServerFn({method:"POST"})
.middleware([authFnMiddleware])
.inputValidator((data:EditVariationInput)=>data)
.handler(
  async({data , context})=>{
    const userId = context.session.user.id;

      if (!userId){
        return {
          success:false,
          error: "Unauthorized. Please sign in.",
        }
      }

      const {aiModel , editPrompt ,  mockupId , versionId} = data;

      const mockup = await prisma.mockup.findFirst({
        where:{
          id:mockupId,
          project:{
            userId
          }
        }
      })

      if(!mockup){
         return {
          success: false,
          error: "Mockup not found or unauthorized.",
        };
      }

      const version = await prisma.mockupVersion.findUnique({
        where:{id:versionId},
        select:{code:true}
      })
      
      
       if (!version) {
        return {
          success: false,
          error: "Version not found.",
        };
      }

      await inngest.send({
        name:"mockup/variation.edit.requested",
        data:{
           versionId,
          mockupId,
          currentHtml: version.code,
          editPrompt,
          aiModel,
        }
      })

      return {
        success:true
      }

  }
)