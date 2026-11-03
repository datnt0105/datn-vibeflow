package com.example.datn.controller;

import com.example.datn.dto.HinhAnhDTO;
import com.example.datn.entity.HinhAnhEntity;
import com.example.datn.entity.SanPhamEntity;
import com.example.datn.repository.HinhAnhRepository;
import com.example.datn.repository.SanPhamRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/hinh-anh")
public class HinhAnhController {

    // Chỉ cho phép các loại ảnh này; đuôi file lấy từ đây, không lấy từ tên file người dùng gửi
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png",  ".png",
            "image/webp", ".webp",
            "image/gif",  ".gif"
    );

    private final HinhAnhRepository hinhAnhRepository;
    private final SanPhamRepository sanPhamRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    private Path root;

    public HinhAnhController(HinhAnhRepository hinhAnhRepository,
                             SanPhamRepository sanPhamRepository) {
        this.hinhAnhRepository = hinhAnhRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @PostConstruct
    void init() throws IOException {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    // ── Upload 1 hoặc nhiều ảnh cho sản phẩm ──────────────────────────────
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<List<HinhAnhDTO>> upload(
            @RequestParam Integer sanPhamId,
            @RequestParam("files") List<MultipartFile> files) throws IOException {

        SanPhamEntity sanPham = sanPhamRepository.findByIdAndTrangThaiTrue(sanPhamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn file nào");
        }

        // Nếu sản phẩm chưa có ảnh nào thì ảnh đầu tiên sẽ là ảnh chính
        boolean needMain = !hinhAnhRepository.existsBySanPham_IdAndTrangThaiTrue(sanPhamId);

        List<HinhAnhEntity> saved = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String ext = ALLOWED_TYPES.get(file.getContentType());
            if (ext == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF");
            }

            String fileName = UUID.randomUUID() + ext;
            Path target = root.resolve(fileName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String original = file.getOriginalFilename();
            if (original != null && original.length() > 150) {
                original = original.substring(0, 150);
            }

            HinhAnhEntity entity = HinhAnhEntity.builder()
                    .sanPham(sanPham)
                    .tenAnh(original)
                    .urlAnh("/api/hinh-anh/file/" + fileName)
                    .anhChinh(needMain)
                    .trangThai(true)
                    .build();
            saved.add(hinhAnhRepository.save(entity));
            needMain = false;
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(saved.stream().map(this::toDTO).toList());
    }

    // ── Danh sách ảnh của 1 sản phẩm (ảnh chính đứng đầu) ─────────────────
    @GetMapping("/san-pham/{sanPhamId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<HinhAnhDTO>> getBySanPham(@PathVariable Integer sanPhamId) {
        List<HinhAnhDTO> list = hinhAnhRepository
                .findBySanPham_IdAndTrangThaiTrueOrderByAnhChinhDescIdAsc(sanPhamId)
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    // ── Xem ảnh (trả về nội dung file để dùng trong <img src>) ────────────
    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) throws IOException {
        Path file = root.resolve(fileName).normalize();

        // Chặn path traversal (../)
        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .body(resource);
    }

    // ── Đặt ảnh chính ─────────────────────────────────────────────────────
    @PutMapping("/{id}/anh-chinh")
    @Transactional
    public ResponseEntity<HinhAnhDTO> setAnhChinh(@PathVariable Integer id) {
        HinhAnhEntity img = hinhAnhRepository.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh"));

        hinhAnhRepository.clearAnhChinh(img.getSanPham().getId());
        img.setAnhChinh(true);
        return ResponseEntity.ok(toDTO(hinhAnhRepository.save(img)));
    }

    // ── Xóa ảnh (xóa mềm, giống cách bạn đang làm với sản phẩm) ──────────
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        HinhAnhEntity img = hinhAnhRepository.findByIdAndTrangThaiTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh"));

        boolean wasMain = Boolean.TRUE.equals(img.getAnhChinh());
        img.setTrangThai(false);
        img.setAnhChinh(false);
        hinhAnhRepository.save(img);

        // Nếu vừa xóa ảnh chính thì chuyển ảnh chính sang ảnh còn lại đầu tiên
        if (wasMain) {
            hinhAnhRepository
                    .findFirstBySanPham_IdAndTrangThaiTrueOrderByIdAsc(img.getSanPham().getId())
                    .ifPresent(next -> {
                        next.setAnhChinh(true);
                        hinhAnhRepository.save(next);
                    });
        }
        return ResponseEntity.noContent().build();
    }

    private HinhAnhDTO toDTO(HinhAnhEntity e) {
        return new HinhAnhDTO(
                e.getId(),
                e.getSanPham().getId(),
                e.getTenAnh(),
                e.getUrlAnh(),
                e.getAnhChinh()
        );
    }
}