"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ElementToolbar } from "@/components/element-toolbar"
import { PropertiesPanel } from "@/components/properties-panel"
import Image from "next/image"
import {
  X,
  ArrowLeft,
  Save,
  Play,
  Settings,
  Plus,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer,
  Hand,
} from "lucide-react"

interface CanvasElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, any>
  rotation: number
  opacity: number
  pageId: string
  zIndex: number
  groupId?: string // Added groupId for element grouping
}

interface ElementGroup {
  id: string
  name: string
  elementIds: string[]
  collapsed: boolean
}

interface Page {
  id: string
  name: string
  elements: CanvasElement[]
  groups: ElementGroup[] // Added groups array to page
  visible: boolean
  canvasBackground: {
    type: "color" | "gradient" | "image"
    color?: string
    gradient?: {
      type: "linear" | "radial"
      colors: string[]
      direction?: string
    }
    image?: {
      url: string
      size: "cover" | "contain" | "repeat"
      position: string
    }
  }
  canvasWidth?: number // Added canvasWidth
  canvasHeight?: number // Added canvasHeight
}

export default function CanvasPage() {
  const router = useRouter()
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  const [selectedElements, setSelectedElements] = useState<CanvasElement[]>([])
  const [selectedGroup, setSelectedGroup] = useState<ElementGroup | null>(null) // Added selectedGroup state
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingPageName, setEditingPageName] = useState("")
  const [clipboard, setClipboard] = useState<CanvasElement[]>([])
  const [history, setHistory] = useState<{ pages: Page[]; currentPageId: string }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [pages, setPages] = useState<Page[]>([
    {
      id: "page-1",
      name: "Page 1",
      elements: [],
      groups: [], // Initialize groups array
      visible: true,
      canvasBackground: {
        type: "color",
        color: "#ffffff",
      },
      canvasWidth: 1200, // Default canvas width
      canvasHeight: 800, // Default canvas height
    },
  ])
  const [currentPageId, setCurrentPageId] = useState("page-1")
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(["page-1"]))
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState("")
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [appName, setAppName] = useState("Untitled App")
  const [isEditingName, setIsEditingName] = useState(false)
  const [currentAppId, setCurrentAppId] = useState<string | null>(null)
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showCanvasProperties, setShowCanvasProperties] = useState(false)
  const [canvasMode, setCanvasMode] = useState<"select" | "pan">("select")
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const currentPage = pages.find((p) => p.id === currentPageId)
  const canvasElements = currentPage?.elements || []
  const currentGroups = currentPage?.groups || [] // Get current groups

  const saveToHistory = useCallback(() => {
    const newHistoryEntry = { pages: JSON.parse(JSON.stringify(pages)), currentPageId }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newHistoryEntry)

    // Keep only last 50 history entries
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }

    setHistory(newHistory)
  }, [pages, currentPageId, history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setPages(previousState.pages)
      setCurrentPageId(previousState.currentPageId)
      setHistoryIndex(historyIndex - 1)
      setSelectedElement(null)
      setSelectedElements([])
      setSelectedGroup(null) // Deselect group on undo
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setPages(nextState.pages)
      setCurrentPageId(nextState.currentPageId)
      setHistoryIndex(historyIndex + 1)
      setSelectedElement(null)
      setSelectedElements([])
      setSelectedGroup(null) // Deselect group on redo
    }
  }, [history, historyIndex])

  const copyElements = useCallback(() => {
    if (selectedElements.length > 0) {
      setClipboard([...selectedElements])
    }
  }, [selectedElements])

  const cutElements = useCallback(() => {
    if (selectedElements.length > 0) {
      setClipboard([...selectedElements])
      saveToHistory()
      updatePageElements(currentPageId, (prev) =>
        prev.filter((el) => !selectedElements.some((selected) => selected.id === el.id)),
      )
      setSelectedElement(null)
      setSelectedElements([])
    }
  }, [selectedElements, currentPageId, saveToHistory])

  const pasteElements = useCallback(() => {
    if (clipboard.length > 0) {
      saveToHistory()
      const maxZIndex = Math.max(...canvasElements.map((el) => el.zIndex), 0)

      const pastedElements = clipboard.map((el, index) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${index}`,
        x: el.x + 20,
        y: el.y + 20,
        zIndex: maxZIndex + index + 1,
        pageId: currentPageId,
      }))

      updatePageElements(currentPageId, (prev) => [...prev, ...pastedElements])
      setSelectedElements(pastedElements)
      setSelectedElement(pastedElements[0])
      setShowCanvasProperties(false)
    }
  }, [clipboard, canvasElements, currentPageId, saveToHistory])

  const selectAllElements = useCallback(() => {
    const visibleElements = canvasElements.filter((el) => !el.properties.hidden)
    setSelectedElements(visibleElements)
    setSelectedElement(visibleElements[0] || null)
    setSelectedGroup(null) // Deselect group when selecting all elements
    setShowCanvasProperties(false)
  }, [canvasElements])

  const deleteSelectedElements = useCallback(() => {
    if (selectedElements.length > 0) {
      saveToHistory()
      updatePageElements(currentPageId, (prev) =>
        prev.filter((el) => !selectedElements.some((selected) => selected.id === el.id)),
      )
      setSelectedElement(null)
      setSelectedElements([])
    }
  }, [selectedElements, currentPageId, saveToHistory])

  const duplicateSelectedElements = useCallback(() => {
    if (selectedElements.length > 0) {
      saveToHistory()
      const maxZIndex = Math.max(...canvasElements.map((el) => el.zIndex), 0)

      const duplicatedElements = selectedElements.map((el, index) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${index}`,
        x: el.x + 20,
        y: el.y + 20,
        zIndex: maxZIndex + index + 1,
      }))

      updatePageElements(currentPageId, (prev) => [...prev, ...duplicatedElements])
      setSelectedElements(duplicatedElements)
      setSelectedElement(duplicatedElements[0])
    }
  }, [selectedElements, canvasElements, currentPageId, saveToHistory])

  const moveSelectedElements = useCallback(
    (direction: "up" | "down" | "left" | "right", distance = 1) => {
      if (selectedElements.length === 0) return

      saveToHistory()
      const updatedElements = selectedElements.map((el) => {
        switch (direction) {
          case "up":
            return { ...el, y: el.y - distance }
          case "down":
            return { ...el, y: el.y + distance }
          case "left":
            return { ...el, x: el.x - distance }
          case "right":
            return { ...el, x: el.x + distance }
          default:
            return el
        }
      })

      setSelectedElements(updatedElements)
      if (selectedElement) {
        const updatedSelected = updatedElements.find((el) => el.id === selectedElement.id)
        if (updatedSelected) setSelectedElement(updatedSelected)
      }

      updatePageElements(currentPageId, (prev) =>
        prev.map((el) => {
          const updated = updatedElements.find((updated) => updated.id === el.id)
          return updated || el
        }),
      )
    },
    [selectedElements, selectedElement, currentPageId, saveToHistory],
  )

  const createGroup = useCallback(() => {
    if (selectedElements.length < 2) return

    saveToHistory()
    const groupId = `group-${Date.now()}`
    const groupName = `Group ${currentGroups.length + 1}`

    const newGroup: ElementGroup = {
      id: groupId,
      name: groupName,
      elementIds: selectedElements.map((el) => el.id),
      collapsed: false,
    }

    // Update elements to include groupId
    const updatedElements = selectedElements.map((el) => ({ ...el, groupId }))

    setPages((prev) =>
      prev.map((page) =>
        page.id === currentPageId
          ? {
              ...page,
              groups: [...page.groups, newGroup],
              elements: page.elements.map((el) => {
                const updated = updatedElements.find((updated) => updated.id === el.id)
                return updated || el
              }),
            }
          : page,
      ),
    )

    setSelectedGroup(newGroup)
    setSelectedElement(null)
    setSelectedElements([])
  }, [selectedElements, currentGroups, currentPageId, saveToHistory])

  const ungroupElements = useCallback(
    (groupId: string) => {
      saveToHistory()

      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                groups: page.groups.filter((g) => g.id !== groupId),
                elements: page.elements.map((el) => (el.groupId === groupId ? { ...el, groupId: undefined } : el)),
              }
            : page,
        ),
      )

      setSelectedGroup(null)
    },
    [currentPageId, saveToHistory],
  )

  const selectGroup = useCallback(
    (groupId: string) => {
      const group = currentGroups.find((g) => g.id === groupId)
      if (!group) return

      const groupElements = canvasElements.filter((el) => el.groupId === groupId)
      setSelectedElements(groupElements)
      setSelectedElement(groupElements[0] || null)
      setSelectedGroup(group)
      setShowCanvasProperties(false)
    },
    [currentGroups, canvasElements],
  )

  const moveGroup = useCallback(
    (groupId: string, deltaX: number, deltaY: number) => {
      const groupElements = canvasElements.filter((el) => el.groupId === groupId)

      const updatedElements = groupElements.map((el) => ({
        ...el,
        x: el.x + deltaX,
        y: el.y + deltaY,
      }))

      setSelectedElements(updatedElements)

      updatePageElements(currentPageId, (prev) =>
        prev.map((el) => {
          const updated = updatedElements.find((updated) => updated.id === el.id)
          return updated || el
        }),
      )
    },
    [canvasElements, currentPageId],
  )

  const duplicateGroup = useCallback(
    (groupId: string) => {
      const group = currentGroups.find((g) => g.id === groupId)
      const groupElements = canvasElements.filter((el) => el.groupId === groupId)

      if (!group || groupElements.length === 0) return

      saveToHistory()
      const newGroupId = `group-${Date.now()}`
      const maxZIndex = Math.max(...canvasElements.map((el) => el.zIndex), 0)

      const duplicatedElements = groupElements.map((el, index) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${index}`,
        x: el.x + 20,
        y: el.y + 20,
        zIndex: maxZIndex + index + 1,
        groupId: newGroupId,
      }))

      const newGroup: ElementGroup = {
        id: newGroupId,
        name: `${group.name} Copy`,
        elementIds: duplicatedElements.map((el) => el.id),
        collapsed: false,
      }

      setPages((prev) =>
        prev.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                groups: [...page.groups, newGroup],
                elements: [...page.elements, ...duplicatedElements],
              }
            : page,
        ),
      )

      setSelectedElements(duplicatedElements)
      setSelectedElement(duplicatedElements[0])
      setSelectedGroup(newGroup)
    },
    [currentGroups, canvasElements, currentPageId, saveToHistory],
  )

  const switchToPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId)
    setSelectedElement(null)
    setSelectedElements([])
    setSelectedGroup(null) // Deselect group when switching page
    setShowCanvasProperties(true)
  }, []) // Removed dependencies that cause infinite loops

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Prevent default browser shortcuts
      if (cmdOrCtrl && ["z", "y", "c", "v", "x", "a", "d", "g", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }

      // Group/Ungroup
      if (cmdOrCtrl && e.key.toLowerCase() === "g" && !e.shiftKey) {
        if (selectedElements.length >= 2) {
          createGroup()
        }
        return
      }
      if (cmdOrCtrl && e.key.toLowerCase() === "g" && e.shiftKey) {
        if (selectedGroup) {
          ungroupElements(selectedGroup.id)
        }
        return
      }

      // Undo/Redo
      if (cmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        undo()
        return
      }
      if (cmdOrCtrl && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        redo()
        return
      }

      // Copy/Cut/Paste
      if (cmdOrCtrl && e.key.toLowerCase() === "c") {
        copyElements()
        return
      }
      if (cmdOrCtrl && e.key.toLowerCase() === "x") {
        cutElements()
        return
      }
      if (cmdOrCtrl && e.key.toLowerCase() === "v") {
        pasteElements()
        return
      }

      // Select All
      if (cmdOrCtrl && e.key.toLowerCase() === "a") {
        selectAllElements()
        return
      }

      // Duplicate
      if (cmdOrCtrl && e.key.toLowerCase() === "d") {
        if (selectedGroup) {
          duplicateGroup(selectedGroup.id)
        } else {
          duplicateSelectedElements()
        }
        return
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedGroup) {
          ungroupElements(selectedGroup.id)
        } else {
          deleteSelectedElements()
        }
        return
      }

      // Arrow key movement
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()
        const distance = e.shiftKey ? 10 : 1 // Hold Shift for larger movements
        const direction = e.key.replace("Arrow", "").toLowerCase() as "up" | "down" | "left" | "right"

        if (selectedGroup) {
          let deltaX = 0,
            deltaY = 0
          switch (direction) {
            case "up":
              deltaY = -distance
              break
            case "down":
              deltaY = distance
              break
            case "left":
              deltaX = -distance
              break
            case "right":
              deltaX = distance
              break
          }
          moveGroup(selectedGroup.id, deltaX, deltaY)
        } else {
          moveSelectedElements(direction, distance)
        }
        return
      }

      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedElement(null)
        setSelectedElements([])
        setSelectedGroup(null) // Deselect group on Escape
        setShowCanvasProperties(true)
        return
      }

      // Space to toggle pan mode
      if (e.key === " " && !e.repeat) {
        e.preventDefault()
        setCanvasMode((prev) => (prev === "select" ? "pan" : "select"))
        return
      }

      // Number keys to switch pages
      if (e.key >= "1" && e.key <= "9") {
        const pageIndex = Number.parseInt(e.key) - 1
        if (pageIndex < pages.length) {
          switchToPage(pages[pageIndex].id)
        }
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset pan mode when space is released
      if (e.key === " ") {
        setCanvasMode("select")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [
    undo,
    redo,
    copyElements,
    cutElements,
    pasteElements,
    selectAllElements,
    duplicateSelectedElements,
    deleteSelectedElements,
    moveSelectedElements,
    createGroup,
    ungroupElements,
    selectedGroup,
    duplicateGroup,
    moveGroup,
    pages,
    switchToPage,
    selectedElements,
    selectedElement,
    clipboard,
    history,
    historyIndex,
    currentPageId,
  ])

  useEffect(() => {
    if (pages.length > 0 && history.length === 0) {
      // Initialize history with current state
      setHistory([{ pages: JSON.parse(JSON.stringify(pages)), currentPageId }])
      setHistoryIndex(0)
    }
  }, [pages, currentPageId, history.length])

  useEffect(() => {
    const loadCurrentApp = () => {
      try {
        const currentAppData = localStorage.getItem("floneo-current-app")
        if (currentAppData) {
          const app = JSON.parse(currentAppData)
          setAppName(app.name)

          if (app.pages) {
            const loadedPages = app.pages.map((page: any) => ({
              ...page,
              visible: page.visible !== undefined ? page.visible : true,
              canvasBackground: page.canvasBackground || {
                type: "color",
                color: "#ffffff",
              },
              elements: page.elements.map((el: any, index: number) => ({
                ...el,
                zIndex: el.zIndex !== undefined ? el.zIndex : index,
              })),
              groups: page.groups || [], // Load groups
              canvasWidth: page.canvasWidth || 1200, // Load canvasWidth
              canvasHeight: page.canvasHeight || 800, // Load canvasHeight
            }))
            setPages(loadedPages)
            setCurrentPageId(app.currentPageId || loadedPages[0]?.id || "page-1")
            setExpandedPages(new Set(loadedPages.map((p: any) => p.id)))
          } else if (app.elements) {
            // Legacy support for old format
            const legacyPage = {
              id: "page-1",
              name: "Page 1",
              elements: app.elements.map((el: any, index: number) => ({
                ...el,
                pageId: "page-1",
                zIndex: el.zIndex !== undefined ? el.zIndex : index,
              })),
              groups: [], // Initialize groups for legacy data
              visible: true,
              canvasBackground: {
                type: "color" as const,
                color: "#ffffff",
              },
              canvasWidth: 1200, // Default canvas width for legacy
              canvasHeight: 800, // Default canvas height for legacy
            }
            setPages([legacyPage])
          }

          setCurrentAppId(app.id)
          localStorage.removeItem("floneo-current-app")
        }
      } catch (error) {
        console.error("Error loading current app:", error)
      }
    }

    loadCurrentApp()
  }, [])

  const updateCanvasBackground = (background: Partial<Page["canvasBackground"]>) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === currentPageId ? { ...page, canvasBackground: { ...page.canvasBackground, ...background } } : page,
      ),
    )
  }

  const updateCanvasDimensions = (width: number, height: number) => {
    setPages((prev) =>
      prev.map((page) => (page.id === currentPageId ? { ...page, canvasWidth: width, canvasHeight: height } : page)),
    )
    saveToHistory()
  }

  const getCanvasBackgroundStyle = (): React.CSSProperties => {
    if (!currentPage) return {}

    const bg = currentPage.canvasBackground

    switch (bg.type) {
      case "color":
        return { backgroundColor: bg.color || "#ffffff" }
      case "gradient":
        if (bg.gradient) {
          const colors = bg.gradient.colors.join(", ")
          if (bg.gradient.type === "linear") {
            return {
              background: `linear-gradient(${bg.gradient.direction || "45deg"}, ${colors})`,
            }
          } else {
            return {
              background: `radial-gradient(circle, ${colors})`,
            }
          }
        }
        return { backgroundColor: "#ffffff" }
      case "image":
        if (bg.image) {
          return {
            backgroundImage: `url(${bg.image.url})`,
            backgroundSize: bg.image.size,
            backgroundPosition: bg.image.position,
            backgroundRepeat: bg.image.size === "repeat" ? "repeat" : "no-repeat",
          }
        }
        return { backgroundColor: "#ffffff" }
      default:
        return { backgroundColor: "#ffffff" }
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        setSelectedElement(null)
        setSelectedElements([])
        setSelectedGroup(null) // Deselect group on canvas click
        setShowCanvasProperties(true)
      }
    }
  }

  const handleElementMouseDown = (e: React.MouseEvent, element: CanvasElement) => {
    if (element.properties.locked || canvasMode === "pan") return

    e.stopPropagation()

    if (element.groupId) {
      // If clicking on a grouped element, select the entire group
      const group = currentGroups.find((g) => g.id === element.groupId)
      if (group) {
        const groupElements = canvasElements.filter((el) => el.groupId === element.groupId)
        setSelectedElements(groupElements)
        setSelectedElement(element)
        setSelectedGroup(group)
        setShowCanvasProperties(false)

        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
          const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

          setDragOffset({
            x: x - element.x,
            y: y - element.y,
          })
          setIsDragging(true)
        }
        return
      }
    }

    // Multi-selection logic for individual elements
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (selectedElements.includes(element)) {
        setSelectedElements((prev) => prev.filter((el) => el.id !== element.id))
        if (selectedElement?.id === element.id) {
          setSelectedElement(selectedElements.find((el) => el.id !== element.id) || null)
        }
      } else {
        setSelectedElements((prev) => [...prev, element])
        setSelectedElement(element)
      }
      setSelectedGroup(null) // Deselect group when multi-selecting individual elements
    } else {
      setSelectedElement(element)
      setSelectedElements([element])
      setSelectedGroup(null) // Deselect group when selecting a single element
    }

    setShowCanvasProperties(false)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
      const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

      setDragOffset({
        x: x - element.x,
        y: y - element.y,
      })
      setIsDragging(true)
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || canvasMode === "pan" || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y })
      e.preventDefault()
    } else if (e.target === canvasRef.current && canvasMode === "select") {
      // Start selection box
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
        const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

        setIsSelecting(true)
        setSelectionStart({ x, y })
        setSelectionBox({ x, y, width: 0, height: 0 })
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }))
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
    const y = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

    // Selection box logic
    if (isSelecting && selectionBox) {
      const newWidth = x - selectionStart.x
      const newHeight = y - selectionStart.y

      setSelectionBox({
        x: newWidth < 0 ? x : selectionStart.x,
        y: newHeight < 0 ? y : selectionStart.y,
        width: Math.abs(newWidth),
        height: Math.abs(newHeight),
      })
    }

    if (isDragging && selectedGroup && selectedElement && canvasMode === "select") {
      const deltaX = x - dragOffset.x - selectedElement.x
      const deltaY = y - dragOffset.y - selectedElement.y

      moveGroup(selectedGroup.id, deltaX, deltaY)
    }
    // Multi-element dragging
    else if (isDragging && selectedElements.length > 1 && canvasMode === "select") {
      const deltaX = x - dragOffset.x - (selectedElement?.x || 0)
      const deltaY = y - dragOffset.y - (selectedElement?.y || 0)

      const updatedElements = selectedElements.map((el) => ({
        ...el,
        x: el.x + deltaX,
        y: el.y + deltaY,
      }))

      setSelectedElements(updatedElements)
      if (selectedElement) {
        const updatedSelected = updatedElements.find((el) => el.id === selectedElement.id)
        if (updatedSelected) setSelectedElement(updatedSelected)
      }

      updatePageElements(currentPageId, (prev) =>
        prev.map((el) => {
          const updated = updatedElements.find((updated) => updated.id === el.id)
          return updated || el
        }),
      )
    } else if (isDragging && selectedElement && canvasMode === "select") {
      const newX = x - dragOffset.x
      const newY = y - dragOffset.y

      const updatedElement = { ...selectedElement, x: newX, y: newY }
      setSelectedElement(updatedElement)
      updatePageElements(currentPageId, (prev) =>
        prev.map((el) => (el.id === selectedElement.id ? updatedElement : el)),
      )
    }

    // Resize logic
    if (isResizing && selectedElement) {
      const deltaX = x - resizeStart.x
      const deltaY = y - resizeStart.y

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = selectedElement.x
      let newY = selectedElement.y

      switch (resizeHandle) {
        case "nw":
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newX = selectedElement.x + (resizeStart.width - newWidth)
          newY = selectedElement.y + (resizeStart.height - newHeight)
          break
        case "ne":
          newWidth = Math.max(20, resizeStart.width + deltaX)
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newY = selectedElement.y + (resizeStart.height - newHeight)
          break
        case "sw":
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newHeight = Math.max(20, resizeStart.height + deltaY)
          newX = selectedElement.x + (resizeStart.width - newWidth)
          break
        case "se":
          newWidth = Math.max(20, resizeStart.width + deltaX)
          newHeight = Math.max(20, resizeStart.height + deltaY)
          break
        case "n":
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newY = selectedElement.y + (resizeStart.height - newHeight)
          break
        case "s":
          newHeight = Math.max(20, resizeStart.height + deltaY)
          break
        case "w":
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newX = selectedElement.x + (resizeStart.width - newWidth)
          break
        case "e":
          newWidth = Math.max(20, resizeStart.width + deltaX)
          break
      }

      const updatedElement = {
        ...selectedElement,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      }
      setSelectedElement(updatedElement)
      updatePageElements(currentPageId, (prev) =>
        prev.map((el) => (el.id === selectedElement.id ? updatedElement : el)),
      )
    }
  }

  const handleCanvasMouseUp = () => {
    if (isSelecting && selectionBox) {
      // Find elements within selection box
      const selectedInBox = canvasElements.filter((element) => {
        const elementRight = element.x + element.width
        const elementBottom = element.y + element.height
        const boxRight = selectionBox.x + selectionBox.width
        const boxBottom = selectionBox.y + selectionBox.height

        return (
          element.x < boxRight &&
          elementRight > selectionBox.x &&
          element.y < boxBottom &&
          elementBottom > selectionBox.y
        )
      })

      if (selectedInBox.length > 0) {
        setSelectedElements(selectedInBox)
        setSelectedElement(selectedInBox[0])
        // If a group is selected, deselect it when selecting individual elements
        if (!selectedInBox.some((el) => el.groupId === selectedGroup?.id)) {
          setSelectedGroup(null)
        }
        setShowCanvasProperties(false)
      } else {
        // If no elements are selected, deselect group if it's not selected
        if (selectedGroup && !selectedElements.some((el) => el.groupId === selectedGroup.id)) {
          setSelectedGroup(null)
        }
      }

      setIsSelecting(false)
      setSelectionBox(null)
    }

    setIsPanning(false)
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle("")
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * delta))

      const rect = canvasContainerRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const scaleChange = newScale / canvasTransform.scale
        const newX = mouseX - (mouseX - canvasTransform.x) * scaleChange
        const newY = mouseY - (mouseY - canvasTransform.y) * scaleChange

        setCanvasTransform({
          x: newX,
          y: newY,
          scale: newScale,
        })
      }
    }
  }

  const updatePageElements = (pageId: string, updater: (elements: CanvasElement[]) => CanvasElement[]) => {
    setPages((prev) => prev.map((page) => (page.id === pageId ? { ...page, elements: updater(page.elements) } : page)))
  }

  const updateElementProperty = (property: string, value: any) => {
    if (!selectedElement) return

    saveToHistory()
    const updatedElement = {
      ...selectedElement,
      properties: { ...selectedElement.properties, [property]: value },
    }
    setSelectedElement(updatedElement)
    updatePageElements(currentPageId, (prev) => prev.map((el) => (el.id === selectedElement.id ? updatedElement : el)))
  }

  const updateElementTransform = (property: string, value: number) => {
    if (!selectedElement) return

    saveToHistory()
    const updatedElement = { ...selectedElement, [property]: value }
    setSelectedElement(updatedElement)
    updatePageElements(currentPageId, (prev) => prev.map((el) => (el.id === selectedElement.id ? updatedElement : el)))
  }

  const deleteElement = () => {
    if (!selectedElement) return

    saveToHistory()
    updatePageElements(currentPageId, (prev) => prev.filter((el) => el.id !== selectedElement.id))
    setSelectedElement(null)
    setSelectedElements([])
  }

  const duplicateElement = () => {
    if (!selectedElement) return

    saveToHistory()
    const maxZIndex = Math.max(...canvasElements.map((el) => el.zIndex), 0)
    const duplicatedElement: CanvasElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      zIndex: maxZIndex + 1,
    }

    updatePageElements(currentPageId, (prev) => [...prev, duplicatedElement])
    setSelectedElement(duplicatedElement)
    setSelectedElements([duplicatedElement])
  }

  const toggleElementVisibility = () => {
    if (!selectedElement) return
    updateElementProperty("hidden", !selectedElement.properties.hidden)
  }

  const toggleElementLock = () => {
    if (!selectedElement) return
    updateElementProperty("locked", !selectedElement.properties.locked)
  }

  const moveElementLayer = (direction: "up" | "down") => {
    if (!selectedElement) return

    const elements = canvasElements
    const elementIndex = elements.findIndex((el) => el.id === selectedElement.id)
    if (elementIndex === -1) return

    const element = elements[elementIndex]
    const newZIndex = direction === "up" ? element.zIndex + 1 : element.zIndex - 1

    const targetElement = elements.find((el) => el.zIndex === newZIndex)

    updatePageElements(currentPageId, (prev) =>
      prev.map((el) => {
        if (el.id === selectedElement.id) {
          return { ...el, zIndex: newZIndex }
        }
        if (targetElement && el.id === targetElement.id) {
          return { ...el, zIndex: element.zIndex }
        }
        return el
      }),
    )

    setSelectedElement((prev) => (prev ? { ...prev, zIndex: newZIndex } : null))
  }

  const handleDragStart = useCallback((e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData("elementType", elementType)
    e.dataTransfer.effectAllowed = "copy"
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const elementType = e.dataTransfer.getData("elementType")
      const canvasRect = canvasRef.current?.getBoundingClientRect()

      if (canvasRect && elementType) {
        saveToHistory()
        const x = (e.clientX - canvasRect.left - canvasTransform.x) / canvasTransform.scale
        const y = (e.clientY - canvasRect.top - canvasTransform.y) / canvasTransform.scale
        const maxZIndex = Math.max(...canvasElements.map((el) => el.zIndex), 0)

        const newElement: CanvasElement = {
          id: `${elementType}-${Date.now()}`,
          type: elementType,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: getDefaultSize(elementType).width,
          height: getDefaultSize(elementType).height,
          properties: getDefaultProperties(elementType),
          rotation: 0,
          opacity: 100,
          pageId: currentPageId,
          zIndex: maxZIndex + 1,
        }

        updatePageElements(currentPageId, (prev) => [...prev, newElement])
        setSelectedElement(newElement)
        setSelectedElements([newElement])
        setSelectedGroup(null) // Deselect group when adding new element
        setShowCanvasProperties(false)
      }
    },
    [canvasTransform, currentPageId, canvasElements, saveToHistory],
  )

  const getDefaultSize = (elementType: string) => {
    const sizes: Record<string, { width: number; height: number }> = {
      textfield: { width: 200, height: 40 },
      textarea: { width: 200, height: 100 },
      button: { width: 120, height: 40 },
      checkbox: { width: 150, height: 30 },
      radiobutton: { width: 150, height: 30 },
      dropdown: { width: 200, height: 40 },
      toggle: { width: 150, height: 30 },
      phone: { width: 200, height: 40 },
      calendar: { width: 200, height: 40 },
      upload: { width: 200, height: 120 },
      media: { width: 200, height: 150 },
      rectangle: { width: 100, height: 100 },
      circle: { width: 100, height: 100 },
      triangle: { width: 100, height: 100 },
      line: { width: 100, height: 2 },
      arrow: { width: 100, height: 20 },
      star: { width: 80, height: 80 },
      heart: { width: 80, height: 80 },
      container: { width: 300, height: 200 },
      divider: { width: 200, height: 2 },
    }
    return sizes[elementType] || { width: 100, height: 100 }
  }

  const getDefaultProperties = (elementType: string) => {
    const defaults: Record<string, any> = {
      textfield: { placeholder: "Enter text", value: "", backgroundColor: "#ffffff", color: "#000000" },
      textarea: { placeholder: "Enter text", value: "", rows: 4, backgroundColor: "#ffffff", color: "#000000" },
      button: { text: "Button", backgroundColor: "#3b82f6", color: "#ffffff", borderRadius: 6 },
      checkbox: { label: "Checkbox", checked: false },
      radiobutton: { label: "Radio Button", checked: false },
      dropdown: { placeholder: "Select option", options: ["Option 1", "Option 2", "Option 3"], value: "" },
      toggle: { label: "Toggle", checked: false },
      phone: { placeholder: "Phone number", value: "" },
      calendar: { value: "" },
      upload: {},
      media: {},
      rectangle: { backgroundColor: "#ffffff", borderRadius: 0 },
      circle: { backgroundColor: "#ffffff" },
      triangle: { backgroundColor: "#ffffff" },
      line: { backgroundColor: "#000000" },
      arrow: { backgroundColor: "#000000" },
      star: { backgroundColor: "#fbbf24" },
      heart: { backgroundColor: "#ef4444" },
      container: { backgroundColor: "#f3f4f6", borderRadius: 8 },
      divider: { backgroundColor: "#d1d5db" },
    }
    return defaults[elementType] || {}
  }

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement?.id === element.id
    const isMultiSelected = selectedElements.some((el) => el.id === element.id)
    const isGrouped = !!element.groupId
    const isGroupSelected = selectedGroup?.id === element.groupId
    const isLocked = element.properties.locked
    const isHidden = element.properties.hidden

    if (isHidden) return null

    const style: React.CSSProperties = {
      backgroundColor: element.properties.backgroundColor || "#ffffff",
      color: element.properties.color || "#000000",
      fontSize: `${element.properties.fontSize || 14}px`,
      fontWeight: element.properties.fontWeight || "normal",
      textAlign: element.properties.textAlign || "left",
      borderRadius: `${element.properties.borderRadius || 0}px`,
      opacity: element.opacity / 100,
    }

    const elementContent = (() => {
      switch (element.type) {
        case "textfield":
          return (
            <input
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              placeholder={element.properties.placeholder}
              value={element.properties.value}
              readOnly
            />
          )
        case "textarea":
          return (
            <textarea
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 resize-none w-full h-full"
              placeholder={element.properties.placeholder}
              value={element.properties.value}
              rows={element.properties.rows}
              readOnly
            />
          )
        case "button":
          return (
            <button style={style} className="px-4 py-2 w-full h-full font-medium">
              {element.properties.text || "Button"}
            </button>
          )
        case "checkbox":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <input type="checkbox" checked={element.properties.checked} className="w-4 h-4" readOnly />
              <label style={style}>{element.properties.label || "Checkbox"}</label>
            </div>
          )
        case "radiobutton":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <input type="radio" checked={element.properties.checked} className="w-4 h-4" readOnly />
              <label style={style}>{element.properties.label || "Radio Button"}</label>
            </div>
          )
        case "dropdown":
          return (
            <select
              style={{ ...style, border: "1px solid #d1d5db" }}
              className="px-3 py-2 w-full h-full"
              value={element.properties.value}
              readOnly
            >
              <option>{element.properties.placeholder || "Select option"}</option>
              {element.properties.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )
        case "toggle":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  element.properties.checked ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    element.properties.checked ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <label style={style}>{element.properties.label || "Toggle"}</label>
            </div>
          )
        case "phone":
          return (
            <input
              type="tel"
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              placeholder={element.properties.placeholder || "Phone number"}
              value={element.properties.value}
              readOnly
            />
          )
        case "calendar":
          return (
            <input
              type="date"
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              value={element.properties.value}
              readOnly
            />
          )
        case "upload":
          return (
            <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-500">Upload File</span>
            </div>
          )
        case "media":
          return (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md border border-gray-300">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )
        case "rectangle":
          return <div style={style} className="w-full h-full border border-gray-300" />
        case "circle":
          return <div style={{ ...style, borderRadius: "50%" }} className="w-full h-full border border-gray-300" />
        case "triangle":
          return (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${element.width / 2}px solid transparent`,
                borderRight: `${element.width / 2}px solid transparent`,
                borderBottom: `${element.height}px solid ${element.properties.backgroundColor || "#ffffff"}`,
              }}
            />
          )
        case "line":
          return <div style={{ ...style, width: "100%", height: "2px" }} />
        case "arrow":
          return (
            <div className="flex items-center w-full h-full">
              <div style={{ ...style, flex: 1, height: "2px" }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeftColor: element.properties.backgroundColor || "#000000",
                }}
              />
            </div>
          )
        case "star":
          return (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill={element.properties.backgroundColor || "#fbbf24"}
                stroke="none"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          )
        case "heart":
          return (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill={element.properties.backgroundColor || "#ef4444"}
                stroke="none"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 17.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          )
        case "container":
          return (
            <div
              style={style}
              className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center"
            >
              <span className="text-gray-500 text-sm">Container</span>
            </div>
          )
        case "divider":
          return <div style={{ ...style, width: "100%", height: "1px" }} />
        default:
          return (
            <div style={style} className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">{element.type}</span>
            </div>
          )
      }
    })()

    return (
      <div
        key={element.id}
        // Enhanced selection indicators for multi-selection
        className={`absolute select-none ${isLocked ? "pointer-events-none" : "cursor-move"}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity / 100,
          zIndex: element.zIndex,
        }}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
      >
        {elementContent}

        {(isSelected || isMultiSelected || isGroupSelected) && !isLocked && (
          <>
            {/* Resize handles - only show for single selection */}
            {isSelected &&
              selectedElements.length === 1 &&
              !selectedGroup && ( // Only show resize handles for single element selection, not group selection
                <>
                  {/* Corner handles */}
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-nw-resize"
                    style={{ left: -4, top: -4 }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("nw")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-ne-resize"
                    style={{ right: -4, top: -4 }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("ne")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-sw-resize"
                    style={{ left: -4, bottom: -4 }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("sw")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-se-resize"
                    style={{ right: -4, bottom: -4 }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("se")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  {/* Edge handles */}
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-n-resize"
                    style={{ left: "50%", top: -4, transform: "translateX(-50%)" }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("n")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-s-resize"
                    style={{ left: "50%", bottom: -4, transform: "translateX(-50%)" }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("s")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-w-resize"
                    style={{ left: -4, top: "50%", transform: "translateY(-50%)" }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("w")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full cursor-e-resize"
                    style={{ right: -4, top: "50%", transform: "translateY(-50%)" }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (!rect) return

                      const canvasX = (e.clientX - rect.left - canvasTransform.x) / canvasTransform.scale
                      const canvasY = (e.clientY - rect.top - canvasTransform.y) / canvasTransform.scale

                      setIsResizing(true)
                      setResizeHandle("e")
                      setResizeStart({
                        x: canvasX,
                        y: canvasY,
                        width: element.width,
                        height: element.height,
                      })
                    }}
                  />
                </>
              )}

            {/* Selection outline - different colors for single vs multi-selection */}
            <div
              className={`absolute inset-0 border-2 pointer-events-none rounded-sm ${
                isGroupSelected
                  ? "border-green-500"
                  : isSelected && selectedElements.length === 1
                    ? "border-blue-500"
                    : "border-purple-500"
              }`}
            />

            {/* Group indicator */}
            {isGrouped && (
              <div className="absolute -top-6 -left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded shadow-lg pointer-events-none">
                G
              </div>
            )}

            {/* Element info tooltip - only for single selection */}
            {isSelected &&
              selectedElements.length === 1 &&
              !selectedGroup && ( // Only show tooltip for single element selection
                <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
                  {element.type} ({Math.round(element.width)}×{Math.round(element.height)})
                </div>
              )}
          </>
        )}

        {/* Lock indicator */}
        {isLocked && (
          <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    )
  }

  const renderElementClean = (element: CanvasElement) => {
    const isHidden = element.properties.hidden
    if (isHidden) return null

    const style: React.CSSProperties = {
      backgroundColor: element.properties.backgroundColor || "#ffffff",
      color: element.properties.color || "#000000",
      fontSize: `${element.properties.fontSize || 14}px`,
      fontWeight: element.properties.fontWeight || "normal",
      textAlign: element.properties.textAlign || "left",
      borderRadius: `${element.properties.borderRadius || 0}px`,
      opacity: element.opacity / 100,
    }

    const elementContent = (() => {
      switch (element.type) {
        case "textfield":
          return (
            <input
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              placeholder={element.properties.placeholder}
              value={element.properties.value}
              readOnly
            />
          )
        case "textarea":
          return (
            <textarea
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 resize-none w-full h-full"
              placeholder={element.properties.placeholder}
              value={element.properties.value}
              rows={element.properties.rows}
              readOnly
            />
          )
        case "button":
          return (
            <button style={style} className="px-4 py-2 w-full h-full font-medium">
              {element.properties.text || "Button"}
            </button>
          )
        case "checkbox":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <input type="checkbox" checked={element.properties.checked} className="w-4 h-4" readOnly />
              <label style={style}>{element.properties.label || "Checkbox"}</label>
            </div>
          )
        case "radiobutton":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <input type="radio" checked={element.properties.checked} className="w-4 h-4" readOnly />
              <label style={style}>{element.properties.label || "Radio Button"}</label>
            </div>
          )
        case "dropdown":
          return (
            <select
              style={{ ...style, border: "1px solid #d1d5db" }}
              className="px-3 py-2 w-full h-full"
              value={element.properties.value}
              readOnly
            >
              <option>{element.properties.placeholder || "Select option"}</option>
              {element.properties.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )
        case "toggle":
          return (
            <div className="flex items-center space-x-2 w-full h-full px-2">
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  element.properties.checked ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    element.properties.checked ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
              <label style={style}>{element.properties.label || "Toggle"}</label>
            </div>
          )
        case "phone":
          return (
            <input
              type="tel"
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              placeholder={element.properties.placeholder || "Phone number"}
              value={element.properties.value}
              readOnly
            />
          )
        case "calendar":
          return (
            <input
              type="date"
              style={{ ...style, border: "1px solid #d1d5db", outline: "none" }}
              className="px-3 py-2 w-full h-full"
              value={element.properties.value}
              readOnly
            />
          )
        case "upload":
          return (
            <div className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-500">Upload File</span>
            </div>
          )
        case "media":
          return (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md border border-gray-300">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )
        case "rectangle":
          return <div style={style} className="w-full h-full border border-gray-300" />
        case "circle":
          return <div style={{ ...style, borderRadius: "50%" }} className="w-full h-full border border-gray-300" />
        case "triangle":
          return (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${element.width / 2}px solid transparent`,
                borderRight: `${element.width / 2}px solid transparent`,
                borderBottom: `${element.height}px solid ${element.properties.backgroundColor || "#ffffff"}`,
              }}
            />
          )
        case "line":
          return <div style={{ ...style, width: "100%", height: "2px" }} />
        case "arrow":
          return (
            <div className="flex items-center w-full h-full">
              <div style={{ ...style, flex: 1, height: "2px" }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeftColor: element.properties.backgroundColor || "#000000",
                }}
              />
            </div>
          )
        case "star":
          return (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill={element.properties.backgroundColor || "#fbbf24"}
                stroke="none"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          )
        case "heart":
          return (
            <div className="flex items-center justify-center w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill={element.properties.backgroundColor || "#ef4444"}
                stroke="none"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 17.77l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          )
        case "container":
          return (
            <div style={style} className="w-full h-full border border-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Container</span>
            </div>
          )
        case "divider":
          return <div style={{ ...style, width: "100%", height: "1px" }} />
        default:
          return (
            <div style={style} className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">{element.type}</span>
            </div>
          )
      }
    })()

    return (
      <div
        key={element.id}
        className="absolute"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity / 100,
          zIndex: element.zIndex,
        }}
      >
        {elementContent}
      </div>
    )
  }

  const saveApp = () => {
    try {
      const appData = {
        id: currentAppId || `app-${Date.now()}`,
        name: appName,
        pages,
        currentPageId,
        createdAt: currentAppId ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const existingApps = JSON.parse(localStorage.getItem("floneo-apps") || "[]")
      const appIndex = existingApps.findIndex((app: any) => app.id === appData.id)

      if (appIndex >= 0) {
        existingApps[appIndex] = { ...existingApps[appIndex], ...appData }
      } else {
        existingApps.push(appData)
        setCurrentAppId(appData.id)
      }

      localStorage.setItem("floneo-apps", JSON.stringify(existingApps))
      window.dispatchEvent(new Event("storage"))

      // Show success feedback
      const button = document.querySelector("[data-save-button]") as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = "Saved!"
        button.classList.add("bg-green-500")
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove("bg-green-500")
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving app:", error)
      alert("Error saving app. Please try again.")
    }
  }

  const addNewPage = () => {
    const newPageId = `page-${Date.now()}`
    const newPage: Page = {
      id: newPageId,
      name: `Page ${pages.length + 1}`,
      elements: [],
      groups: [], // Initialize groups for new page
      visible: true,
      canvasBackground: {
        type: "color",
        color: "#ffffff",
      },
      canvasWidth: 1200, // Default canvas width
      canvasHeight: 800, // Default canvas height
    }
    saveToHistory()
    setPages((prev) => [...prev, newPage])
    setCurrentPageId(newPageId)
    setExpandedPages((prev) => new Set([...prev, newPageId]))
    setSelectedElement(null)
    setSelectedElements([])
    setSelectedGroup(null) // Deselect group when adding new page
    setShowCanvasProperties(true)
  }

  const startPageRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId)
    setEditingPageName(currentName)
  }

  const finishPageRename = () => {
    if (editingPageId && editingPageName.trim()) {
      saveToHistory()
      setPages((prev) =>
        prev.map((page) => (page.id === editingPageId ? { ...page, name: editingPageName.trim() } : page)),
      )
    }
    setEditingPageId(null)
    setEditingPageName("")
  }

  const cancelPageRename = () => {
    setEditingPageId(null)
    setEditingPageName("")
  }

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return // Don't delete the last page

    const pageIndex = pages.findIndex((p) => p.id === pageId)
    if (pageIndex === -1) return

    saveToHistory()
    setPages((prev) => prev.filter((page) => page.id !== pageId))

    // Switch to another page if we deleted the current one
    if (currentPageId === pageId) {
      const remainingPages = pages.filter((p) => p.id !== pageId)
      const newCurrentPage = remainingPages[Math.max(0, pageIndex - 1)]
      setCurrentPageId(newCurrentPage.id)
    }

    setSelectedElement(null)
    setSelectedElements([])
    setSelectedGroup(null) // Deselect group when deleting page
  }

  const duplicatePage = (pageId: string) => {
    const pageToClone = pages.find((p) => p.id === pageId)
    if (!pageToClone) return

    const newPageId = `page-${Date.now()}`
    const clonedPage: Page = {
      ...pageToClone,
      id: newPageId,
      name: `${pageToClone.name} Copy`,
      elements: pageToClone.elements.map((el) => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        pageId: newPageId,
      })),
      groups: pageToClone.groups.map((group) => ({
        // Duplicate groups
        ...group,
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        elementIds: group.elementIds.map((elId) => {
          // Find the corresponding duplicated element ID
          const originalElement = pageToClone.elements.find((el) => el.id === elId)
          if (originalElement) {
            const duplicatedElementId = `${originalElement.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            // This is a bit tricky, we need to map original element IDs to new ones.
            // For simplicity here, we'll just generate new IDs, assuming the order is preserved.
            // A more robust solution would involve a mapping.
            return duplicatedElementId
          }
          return elId // Fallback
        }),
      })),
      canvasWidth: pageToClone.canvasWidth, // Duplicate canvas dimensions
      canvasHeight: pageToClone.canvasHeight,
    }
    saveToHistory()
    setPages((prev) => [...prev, clonedPage])
    setCurrentPageId(newPageId)
    setExpandedPages((prev) => new Set([...prev, newPageId]))
    setSelectedElement(null)
    setSelectedElements([])
    setSelectedGroup(null) // Deselect group when duplicating page
  }

  // const switchToPage = (pageId: string) => {
  //   setCurrentPageId(pageId)
  //   setSelectedElement(null)
  //   setSelectedElements([])
  //   setSelectedGroup(null) // Deselect group when switching page
  //   setShowCanvasProperties(true)
  // }

  const resetCanvasView = () => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 })
  }

  const zoomIn = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2),
    }))
  }

  const zoomOut = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.max(0.1, prev.scale * 0.8),
    }))
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
    setSelectedElement(null)
    setSelectedElements([])
    setSelectedGroup(null) // Deselect group when toggling preview
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Image src="/floneo-profile-logo.png" alt="Floneo" width={24} height={24} />
            {isEditingName ? (
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                className="text-lg font-semibold bg-transparent border-none outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-lg font-semibold cursor-pointer" onClick={() => setIsEditingName(true)}>
                {appName}
              </h1>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Canvas tools */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={canvasMode === "select" ? "default" : "ghost"}
              onClick={() => setCanvasMode("select")}
              className="h-8 px-3"
            >
              <MousePointer className="w-3 h-3 mr-1" />
              Select
            </Button>
            <Button
              size="sm"
              variant={canvasMode === "pan" ? "default" : "ghost"}
              onClick={() => setCanvasMode("pan")}
              className="h-8 px-3"
            >
              <Hand className="w-3 h-3 mr-1" />
              Pan
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <div className="flex items-center space-x-1">
            <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                />
              </svg>
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="outline" onClick={zoomOut}>
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(canvasTransform.scale * 100)}%
            </span>
            <Button size="sm" variant="outline" onClick={zoomIn}>
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={resetCanvasView}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Action buttons */}
          <Button size="sm" variant="outline" onClick={addNewPage}>
            <Plus className="w-3 h-3 mr-1" />
            Page
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCanvasProperties(!showCanvasProperties)}
            className={showCanvasProperties ? "bg-blue-50 border-blue-200" : ""}
          >
            <Settings className="w-3 h-3 mr-1" />
            Canvas
          </Button>

          <Button size="sm" onClick={saveApp} data-save-button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>

          <Button size="sm" variant="outline" onClick={togglePreviewMode}>
            <Play className="w-3 h-3 mr-1" />
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-75 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Ctrl+Z: Undo</div>
          <div>Ctrl+Y: Redo</div>
          <div>Ctrl+C: Copy</div>
          <div>Ctrl+V: Paste</div>
          <div>Ctrl+X: Cut</div>
          <div>Ctrl+A: Select All</div>
          <div>Ctrl+D: Duplicate</div>
          <div>Ctrl+G: Group</div>
          <div>Ctrl+Shift+G: Ungroup</div>
          <div>Del: Delete</div>
          <div>Arrows: Move</div>
          <div>Shift+Arrows: Move 10px</div>
          <div>Space: Pan Mode</div>
          <div>1-9: Switch Pages</div>
        </div>
      </div>

      {isPreviewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl max-h-[95vh] w-full mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Preview - {currentPage?.name}</h2>
              <div className="flex items-center space-x-2">
                {pages.map((page, index) => (
                  <Button
                    key={page.id}
                    size="sm"
                    variant={currentPageId === page.id ? "default" : "ghost"}
                    onClick={() => switchToPage(page.id)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={togglePreviewMode}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div
                className="relative border rounded-lg mx-auto"
                style={{
                  ...getCanvasBackgroundStyle(),
                  width: `${currentPage?.canvasWidth || 1200}px`,
                  height: `${currentPage?.canvasHeight || 800}px`,
                  minHeight: "600px",
                }}
              >
                {canvasElements.map((element) => renderElementClean(element))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isPreviewMode && (
        <div className="flex flex-1 overflow-hidden">
          {/* Element toolbar */}
          <ElementToolbar onDragStart={handleDragStart} />

          {/* Canvas area */}
          <div className="flex-1 flex flex-col">
            {/* Page tabs */}
            <div className="flex items-center px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {pages.map((page, index) => (
                  <div key={page.id} className="flex items-center space-x-1 group">
                    <div className="relative">
                      <Button
                        size="sm"
                        variant={currentPageId === page.id ? "default" : "ghost"}
                        onClick={() => switchToPage(page.id)}
                        onDoubleClick={() => startPageRename(page.id, page.name)}
                        className="flex items-center gap-2 h-8 pr-8"
                      >
                        <span className="text-xs">{index + 1}</span>
                        {editingPageId === page.id ? (
                          <input
                            type="text"
                            value={editingPageName}
                            onChange={(e) => setEditingPageName(e.target.value)}
                            onBlur={finishPageRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") finishPageRename()
                              if (e.key === "Escape") cancelPageRename()
                            }}
                            className="text-xs bg-transparent border-none outline-none w-20"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-xs">{page.name}</span>
                        )}
                        {!page.visible && <EyeOff className="w-3 h-3" />}
                      </Button>

                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startPageRename(page.id, page.name)
                            }}
                            className="w-4 h-4 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                            title="Rename page"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicatePage(page.id)
                            }}
                            className="w-4 h-4 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                            title="Duplicate page"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                          {pages.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`Are you sure you want to delete "${page.name}"?`)) {
                                  deletePage(page.id)
                                }
                              }}
                              className="w-4 h-4 text-gray-400 hover:text-red-600 flex items-center justify-center"
                              title="Delete page"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < pages.length - 1 && <div className="w-px h-4 bg-gray-300" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex">
              <div
                ref={canvasContainerRef}
                className="flex-1 overflow-hidden relative bg-gray-100"
                onWheel={handleWheel}
              >
                {/* Grid background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: `${20 * canvasTransform.scale}px ${20 * canvasTransform.scale}px`,
                    backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
                  }}
                />

                {/* Canvas */}
                <div
                  ref={canvasRef}
                  className="w-full h-full relative"
                  style={{
                    transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                    transformOrigin: "0 0",
                    cursor: isPanning ? "grabbing" : canvasMode === "pan" ? "grab" : "default",
                    ...getCanvasBackgroundStyle(),
                  }}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onClick={handleCanvasClick}
                >
                  {canvasElements.sort((a, b) => a.zIndex - b.zIndex).map(renderElement)}

                  {selectionBox && (
                    <div
                      className="absolute border-2 border-blue-400 bg-blue-100 bg-opacity-20 pointer-events-none"
                      style={{
                        left: selectionBox.x,
                        top: selectionBox.y,
                        width: selectionBox.width,
                        height: selectionBox.height,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Properties panel */}
          <PropertiesPanel
            selectedElement={selectedElement}
            selectedElements={selectedElements}
            selectedGroup={selectedGroup} // Pass selectedGroup to PropertiesPanel
            currentPage={currentPage}
            showCanvasProperties={showCanvasProperties}
            onUpdateElement={updateElementProperty}
            onUpdateElementTransform={updateElementTransform}
            onUpdateCanvasBackground={updateCanvasBackground}
            onUpdateCanvasDimensions={updateCanvasDimensions} // Add this handler
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            onToggleElementVisibility={toggleElementVisibility}
            onToggleElementLock={toggleElementLock}
            onMoveElementLayer={moveElementLayer}
            onCreateGroup={createGroup} // Pass createGroup
            onUngroupElements={ungroupElements} // Pass ungroupElements
            onSelectGroup={selectGroup} // Pass selectGroup
            onDuplicateGroup={duplicateGroup} // Pass duplicateGroup
          />
        </div>
      )}
    </div>
  )
}
