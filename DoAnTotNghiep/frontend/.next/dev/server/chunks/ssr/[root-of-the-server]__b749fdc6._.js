module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/loading.tsx [app-rsc] (ecmascript)"));
}),
"[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/register/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const handleRegister = async (e)=>{
    e.preventDefault();
    try {
        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        /* =====================================================
       ĐĂNG KÝ CUSTOMER
    ===================================================== */ if (formData.userType === "customer") {
            await registerCustomer({
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            alert("Đăng ký thành công!");
            window.location.href = "/login";
            return;
        }
        /* =====================================================
       ĐĂNG KÝ OWNER – STEP 1
    ===================================================== */ const step1 = await registerOwnerStep1({
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
        });
        const userId = step1.userId || step1.data?.userId;
        /* =====================================================
       STEP 2
    ===================================================== */ await registerOwnerStep2({
            userId,
            business_name: formData.businessName,
            tax_code: formData.taxCode,
            address: formData.businessAddress
        });
        /* =====================================================
       STEP 3 (UPLOAD FILES)
    ===================================================== */ await registerOwnerStep3(userId, {
            businessLicense: formData.businessLicense,
            idCardFront: formData.idCardFront,
            idCardBack: formData.idCardBack
        });
        /* =====================================================
       AUTO LOGIN
    ===================================================== */ const loginRes = await login(formData.email, formData.password);
        localStorage.setItem("token", loginRes.token);
        window.location.href = "/owner/pending";
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Đăng ký thất bại, thử lại!");
    }
};
}),
"[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/register/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/OneDrive/Desktop/DOAN/DoAnTotNghiep/frontend/app/register/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b749fdc6._.js.map