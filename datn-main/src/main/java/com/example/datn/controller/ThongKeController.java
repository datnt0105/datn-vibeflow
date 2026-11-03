package com.example.datn.controller;

import com.example.datn.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Thống kê Dashboard — khớp tab "Dashboard / Thống Kê" (chỉ ADMIN thấy tab này trên FE).
 *
 * GET /api/thong-ke/dashboard?period=today|7days|month|year
 */
@RestController
@RequestMapping("/thong-ke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> dashboard(
            @RequestParam(defaultValue = "7days") String period) {
        return ResponseEntity.ok(thongKeService.dashboard(period));
    }
}
