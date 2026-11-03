package com.example.datn.controller;

import com.example.datn.dto.MauSacDTO;
import com.example.datn.dto.PageResponse;
import com.example.datn.entity.MauSacEntity;
import com.example.datn.entity.XuatXuEntity;
import com.example.datn.repository.MauSacRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mau-sac")
public class MauSacController {
    @Autowired
    private  MauSacRepository repo;

    private MauSacDTO toDTO(MauSacEntity e) {
        return MauSacDTO.builder()
                .id(e.getId())
                .maMau(e.getMaMau())
                .tenMau(e.getTenMau())
                .maHex(e.getMaHex())
                .trangThai(Boolean.TRUE.equals(e.getTrangThai()))
                .build();
    }


    @GetMapping
    public List<MauSacEntity> getAll() {
        return repo.findByTrangThaiTrueOrderByIdAsc();
    }

    @GetMapping("/page")
    public PageResponse<MauSacDTO> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(required = false) Boolean trangThai) {

        size = Math.min(Math.max(size, 1), 100);
        page = Math.max(page, 0);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<MauSacEntity> result = repo.search(q.trim(), trangThai, pageable);

        return PageResponse.of(result, result.getContent().stream().map(this::toDTO).toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<MauSacDTO> create(@Valid @RequestBody MauSacDTO dto) {
        String ma = dto.getMaMau().trim();
        if (repo.existsByMaMau(ma)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã màu sắc đã tồn tại");
        }
        MauSacEntity e = MauSacEntity.builder()
                .maMau(ma)
                .tenMau(dto.getTenMau().trim())
                .maHex(dto.getMaHex())
                .trangThai(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repo.save(e)));
    }

    private MauSacEntity findActive(Long id) {
        return repo.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy màu sắc"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<MauSacDTO> update(@PathVariable Long id, @Valid @RequestBody MauSacDTO dto) {
        MauSacEntity e = findActive(id);
        String ma = dto.getMaMau().trim();
        if (repo.existsByMaMauAndIdNot(ma, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã màu sắc đã tồn tại");
        }
        e.setMaMau(ma);
        e.setTenMau(dto.getTenMau().trim());
        e.setMaHex(dto.getMaHex());
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }

    @PatchMapping("/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<MauSacDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean trangThai = body.get("trangThai");
        if (trangThai == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường trangThai");
        }
        MauSacEntity e = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xuất xứ"));
        e.setTrangThai(trangThai);
        return ResponseEntity.ok(toDTO(repo.save(e)));
    }

}


