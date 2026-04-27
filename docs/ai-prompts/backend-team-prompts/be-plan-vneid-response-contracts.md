## VNeID Response Contract Catalog

### Muc tieu
Dinh nghia day du schema response cho VNeID sandbox va cac BE endpoints Phase 1 dung contract do.

### Nguyen tac chung
- Moi response phai co envelope thong nhat.
- Moi error phai co ma code xac dinh, khong dung message text de render logic.
- Payload phai deterministic de test co the snapshot.
- Cac field nullable phai ghi ro trong schema.

---

## 1. Common envelope

### 1.1 Success envelope
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "timestamp": "ISO-8601",
  "request_id": "string",
  "trace_id": "string"
}
```

### 1.2 Error envelope
```json
{
  "success": false,
  "message": "string",
  "error": {
    "code": "STRING_CODE",
    "details": {}
  },
  "timestamp": "ISO-8601",
  "request_id": "string",
  "trace_id": "string",
  "retry_after": 0
}
```

---

## 2. VNeID sandbox schemas

### 2.1 Verify identity success
```json
{
  "success": true,
  "message": "Identity verified",
  "data": {
    "cccd_number": "001234567890",
    "full_name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "date_of_birth": "1990-05-15",
    "issued_date": "2015-06-10",
    "expiry_date": "2030-06-10",
    "status": "VALID",
    "is_duplicate": false,
    "registered_with_user_id": null,
    "linked_wallet_address": null,
    "verified_at": "2026-04-20T10:30:00Z"
  },
  "timestamp": "2026-04-20T10:30:00Z",
  "request_id": "req_...",
  "trace_id": "trace_..."
}
```

### 2.2 Check duplicate success
```json
{
  "success": true,
  "message": "Duplicate check completed",
  "data": {
    "cccd_number": "001234567890",
    "is_duplicate": true,
    "registered_with_user_id": 42,
    "first_registered_at": "2026-04-19T14:20:00Z",
    "linked_wallet_address": "0xAbc123..."
  },
  "timestamp": "2026-04-20T10:31:00Z",
  "request_id": "req_...",
  "trace_id": "trace_..."
}
```

### 2.3 Profile lookup success
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "cccd_number": "001234567890",
    "full_name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "date_of_birth": "1990-05-15",
    "issued_date": "2015-06-10",
    "expiry_date": "2030-06-10",
    "status": "VALID"
  }
}
```

### 2.4 Register CCCD success
```json
{
  "success": true,
  "message": "CCCD registered",
  "data": {
    "cccd_number": "001234567890",
    "registered": true,
    "registered_with_user_id": 42,
    "registered_at": "2026-04-20T10:32:00Z"
  }
}
```

### 2.5 Health check success
```json
{
  "success": true,
  "message": "VNeID sandbox ok",
  "data": {
    "status": "ok",
    "service": "mock-vneid",
    "uptime_seconds": 12345,
    "version": "v1"
  }
}
```

---

## 3. VNeID sandbox errors

### 3.1 Invalid CCCD format
```json
{
  "success": false,
  "message": "CCCD number must be 12 digits",
  "error": {
    "code": "INVALID_CCCD_FORMAT",
    "details": {
      "field": "cccd_number",
      "provided": "ABC123",
      "expected_format": "^\\d{12}$"
    }
  },
  "timestamp": "2026-04-20T10:33:00Z",
  "request_id": "req_...",
  "trace_id": "trace_..."
}
```

### 3.2 CCCD not found
```json
{
  "success": false,
  "message": "CCCD does not exist in national registry",
  "error": {
    "code": "CCCD_NOT_FOUND",
    "details": {
      "cccd_number": "001234567890",
      "searched_at": "2026-04-20T10:34:00Z"
    }
  }
}
```

### 3.3 CCCD already registered
```json
{
  "success": false,
  "message": "This CCCD is already linked to another user account",
  "error": {
    "code": "CCCD_ALREADY_REGISTERED",
    "details": {
      "cccd_number": "001234567890",
      "existing_user_id": 42,
      "first_registered": "2026-04-19T14:20:00Z",
      "linked_wallet_address": "0xAbc123..."
    }
  }
}
```

### 3.4 Invalid status
```json
{
  "success": false,
  "message": "CCCD is no longer valid",
  "error": {
    "code": "CCCD_INVALID_STATUS",
    "details": {
      "cccd_number": "001234567890",
      "status": "EXPIRED",
      "expiry_date": "2020-06-10",
      "reason": "Document expired"
    }
  }
}
```

### 3.5 Rate limit exceeded
```json
{
  "success": false,
  "message": "Too many verification attempts. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "cccd_number": "001234567890",
      "attempts_in_window": 6,
      "limit": 5,
      "window_seconds": 60,
      "retry_after_seconds": 35
    }
  },
  "retry_after": 35
}
```

### 3.6 Service unavailable
```json
{
  "success": false,
  "message": "VNeID service is temporarily unavailable",
  "error": {
    "code": "VNEID_SERVICE_UNAVAILABLE",
    "details": {
      "service": "mock-vneid",
      "uptime_status": "degraded"
    }
  }
}
```

### 3.7 Timeout
```json
{
  "success": false,
  "message": "VNeID request timed out",
  "error": {
    "code": "VNEID_TIMEOUT",
    "details": {
      "timeout_ms": 3000,
      "operation": "verify-identity"
    }
  }
}
```

---

## 4. BE auth contract schemas

### 4.1 Login success
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "profile": {
      "user_id": 123,
      "vneid_number": "001234567890",
      "full_name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "role": "ND",
      "wallet_linked": false,
      "wallet_address": null
    }
  }
}
```

### 4.2 Login failure from VNeID
```json
{
  "success": false,
  "message": "Identity verification failed",
  "error": {
    "code": "AUTH_VNEID_FAILED",
    "details": {
      "vneid_error_code": "CCCD_NOT_FOUND",
      "vneid_message": "CCCD does not exist in national registry"
    }
  }
}
```

### 4.3 Wallet duplicate error
```json
{
  "success": false,
  "message": "Cannot link: this CCCD already has an active wallet",
  "error": {
    "code": "WALLET_DUPLICATE_CCCD",
    "details": {
      "cccd_number": "001234567890",
      "existing_wallet": "0xAbc123...",
      "existing_user_id": 42
    }
  }
}
```

### 4.4 Profile success
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "user_id": 123,
    "vneid_number": "001234567890",
    "full_name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "role": "ND",
    "wallet_status": "ACTIVE",
    "wallet_address": "0xAbc123...",
    "last_login": "2026-04-20T10:40:00Z",
    "created_at": "2026-04-19T14:20:00Z"
  }
}
```

### 4.5 Logout success
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "user_id": 123,
    "token_invalidated_at": "2026-04-20T10:50:00Z"
  }
}
```

### 4.6 Recovery request success
```json
{
  "success": true,
  "message": "Recovery request created",
  "data": {
    "request_id": "rec_req_001",
    "user_id": 123,
    "old_wallet_address": "0xOldWallet...",
    "new_wallet_address": "0xNewWallet...",
    "status": "Pending",
    "created_at": "2026-04-20T10:55:00Z"
  }
}
```

---

## 5. Field constraints

### 5.1 Common fields
- `timestamp`: ISO-8601 string.
- `request_id`: string unique per request.
- `trace_id`: string unique per trace chain.
- `success`: boolean.
- `retry_after`: integer seconds, only on rate limit/error situations.

### 5.2 CCCD fields
- `cccd_number`: exactly 12 digits.
- Must be returned as string, not number.
- Must be deterministic in seed data.

### 5.3 Date fields
- All date-only fields use `YYYY-MM-DD`.
- All datetime fields use ISO-8601 UTC.

### 5.4 Status enums
- VNeID registry status: `VALID`, `EXPIRED`, `REVOKED`, `SUSPENDED`, `NOT_FOUND`.
- Wallet status: `ACTIVE`, `LOCKED`, `REPLACED`.
- Recovery request status: `Pending`, `Approved`, `Rejected`.

---

## 6. Mapping rules

### 6.1 VNeID error -> BE error
- `INVALID_CCCD_FORMAT` -> reject request at validation layer.
- `CCCD_NOT_FOUND` -> `AUTH_VNEID_FAILED`.
- `CCCD_ALREADY_REGISTERED` -> `WALLET_DUPLICATE_CCCD` or wallet/link conflict.
- `RATE_LIMIT_EXCEEDED` -> `AUTH_RATE_LIMITED` if BE wants a local domain code.
- `VNEID_SERVICE_UNAVAILABLE` -> `AUTH_UPSTREAM_UNAVAILABLE`.

### 6.2 Logging rules
- Log every failure in `System_Logs`.
- Persist request_id/trace_id for correlation.
- Do not log OTP value in plaintext.

---

## 7. Test coverage checklist

1. Validate schema snapshot for every success response.
2. Validate schema snapshot for every error response.
3. Verify contract mapping from VNeID error to BE domain error.
4. Verify login/profile/logout wallet flows consume the same envelope.
5. Verify no optional field is accidentally required in production code.

---

## 8. Definition of Done

File nay duoc xem la done khi:
- Sandbox response schema va BE auth response schema da ro rang.
- Team co the implement mock service khong can hoi them ve field names.
- Team test co the dung snapshot hoac contract assertions ngay.
- Moi schema co error code mapping va field constraints.

---

## 9. Recommended usage

- Doc cung voi [be-plan-vneid-sandbox.md](be-plan-vneid-sandbox.md).
- Dung lam reference cho Phase 1 auth, wallet link, recovery request, va test harness.
- Neu schema thay doi, cap nhat dong thoi file sandbox plan va Phase 1 plan.