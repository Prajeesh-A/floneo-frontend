"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Type,
  Square,
  Circle,
  ImageIcon,
  Calendar,
  Phone,
  CheckSquare,
  ToggleLeft,
  Upload,
  ChevronDown,
  Triangle,
  Minus,
  ArrowRight,
  Star,
  Heart,
  Zap,
  Hand,
  Layers,
  Palette,
  Settings,
} from "lucide-react"

interface ElementType {
  type: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  category: "form" | "media" | "shapes" | "layout"
  description?: string
}

interface ElementToolbarProps {
  onDragStart: (e: React.DragEvent, elementType: string) => void
}

export function ElementToolbar({ onDragStart }: ElementToolbarProps) {
  const [activeCategory, setActiveCategory] = useState<"form" | "media" | "shapes" | "layout">("form")

  const elementTypes: ElementType[] = [
    // Form Elements
    { type: "textfield", icon: Type, label: "Text Field", category: "form", description: "Single line text input" },
    { type: "textarea", icon: Type, label: "Text Area", category: "form", description: "Multi-line text input" },
    { type: "button", icon: Square, label: "Button", category: "form", description: "Clickable button element" },
    {
      type: "checkbox",
      icon: CheckSquare,
      label: "Checkbox",
      category: "form",
      description: "Boolean selection input",
    },
    {
      type: "radiobutton",
      icon: Circle,
      label: "Radio Button",
      category: "form",
      description: "Single choice selection",
    },
    { type: "dropdown", icon: ChevronDown, label: "Dropdown", category: "form", description: "Select from options" },
    {
      type: "toggle",
      icon: ToggleLeft,
      label: "Toggle Switch",
      category: "form",
      description: "On/off switch control",
    },
    { type: "phone", icon: Phone, label: "Phone Field", category: "form", description: "Phone number input" },
    { type: "calendar", icon: Calendar, label: "Date Picker", category: "form", description: "Date selection input" },

    // Media Elements
    { type: "upload", icon: Upload, label: "File Upload", category: "media", description: "File upload component" },
    { type: "media", icon: ImageIcon, label: "Image", category: "media", description: "Image display element" },

    // Shape Elements
    { type: "rectangle", icon: Square, label: "Rectangle", category: "shapes", description: "Basic rectangle shape" },
    { type: "circle", icon: Circle, label: "Circle", category: "shapes", description: "Basic circle shape" },
    { type: "triangle", icon: Triangle, label: "Triangle", category: "shapes", description: "Basic triangle shape" },
    { type: "line", icon: Minus, label: "Line", category: "shapes", description: "Straight line element" },
    { type: "arrow", icon: ArrowRight, label: "Arrow", category: "shapes", description: "Arrow shape" },
    { type: "star", icon: Star, label: "Star", category: "shapes", description: "Star shape" },
    { type: "heart", icon: Heart, label: "Heart", category: "shapes", description: "Heart shape" },

    // Layout Elements
    { type: "container", icon: Layers, label: "Container", category: "layout", description: "Layout container" },
    { type: "divider", icon: Minus, label: "Divider", category: "layout", description: "Section divider" },
  ]

  const categories = [
    { id: "form" as const, label: "Form", icon: Type, description: "Input and form controls" },
    { id: "media" as const, label: "Media", icon: ImageIcon, description: "Images and media elements" },
    { id: "shapes" as const, label: "Shapes", icon: Circle, description: "Basic geometric shapes" },
    { id: "layout" as const, label: "Layout", icon: Layers, description: "Layout and structure elements" },
  ]

  const filteredElements = elementTypes.filter((element) => element.category === activeCategory)

  const handleElementDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.effectAllowed = "copy"
    onDragStart(e, elementType)
  }

  const renderElementCard = (element: ElementType) => {
    const Icon = element.icon
    return (
      <div
        key={element.type}
        draggable
        onDragStart={(e) => handleElementDragStart(e, element.type)}
        className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
        title={element.description}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center leading-tight">{element.label}</span>
        </div>

        {/* Drag indicator */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Hand className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Elements</h2>
        </div>
        <p className="text-xs text-gray-500">Drag elements onto the canvas</p>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={(value) => setActiveCategory(value as any)}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            {categories.slice(0, 2).map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Icon className="w-3 h-3" />
                  {category.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 mt-1">
            {categories.slice(2).map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Icon className="w-3 h-3" />
                  {category.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Elements Grid */}
        <div className="flex-1 px-4 pb-4">
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4 h-full">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">{category.label}</h3>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="grid grid-cols-2 gap-3 pr-4">
                  {elementTypes.filter((element) => element.category === category.id).map(renderElementCard)}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs bg-transparent"
            onClick={() => {
              // Add functionality for templates
            }}
          >
            <Settings className="w-3 h-3 mr-2" />
            Element Templates
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs bg-transparent"
            onClick={() => {
              // Add functionality for custom elements
            }}
          >
            <Zap className="w-3 h-3 mr-2" />
            Custom Elements
          </Button>
        </div>
      </div>
    </div>
  )
}
