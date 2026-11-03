
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "MAU_SAC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MauSacEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_mau", length = 20, nullable = false)
    String maMau;

    @Column(name = "ten_mau", length = 50, nullable = false)
    String tenMau;

    @Column(name = "ma_hex", length = 10)
    String maHex;

    @Column(name = "trang_thai")
    Boolean trangThai;
}
