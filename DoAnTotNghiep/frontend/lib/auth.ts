import api from "./axios";

// ================================
// AUTH — LOGIN
// ================================
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// ================================
// AUTH — ME (check token)
// ================================
export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// ================================
// CUSTOMER REGISTER
// ================================
export const registerCustomer = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  return api.post("/auth/register/customer", data);
};

// ================================
// OWNER REGISTER — STEP 1
// ================================
export const registerOwnerStep1 = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  return api.post("/auth/register/owner/step1", data);
};

// ================================
// OWNER REGISTER — STEP 2
// ================================
export const registerOwnerStep2 = async (data: {
  userId: number;
  business_name: string;
  tax_code: string;
  address: string;
}) => {
  return api.post("/auth/register/owner/step2", data);
};

// ================================
// OWNER REGISTER — STEP 3 (UPLOAD FILES)
// ================================
export const registerOwnerStep3 = async (
  userId: number,
  files: {
    businessLicense: File;
    idCardFront: File;
    idCardBack: File;
  }
) => {
  const form = new FormData();

  form.append("userId", userId.toString());
  form.append("license", files.businessLicense);
  form.append("id_front", files.idCardFront);
  form.append("id_back", files.idCardBack);

  return api.post("/auth/register/owner/step3", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
