package com.example.datn.repository;

import com.example.datn.entity.XuatXuEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface XuatXuRepository extends JpaRepository<XuatXuEntity, Long> {
    List<XuatXuEntity> findByTrangThaiTrueOrderByIdAsc();
    Optional<XuatXuEntity> findByIdAndTrangThaiTrue(Long id);
    boolean existsByMaXuatXu(String maXuatXu);
    boolean existsByMaXuatXuAndIdNot(String maXuatXu, Long id);

    @Query("""
       SELECT t FROM XuatXuEntity t
       WHERE (:q = '' OR LOWER(t.tenXuatXu) LIKE LOWER(CONCAT('%', :q, '%'))
                      OR LOWER(t.maXuatXu)  LIKE LOWER(CONCAT('%', :q, '%')))
         AND (:trangThai IS NULL OR t.trangThai = :trangThai)
       """)
    Page<XuatXuEntity> search(@Param("q") String q,
                              @Param("trangThai") Boolean trangThai,
                              Pageable pageable);
}