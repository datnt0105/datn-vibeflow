package com.example.datn.repository;

import com.example.datn.entity.MauSacEntity;
import com.example.datn.entity.ThuongHieuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MauSacRepository extends JpaRepository<MauSacEntity, Long> {

    Optional<MauSacEntity> findByMaMau(String maMau);

    boolean existsByMaMau(String maMau);

    List<MauSacEntity> findByTrangThaiTrueOrderByIdAsc();

    Optional<MauSacEntity> findByIdAndTrangThaiTrue(Long id);

    boolean existsByMaMauAndIdNot(String maMau, Long id);

    @Query("""
       SELECT t FROM MauSacEntity t
       WHERE (:q = '' OR LOWER(t.tenMau) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maMau)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<MauSacEntity> search(@Param("q") String q,
                              @Param("trangThai") Boolean trangThai,
                              Pageable pageable);
}