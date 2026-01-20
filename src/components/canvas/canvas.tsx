import { cn } from '@/lib/utils'
import { DeviceType } from '@/server/mockup'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  type Node,
  type OnSelectionChangeParams,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CanvasHeader from './canvas-header'
import { MockupNode } from './mockup-node'
import SelectionToolbar from './selection-toolbar'
import CodeModal from './code-modal'
import PreviewModal from './preview-modal'

export type Variation = {
  id: string
  code: string
  label: string
  version?: number
}

interface CanvasProps {
  title?: string
  mockupId?: string
  deviceType?: DeviceType
  variations?: Variation[]
  className?: string
  onVariationUpdate?: (id: string, newCode: string) => void
  onEditComplete?: () => void
}
const nodeTypes = {
  mockup: MockupNode,
}

const VARIATION_LABELS = [
  'Design A - Modern & Bold',
  'Design B - Dark & Sleek',
  'Design C - Minimalist',
]

const DEVICE_DIMENSIONS: Record<DeviceType, { width: number; height: number }> =
  {
    MOBILE: { width: 390, height: 844 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1440, height: 900 },
    BOTH: { width: 1440, height: 900 },
  }

const SAMPLE_MOCKUP = `
<div class="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
  <nav class="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl font-bold tracking-tight">Sketch AI</span>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 text-sm font-medium rounded-md border border-zinc-700">Sign In</button>
        <button class="px-4 py-2 text-sm font-medium rounded-md bg-emerald-500 text-zinc-950">Get Started</button>
      </div>
    </div>
  </nav>
  <section class="py-24 px-6">
    <div class="max-w-4xl mx-auto text-center space-y-6">
      <h1 class="text-5xl font-bold tracking-tight">Build Beautiful UIs with AI</h1>
      <p class="text-xl text-zinc-400 max-w-2xl mx-auto">Generate stunning mockups in seconds.</p>
      <div class="flex justify-center gap-4 pt-4">
        <button class="px-6 py-3 rounded-md bg-emerald-500 text-zinc-950 font-semibold">Start Creating</button>
        <button class="px-6 py-3 rounded-md bg-zinc-800 text-white font-semibold border border-zinc-700">View Examples</button>
      </div>
    </div>
  </section>
</div>
`

export type DeviceSize = 'mobile' | 'tablet' | 'desktop'
const FRAME_GAP = 120

const Canvas = ({
  className,
  deviceType = 'DESKTOP',
  mockupId,
  onEditComplete,
  onVariationUpdate,
  title = 'Untitled mockup',
  variations,
}: CanvasProps) => {
  const { width: FRAME_WIDTH, height: FRAME_HEIGHT } =
    DEVICE_DIMENSIONS[deviceType]

  const [selectedNode, setSelectedNode] = useState<{
    id: string
    label: string
    html: string
    version?: number
  } | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<DeviceSize>(
    deviceType === 'MOBILE'
      ? 'mobile'
      : deviceType === 'TABLET'
        ? 'tablet'
        : 'desktop',
  )
  const [codeOpen, setCodeOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const allVariations: Variation[] = useMemo(
    () =>
      variations?.length! > 0
        ? variations
        : [{ id: 'sample', code: SAMPLE_MOCKUP, label: 'Sample' }],
    [variations],
  )

  const initialNodes: Node[] = useMemo(() => {
    return allVariations.map((variation, index) => ({
      id: variation.id,
      type: 'mockup',
      position: {
        x: index * (FRAME_WIDTH + FRAME_GAP),
        y: 0,
      },

      data: {
        label: VARIATION_LABELS[index],
        html: variation.code,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        version: variation.version || index + 1,
      },
      selectable: true,
      draggable: true, // Enable dragging
    }))
  }, [allVariations, FRAME_WIDTH, FRAME_HEIGHT])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        const node = selectedNodes[0]
        setSelectedNode({
          id: node.id,
          label: node.data.label as string,
          html: node.data.html as string,
          version: node.data.version as number | undefined,
        })
      } else {
        setSelectedNode(null)
      }
    },
    [],
  )

  const defaultViewport = useMemo(() => {
    const totalWidth =
      allVariations.length * (FRAME_WIDTH + FRAME_GAP) - FRAME_GAP
    const centerX = totalWidth / 2
    const centerY = FRAME_HEIGHT / 2 + 40

    let zoom: number
    if (deviceType === 'MOBILE') {
      zoom =
        allVariations.length === 1
          ? 0.7
          : allVariations.length === 2
            ? 0.5
            : 0.4
    } else if (deviceType === 'TABLET') {
      zoom =
        allVariations.length === 1
          ? 0.5
          : allVariations.length === 2
            ? 0.35
            : 0.25
    } else {
      zoom =
        allVariations.length === 1
          ? 0.35
          : allVariations.length === 2
            ? 0.25
            : 0.18
    }

    return {
      x: window.innerWidth / 2 - centerX * zoom,
      y: window.innerHeight / 2 - centerY * zoom,
      zoom,
    }
  }, [allVariations.length, FRAME_WIDTH, FRAME_HEIGHT, deviceType])

  const handleEdit = () => {}
  const handlePreview = (device:DeviceSize) =>{
    setPreviewDevice(device)
    setPreviewOpen(true)
  } 
  const handleViewCode = () => setCodeOpen(true)
  const handleExport = () => {}

  return (
    <div className="relative h-screen w-screen">
      <CanvasHeader title={title} />
      {selectedNode && (
        <SelectionToolbar
          onEdit={handleEdit}
          onPreview={handlePreview}
          onViewCode={handleViewCode}
          onExport={handleExport}
        />
      )}
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        minZoom={0.02}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        selectionOnDrag={false}
        selectNodesOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={false}
        fitView={false}
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-100! dark:bg-zinc-950!"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgb(161 161 170 / 0.9)"
        />

        <Controls
          showInteractive={false}
          className="bg-background/90! backdrop-blur-md! shadow-lg! border! border-border/50! rounded-xl! overflow-hidden!"
        />
      </ReactFlow>

      {
        selectedNode && (
          <>

          <PreviewModal
           open={previewOpen}
            onOpenChange={setPreviewOpen}
            html={selectedNode.html}
            initialDevice={previewDevice}
          />

          <CodeModal
           open={codeOpen}
            onOpenChange={setCodeOpen}
            html={selectedNode.html}
            title={`Code - ${selectedNode.label}`}
          
          />
          </>
        )
      }
    </div>
  )
}

export default Canvas
