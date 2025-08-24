"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, MessageSquare, Sparkles, Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface AIAssistantButtonProps {
  onQuery?: (query: string) => void
}

export default function AIAssistantButton({ onQuery }: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleVoiceToggle = () => {
    setIsListening(!isListening)
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setQuery("Show cybercrime trend in Delhi last 3 months")
        setIsListening(false)
      }, 2000)
    }
  }

  const handleSubmit = () => {
    if (!query.trim()) return

    setIsProcessing(true)
    onQuery?.(query)

    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setQuery("")
      setIsOpen(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  const suggestedQueries = [
    "Show assault trends in Mumbai",
    "Compare crime rates across states",
    "Predict next month's cybercrime",
    "Analyze economic crime correlation",
  ]

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-14 h-14 rounded-full p-0 transition-all duration-300
            bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90
            shadow-lg hover:shadow-2xl hover:scale-110
            ${isOpen ? "rotate-180" : ""}
            before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-primary/20 before:to-secondary/20 before:animate-ping before:opacity-75
          `}
        >
          <div className="relative z-10">
            {isProcessing ? <Sparkles className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
          </div>
        </Button>

        {/* AI Assistant Panel */}
        {isOpen && (
          <Card className="absolute bottom-16 right-0 w-80 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-foreground">AI Crime Assistant</span>
                <Sparkles className="h-4 w-4 text-primary ml-auto" />
              </div>

              {/* Query Input */}
              <div className="relative mb-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about crime data..."
                  className="w-full px-3 py-2 pr-20 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  disabled={isProcessing}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleVoiceToggle}
                    className={`h-6 w-6 p-0 ${isListening ? "text-red-400 animate-pulse" : "text-muted-foreground"}`}
                  >
                    {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSubmit}
                    disabled={!query.trim() || isProcessing}
                    className="h-6 w-6 p-0 text-primary hover:text-primary/80"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Voice Status */}
              {isListening && (
                <div className="flex items-center gap-2 mb-3 text-xs text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  Listening...
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && (
                <div className="flex items-center gap-2 mb-3 text-xs text-primary">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Processing your query...
                </div>
              )}

              {/* Suggested Queries */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Quick queries:</span>
                {suggestedQueries.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="block w-full text-left text-xs text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/5"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
