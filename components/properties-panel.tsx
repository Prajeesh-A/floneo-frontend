"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Palette,
  Type,
  Move,
  RotateCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
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
}

interface Page {
  id: string
  name: string
  elements: CanvasElement[]
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
}

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null
  currentPage: Page | null
  showCanvasProperties: boolean
  onUpdateElement: (property: string, value: any) => void
  onUpdateElementTransform: (property: string, value: number) => void
  onUpdateCanvasBackground: (background: Partial<Page["canvasBackground"]>) => void
  onDeleteElement: () => void
  onDuplicateElement: () => void
  onToggleElementVisibility: () => void
  onToggleElementLock: () => void
  onMoveElementLayer: (direction: "up" | "down") => void
}

export function PropertiesPanel({
  selectedElement,
  currentPage,
  showCanvasProperties,
  // ...other props...
  // General properties function
  const renderGeneralProperties = () => {
    if (!selectedElement) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alignment */}
          <div>
            <Label>Alignment</Label>
            <div className="flex gap-1 mb-2">
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("align", "left")}>Left</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("align", "center")}>H Center</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("align", "right")}>Right</Button>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("valign", "top")}>Top</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("valign", "center")}>V Center</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("valign", "bottom")}>Bottom</Button>
            </div>
          </div>
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>X Position</Label>
              <Input type="number" value={selectedElement.x} onChange={e => onUpdateElementTransform("x", Number(e.target.value))} />
            </div>
            <div>
              <Label>Y Position</Label>
              <Input type="number" value={selectedElement.y} onChange={e => onUpdateElementTransform("y", Number(e.target.value))} />
            </div>
          </div>
          {/* Rotation & Flip */}
          <div className="flex gap-2 items-center">
            <Label>Rotation</Label>
            <Input type="number" value={selectedElement.rotation} onChange={e => onUpdateElementTransform("rotation", Number(e.target.value))} />
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("flipH", !(selectedElement.properties?.flipH))}>Flip H</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("flipV", !(selectedElement.properties?.flipV))}>Flip V</Button>
          </div>
          {/* Layout / Dimensions */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Width</Label>
              <Input type="number" value={selectedElement.width} onChange={e => onUpdateElementTransform("width", Number(e.target.value))} />
            </div>
            <div>
              <Label>Height</Label>
              <Input type="number" value={selectedElement.height} onChange={e => onUpdateElementTransform("height", Number(e.target.value))} />
            </div>
          </div>
          {/* Appearance */}
          <div>
            <Label>Opacity</Label>
            <Slider value={[selectedElement.opacity]} onValueChange={([v]) => onUpdateElementTransform("opacity", v)} min={0} max={100} step={1} />
          </div>
          <div>
            <Label>Corner Radius</Label>
            <Input type="number" value={selectedElement.properties?.borderRadius ?? 0} onChange={e => onUpdateElement("borderRadius", Number(e.target.value))} />
          </div>
          {/* Fill */}
          <div>
            <Label>Fill Color</Label>
            <Input type="text" value={selectedElement.properties?.fillColor ?? "#FFFFFF"} onChange={e => onUpdateElement("fillColor", e.target.value)} />
            <Label>Fill Opacity</Label>
            <Slider value={[selectedElement.properties?.fillOpacity ?? 100]} onValueChange={([v]) => onUpdateElement("fillOpacity", v)} min={0} max={100} step={1} />
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("showFill", !(selectedElement.properties?.showFill))}>{selectedElement.properties?.showFill ? <Eye /> : <EyeOff />}</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("addFill", true)}>+</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("removeFill", true)}>-</Button>
          </div>
          {/* Stroke */}
          <div>
            <Label>Stroke Color</Label>
            <Input type="text" value={selectedElement.properties?.strokeColor ?? "#FFFFFF"} onChange={e => onUpdateElement("strokeColor", e.target.value)} />
            <Label>Stroke Opacity</Label>
            <Slider value={[selectedElement.properties?.strokeOpacity ?? 100]} onValueChange={([v]) => onUpdateElement("strokeOpacity", v)} min={0} max={100} step={1} />
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("showStroke", !(selectedElement.properties?.showStroke))}>{selectedElement.properties?.showStroke ? <Eye /> : <EyeOff />}</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("addStroke", true)}>+</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateElement("removeStroke", true)}>-</Button>
            <Label>Stroke Position</Label>
            <Select value={selectedElement.properties?.strokePosition ?? "inside"} onValueChange={v => onUpdateElement("strokePosition", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inside">Inside</SelectItem>
                <SelectItem value="outside">Outside</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
            <Label>Stroke Weight</Label>
            <Input type="number" value={selectedElement.properties?.strokeWeight ?? 1} onChange={e => onUpdateElement("strokeWeight", Number(e.target.value))} />
          </div>
          {/* Effects */}
          <div>
            <Label>Effects</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={selectedElement.properties?.dropShadow ? "default" : "outline"} onClick={() => onUpdateElement("dropShadow", !(selectedElement.properties?.dropShadow))}>Drop Shadow</Button>
              <Button size="sm" variant={selectedElement.properties?.backgroundBlur ? "default" : "outline"} onClick={() => onUpdateElement("backgroundBlur", !(selectedElement.properties?.backgroundBlur))}>Background Blur</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("addEffect", true)}>+</Button>
              <Button size="sm" variant="outline" onClick={() => onUpdateElement("removeEffect", true)}>-</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  };

  // ...existing code...
            <div>
              <Label>Color 2</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={currentPage.canvasBackground.gradient?.colors?.[1] || "#000000"}
                  onChange={(e) => {
                    const colors = [...(currentPage.canvasBackground.gradient?.colors || ["#ffffff", "#000000"])]
                    colors[1] = e.target.value
                    onUpdateCanvasBackground({
                      gradient: {
                        ...currentPage.canvasBackground.gradient,
                        colors,
                        type: currentPage.canvasBackground.gradient?.type || "linear",
                      },
                    })
                  }}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={currentPage.canvasBackground.gradient?.colors?.[1] || "#000000"}
                  onChange={(e) => {
                    const colors = [...(currentPage.canvasBackground.gradient?.colors || ["#ffffff", "#000000"])]
                    colors[1] = e.target.value
                    onUpdateCanvasBackground({
                      gradient: {
                        ...currentPage.canvasBackground.gradient,
                        colors,
                        type: currentPage.canvasBackground.gradient?.type || "linear",
                      },
                    })
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}

        {currentPage?.canvasBackground.type === "image" && (
          <div className="space-y-3">
            <div>
              <Label>Image URL</Label>
              <Input
                type="text"
                value={currentPage.canvasBackground.image?.url || ""}
                onChange={(e) =>
                  onUpdateCanvasBackground({
                    image: {
                      ...currentPage.canvasBackground.image,
                      url: e.target.value,
                      size: currentPage.canvasBackground.image?.size || "cover",
                      position: currentPage.canvasBackground.image?.position || "center",
                    },
                  })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label>Image Size</Label>
              <Select
                value={currentPage.canvasBackground.image?.size || "cover"}
                onValueChange={(value: "cover" | "contain" | "repeat") =>
                  onUpdateCanvasBackground({
                    image: {
                      ...currentPage.canvasBackground.image,
                      size: value,
                      url: currentPage.canvasBackground.image?.url || "",
                      position: currentPage.canvasBackground.image?.position || "center",
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="repeat">Repeat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Image Position</Label>
              <Select
                value={currentPage.canvasBackground.image?.position || "center"}
                onValueChange={(value) =>
                  onUpdateCanvasBackground({
                    image: {
                      ...currentPage.canvasBackground.image,
                      position: value,
                      url: currentPage.canvasBackground.image?.url || "",
                      size: currentPage.canvasBackground.image?.size || "cover",
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top left">Top Left</SelectItem>
                  <SelectItem value="top right">Top Right</SelectItem>
                  <SelectItem value="bottom left">Bottom Left</SelectItem>
                  <SelectItem value="bottom right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          Select an element to edit its properties
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Element Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onToggleElementVisibility}
                  title={selectedElement.properties.hidden ? "Show" : "Hide"}
                >
                  {selectedElement.properties.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onToggleElementLock}
                  title={selectedElement.properties.locked ? "Unlock" : "Lock"}
                >
                  {selectedElement.properties.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="outline" onClick={onDuplicateElement} title="Duplicate">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={onDeleteElement} title="Delete">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onMoveElementLayer("up")} className="flex-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                Bring Forward
              </Button>
              <Button size="sm" variant="outline" onClick={() => onMoveElementLayer("down")} className="flex-1">
                <ArrowDown className="w-3 h-3 mr-1" />
                Send Backward
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Position & Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => onUpdateElementTransform("x", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => onUpdateElementTransform("y", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => onUpdateElementTransform("width", Number.parseFloat(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => onUpdateElementTransform("height", Number.parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <RotateCw className="w-3 h-3" />
                    Rotation: {selectedElement.rotation}°
                  </Label>
                  <Slider
                    value={[selectedElement.rotation]}
                    onValueChange={([value]) => onUpdateElementTransform("rotation", value)}
                    min={-180}
                    max={180}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Opacity: {selectedElement.opacity}%</Label>
                  <Slider
                    value={[selectedElement.opacity]}
                    onValueChange={([value]) => onUpdateElementTransform("opacity", value)}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(selectedElement.type === "textfield" ||
                  selectedElement.type === "textarea" ||
                  selectedElement.type === "button" ||
                  selectedElement.type === "rectangle" ||
                  selectedElement.type === "circle") && (
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElement.properties.backgroundColor || "#ffffff"}
                        onChange={(e) => onUpdateElement("backgroundColor", e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={selectedElement.properties.backgroundColor || "#ffffff"}
                        onChange={(e) => onUpdateElement("backgroundColor", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {(selectedElement.type === "textfield" ||
                  selectedElement.type === "textarea" ||
                  selectedElement.type === "button") && (
                  <div>
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElement.properties.color || "#000000"}
                        onChange={(e) => onUpdateElement("color", e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={selectedElement.properties.color || "#000000"}
                        onChange={(e) => onUpdateElement("color", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                {(selectedElement.type === "textfield" ||
                  selectedElement.type === "textarea" ||
                  selectedElement.type === "button") && (
                  <>
                    <div>
                      <Label>Font Size</Label>
                      <Input
                        type="number"
                        value={selectedElement.properties.fontSize || 14}
                        onChange={(e) => onUpdateElement("fontSize", Number.parseInt(e.target.value) || 14)}
                        min={8}
                        max={72}
                      />
                    </div>

                    <div>
                      <Label>Font Weight</Label>
                      <Select
                        value={selectedElement.properties.fontWeight || "normal"}
                        onValueChange={(value) => onUpdateElement("fontWeight", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="lighter">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Text Align</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={selectedElement.properties.textAlign === "left" ? "default" : "outline"}
                          onClick={() => onUpdateElement("textAlign", "left")}
                        >
                          <AlignLeft className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedElement.properties.textAlign === "center" ? "default" : "outline"}
                          onClick={() => onUpdateElement("textAlign", "center")}
                        >
                          <AlignCenter className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedElement.properties.textAlign === "right" ? "default" : "outline"}
                          onClick={() => onUpdateElement("textAlign", "right")}
                        >
                          <AlignRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {(selectedElement.type === "button" ||
                  selectedElement.type === "textfield" ||
                  selectedElement.type === "textarea" ||
                  selectedElement.type === "rectangle") && (
                  <div>
                    <Label>Border Radius</Label>
                    <Input
                      type="number"
                      value={selectedElement.properties.borderRadius || 0}
                      onChange={(e) => onUpdateElement("borderRadius", Number.parseInt(e.target.value) || 0)}
                      min={0}
                      max={50}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedElement.type === "button" && (
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      type="text"
                      value={selectedElement.properties.text || "Button"}
                      onChange={(e) => onUpdateElement("text", e.target.value)}
                    />
                  </div>
                )}

                {(selectedElement.type === "textfield" || selectedElement.type === "textarea") && (
                  <>
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        type="text"
                        value={selectedElement.properties.placeholder || ""}
                        onChange={(e) => onUpdateElement("placeholder", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Default Value</Label>
                      <Input
                        type="text"
                        value={selectedElement.properties.value || ""}
                        onChange={(e) => onUpdateElement("value", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === "textarea" && (
                  <div>
                    <Label>Rows</Label>
                    <Input
                      type="number"
                      value={selectedElement.properties.rows || 4}
                      onChange={(e) => onUpdateElement("rows", Number.parseInt(e.target.value) || 4)}
                      min={1}
                      max={20}
                    />
                  </div>
                )}

                {(selectedElement.type === "checkbox" ||
                  selectedElement.type === "radiobutton" ||
                  selectedElement.type === "toggle") && (
                  <>
                    <div>
                      <Label>Label</Label>
                      <Input
                        type="text"
                        value={selectedElement.properties.label || ""}
                        onChange={(e) => onUpdateElement("label", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedElement.properties.checked || false}
                        onCheckedChange={(checked) => onUpdateElement("checked", checked)}
                      />
                      <Label>Checked by default</Label>
                    </div>
                  </>
                )}

                {selectedElement.type === "dropdown" && (
                  <>
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        type="text"
                        value={selectedElement.properties.placeholder || "Select option"}
                        onChange={(e) => onUpdateElement("placeholder", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Options (one per line)</Label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        rows={4}
                        value={(selectedElement.properties.options || []).join("\n")}
                        onChange={(e) => onUpdateElement("options", e.target.value.split("\n").filter(Boolean))}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === "phone" && (
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      type="text"
                      value={selectedElement.properties.placeholder || "Phone number"}
                      onChange={(e) => onUpdateElement("placeholder", e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="space-y-4">{showCanvasProperties ? renderCanvasProperties() : renderElementProperties()}</div>
    </div>
  )
}
