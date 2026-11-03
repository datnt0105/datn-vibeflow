package com.example.datn.exception;

/**
 * Dữ liệu hợp lệ về định dạng nhưng sai nghiệp vụ (vd: vai trò không tồn tại) → HTTP 400
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
