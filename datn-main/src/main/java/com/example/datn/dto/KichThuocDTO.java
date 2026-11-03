package com.example.datn.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KichThuocDTO {
    Long id;
    String maKichThuoc;
    String tenKichThuoc;
    Boolean trangThai;
}
