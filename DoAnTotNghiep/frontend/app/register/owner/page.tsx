"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  User,
  ArrowLeft,
  Building2,
  Upload,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  Save,
  CheckCircle2,
} from "lucide-react"

type FormData = {
  // Step 1: Basic Info
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string

  // Step 2: Business Type & Info
  businessType: "individual" | "company"
  businessName: string
  taxId: string
  businessAddress: string
  description: string

  // Step 3: Documents
  nationalId: File | null
  businessLicense: File | null
  proofOfOwnership: File | null

  // Step 4: Agreement
  agreeTerms: boolean
}

export default function OwnerRegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "individual",
    businessName: "",
    taxId: "",
    businessAddress: "",
    description: "",
    nationalId: null,
    businessLicense: null,
    proofOfOwnership: null,
    agreeTerms: false,
  })

  const [uploadPreviews, setUploadPreviews] = useState<{
    nationalId: string
    businessLicense: string
    proofOfOwnership: string
  }>({
    nationalId: "",
    businessLicense: "",
    proofOfOwnership: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const savedData = localStorage.getItem("ownerRegistrationDraft")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData((prev) => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error("Failed to load saved data", e)
      }
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dataToSave = { ...formData }
      // Don't save files and password
      delete (dataToSave as any).nationalId
      delete (dataToSave as any).businessLicense
      delete (dataToSave as any).proofOfOwnership
      delete (dataToSave as any).password
      delete (dataToSave as any).confirmPassword

      localStorage.setItem("ownerRegistrationDraft", JSON.stringify(dataToSave))
      setLastSaved(new Date())
    }, 1000)

    return () => clearTimeout(timeout)
  }, [formData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string },
  ) => {
    const name = "target" in e ? e.target.name : e.name
    const value = "target" in e ? e.target.value : e.value

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [fieldName]: "File quá lớn. Tối đa 10MB." }))
        return
      }

      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [fieldName]: "Chỉ chấp nhận file PDF, JPG, PNG." }))
        return
      }

      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreviews((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)

      // Clear error
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
      }
    }
  }

  const removeFile = (fieldName: keyof FormData) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: null,
    }))
    setUploadPreviews((prev) => ({
      ...prev,
      [fieldName]: "",
    }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên"
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ"
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại"
    else if (!/^[0-9+\s()-]{10,}$/.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ"
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu"
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu tối thiểu 6 ký tự"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) newErrors.businessName = "Vui lòng nhập tên doanh nghiệp"
    if (!formData.businessAddress.trim()) newErrors.businessAddress = "Vui lòng nhập địa chỉ"
    if (formData.businessType === "company" && !formData.taxId.trim()) newErrors.taxId = "Vui lòng nhập mã số thuế"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nationalId) newErrors.nationalId = "Vui lòng tải lên CMND/CCCD"
    if (formData.businessType === "company" && !formData.businessLicense)
      newErrors.businessLicense = "Vui lòng tải lên giấy phép kinh doanh"
    if (!formData.proofOfOwnership) newErrors.proofOfOwnership = "Vui lòng tải lên giấy chứng nhận quyền sở hữu"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false

    if (currentStep === 1) isValid = validateStep1()
    else if (currentStep === 2) isValid = validateStep2()
    else if (currentStep === 3) isValid = validateStep3()

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms) {
      setErrors({ agreeTerms: "Vui lòng đồng ý với điều khoản" })
      return
    }

    // Clear saved draft
    localStorage.removeItem("ownerRegistrationDraft")

    // In real app, upload to server
    console.log("Owner registration submitted:", formData)

    // Redirect to pending page
    router.push("/owner/pending")
  }

  const steps = [
    { number: 1, title: "Thông tin cá nhân", icon: User },
    { number: 2, title: "Thông tin doanh nghiệp", icon: Building2 },
    { number: 3, title: "Tài liệu xác thực", icon: FileText },
    { number: 4, title: "Xác nhận", icon: CheckCircle2 },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Link
          href="/for-owners"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang Dành cho chủ sân
        </Link>

        <Card className="p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Đăng Ký Chủ Sân</h1>
            <p className="text-muted-foreground mt-2">Trở thành đối tác của HCMUT Sport Field Management</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep > step.number
                          ? "bg-green-600 border-green-600 text-white"
                          : currentStep === step.number
                            ? "bg-green-600 border-green-600 text-white"
                            : "bg-background border-border text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center hidden md:block ${
                        currentStep >= step.number ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? "bg-green-600" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <Badge variant="outline" className="text-xs">
                Bước {currentStep}/4
              </Badge>
            </div>
          </div>

          {lastSaved && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
              <Save className="w-3 h-3" />
              <span>Đã lưu lúc {lastSaved.toLocaleTimeString("vi-VN")}</span>
            </div>
          )}

          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              Đơn đăng ký sẽ được xem xét trong vòng 1-3 ngày làm việc. Tiến trình được lưu tự động.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Thông tin cá nhân
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">
                        Họ và Tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="owner@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone">
                          Số Điện Thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="0901234567"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">
                          Mật Khẩu <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Tối thiểu 6 ký tự"
                          value={formData.password}
                          onChange={handleChange}
                          className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">
                          Xác Nhận Mật Khẩu <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Nhập lại mật khẩu"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        {errors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    Thông tin doanh nghiệp
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label>
                        Loại hình <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.businessType}
                        onValueChange={(value) => handleChange({ name: "businessType", value })}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual" className="font-normal cursor-pointer">
                            Cá nhân
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="company" id="company" />
                          <Label htmlFor="company" className="font-normal cursor-pointer">
                            Công ty
                          </Label>
                        </div>
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cá nhân: Chủ sân cá nhân | Công ty: Doanh nghiệp có đăng ký kinh doanh
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="businessName">
                        Tên {formData.businessType === "company" ? "Công ty" : "Sân"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="VD: Sân Thể Thao ABC"
                        value={formData.businessName}
                        onChange={handleChange}
                        className={errors.businessName ? "border-red-500" : ""}
                      />
                      {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
                    </div>

                    {formData.businessType === "company" && (
                      <div>
                        <Label htmlFor="taxId">
                          Mã Số Thuế <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="taxId"
                          name="taxId"
                          placeholder="0123456789"
                          value={formData.taxId}
                          onChange={handleChange}
                          className={errors.taxId ? "border-red-500" : ""}
                        />
                        {errors.taxId && <p className="text-xs text-red-500 mt-1">{errors.taxId}</p>}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="businessAddress">
                        Địa Chỉ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessAddress"
                        name="businessAddress"
                        placeholder="Số nhà, đường, phường, quận, TP.HCM"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        className={errors.businessAddress ? "border-red-500" : ""}
                      />
                      {errors.businessAddress && <p className="text-xs text-red-500 mt-1">{errors.businessAddress}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Mô Tả Ngắn (Tùy chọn)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Giới thiệu về cơ sở của bạn..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Giúp khách hàng hiểu thêm về sân thể thao của bạn
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Tài liệu xác thực
                  </h2>

                  <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                      <strong>Yêu cầu tài liệu:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>File PDF, JPG, hoặc PNG</li>
                        <li>Kích thước tối đa: 10MB</li>
                        <li>Ảnh rõ nét, đầy đủ 4 góc</li>
                        <li>Thông tin phải đọc được</li>
                        <li>Tài liệu còn hiệu lực</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    {/* National ID */}
                    <div>
                      <Label>
                        CMND/CCCD/Hộ Chiếu <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">Giấy tờ tùy thân của người đại diện</p>

                      {!formData.nationalId ? (
                        <label
                          htmlFor="nationalId"
                          className={`flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            errors.nationalId
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-border hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                          }`}
                        >
                          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium text-foreground">Tải lên tài liệu</span>
                          <span className="text-xs text-muted-foreground mt-1">Kéo thả file hoặc click để chọn</span>
                          <input
                            id="nationalId"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "nationalId")}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 rounded bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {formData.nationalId.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(formData.nationalId.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {uploadPreviews.nationalId && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(uploadPreviews.nationalId, "_blank")}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeFile("nationalId")}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {errors.nationalId && <p className="text-xs text-red-500 mt-1">{errors.nationalId}</p>}
                    </div>

                    {/* Business License (if company) */}
                    {formData.businessType === "company" && (
                      <div>
                        <Label>
                          Giấy Phép Kinh Doanh <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Giấy chứng nhận đăng ký kinh doanh hoặc giấy phép tương đương
                        </p>

                        {!formData.businessLicense ? (
                          <label
                            htmlFor="businessLicense"
                            className={`flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              errors.businessLicense
                                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                : "border-border hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                            }`}
                          >
                            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium text-foreground">Tải lên tài liệu</span>
                            <span className="text-xs text-muted-foreground mt-1">Kéo thả file hoặc click để chọn</span>
                            <input
                              id="businessLicense"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, "businessLicense")}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 rounded bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {formData.businessLicense.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(formData.businessLicense.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {uploadPreviews.businessLicense && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(uploadPreviews.businessLicense, "_blank")}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile("businessLicense")}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        {errors.businessLicense && (
                          <p className="text-xs text-red-500 mt-1">{errors.businessLicense}</p>
                        )}
                      </div>
                    )}

                    {/* Proof of Ownership */}
                    <div>
                      <Label>
                        Giấy Chứng Nhận Quyền Sở Hữu/Thuê <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Sổ đỏ, hợp đồng thuê, hoặc giấy tờ chứng minh quyền sử dụng mặt bằng
                      </p>

                      {!formData.proofOfOwnership ? (
                        <label
                          htmlFor="proofOfOwnership"
                          className={`flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            errors.proofOfOwnership
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-border hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                          }`}
                        >
                          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium text-foreground">Tải lên tài liệu</span>
                          <span className="text-xs text-muted-foreground mt-1">Kéo thả file hoặc click để chọn</span>
                          <input
                            id="proofOfOwnership"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "proofOfOwnership")}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 rounded bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {formData.proofOfOwnership.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(formData.proofOfOwnership.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {uploadPreviews.proofOfOwnership && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(uploadPreviews.proofOfOwnership, "_blank")}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile("proofOfOwnership")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {errors.proofOfOwnership && (
                        <p className="text-xs text-red-500 mt-1">{errors.proofOfOwnership}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Confirm */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Xác nhận thông tin
                  </h2>

                  {/* Review Summary */}
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Thông tin cá nhân</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                          Chỉnh sửa
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Họ tên:</strong> {formData.fullName}
                        </p>
                        <p>
                          <strong>Email:</strong> {formData.email}
                        </p>
                        <p>
                          <strong>SĐT:</strong> {formData.phone}
                        </p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Thông tin doanh nghiệp</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                          Chỉnh sửa
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Loại hình:</strong> {formData.businessType === "individual" ? "Cá nhân" : "Công ty"}
                        </p>
                        <p>
                          <strong>Tên:</strong> {formData.businessName}
                        </p>
                        {formData.businessType === "company" && formData.taxId && (
                          <p>
                            <strong>MST:</strong> {formData.taxId}
                          </p>
                        )}
                        <p>
                          <strong>Địa chỉ:</strong> {formData.businessAddress}
                        </p>
                        {formData.description && (
                          <p>
                            <strong>Mô tả:</strong> {formData.description}
                          </p>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Tài liệu</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                          Chỉnh sửa
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>CMND/CCCD: {formData.nationalId?.name}</span>
                        </div>
                        {formData.businessType === "company" && formData.businessLicense && (
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Giấy phép KD: {formData.businessLicense?.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Giấy sở hữu: {formData.proofOfOwnership?.name}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Terms Agreement */}
                  <div className="mt-6 pt-6 border-t">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
                        className="w-4 h-4 rounded border-border mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        Tôi cam kết rằng tất cả thông tin và tài liệu cung cấp là chính xác và đồng ý với{" "}
                        <Link href="/terms" className="text-green-600 hover:text-green-700 dark:text-green-400">
                          Điều Khoản Dịch Vụ
                        </Link>{" "}
                        và{" "}
                        <Link href="/privacy" className="text-green-600 hover:text-green-700 dark:text-green-400">
                          Chính Sách Bảo Mật
                        </Link>
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-xs text-red-500 mt-1">{errors.agreeTerms}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Quay lại
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext} className="ml-auto">
                  Tiếp tục
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-green-600 hover:bg-green-700"
                  disabled={!formData.agreeTerms}
                >
                  Gửi Đơn Đăng Ký
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản chủ sân?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 dark:text-green-400 font-medium">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
