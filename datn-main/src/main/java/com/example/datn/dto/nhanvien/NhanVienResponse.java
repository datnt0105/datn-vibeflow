package com.example.datn.dto.nhanvien;

import com.example.datn.entity.NhanVienEntity;
import com.example.datn.entity.VaiTroEntity;

/**
 * Thông tin nhân viên trả về FE — không bao giờ trả mật khẩu.
 */
public record NhanVienResponse(
        Long id,
        String maNhanVien,
        String hoTen,
        String sdt,
        String email,
        Boolean trangThai,
        VaiTroResponse vaiTro
) {
    public static NhanVienResponse from(NhanVienEntity nv) {
        VaiTroEntity vt = nv.getVaiTro();
        return new NhanVienResponse(nv.getId(), nv.getMaNhanVien(), nv.getHoTen(), nv.getSdt(), nv.getEmail(),
                nv.getTrangThai(), vt == null ? null : VaiTroResponse.from(vt));
    }
}
