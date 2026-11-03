package com.example.datn.dto.nhanvien;

import com.example.datn.entity.VaiTroEntity;

public record VaiTroResponse(Long id, String maVaiTro, String tenVaiTro) {

    public static VaiTroResponse from(VaiTroEntity vt) {
        return new VaiTroResponse(vt.getId(), vt.getMaVaiTro(), vt.getTenVaiTro());
    }
}
