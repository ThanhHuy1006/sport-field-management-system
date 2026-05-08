# Danh sách API routes

Tổng số endpoint: **100**

## Tổng hợp theo module

| STT | Module | Số API |
|---:|---|---:|
| 1 | Admin | 1 |
| 2 | Admin Field Reports | 3 |
| 3 | Admin Reports | 1 |
| 4 | Admin Review Reports | 3 |
| 5 | Auth | 4 |
| 6 | Field Reports | 1 |
| 7 | Health | 3 |
| 8 | Member Bookings | 9 |
| 9 | Notifications | 6 |
| 10 | Other | 1 |
| 11 | Owner Bookings | 7 |
| 12 | Owner Reviews | 3 |
| 13 | Owner Vouchers | 5 |
| 14 | Owners | 14 |
| 15 | Payments | 5 |
| 16 | Public Fields | 20 |
| 17 | Review Reports | 1 |
| 18 | Reviews | 3 |
| 19 | Uploads | 3 |
| 20 | Users | 5 |
| 21 | Vouchers | 2 |

## Danh sách API chi tiết

| STT | Module | Method | Endpoint |
|---:|---|---|---|
| 1 | Admin | GET | `/api/v1/admin/dashboard/summary` |
| 2 | Admin Field Reports | GET | `/api/v1/admin/field-reports` |
| 3 | Admin Field Reports | GET | `/api/v1/admin/field-reports/:reportId` |
| 4 | Admin Field Reports | PATCH | `/api/v1/admin/field-reports/:reportId/status` |
| 5 | Admin Reports | GET | `/api/v1/admin/reports` |
| 6 | Admin Review Reports | GET | `/api/v1/admin/review-reports` |
| 7 | Admin Review Reports | GET | `/api/v1/admin/review-reports/:reportId` |
| 8 | Admin Review Reports | PATCH | `/api/v1/admin/review-reports/:reportId/status` |
| 9 | Auth | PATCH | `/api/v1/auth/change-password` |
| 10 | Auth | POST | `/api/v1/auth/login` |
| 11 | Auth | GET | `/api/v1/auth/me` |
| 12 | Auth | POST | `/api/v1/auth/register` |
| 13 | Field Reports | POST | `/api/v1/field-reports` |
| 14 | Health | GET | `/health` |
| 15 | Health | GET | `/health/live` |
| 16 | Health | GET | `/health/ready` |
| 17 | Member Bookings | GET | `/api/v1/admin/bookings` |
| 18 | Member Bookings | GET | `/api/v1/admin/bookings/:bookingId` |
| 19 | Member Bookings | POST | `/api/v1/bookings` |
| 20 | Member Bookings | GET | `/api/v1/bookings/availability-slots` |
| 21 | Member Bookings | POST | `/api/v1/bookings/check-availability` |
| 22 | Member Bookings | GET | `/api/v1/bookings/my` |
| 23 | Member Bookings | GET | `/api/v1/bookings/my/:bookingId` |
| 24 | Member Bookings | PATCH | `/api/v1/bookings/my/:bookingId/cancel` |
| 25 | Member Bookings | GET | `/api/v1/bookings/my/:bookingId/check-in-qr` |
| 26 | Notifications | DELETE | `/api/v1/notifications/:notificationId` |
| 27 | Notifications | PATCH | `/api/v1/notifications/:notificationId/read` |
| 28 | Notifications | POST | `/api/v1/notifications/admin/broadcast` |
| 29 | Notifications | GET | `/api/v1/notifications/me` |
| 30 | Notifications | PATCH | `/api/v1/notifications/read-all` |
| 31 | Notifications | GET | `/api/v1/notifications/unread-count` |
| 32 | Other | GET | `/api-docs.json` |
| 33 | Owner Bookings | GET | `/api/v1/owner/bookings` |
| 34 | Owner Bookings | GET | `/api/v1/owner/bookings/:bookingId` |
| 35 | Owner Bookings | PATCH | `/api/v1/owner/bookings/:bookingId/approve` |
| 36 | Owner Bookings | PATCH | `/api/v1/owner/bookings/:bookingId/check-in` |
| 37 | Owner Bookings | PATCH | `/api/v1/owner/bookings/:bookingId/complete` |
| 38 | Owner Bookings | PATCH | `/api/v1/owner/bookings/:bookingId/reject` |
| 39 | Owner Bookings | POST | `/api/v1/owner/bookings/check-in/scan` |
| 40 | Owner Reviews | GET | `/api/v1/owner/reviews` |
| 41 | Owner Reviews | PATCH | `/api/v1/owner/reviews/:reviewId/reply` |
| 42 | Owner Reviews | POST | `/api/v1/owner/reviews/:reviewId/reply` |
| 43 | Owner Vouchers | GET | `/api/v1/owner/vouchers` |
| 44 | Owner Vouchers | POST | `/api/v1/owner/vouchers` |
| 45 | Owner Vouchers | GET | `/api/v1/owner/vouchers/:voucherId` |
| 46 | Owner Vouchers | PATCH | `/api/v1/owner/vouchers/:voucherId` |
| 47 | Owner Vouchers | PATCH | `/api/v1/owner/vouchers/:voucherId/status` |
| 48 | Owners | GET | `/api/v1/admin/owner-registrations` |
| 49 | Owners | GET | `/api/v1/admin/owner-registrations/:userId` |
| 50 | Owners | PATCH | `/api/v1/admin/owner-registrations/:userId/approve` |
| 51 | Owners | PATCH | `/api/v1/admin/owner-registrations/:userId/reject` |
| 52 | Owners | DELETE | `/api/v1/owner/blackout-dates/:blackoutDateId` |
| 53 | Owners | GET | `/api/v1/owner/dashboard/recent-bookings` |
| 54 | Owners | GET | `/api/v1/owner/dashboard/recent-notifications` |
| 55 | Owners | GET | `/api/v1/owner/dashboard/summary` |
| 56 | Owners | GET | `/api/v1/owner/profile/me` |
| 57 | Owners | PATCH | `/api/v1/owner/profile/me` |
| 58 | Owners | POST | `/api/v1/owner/registration` |
| 59 | Owners | GET | `/api/v1/owner/registration/me` |
| 60 | Owners | PATCH | `/api/v1/owner/registration/me` |
| 61 | Owners | GET | `/api/v1/owner/reports` |
| 62 | Payments | GET | `/api/v1/payments/:paymentId` |
| 63 | Payments | POST | `/api/v1/payments/:paymentId/simulate-failed` |
| 64 | Payments | POST | `/api/v1/payments/:paymentId/simulate-success` |
| 65 | Payments | GET | `/api/v1/payments/by-booking/:bookingId` |
| 66 | Payments | POST | `/api/v1/payments/create` |
| 67 | Public Fields | GET | `/api/v1/admin/fields` |
| 68 | Public Fields | PATCH | `/api/v1/admin/fields/:fieldId/approve` |
| 69 | Public Fields | PATCH | `/api/v1/admin/fields/:fieldId/reject` |
| 70 | Public Fields | GET | `/api/v1/fields` |
| 71 | Public Fields | GET | `/api/v1/fields/:fieldId` |
| 72 | Public Fields | GET | `/api/v1/fields/:fieldId/availability` |
| 73 | Public Fields | GET | `/api/v1/fields/:fieldId/images` |
| 74 | Public Fields | GET | `/api/v1/fields/:fieldId/owner-info` |
| 75 | Public Fields | GET | `/api/v1/fields/:fieldId/reviews` |
| 76 | Public Fields | GET | `/api/v1/owner/fields` |
| 77 | Public Fields | POST | `/api/v1/owner/fields` |
| 78 | Public Fields | GET | `/api/v1/owner/fields/:fieldId` |
| 79 | Public Fields | PATCH | `/api/v1/owner/fields/:fieldId` |
| 80 | Public Fields | POST | `/api/v1/owner/fields/:fieldId/blackout-dates` |
| 81 | Public Fields | POST | `/api/v1/owner/fields/:fieldId/images` |
| 82 | Public Fields | DELETE | `/api/v1/owner/fields/:fieldId/images/:imageId` |
| 83 | Public Fields | PATCH | `/api/v1/owner/fields/:fieldId/images/:imageId/primary` |
| 84 | Public Fields | GET | `/api/v1/owner/fields/:fieldId/operating-hours` |
| 85 | Public Fields | PUT | `/api/v1/owner/fields/:fieldId/operating-hours` |
| 86 | Public Fields | PATCH | `/api/v1/owner/fields/:fieldId/status` |
| 87 | Review Reports | POST | `/api/v1/review-reports` |
| 88 | Reviews | POST | `/api/v1/reviews` |
| 89 | Reviews | DELETE | `/api/v1/reviews/:reviewId` |
| 90 | Reviews | PATCH | `/api/v1/reviews/:reviewId` |
| 91 | Uploads | POST | `/api/v1/uploads/avatar` |
| 92 | Uploads | POST | `/api/v1/uploads/documents` |
| 93 | Uploads | POST | `/api/v1/uploads/fields/images` |
| 94 | Users | GET | `/api/v1/admin/users` |
| 95 | Users | GET | `/api/v1/admin/users/:userId` |
| 96 | Users | PATCH | `/api/v1/admin/users/:userId/status` |
| 97 | Users | GET | `/api/v1/users/me` |
| 98 | Users | PATCH | `/api/v1/users/me` |
| 99 | Vouchers | GET | `/api/v1/vouchers/available` |
| 100 | Vouchers | POST | `/api/v1/vouchers/validate` |