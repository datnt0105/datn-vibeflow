
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "CHI_TIET_SAN_PHAM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamChiTietEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_chi_tiet", length = 30, nullable = false)
    String maChiTiet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id")
    SanPhamEntity sanPham;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mau_sac_id")
    MauSacEntity mauSac;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kich_thuoc_id")
    KichThuocEntity kichThuoc;

    @Column(name = "so_luong")
    Integer soLuong;

    @Column(name = "gia_ban", precision = 12, scale = 2)
    BigDecimal giaBan;

    @Column(name = "gia_goc", precision = 12, scale = 2)
    BigDecimal giaGoc;
    @Column(name = "gia_nhap", precision = 12, scale = 2)
    BigDecimal giaNhap;

    @Column(name = "trang_thai")
    Boolean trangThai;

}
