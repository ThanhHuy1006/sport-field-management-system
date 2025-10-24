import api from "./api";
import { Field, Booking, Voucher } from "./types";

// Get all fields
export async function getFields(): Promise<Field[]> {
  const res = await api.get("/fields");
  return res.data;
}

// Get field by id
export async function getFieldById(id: number): Promise<Field> {
  const res = await api.get(`/fields/${id}`);
  return res.data;
}

// Get bookings of current user
export async function getUserBookings(): Promise<Booking[]> {
  const res = await api.get("/bookings/my");
  return res.data;
}

// Get all vouchers
export async function getVouchers(): Promise<Voucher[]> {
  const res = await api.get("/vouchers");
  return res.data;
}
