package com.example.datn.repository;

import com.example.datn.entity.DanhMucEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DanhMucRepository extends JpaRepository<DanhMucEntity, Long> {

    List<DanhMucEntity> findByTrangThaiTrueOrderByIdAsc();
    Optional<DanhMucEntity> findByIdAndTrangThaiTrue(Long id);
    boolean existsByMaDanhMuc(String maDanhMuc);
    boolean existsByMaDanhMucAndIdNot(String maDanhMuc, Long id);

    @Query("""
       SELECT t FROM DanhMucEntity t
       WHERE (:q = '' OR LOWER(t.tenDanhMuc) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maDanhMuc)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<DanhMucEntity> search(@Param("q") String q,
                               @Param("trangThai") Boolean trangThai,
                               Pageable pageable);
}