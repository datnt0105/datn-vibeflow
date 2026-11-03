package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SAN_PHAM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_san_pham", length = 20, nullable = false)
    String maSanPham;

    @Column(name = "ten_san_pham", length = 150, nullable = false)
    String tenSanPham;

    @Column(name = "danh_muc_id")
    Integer danhMucId;

    @Column(name = "thuong_hieu_id")
    Integer thuongHieuId;

    @Column(name = "xuat_xu_id")
    Integer xuatXuId;

    @Column(name = "chat_lieu_id")
    Integer chatLieuId;

    @Column(name = "mo_ta", length = 500)
    String moTa;

    @Column(name = "gia_ban", precision = 12, scale = 2)
    BigDecimal giaBan;
    @Column(name = "gia_goc", precision = 12, scale = 2)
    BigDecimal giaGoc;

    @Column(name = "trang_thai")
    Boolean trangThai;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    LocalDateTime ngayTao;
}