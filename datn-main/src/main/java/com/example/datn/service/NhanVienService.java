package com.example.datn.service;

import com.example.datn.dto.common.PageResponse;
import com.example.datn.dto.nhanvien.NhanVienRequest;
import com.example.datn.dto.nhanvien.NhanVienResponse;
import com.example.datn.dto.nhanvien.NhanVienThongKe;
import com.example.datn.dto.nhanvien.VaiTroResponse;
import com.example.datn.entity.NhanVienEntity;
import com.example.datn.entity.VaiTroEntity;
import com.example.datn.exception.BadRequestException;
import com.example.datn.exception.ConflictException;
import com.example.datn.exception.NotFoundException;
import com.example.datn.repository.NhanVienRepository;
import com.example.datn.repository.VaiTroRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Nghiệp vụ Quản lý nhân viên (ADR-003). Mọi thao tác chỉ dành cho ADMIN (chặn ở controller).
 * currentEmail = email của quản trị viên đang đăng nhập — dùng cho các guard "tự thao tác trên chính mình".
 */
@Service
public class NhanVienService {

    static final String MAT_KHAU_MAC_DINH = "1";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_KHACH_HANG = "KHACH_HANG";

    @Autowired
    private NhanVienRepository nhanVienRepository;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<NhanVienResponse> search(String q, Long vaiTroId, Boolean trangThai, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.ASC, "id"));
        return PageResponse.of(nhanVienRepository.findAll(filter(q, vaiTroId, trangThai), pageable),
                NhanVienResponse::from);
    }

    @Transactional(readOnly = true)
    public NhanVienResponse getById(Long id) {
        return NhanVienResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public NhanVienThongKe thongKe() {
        long tong = nhanVienRepository.count();
        long daKhoa = nhanVienRepository.countByTrangThai(false);
        return new NhanVienThongKe(tong, tong - daKhoa, daKhoa, nhanVienRepository.countByVaiTro_MaVaiTro(ROLE_ADMIN));
    }

    @Transactional(readOnly = true)
    public List<VaiTroResponse> vaiTroNhanVien() {
        return vaiTroRepository.findByMaVaiTroNotOrderByIdAsc(ROLE_KHACH_HANG).stream()
                .map(VaiTroResponse::from).toList();
    }

    @Transactional
    public NhanVienResponse create(NhanVienRequest req) {
        String email = req.email().trim().toLowerCase();
        if (nhanVienRepository.existsByEmail(email)) {
            throw new ConflictException("Email đã được sử dụng!");
        }
        if (nhanVienRepository.existsBySdt(req.sdt())) {
            throw new ConflictException("Số điện thoại đã được sử dụng!");
        }

        NhanVienEntity nv = NhanVienEntity.builder()
                .maNhanVien(MaGenerator.next("NV", nhanVienRepository.count(), nhanVienRepository::existsByMaNhanVien))
                .hoTen(req.hoTen().trim())
                .sdt(req.sdt())
                .email(email)
                .vaiTro(findVaiTro(req.vaiTroId()))
                .trangThai(req.trangThai() == null || req.trangThai())
                .matKhau(passwordEncoder.encode(MAT_KHAU_MAC_DINH))
                .build();
        return NhanVienResponse.from(nhanVienRepository.save(nv));
    }

    @Transactional
    public NhanVienResponse update(Long id, NhanVienRequest req, String currentEmail) {
        NhanVienEntity nv = findOrThrow(id);
        String email = req.email().trim().toLowerCase();
        if (nhanVienRepository.existsByEmailAndIdNot(email, id)) {
            throw new ConflictException("Email đã được sử dụng!");
        }
        if (nhanVienRepository.existsBySdtAndIdNot(req.sdt(), id)) {
            throw new ConflictException("Số điện thoại đã được sử dụng!");
        }

        VaiTroEntity vaiTroMoi = findVaiTro(req.vaiTroId());
        boolean trangThaiMoi = req.trangThai() == null ? Boolean.TRUE.equals(nv.getTrangThai()) : req.trangThai();
        boolean doiVaiTro = nv.getVaiTro() == null || !Objects.equals(nv.getVaiTro().getId(), vaiTroMoi.getId());
        boolean doiTrangThai = trangThaiMoi != Boolean.TRUE.equals(nv.getTrangThai());

        if (isSelf(nv, currentEmail) && (doiVaiTro || doiTrangThai)) {
            throw new ConflictException("Không thể khóa hoặc đổi vai trò của tài khoản đang đăng nhập!");
        }
        boolean conLaAdminHoatDong = ROLE_ADMIN.equalsIgnoreCase(vaiTroMoi.getMaVaiTro()) && trangThaiMoi;
        if (!conLaAdminHoatDong) {
            guardLastAdmin(nv);
        }

        nv.setHoTen(req.hoTen().trim());
        nv.setSdt(req.sdt());
        nv.setEmail(email);
        nv.setVaiTro(vaiTroMoi);
        nv.setTrangThai(trangThaiMoi);
        return NhanVienResponse.from(nv);
    }

    @Transactional
    public NhanVienResponse updateTrangThai(Long id, boolean trangThai, String currentEmail) {
        NhanVienEntity nv = findOrThrow(id);
        if (!trangThai) {
            if (isSelf(nv, currentEmail)) {
                throw new ConflictException("Không thể khóa tài khoản đang đăng nhập!");
            }
            guardLastAdmin(nv);
        }
        nv.setTrangThai(trangThai);
        return NhanVienResponse.from(nv);
    }

    @Transactional
    public void resetMatKhau(Long id, String currentEmail) {
        NhanVienEntity nv = findOrThrow(id);
        if (isSelf(nv, currentEmail)) {
            throw new ConflictException("Hãy đổi mật khẩu của chính bạn tại trang hồ sơ cá nhân!");
        }
        nv.setMatKhau(passwordEncoder.encode(MAT_KHAU_MAC_DINH));
    }

    /** Chặn khóa / hạ quyền quản trị viên đang hoạt động cuối cùng. */
    private void guardLastAdmin(NhanVienEntity nv) {
        boolean dangLaAdminHoatDong = nv.getVaiTro() != null
                && ROLE_ADMIN.equalsIgnoreCase(nv.getVaiTro().getMaVaiTro())
                && Boolean.TRUE.equals(nv.getTrangThai());
        if (dangLaAdminHoatDong && nhanVienRepository.countByVaiTro_MaVaiTroAndTrangThai(ROLE_ADMIN, true) <= 1) {
            throw new ConflictException("Không thể khóa quản trị viên cuối cùng!");
        }
    }

    private static boolean isSelf(NhanVienEntity nv, String currentEmail) {
        return currentEmail != null && currentEmail.equalsIgnoreCase(nv.getEmail());
    }

    private VaiTroEntity findVaiTro(Long vaiTroId) {
        VaiTroEntity vt = vaiTroRepository.findById(vaiTroId)
                .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ!"));
        if (ROLE_KHACH_HANG.equalsIgnoreCase(vt.getMaVaiTro())) {
            throw new BadRequestException("Vai trò không hợp lệ!");
        }
        return vt;
    }

    private NhanVienEntity findOrThrow(Long id) {
        return nhanVienRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân viên!"));
    }

    private static Specification<NhanVienEntity> filter(String q, Long vaiTroId, Boolean trangThai) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                ps.add(cb.or(
                        cb.like(cb.lower(root.get("maNhanVien")), like),
                        cb.like(cb.lower(root.get("hoTen")), like),
                        cb.like(root.get("sdt"), like),
                        cb.like(cb.lower(root.get("email")), like)
                ));
            }
            if (vaiTroId != null) {
                ps.add(cb.equal(root.get("vaiTro").get("id"), vaiTroId));
            }
            if (trangThai != null) {
                ps.add(cb.equal(root.get("trangThai"), trangThai));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
