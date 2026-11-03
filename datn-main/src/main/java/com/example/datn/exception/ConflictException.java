package com.example.datn.exception;

/**
 * Lỗi xung đột dữ liệu (trùng email/SĐT, vi phạm ràng buộc nghiệp vụ) → HTTP 409
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
