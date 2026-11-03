package com.example.datn.repository;

import com.example.datn.entity.NhanVienEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVienEntity, Long>, JpaSpecificationExecutor<NhanVienEntity> {

    // Tìm nhân viên theo mã nhân viên
    Optional<NhanVienEntity> findByMaNhanVien(String maNhanVien);

    // Tìm nhân viên theo email (dùng cho đăng nhập)
    Optional<NhanVienEntity> findByEmail(String email);

    // Kiểm tra tồn tại mã nhân viên
    boolean existsByMaNhanVien(String maNhanVien);

    // Kiểm tra tồn tại email
    boolean existsByEmail(String email);

    // Kiểm tra tồn tại số điện thoại
    boolean existsBySdt(String sdt);

    // Kiểm tra trùng email / SĐT khi cập nhật (bỏ qua chính bản ghi đang sửa)
    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsBySdtAndIdNot(String sdt, Long id);

    // Thống kê KPI + kiểm tra "quản trị viên cuối cùng"
    long countByTrangThai(Boolean trangThai);

    long countByVaiTro_MaVaiTro(String maVaiTro);

    long countByVaiTro_MaVaiTroAndTrangThai(String maVaiTro, Boolean trangThai);

}