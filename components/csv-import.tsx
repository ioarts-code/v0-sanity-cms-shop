"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

export function CsvImport() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setResult(null)

    try {
      const text = await file.text()

      const response = await fetch("/api/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvData: text }),
      })

      let data
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        // If response is not JSON, treat it as an error
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text)
        data = { error: "Server returned an invalid response" }
      }

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Products imported successfully",
          count: data.count,
        })
        // Refresh the page after successful import
        setTimeout(() => {
          router.refresh()
          setIsOpen(false)
          setResult(null)
        }, 2000)
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to import products",
        })
      }
    } catch (error) {
      console.error("[v0] Import error:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during import",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import products into your store. The file should include product details and image
            URLs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-primary hover:underline">Choose a CSV file</span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </label>
            <p className="text-xs text-muted-foreground mt-2">CSV files only</p>
          </div>

          {isImporting && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Importing products...</span>
            </div>
          )}

          {result && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg ${
                result.success
                  ? "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
                  : "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{result.message}</p>
                {result.count && <p className="text-xs mt-1">{result.count} products imported</p>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
