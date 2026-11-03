package com.example.datn.security;

import com.example.datn.entity.KhachHangEntity;
import com.example.datn.entity.NhanVienEntity;
import com.example.datn.repository.KhachHangRepository;
import com.example.datn.repository.NhanVienRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.info("Đang tìm tài khoản với email: {}", email);

        // 1. Kiểm tra bảng Nhân Viên trước
        Optional<NhanVienEntity> nvOpt = nhanVienRepository.findByEmail(email);
        if (nvOpt.isPresent()) {
            NhanVienEntity nv = nvOpt.get();
            String role = (nv.getVaiTro() != null && nv.getVaiTro().getMaVaiTro() != null)
                    ? nv.getVaiTro().getMaVaiTro().toUpperCase()
                    : "NHANVIEN";
            boolean enabled = (nv.getTrangThai() == null || nv.getTrangThai());

            return User.builder()
                    .username(nv.getEmail())
                    .password(nv.getMatKhau())
                    .disabled(!enabled)
                    .roles(role) // ROLE_NHAN_VIEN, ROLE_ADMIN,...
                    .build();
        }

        // 2. Nếu không phải nhân viên, kiểm tra bảng Khách Hàng
        Optional<KhachHangEntity> khOpt = khachHangRepository.findByEmail(email);
        if (khOpt.isPresent()) {
            KhachHangEntity kh = khOpt.get();
            boolean enabled = (kh.getTrangThai() == null || kh.getTrangThai());

            return User.builder()
                    .username(kh.getEmail())
                    .password(kh.getMatKhau() != null ? kh.getMatKhau() : "")
                    .disabled(!enabled)
                    .roles("KHACH_HANG") // ROLE_KHACH_HANG
                    .build();
        }

        // 3. Không tìm thấy ở cả 2 bảng
        logger.warn("Không tìm thấy tài khoản với email: {}", email);
        throw new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + email);
    }
}
