package com.example.datn.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HinhAnhDTO {
    Integer id;
    Long sanPhamId;
    String tenAnh;
    String urlAnh;
    Boolean anhChinh;
}