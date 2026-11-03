package com.example.datn.dto.common;

import jakarta.validation.constraints.NotNull;

/**
 * Body cho PATCH .../{id}/trang-thai — true = Hoạt động, false = Đã khóa.
 */
public record TrangThaiRequest(
        @NotNull(message = "Vui lòng chọn trạng thái!")
        Boolean trangThai
) {
}
