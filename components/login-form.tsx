"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { designSystem } from "@/lib/design-system"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (email === "test@gmail.com" && password === "test") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } else {
      alert("Invalid credentials. Use test@gmail.com and password: test")
    }

    setIsLoading(false)
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: designSystem.colors.background.primary }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute -top-40 -left-32 w-[600px] h-[500px] transform rotate-12 opacity-80"
          style={{
            background: "linear-gradient(135deg, #0066FF 0%, #4A90E2 100%)",
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            filter: "blur(1px)",
          }}
        />

        <div
          className="absolute -top-20 right-0 w-[400px] h-[600px] transform -rotate-12 opacity-75"
          style={{
            background: "linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            filter: "blur(1px)",
          }}
        />

        <div
          className="absolute -bottom-32 right-0 w-[500px] h-[400px] transform rotate-45 opacity-70"
          style={{
            background: "linear-gradient(135deg, #FFC107 0%, #F39C12 100%)",
            borderRadius: "50% 50% 80% 20% / 60% 40% 60% 40%",
            filter: "blur(1px)",
          }}
        />

        <div
          className="absolute -bottom-40 -left-20 w-[450px] h-[350px] transform -rotate-30 opacity-75"
          style={{
            background: "linear-gradient(135deg, #FF4FCB 0%, #E91E63 100%)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            filter: "blur(1px)",
          }}
        />

        <div
          className="absolute top-1/4 left-1/3 w-[200px] h-[300px] transform rotate-45 opacity-40"
          style={{
            background: "linear-gradient(135deg, #0066FF 0%, #8E44AD 100%)",
            borderRadius: "60% 40% 40% 60% / 70% 30% 70% 30%",
            filter: "blur(2px)",
          }}
        />

        <div
          className="absolute bottom-1/4 right-1/3 w-[250px] h-[200px] transform -rotate-60 opacity-35"
          style={{
            background: "linear-gradient(135deg, #2ECC71 0%, #16A085 100%)",
            borderRadius: "80% 20% 60% 40% / 50% 50% 50% 50%",
            filter: "blur(2px)",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="w-1/2 flex items-center justify-center p-12">
          <div
            className="w-full max-w-md aspect-[3/4] border-2 border-dashed flex items-center justify-center"
            style={{
              backgroundColor: designSystem.colors.background.secondary,
              borderRadius: designSystem.spacing.borderRadius["2xl"],
              borderColor: designSystem.colors.border.secondary,
            }}
          >
            <div className="text-center space-y-6">
              <div
                className="w-20 h-20 mx-auto flex items-center justify-center"
                style={{
                  backgroundColor: designSystem.colors.background.primary,
                  borderRadius: "50%",
                }}
              >
                <svg className="w-10 h-10" fill="none" stroke={designSystem.colors.text.muted} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <p
                  className="text-base"
                  style={{
                    color: designSystem.colors.text.secondary,
                    fontWeight: designSystem.typography.fontWeight.medium,
                  }}
                >
                  Portrait Image
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: designSystem.colors.text.muted,
                  }}
                >
                  Placeholder for portrait
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center p-12">
          <Card
            className="w-full max-w-sm relative overflow-hidden"
            style={{
              background: designSystem.components.glassCard.background,
              backdropFilter: designSystem.components.glassCard.backdropBlur,
              border: designSystem.components.glassCard.border,
              borderRadius: designSystem.components.glassCard.borderRadius,
              boxShadow: designSystem.components.glassCard.shadow,
              padding: designSystem.spacing.padding["2xl"],
            }}
          >
            <div
              className="absolute inset-0 rounded-[20px]"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                pointerEvents: "none",
              }}
            />

            <CardContent className="space-y-8 p-0 relative z-10">
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-4">
                  <Image src="/floneo-logo.png" alt="Floneo" width={40} height={40} />
                </div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{
                    color: designSystem.colors.text.primary,
                    fontWeight: designSystem.typography.fontWeight.bold,
                  }}
                >
                  floneo
                </h1>
              </div>

              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: designSystem.colors.text.primary,
                      fontWeight: designSystem.typography.fontWeight.semibold,
                    }}
                  >
                    Login
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: designSystem.colors.text.secondary }}>
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-1 transition-all duration-200"
                    style={{
                      height: designSystem.components.input.height,
                      borderRadius: designSystem.components.input.borderRadius,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: designSystem.colors.text.primary,
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />

                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-1 transition-all duration-200"
                    style={{
                      height: designSystem.components.input.height,
                      borderRadius: designSystem.components.input.borderRadius,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: designSystem.colors.text.primary,
                      backdropFilter: "blur(10px)",
                    }}
                    required
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg mt-6"
                    style={{
                      height: designSystem.components.button.primary.height,
                      backgroundColor: designSystem.components.button.primary.background,
                      color: designSystem.components.button.primary.color,
                      borderRadius: designSystem.components.button.primary.borderRadius,
                      boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>

                <div
                  className="text-center text-xs leading-relaxed px-1"
                  style={{ color: designSystem.colors.text.muted }}
                >
                  By clicking continue, you agree to our{" "}
                  <span
                    style={{
                      color: designSystem.colors.text.primary,
                      fontWeight: designSystem.typography.fontWeight.medium,
                    }}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    style={{
                      color: designSystem.colors.text.primary,
                      fontWeight: designSystem.typography.fontWeight.medium,
                    }}
                  >
                    Privacy Policy
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
