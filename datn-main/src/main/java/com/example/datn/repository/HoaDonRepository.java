package com.example.datn.repository;

import com.example.datn.entity.HoaDonEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HoaDonRepository extends JpaRepository<HoaDonEntity, Integer> {

    boolean existsByMaHoaDon(String maHoaDon);
}
