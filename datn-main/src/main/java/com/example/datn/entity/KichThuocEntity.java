
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "KICH_THUOC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KichThuocEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_kich_thuoc", length = 20, nullable = false)
    String maKichThuoc;

    @Column(name = "ten_kich_thuoc", length = 20, nullable = false)
    String tenKichThuoc;

    @Column(name = "trang_thai")
    Boolean trangThai;
}
