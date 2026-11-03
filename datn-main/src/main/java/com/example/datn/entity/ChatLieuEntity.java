
package com.example.datn.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "CHAT_LIEU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatLieuEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "ma_chat_lieu", length = 20, nullable = false)
    String maChatLieu;

    @Column(name = "ten_chat_lieu", length = 100, nullable = false)
    String tenChatLieu;

    @Column(name = "mo_ta", length = 255)
    String moTa;

    @Column(name = "trang_thai")
    Boolean trangThai;
}
