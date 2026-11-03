package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Chi tiết hóa đơn — bảng HOA_DON_CHI_TIET (đã có trong db.sql).
 * Mỗi dòng = 1 biến thể (CHI_TIET_SAN_PHAM) được bán với số lượng và đơn giá.
 */
@Entity
@Table(name = "HOA_DON_CHI_TIET")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HoaDonChiTietEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hoa_don_id")
    HoaDonEntity hoaDon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chi_tiet_san_pham_id")
    SanPhamChiTietEntity chiTietSanPham;

    @Column(name = "so_luong", nullable = false)
    Integer soLuong;

    @Column(name = "don_gia", precision = 12, scale = 2)
    BigDecimal donGia;

    @Column(name = "thanh_tien", precision = 12, scale = 2)
    BigDecimal thanhTien;
}
