package com.example.datn.repository;

import com.example.datn.entity.SanPhamEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SanPhamRepository extends JpaRepository<SanPhamEntity, Integer> {

    List<SanPhamEntity> findByTrangThaiTrueOrderByNgayTaoDesc();

    Optional<SanPhamEntity> findByIdAndTrangThaiTrue(Integer id);



    boolean existsByMaSanPham(String maSanPham);

    @Query("""
           SELECT s FROM SanPhamEntity s
           WHERE s.trangThai = true
             AND (LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(s.maSanPham)  LIKE LOWER(CONCAT('%', :q, '%')))
           ORDER BY s.ngayTao DESC
           """)
    List<SanPhamEntity> search(@Param("q") String q);

    // Phân trang — tìm kiếm kết hợp với lọc thương hiệu
    @Query("""
           SELECT s FROM SanPhamEntity s
           WHERE s.trangThai = true
             AND (:q     = '' OR LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :q, '%'))
                            OR LOWER(s.maSanPham)  LIKE LOWER(CONCAT('%', :q, '%')))
             AND (:thuongHieuId IS NULL OR s.thuongHieuId = :thuongHieuId)
           """)
    Page<SanPhamEntity> findWithPaging(
            @Param("q") String q,
            @Param("thuongHieuId") Integer thuongHieuId,
            Pageable pageable);



    // Đếm tổng (dùng cho thống kê)
    long countByTrangThaiTrue();
}