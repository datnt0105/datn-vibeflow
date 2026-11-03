package com.example.datn.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamChiTietDTO {
    Long id;
    String maChiTiet;
    Long sanPhamId;
    Long mauSacId;
    String tenMau;
    String maHex;
    Long kichThuocId;
    String tenKichThuoc;
    Integer soLuong;
    Boolean trangThai;

    BigDecimal giaBan;          // giá riêng của biến thể (có thể null)
    BigDecimal giaGoc;          // giá gốc riêng (có thể null)
    BigDecimal giaNhap;         // chỉ ADMIN mới có giá trị
    BigDecimal giaBanHieuLuc;   // đã áp quy tắc ưu tiên
    BigDecimal giaGocHieuLuc;
}