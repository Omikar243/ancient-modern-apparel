"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

const templates = [
  {
    id: "saree",
    name: "Saree",
    description: "An unstitched drape worn by women, symbolizing grace and tradition.",
    image: "https://images.unsplash.com/photo-1558618047-3c8d3a1b66b9?w=400&h=600&fit=crop",
  },
  {
    id: "dhoti",
    name: "Dhoti",
    description: "Traditional wrap-around garment for men, originating from ancient times.",
    image: "https://images.unsplash.com/photo-1595347123681-9ad98a7c5f89?w=400&h=600&fit=crop",
  },
  {
    id: "lehenga",
    name: "Lehenga Choli",
    description: "Embroidered skirt and blouse ensemble, perfect for festive occasions.",
    image: "https://images.unsplash.com/photo-1567183956072-638b7d772ca5?w=400&h=600&fit=crop",
  },
  {
    id: "kurta",
    name: "Kurta Pyjama",
    description: "Long tunic with pants, versatile for daily and formal wear.",
    image: "https://images.unsplash.com/photo-1571692280471-b5e8b1f4a72c?w=400&h=600&fit=crop",
  },
];

const materials = [
  {
    id: "khadi",
    name: "Khadi",
    origin: "Hand-spun and hand-woven cotton fabric, promoted by Mahatma Gandhi as a symbol of self-reliance.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
  },
  {
    id: "banarasi-silk",
    name: "Banarasi Silk",
    origin: "Luxurious silk sarees from Varanasi, known for intricate gold and silver brocade work dating back to Mughal era.",
    image: "https://images.unsplash.com/photo-1567183956072-638b7d772ca5?w=300&h=300&fit=crop",
  },
  {
    id: "chanderi",
    name: "Chanderi",
    origin: "Lightweight silk-cotton blend from Chanderi, Madhya Pradesh, famous for fine weaves and subtle motifs since 12th century.",
    image: "https://images.unsplash.com/photo-1558618047-3c8d3a1b66b9?w=300&h=300&fit=crop",
  },
  {
    id: "kanchipuram-silk",
    name: "Kanchipuram Silk",
    origin: "Rich silk sarees from Kanchipuram, Tamil Nadu, characterized by heavy zari borders and vibrant colors from ancient weaving traditions.",
    image: "https://images.unsplash.com/photo-1578631619929-30aa475ed3e5?w=300&h=300&fit=crop",
  },
];

export default function Catalog() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].id);
  const [customization, setCustomization] = useState({
    color: "red",
    pattern: "floral",
  });

  const colors = ["red", "blue", "green", "gold", "maroon"];
  const patterns = ["floral", "geometric", "solid", "embroidered", "printed"];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Garment Catalog</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Explore traditional Indian clothing templates, select authentic materials, and customize your design.
        </p>

        {/* Templates Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Choose a Template</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer ${selectedTemplate === template.id ? "border-2 border-primary" : ""}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="relative overflow-hidden rounded-t-lg h-48">
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Material Selection - Update to swatch-style with color options like reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Select Material & Colors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {materials.map((material) => (
              <Card
                key={material.id}
                className={`cursor-pointer ${selectedMaterial === material.id ? "border-2 border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => setSelectedMaterial(material.id)}
              >
                <div className="relative overflow-hidden rounded-t-lg h-40">
                  <Image
                    src={material.image}
                    alt={material.name}
                    fill
                    className="object-cover"
                  />
                  {/* Overlay text like in ref */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                    <h3 className="font-semibold">{material.name}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <CardDescription className="mb-3 text-sm">{material.origin}</CardDescription>
                  {/* Color swatches like ref second image */}
                  <div className="flex gap-1 mb-3">
                    {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"].map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border-2 ${customization.color === color ? "border-primary ring-2 ring-primary" : "border-muted"}`}
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomization((prev) => ({ ...prev, color }));
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open modal for more info if needed
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customization Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Customize Design</h2>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={customization.color} onValueChange={(value) => setCustomization((prev) => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pattern">Pattern</Label>
                  <Select value={customization.pattern} onValueChange={(value) => setCustomization((prev) => ({ ...prev, pattern: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Preview Image Placeholder */}
              <div className="text-center">
                <div className="relative w-full max-w-md mx-auto h-80 bg-gradient-to-br from-muted to-card rounded-xl flex items-center justify-center p-4">
                  <Image
                    src={selectedTemplate === "saree" ? "https://images.unsplash.com/photo-1558618047-3c8d3a1b66b9?w=300&h=500&fit=crop" : "https://images.unsplash.com/photo-1571692280471-b5e8b1f4a72c?w=300&h=500&fit=crop"} // Dynamic based on template
                    alt="Draft Preview"
                    fill
                    className="object-contain rounded-lg absolute"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-xs">
                    Draft - {selectedTemplate} in {selectedMaterial} ({customization.color}, {customization.pattern})
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">My Threads Draft</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="text-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/avatar">Back to Avatar</Link>
          </Button>
          <Button asChild>
            <Link href="/preview">Preview on Avatar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}