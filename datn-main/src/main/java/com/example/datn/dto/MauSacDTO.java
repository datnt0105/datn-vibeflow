package com.example.datn.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MauSacDTO {
    Long id;
    String maMau;
    String tenMau;
    String maHex;
    Boolean trangThai;
}

