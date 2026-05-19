"use client"

import { QRCodeCanvas } from "qrcode.react"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 340, className }: QRCodeProps) {
  const qrValue = value?.trim()

  if (!qrValue) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#dc2626",
          fontSize: 14,
          textAlign: "center",
          padding: 16,
        }}
      >
        Không có mã QR
      </div>
    )
  }

  return (
    <div className={className}>
      <QRCodeCanvas
        value={qrValue}
        size={size}
        level="M"
        includeMargin={true}
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
    </div>
  )
}