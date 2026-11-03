package com.example.datn.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ThuongHieuDTO {
    Long id;
    String maThuongHieu;
    String tenThuongHieu;
    String moTa;
    Boolean trangThai;
}
