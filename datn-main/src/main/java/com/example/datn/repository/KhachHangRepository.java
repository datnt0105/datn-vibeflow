package com.example.datn.repository;

import com.example.datn.entity.KhachHangEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHangEntity, Long>, JpaSpecificationExecutor<KhachHangEntity> {

    // Tìm khách hàng theo mã khách hàng
    Optional<KhachHangEntity> findByMaKhachHang(String maKhachHang);

    // Tìm khách hàng theo email (dùng đăng nhập / tra cứu)
    Optional<KhachHangEntity> findByEmail(String email);

    // Tìm khách hàng theo số điện thoại
    Optional<KhachHangEntity> findBySdt(String sdt);

    // Kiểm tra tồn tại mã khách hàng
    boolean existsByMaKhachHang(String maKhachHang);

    // Kiểm tra tồn tại email
    boolean existsByEmail(String email);

    // Kiểm tra tồn tại số điện thoại
    boolean existsBySdt(String sdt);

    // Kiểm tra trùng email / SĐT khi cập nhật (bỏ qua chính bản ghi đang sửa)
    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsBySdtAndIdNot(String sdt, Long id);

    // Thống kê KPI
    long countByTrangThai(Boolean trangThai);

    long countByNgayTaoGreaterThanEqual(LocalDateTime from);
}