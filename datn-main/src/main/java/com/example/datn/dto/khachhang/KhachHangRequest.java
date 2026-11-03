package com.example.datn.dto.khachhang;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Body cho POST / PUT /api/admin/khach-hang. Mã KH do hệ thống sinh, không nhận từ client.
 */
public record KhachHangRequest(
        @NotBlank(message = "Vui lòng nhập họ tên!")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự!")
        String hoTen,

        @NotBlank(message = "Vui lòng nhập số điện thoại!")
        @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0!")
        String sdt,

        @Email(message = "Email không đúng định dạng!")
        @Size(max = 100, message = "Email tối đa 100 ký tự!")
        String email,

        @Past(message = "Ngày sinh phải trước ngày hiện tại!")
        LocalDate ngaySinh,

        Boolean gioiTinh,

        Boolean trangThai
) {
}
