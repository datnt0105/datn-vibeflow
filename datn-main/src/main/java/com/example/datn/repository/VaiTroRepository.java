package com.example.datn.repository;

import com.example.datn.entity.VaiTroEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaiTroRepository extends JpaRepository<VaiTroEntity, Long> {

    // Danh sách vai trò gán được cho nhân viên (loại bỏ KHACH_HANG)
    List<VaiTroEntity> findByMaVaiTroNotOrderByIdAsc(String maVaiTro);
}
