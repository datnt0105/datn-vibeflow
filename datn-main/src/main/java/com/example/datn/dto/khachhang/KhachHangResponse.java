package com.example.datn.dto.khachhang;

import com.example.datn.entity.KhachHangEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Thông tin khách hàng trả về FE — không bao giờ trả mật khẩu.
 */
public record KhachHangResponse(
        Long id,
        String maKhachHang,
        String hoTen,
        String sdt,
        String email,
        LocalDate ngaySinh,
        Boolean gioiTinh,
        Boolean trangThai,
        LocalDateTime ngayTao
) {
    public static KhachHangResponse from(KhachHangEntity kh) {
        return new KhachHangResponse(kh.getId(), kh.getMaKhachHang(), kh.getHoTen(), kh.getSdt(), kh.getEmail(),
                kh.getNgaySinh(), kh.getGioiTinh(), kh.getTrangThai(), kh.getNgayTao());
    }
}
