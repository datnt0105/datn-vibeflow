package com.example.datn.dto.nhanvien;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body cho POST / PUT /api/admin/nhan-vien. Mã NV do hệ thống sinh, mật khẩu mặc định "1" (ADR-003).
 */
public record NhanVienRequest(
        @NotBlank(message = "Vui lòng nhập họ tên!")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự!")
        String hoTen,

        @NotBlank(message = "Vui lòng nhập số điện thoại!")
        @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!")
        String sdt,

        @NotBlank(message = "Vui lòng nhập email!")
        @Email(message = "Email không đúng định dạng!")
        @Size(max = 100, message = "Email tối đa 100 ký tự!")
        String email,

        @NotNull(message = "Vui lòng chọn vai trò!")
        Long vaiTroId,

        Boolean trangThai
) {
}
