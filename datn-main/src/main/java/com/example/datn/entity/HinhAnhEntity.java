package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "HINH_ANH")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HinhAnhEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id")
    SanPhamEntity sanPham;

    @Column(name = "ten_anh", length = 150)
    String tenAnh;

    @Column(name = "url_anh", length = 500)
    String urlAnh;

    @Column(name = "anh_chinh")
    @Builder.Default
    Boolean anhChinh = false;

    @Column(name = "trang_thai")
    @Builder.Default
    Boolean trangThai = true;
}