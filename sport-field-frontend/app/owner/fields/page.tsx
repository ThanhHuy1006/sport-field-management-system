// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card } from "@/components/ui/card"
// import { Plus, Edit, Trash2, ArrowLeft, MapPin, Users } from "lucide-react"
// import { getMyFields, deleteField, type OwnerField } from "@/lib/fetchers"

// export default function OwnerFieldsPage() {
//   const [fields, setFields] = useState<OwnerField[]>([])
//   const [loading, setLoading] = useState(true)

//   // ✅ Gọi API lấy danh sách sân của chủ sở hữu
//   useEffect(() => {
//     getMyFields()
//       .then(setFields)
//       .catch((err) => console.error("Fetch error:", err))
//       .finally(() => setLoading(false))
//   }, [])

//   // ✅ Xử lý xóa sân
//   const handleDelete = async (id: number) => {
//     if (!confirm("Bạn có chắc muốn xóa sân này?")) return
//     try {
//       await deleteField(id)
//       setFields((prev) => prev.filter((f) => f.id !== id))
//       alert("✅ Đã xóa sân thành công!")
//     } catch (err) {
//       console.error("Delete error:", err)
//       alert("❌ Xóa sân thất bại.")
//     }
//   }

//   return (
//     <main className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-background border-b border-border">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
//             <ArrowLeft className="w-5 h-5" />
//             Quay lại
//           </Link>
//           <h1 className="text-xl font-bold">Quản Lý Sân</h1>
//           <Link href="/owner/fields/new">
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Thêm Sân
//             </Button>
//           </Link>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {loading ? (
//           <p className="text-muted-foreground text-center">Đang tải danh sách sân...</p>
//         ) : fields.length === 0 ? (
//           <Card className="p-12 text-center">
//             <p className="text-muted-foreground text-lg mb-4">Chưa có sân nào</p>
//             <Link href="/owner/fields/add">
//               <Button>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Thêm Sân Đầu Tiên
//               </Button>
//             </Link>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {fields.map((field) => (
//               <Card key={field.id} className="overflow-hidden">
//                 <div className="flex flex-col md:flex-row">
//                   {/* Nếu có ảnh sân thì hiển thị */}
//                   <img
//                     src={field.image || "/placeholder.svg"}
//                     alt={field.field_name}
//                     className="w-full md:w-48 h-48 object-cover"
//                   />

//                   <div className="flex-1 p-6 flex flex-col justify-between">
//                     <div>
//                       <div className="flex items-start justify-between mb-4">
//                         <div>
//                           <h3 className="text-xl font-bold text-foreground mb-1">{field.field_name}</h3>
//                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                             <MapPin className="w-4 h-4" />
//                             {field.address || "Chưa có địa chỉ"}
//                           </div>
//                         </div>
//                         <span
//                           className={`px-3 py-1 rounded-full text-sm font-medium ${
//                             field.status === "active"
//                               ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
//                               : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
//                           }`}
//                         >
//                           {field.status === "active" ? "Hoạt Động" : "Không Hoạt Động"}
//                         </span>
//                       </div>

//                       <div className="grid grid-cols-3 gap-4 mb-4">
//                         <div>
//                           <p className="text-xs text-muted-foreground">Loại</p>
//                           <p className="font-medium text-foreground">
//                             {field.sport_type || "Chưa cập nhật"}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-muted-foreground">Sức Chứa</p>
//                           <p className="font-medium text-foreground flex items-center gap-1">
//                             <Users className="w-4 h-4" />
//                             {field.max_players || 0} người
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-muted-foreground">Giá</p>
//                           <p className="font-medium text-foreground">
//                             {Number(field.base_price_per_hour).toLocaleString()} VND/giờ
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-2 pt-4 border-t border-border">
//                       <Link href={`/owner/fields/${field.id}/edit`}>
//                         <Button variant="outline" size="sm">
//                           <Edit className="w-4 h-4 mr-2" />
//                           Sửa
//                         </Button>
//                       </Link>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="text-destructive bg-transparent"
//                         onClick={() => handleDelete(field.id)}
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" />
//                         Xóa
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </main>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowLeft, MapPin, Users } from "lucide-react"
import { getMyFields, deleteField, type OwnerField } from "@/lib/fetchers"

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState<OwnerField[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Gọi API lấy danh sách sân của chủ sở hữu
  useEffect(() => {
    getMyFields()
      .then(setFields)
      .catch((err) => console.error("❌ Fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  // ✅ Xử lý xóa sân
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sân này?")) return
    try {
      await deleteField(id)
      setFields((prev) => prev.filter((f) => f.id !== id))
      alert("✅ Đã xóa sân thành công!")
    } catch (err) {
      console.error("❌ Delete error:", err)
      alert("❌ Xóa sân thất bại.")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
          <Link href="/owner/fields/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Sân
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-muted-foreground text-center">Đang tải danh sách sân...</p>
        ) : fields.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Chưa có sân nào</p>
            <Link href="/owner/fields/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân Đầu Tiên
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <Card key={field.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Ảnh sân */}
                  <img
                    src={field.image || "/placeholder.svg"}
                    alt={field.field_name}
                    className="w-full md:w-48 h-48 object-cover"
                  />

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{field.field_name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {field.address || "Chưa có địa chỉ"}
                          </div>
                        </div>
                        {/* Trạng thái sân */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            field.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : field.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {field.status === "active"
                            ? "Hoạt Động"
                            : field.status === "pending"
                            ? "Chờ Duyệt"
                            : "Ẩn / Bị Từ Chối"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Loại</p>
                          <p className="font-medium text-foreground">
                            {field.sport_type || "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sức Chứa</p>
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {field.max_players || 0} người
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Giá</p>
                          <p className="font-medium text-foreground">
                            {Number(field.base_price_per_hour).toLocaleString()} VND/giờ
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Link href={`/owner/fields/${field.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent"
                        onClick={() => handleDelete(field.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
