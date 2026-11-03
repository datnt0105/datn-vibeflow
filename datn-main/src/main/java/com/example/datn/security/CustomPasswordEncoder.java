package com.example.datn.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class CustomPasswordEncoder implements PasswordEncoder {

    private static final Logger logger = LoggerFactory.getLogger(CustomPasswordEncoder.class);
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Override
    public String encode(CharSequence rawPassword) {
        return bCryptPasswordEncoder.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null) return false;

        // Nếu mật khẩu trong DB đã mã hóa bằng BCrypt
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            return bCryptPasswordEncoder.matches(rawPassword, encodedPassword);
        }

        // Hỗ trợ kiểm tra cả mật khẩu dạng chuỗi thường (Plain-text) khi đang test/dev
        boolean plainMatch = rawPassword != null && rawPassword.toString().equals(encodedPassword);
        if (plainMatch) {
            logger.warn("Mật khẩu trong DB đang ở dạng thô (plain-text): {}", rawPassword);
        }
        return plainMatch;
    }
}
