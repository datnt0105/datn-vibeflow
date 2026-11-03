package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "NHAN_VIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NhanVienEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_nhan_vien", length = 20, nullable = false)
    String maNhanVien;

    @Column(name = "ho_ten", length = 100, nullable = false)
    String hoTen;

    @Column(name = "sdt", length = 15)
    String sdt;

    @Column(name = "email", length = 100)
    String email;

    @Column(name = "mat_khau", length = 255, nullable = false)
    String matKhau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vai_tro_id")
    VaiTroEntity vaiTro;

    @Column(name = "trang_thai")
    Boolean trangThai;
}