package com.example.datn.service;

import com.example.datn.dto.common.PageResponse;
import com.example.datn.dto.khachhang.KhachHangRequest;
import com.example.datn.dto.khachhang.KhachHangResponse;
import com.example.datn.dto.khachhang.KhachHangThongKe;
import com.example.datn.entity.KhachHangEntity;
import com.example.datn.exception.ConflictException;
import com.example.datn.exception.NotFoundException;
import com.example.datn.repository.KhachHangRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class KhachHangService {

    // ADR-002: khách hàng do nhân viên tạo có mật khẩu mặc định "1"
    static final String MAT_KHAU_MAC_DINH = "1";

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<KhachHangResponse> search(String q, Boolean gioiTinh, Boolean trangThai, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "id"));
        return PageResponse.of(khachHangRepository.findAll(filter(q, gioiTinh, trangThai), pageable),
                KhachHangResponse::from);
    }

    @Transactional(readOnly = true)
    public KhachHangResponse getById(Long id) {
        return KhachHangResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public KhachHangThongKe thongKe() {
        long tong = khachHangRepository.count();
        long daKhoa = khachHangRepository.countByTrangThai(false);
        long moi = khachHangRepository.countByNgayTaoGreaterThanEqual(LocalDate.now().withDayOfMonth(1).atStartOfDay());
        return new KhachHangThongKe(tong, tong - daKhoa, daKhoa, moi);
    }

    @Transactional
    public KhachHangResponse create(KhachHangRequest req) {
        String email = normalize(req.email());
        if (email != null && khachHangRepository.existsByEmail(email)) {
            throw new ConflictException("Email đã được sử dụng!");
        }
        if (khachHangRepository.existsBySdt(req.sdt())) {
            throw new ConflictException("Số điện thoại đã được sử dụng!");
        }

        KhachHangEntity kh = KhachHangEntity.builder()
                .maKhachHang(nextMaKhachHang())
                .hoTen(req.hoTen().trim())
                .sdt(req.sdt())
                .email(email)
                .ngaySinh(req.ngaySinh())
                .gioiTinh(req.gioiTinh())
                .trangThai(req.trangThai() == null || req.trangThai())
                .matKhau(passwordEncoder.encode(MAT_KHAU_MAC_DINH))
                .build();
        return KhachHangResponse.from(khachHangRepository.save(kh));
    }

    @Transactional
    public KhachHangResponse update(Long id, KhachHangRequest req) {
        KhachHangEntity kh = findOrThrow(id);
        String email = normalize(req.email());
        if (email != null && khachHangRepository.existsByEmailAndIdNot(email, id)) {
            throw new ConflictException("Email đã được sử dụng!");
        }
        if (khachHangRepository.existsBySdtAndIdNot(req.sdt(), id)) {
            throw new ConflictException("Số điện thoại đã được sử dụng!");
        }

        kh.setHoTen(req.hoTen().trim());
        kh.setSdt(req.sdt());
        kh.setEmail(email);
        kh.setNgaySinh(req.ngaySinh());
        kh.setGioiTinh(req.gioiTinh());
        // Trạng thái chỉ đổi qua PATCH /trang-thai (chỉ ADMIN) — PUT bỏ qua trường này
        return KhachHangResponse.from(kh);
    }

    @Transactional
    public KhachHangResponse updateTrangThai(Long id, boolean trangThai) {
        KhachHangEntity kh = findOrThrow(id);
        kh.setTrangThai(trangThai);
        return KhachHangResponse.from(kh);
    }

    /** Dùng chung cho đăng ký khách hàng (AuthController) và tạo từ trang quản trị. */
    public String nextMaKhachHang() {
        return MaGenerator.next("KH", khachHangRepository.count(), khachHangRepository::existsByMaKhachHang);
    }

    private KhachHangEntity findOrThrow(Long id) {
        return khachHangRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng!"));
    }

    private static String normalize(String email) {
        return (email == null || email.isBlank()) ? null : email.trim().toLowerCase();
    }

    private static Specification<KhachHangEntity> filter(String q, Boolean gioiTinh, Boolean trangThai) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                ps.add(cb.or(
                        cb.like(cb.lower(root.get("maKhachHang")), like),
                        cb.like(cb.lower(root.get("hoTen")), like),
                        cb.like(root.get("sdt"), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }
            if (gioiTinh != null) {
                ps.add(cb.equal(root.get("gioiTinh"), gioiTinh));
            }
            if (trangThai != null) {
                ps.add(cb.equal(root.get("trangThai"), trangThai));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
