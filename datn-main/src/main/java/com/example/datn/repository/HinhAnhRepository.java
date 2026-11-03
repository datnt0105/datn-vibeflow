package com.example.datn.repository;

import com.example.datn.entity.HinhAnhEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HinhAnhRepository extends JpaRepository<HinhAnhEntity, Integer> {

    List<HinhAnhEntity> findBySanPham_IdAndTrangThaiTrueOrderByAnhChinhDescIdAsc(Integer sanPhamId);

    Optional<HinhAnhEntity> findByIdAndTrangThaiTrue(Integer id);

    boolean existsBySanPham_IdAndTrangThaiTrue(Integer sanPhamId);

    Optional<HinhAnhEntity> findFirstBySanPham_IdAndTrangThaiTrueOrderByIdAsc(Long sanPhamId);

    // Bỏ cờ ảnh chính của tất cả ảnh thuộc sản phẩm
    @Modifying
    @Query("UPDATE HinhAnhEntity h SET h.anhChinh = false WHERE h.sanPham.id = :sanPhamId")
    void clearAnhChinh(@Param("sanPhamId") Long sanPhamId);
}