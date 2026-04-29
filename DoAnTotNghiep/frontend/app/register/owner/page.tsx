"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
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
  Loader2,
} from "lucide-react"

type FormData = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string

  businessType: "individual" | "company"
  businessName: string
  taxId: string
  businessAddress: string
  description: string

  idFront: File | null
  idBack: File | null
  licenseFile: File | null

  agreeTerms: boolean
}

type UploadField = "idFront" | "idBack" | "licenseFile"

type UploadPreviews = Record<UploadField, string>

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type UploadedFile = {
  url: string
  storage_path?: string
  original_name?: string
  mime_type?: string
  size_bytes?: number
}

type UploadDocumentsResponse = {
  files: UploadedFile[]
}

type AuthData = {
  accessToken?: string
  access_token?: string
  token?: string
  user?: unknown
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"

const INITIAL_FORM_DATA: FormData = {
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
  idFront: null,
  idBack: null,
  licenseFile: null,
  agreeTerms: false,
}

function getAccessTokenFromAuthResponse(response: ApiResponse<AuthData>) {
  const payload = response.data

  return payload.accessToken || payload.access_token || payload.token || ""
}

async function requestJson<T>(
  endpoint: string,
  options: RequestInit & { requireAuth?: boolean } = {},
): Promise<T> {
  const { requireAuth = false, ...fetchOptions } = options
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
    cache: "no-store",
  })

  let result: any = null

  try {
    result = await response.json()
  } catch {
    if (!response.ok) {
      throw new Error("Response từ server không phải JSON hợp lệ")
    }
  }

  if (!response.ok) {
    throw new Error(result?.message || "Yêu cầu thất bại")
  }

  return result as T
}

async function uploadOwnerDocuments(files: File[]) {
  const form = new FormData()

  files.forEach((file) => {
    form.append("documents", file)
  })

  const response = await requestJson<ApiResponse<UploadDocumentsResponse>>("/uploads/documents", {
    method: "POST",
    body: form,
    requireAuth: true,
  })

  return response.data.files
}

export default function OwnerRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [uploadPreviews, setUploadPreviews] = useState<UploadPreviews>({
    idFront: "",
    idBack: "",
    licenseFile: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedData = localStorage.getItem("ownerRegistrationDraft")

    if (!savedData) return

    try {
      const parsed = JSON.parse(savedData)
      setFormData((prev) => ({ ...prev, ...parsed }))
    } catch (error) {
      console.error("Failed to load saved data", error)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dataToSave = { ...formData }

      delete (dataToSave as Partial<FormData>).idFront
      delete (dataToSave as Partial<FormData>).idBack
      delete (dataToSave as Partial<FormData>).licenseFile
      delete (dataToSave as Partial<FormData>).password
      delete (dataToSave as Partial<FormData>).confirmPassword

      localStorage.setItem("ownerRegistrationDraft", JSON.stringify(dataToSave))
      setLastSaved(new Date())
    }, 1000)

    return () => clearTimeout(timeout)
  }, [formData])

  const clearError = (name: string) => {
    if (!errors[name]) return

    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string },
  ) => {
    const name = "target" in e ? e.target.name : e.name
    const value = "target" in e ? e.target.value : e.value

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    clearError(name)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: UploadField) => {
    const file = e.target.files?.[0]
    e.target.value = ""

    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [fieldName]: "File quá lớn. Tối đa 10MB." }))
      return
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [fieldName]: "Chỉ chấp nhận file PDF, JPG, PNG." }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }))

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadPreviews((prev) => ({
        ...prev,
        [fieldName]: event.target?.result as string,
      }))
    }
    reader.readAsDataURL(file)

    clearError(fieldName)
  }

  const removeFile = (fieldName: UploadField) => {
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

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^(0|\+84)[0-9]{8,10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName.trim()) newErrors.businessName = "Vui lòng nhập tên sân/doanh nghiệp"
    if (!formData.businessAddress.trim()) newErrors.businessAddress = "Vui lòng nhập địa chỉ"

    if (formData.businessType === "company" && !formData.taxId.trim()) {
      newErrors.taxId = "Vui lòng nhập mã số thuế"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.idFront) newErrors.idFront = "Vui lòng tải lên mặt trước CCCD/CMND"
    if (!formData.idBack) newErrors.idBack = "Vui lòng tải lên mặt sau CCCD/CMND"
    if (!formData.licenseFile) {
      newErrors.licenseFile = "Vui lòng tải lên giấy phép hoặc giấy tờ chứng minh quyền vận hành sân"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) return validateStep1()
    if (currentStep === 2) return validateStep2()
    if (currentStep === 3) return validateStep3()
    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return

    setCurrentStep((prev) => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const ensureAccountAndLogin = async () => {
    const existingToken = localStorage.getItem("accessToken")

    if (existingToken) return

    try {
      await requestJson<ApiResponse<unknown>>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
        }),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo tài khoản"

      if (!message.toLowerCase().includes("email") && !message.toLowerCase().includes("tồn tại")) {
        throw error
      }
    }

    const loginResponse = await requestJson<ApiResponse<AuthData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
      }),
    })

    const token = getAccessTokenFromAuthResponse(loginResponse)

    if (!token) {
      throw new Error("Đăng nhập thành công nhưng không nhận được accessToken")
    }

    localStorage.setItem("accessToken", token)

    if (loginResponse.data.user) {
      localStorage.setItem("user", JSON.stringify(loginResponse.data.user))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms) {
      setErrors({ agreeTerms: "Vui lòng đồng ý với điều khoản" })
      return
    }

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng kiểm tra lại các bước đăng ký.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await ensureAccountAndLogin()

      const uploadedFiles = await uploadOwnerDocuments([
        formData.licenseFile as File,
        formData.idFront as File,
        formData.idBack as File,
      ])

      const [licenseFile, idFrontFile, idBackFile] = uploadedFiles

      if (!licenseFile?.url || !idFrontFile?.url || !idBackFile?.url) {
        throw new Error("Upload giấy tờ chưa trả đủ URL cần thiết")
      }

      await requestJson<ApiResponse<unknown>>("/owner/registration", {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          business_name: formData.businessName.trim(),
          tax_code: formData.taxId.trim() || null,
          address: formData.businessAddress.trim(),
          license_url: licenseFile.url,
          id_front_url: idFrontFile.url,
          id_back_url: idBackFile.url,
        }),
      })

      localStorage.removeItem("ownerRegistrationDraft")

      toast({
        title: "Gửi đăng ký owner thành công",
        description: "Hồ sơ của bạn đang chờ admin kiểm duyệt.",
      })

      router.push("/owner/pending")
    } catch (error) {
      toast({
        title: "Không thể gửi đăng ký owner",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Thông tin cá nhân", icon: User },
    { number: 2, title: "Thông tin doanh nghiệp", icon: Building2 },
    { number: 3, title: "Tài liệu xác thực", icon: FileText },
    { number: 4, title: "Xác nhận", icon: CheckCircle2 },
  ]

  const renderUploadBox = ({
    field,
    title,
    description,
  }: {
    field: UploadField
    title: string
    description: string
  }) => {
    const file = formData[field]
    const preview = uploadPreviews[field]

    return (
      <div>
        <Label>
          {title} <span className="text-red-500">*</span>
        </Label>
        <p className="mb-2 text-xs text-muted-foreground">{description}</p>

        {!file ? (
          <label
            htmlFor={field}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
              errors[field]
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-border hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20"
            }`}
          >
            <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Tải lên tài liệu</span>
            <span className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG. Tối đa 10MB.</span>
            <input
              id={field}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, field)}
              className="hidden"
            />
          </label>
        ) : (
          <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-green-100 dark:bg-green-900/50">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex gap-2">
                {preview && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => window.open(preview, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(field)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/for-owners"
          className="mb-8 flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang Dành cho chủ sân
        </Link>

        <Card className="p-6 md:p-10">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Đăng Ký Chủ Sân</h1>
            <p className="mt-2 text-muted-foreground">Trở thành đối tác của HCMUT Sport Field Management</p>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        currentStep >= step.number
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <span
                      className={`mt-2 hidden text-center text-xs md:block ${
                        currentStep >= step.number ? "font-medium text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 ${currentStep > step.number ? "bg-green-600" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                Bước {currentStep}/4
              </Badge>
            </div>
          </div>

          {lastSaved && (
            <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Save className="h-3 w-3" />
              <span>Đã lưu lúc {lastSaved.toLocaleTimeString("vi-VN")}</span>
            </div>
          )}

          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              Đơn đăng ký sẽ được admin xem xét. Vui lòng dùng ảnh giấy tờ rõ nét và đúng thông tin.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <User className="h-5 w-5 text-green-600" />
                    Thông tin tài khoản
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
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
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="0901234567"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="password">
                          Mật khẩu <span className="text-red-500">*</span>
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
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">
                          Xác nhận mật khẩu <span className="text-red-500">*</span>
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
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Thông tin chủ sân
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label>
                        Loại hình <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.businessType}
                        onValueChange={(value) => handleChange({ name: "businessType", value })}
                        className="mt-2 flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual" className="cursor-pointer font-normal">
                            Cá nhân
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="company" id="company" />
                          <Label htmlFor="company" className="cursor-pointer font-normal">
                            Công ty
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="businessName">
                        Tên {formData.businessType === "company" ? "doanh nghiệp" : "cơ sở/sân"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="VD: Sân Thể Thao Huy Sport"
                        value={formData.businessName}
                        onChange={handleChange}
                        className={errors.businessName ? "border-red-500" : ""}
                      />
                      {errors.businessName && <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="taxId">
                        Mã số thuế {formData.businessType === "company" && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="taxId"
                        name="taxId"
                        placeholder="0312345678"
                        value={formData.taxId}
                        onChange={handleChange}
                        className={errors.taxId ? "border-red-500" : ""}
                      />
                      {errors.taxId && <p className="mt-1 text-xs text-red-500">{errors.taxId}</p>}
                    </div>

                    <div>
                      <Label htmlFor="businessAddress">
                        Địa chỉ <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessAddress"
                        name="businessAddress"
                        placeholder="Số nhà, đường, phường, quận, TP.HCM"
                        value={formData.businessAddress}
                        onChange={handleChange}
                        className={errors.businessAddress ? "border-red-500" : ""}
                      />
                      {errors.businessAddress && <p className="mt-1 text-xs text-red-500">{errors.businessAddress}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Mô tả ngắn</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Giới thiệu ngắn về cơ sở của bạn..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <FileText className="h-5 w-5 text-green-600" />
                    Tài liệu xác thực
                  </h2>

                  <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                      Cần đủ 3 tài liệu: giấy phép/chứng minh quyền vận hành sân, CCCD mặt trước và CCCD mặt sau.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    {renderUploadBox({
                      field: "licenseFile",
                      title: "Giấy phép hoặc giấy tờ chứng minh quyền vận hành sân",
                      description:
                        "Có thể là giấy phép kinh doanh, hợp đồng thuê sân, giấy chứng nhận quyền sử dụng hoặc tài liệu tương đương.",
                    })}
                    {renderUploadBox({
                      field: "idFront",
                      title: "CCCD/CMND mặt trước",
                      description: "Ảnh mặt trước giấy tờ tùy thân của người đại diện.",
                    })}
                    {renderUploadBox({
                      field: "idBack",
                      title: "CCCD/CMND mặt sau",
                      description: "Ảnh mặt sau giấy tờ tùy thân của người đại diện.",
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Xác nhận thông tin
                  </h2>

                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">Thông tin tài khoản</h3>
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
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">Thông tin chủ sân</h3>
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
                        {formData.taxId && (
                          <p>
                            <strong>MST:</strong> {formData.taxId}
                          </p>
                        )}
                        <p>
                          <strong>Địa chỉ:</strong> {formData.businessAddress}
                        </p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-medium">Tài liệu</h3>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                          Chỉnh sửa
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>Giấy phép/chứng minh quyền vận hành: {formData.licenseFile?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>CCCD mặt trước: {formData.idFront?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span>CCCD mặt sau: {formData.idBack?.name}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))
                          clearError("agreeTerms")
                        }}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">
                        Tôi cam kết thông tin và tài liệu cung cấp là chính xác và đồng ý với{" "}
                        <Link href="/terms" className="text-green-600 hover:text-green-700 dark:text-green-400">
                          Điều khoản dịch vụ
                        </Link>{" "}
                        và{" "}
                        <Link href="/privacy" className="text-green-600 hover:text-green-700 dark:text-green-400">
                          Chính sách bảo mật
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-6">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Quay lại
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext} className="ml-auto">
                  Tiếp tục
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="ml-auto bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi Đơn Đăng Ký"
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-700 dark:text-green-400">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}