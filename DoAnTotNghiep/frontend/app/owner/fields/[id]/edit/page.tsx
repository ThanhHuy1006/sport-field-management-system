"use client"
import EditFieldForm from "./edit-field-form"

// Mock data - in real app, fetch from API
const mockFieldData = {
  1: {
    name: "Sân Bóng Đá Green Valley",
    type: "soccer",
    location: "Quận 1, TP.HCM",
    address: "123 Đường Nguyễn Huệ",
    capacity: "22",
    price: "500000",
    description: "Sân bóng đá chất lượng cao với cỏ nhân tạo",
    status: "active",
    amenities: ["Bãi đỗ xe", "Phòng thay đồ", "Wifi miễn phí"],
    openTime: "06:00",
    closeTime: "22:00",
  },
  2: {
    name: "Sân Cầu Lông Sky Court",
    type: "badminton",
    location: "Quận 3, TP.HCM",
    address: "456 Đường Lê Văn Sỹ",
    capacity: "4",
    price: "200000",
    description: "Sân cầu lông trong nhà, điều hòa mát mẻ",
    status: "active",
    amenities: ["Điều hòa", "Phòng thay đồ", "Cho thuê vợt"],
    openTime: "07:00",
    closeTime: "23:00",
  },
  3: {
    name: "Sân Bóng Rổ Urban Court",
    type: "basketball",
    location: "Quận 7, TP.HCM",
    address: "789 Đường Nguyễn Văn Linh",
    capacity: "10",
    price: "300000",
    description: "Sân bóng rổ ngoài trời với sàn cao su",
    status: "active",
    amenities: ["Bãi đỗ xe", "Nước uống miễn phí", "Ánh sáng đêm"],
    openTime: "06:00",
    closeTime: "22:00",
  },
}

export default async function EditFieldPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Load existing field data
  const existingData = mockFieldData[id as keyof typeof mockFieldData] || mockFieldData[1]

  return <EditFieldForm fieldId={id} existingData={existingData} />
}
