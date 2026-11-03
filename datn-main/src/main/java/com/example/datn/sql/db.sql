# khởi tạo
-- 1. Tạo Database
CREATE DATABASE VibeFlowDB;
GO

USE VibeFlowDB;
GO

-- =============================================
-- NHÓM KHÁCH HÀNG & NHÂN VIÊN
-- =============================================

-- 3. VAI_TRO[cite: 2]
CREATE TABLE VAI_TRO (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         ma_vai_tro VARCHAR(20) NOT NULL,
                         ten_vai_tro NVARCHAR(50) NOT NULL,
                         mo_ta NVARCHAR(255),
                         trang_thai BIT DEFAULT 1
);

-- 2. NHAN_VIEN[cite: 2]
CREATE TABLE NHAN_VIEN (
                           id INT IDENTITY(1,1) PRIMARY KEY,
                           ma_nhan_vien VARCHAR(20) NOT NULL,
                           ho_ten NVARCHAR(100) NOT NULL,
                           sdt VARCHAR(15),
                           email VARCHAR(100),
                           mat_khau VARCHAR(255) NOT NULL,
                           vai_tro_id INT FOREIGN KEY REFERENCES VAI_TRO(id),
                           trang_thai BIT DEFAULT 1
);

-- 1. KHACH_HANG[cite: 2]
CREATE TABLE KHACH_HANG (
                            id INT IDENTITY(1,1) PRIMARY KEY,
                            ma_khach_hang VARCHAR(20) NOT NULL,
                            ho_ten NVARCHAR(100) NOT NULL,
                            sdt VARCHAR(15),
                            email VARCHAR(100),
                            ngay_sinh DATE,
                            gioi_tinh BIT,
                            trang_thai BIT DEFAULT 1,
                            mat_khau NVARCHAR(255)
);

-- 4. DIA_CHI_KHACH_HANG[cite: 2]
CREATE TABLE DIA_CHI_KHACH_HANG (
                                    id INT IDENTITY(1,1) PRIMARY KEY,
                                    khach_hang_id INT FOREIGN KEY REFERENCES KHACH_HANG(id),
                                    nguoi_nhan NVARCHAR(100) NOT NULL,
                                    sdt VARCHAR(15) NOT NULL,
                                    tinh_thanh NVARCHAR(100),
                                    quan_huyen NVARCHAR(100),
                                    phuong_xa NVARCHAR(100),
                                    dia_chi_chi_tiet NVARCHAR(255),
                                    mac_dinh BIT DEFAULT 0
);

-- PHIÊN ĐĂNG NHẬP[cite: 2]
CREATE TABLE phien_dang_nhap (
                                 id INT IDENTITY(1,1) PRIMARY KEY,
                                 user_id INT NOT NULL,
                                 token NVARCHAR(MAX),
                                 thoi_gian_bat_dau DATETIME DEFAULT GETDATE(),
                                 thoi_gian_het_han DATETIME,
                                 thoi_gian_dang_xuat DATETIME,
                                 dia_chi_ip VARCHAR(50),
                                 thiet_bi VARCHAR(255),
                                 trang_thai BIT DEFAULT 1,
                                 loai_tai_khoan NVARCHAR(20) -- nhan_vien/khach_hang[cite: 2]
);


-- =============================================
-- NHÓM SẢN PHẨM
-- =============================================

-- 6. DANH_MUC[cite: 2]
CREATE TABLE DANH_MUC (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          ma_danh_muc VARCHAR(20) NOT NULL,
                          ten_danh_muc NVARCHAR(100) NOT NULL,
                          mo_ta NVARCHAR(255),
                          trang_thai BIT DEFAULT 1
);

-- 7. THUONG_HIEU[cite: 2]
CREATE TABLE THUONG_HIEU (
                             id INT IDENTITY(1,1) PRIMARY KEY,
                             ma_thuong_hieu VARCHAR(20) NOT NULL,
                             ten_thuong_hieu NVARCHAR(100) NOT NULL,
                             mo_ta NVARCHAR(255),
                             trang_thai BIT DEFAULT 1
);

-- 8. XUAT_XU[cite: 2]
CREATE TABLE XUAT_XU (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         ma_xuat_xu VARCHAR(20) NOT NULL,
                         ten_xuat_xu NVARCHAR(100) NOT NULL,
                         mo_ta NVARCHAR(255),
                         trang_thai BIT DEFAULT 1
);

-- 10. CHAT_LIEU[cite: 2]
CREATE TABLE CHAT_LIEU (
                           id INT IDENTITY(1,1) PRIMARY KEY,
                           ma_chat_lieu VARCHAR(20) NOT NULL,
                           ten_chat_lieu NVARCHAR(100) NOT NULL,
                           mo_ta NVARCHAR(255),
                           trang_thai BIT DEFAULT 1
);

-- 11. MAU_SAC[cite: 2]
CREATE TABLE MAU_SAC (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         ma_mau VARCHAR(20) NOT NULL,
                         ten_mau NVARCHAR(50) NOT NULL,
                         ma_hex VARCHAR(10),
                         trang_thai BIT DEFAULT 1
);

-- 12. KICH_THUOC[cite: 2]
CREATE TABLE KICH_THUOC (
                            id INT IDENTITY(1,1) PRIMARY KEY,
                            ma_kich_thuoc VARCHAR(20) NOT NULL,
                            ten_kich_thuoc NVARCHAR(20) NOT NULL,
                            trang_thai BIT DEFAULT 1
);

-- 5. SAN_PHAM[cite: 2]
CREATE TABLE SAN_PHAM (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          ma_san_pham VARCHAR(20) NOT NULL,
                          ten_san_pham NVARCHAR(150) NOT NULL,
                          danh_muc_id INT FOREIGN KEY REFERENCES DANH_MUC(id),
                          thuong_hieu_id INT FOREIGN KEY REFERENCES THUONG_HIEU(id),
                          xuat_xu_id INT FOREIGN KEY REFERENCES XUAT_XU(id),
                          chat_lieu_id INT FOREIGN KEY REFERENCES CHAT_LIEU(id),
                          mo_ta NVARCHAR(500),
                          gia_ban DECIMAL(12,2),
                          trang_thai BIT DEFAULT 1,
                          ngay_tao DATETIME DEFAULT GETDATE()
);

-- 13. HINH_ANH[cite: 2]
CREATE TABLE HINH_ANH (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          san_pham_id INT FOREIGN KEY REFERENCES SAN_PHAM(id),
                          ten_anh NVARCHAR(150),
                          url_anh NVARCHAR(500),
                          anh_chinh BIT DEFAULT 0,
                          trang_thai BIT DEFAULT 1
);

-- 9. CHI_TIET_SAN_PHAM[cite: 2]
CREATE TABLE CHI_TIET_SAN_PHAM (
                                   id INT IDENTITY(1,1) PRIMARY KEY,
                                   ma_chi_tiet VARCHAR(30) NOT NULL,
                                   san_pham_id INT FOREIGN KEY REFERENCES SAN_PHAM(id),
                                   mau_sac_id INT FOREIGN KEY REFERENCES MAU_SAC(id),
                                   kich_thuoc_id INT FOREIGN KEY REFERENCES KICH_THUOC(id),
                                   so_luong INT DEFAULT 0,
                                   gia_ban DECIMAL(12,2),
                                   trang_thai BIT DEFAULT 1
);


-- =============================================
-- NHÓM BÁN HÀNG, KHUYẾN MÃI & GIỎ HÀNG
-- =============================================

-- KHUYEN_MAI[cite: 2]
CREATE TABLE Khuyen_mai (
                            id INT IDENTITY(1,1) PRIMARY KEY,
                            ma_khuyen_mai NVARCHAR(100) NOT NULL,
                            ten NVARCHAR(255) NOT NULL,
                            chi_tiet NVARCHAR(MAX),
                            loai TINYINT,
                            gia_tri INT,
                            ngay_tao DATETIME DEFAULT GETDATE(),
                            giam_gia_toi_thieu INT,
                            giam_gia_toi_da INT,
                            ngay_bat_dau DATETIME,
                            ngay_ket_thuc DATETIME,
                            trang_thai INT DEFAULT 1
);

-- 14. HOA_DON[cite: 2]
CREATE TABLE HOA_DON (
                         id INT IDENTITY(1,1) PRIMARY KEY,
                         ma_hoa_don VARCHAR(20) NOT NULL,
                         khach_hang_id INT FOREIGN KEY REFERENCES KHACH_HANG(id),
                         nhan_vien_id INT FOREIGN KEY REFERENCES NHAN_VIEN(id),
                         ngay_tao DATETIME DEFAULT GETDATE(),
                         tong_tien DECIMAL(12,2),
                         tien_giam DECIMAL(12,2),
                         thanh_tien DECIMAL(12,2),
                         trang_thai INT
);

-- 15. HOA_DON_CHI_TIET[cite: 2]
CREATE TABLE HOA_DON_CHI_TIET (
                                  id INT IDENTITY(1,1) PRIMARY KEY,
                                  hoa_don_id INT FOREIGN KEY REFERENCES HOA_DON(id),
                                  chi_tiet_san_pham_id INT FOREIGN KEY REFERENCES CHI_TIET_SAN_PHAM(id),
                                  so_luong INT NOT NULL,
                                  don_gia DECIMAL(12,2),
                                  thanh_tien DECIMAL(12,2)
);

-- 16. LICH_SU_HOA_DON[cite: 2]
CREATE TABLE LICH_SU_HOA_DON (
                                 id INT IDENTITY(1,1) PRIMARY KEY,
                                 hoa_don_id INT FOREIGN KEY REFERENCES HOA_DON(id),
                                 nhan_vien_id INT FOREIGN KEY REFERENCES NHAN_VIEN(id),
                                 trang_thai_cu INT,
                                 trang_thai_moi INT,
                                 ly_do NVARCHAR(255),
                                 thoi_gian DATETIME DEFAULT GETDATE()
);

-- 16. GIO_HANG[cite: 2]
CREATE TABLE GIO_HANG (
                          id INT IDENTITY(1,1) PRIMARY KEY,
                          khach_hang_id INT FOREIGN KEY REFERENCES KHACH_HANG(id),
                          device_id INT,
                          chi_tiet_san_pham_id INT FOREIGN KEY REFERENCES CHI_TIET_SAN_PHAM(id),
                          so_luong INT DEFAULT 1,
                          trang_thai BIT DEFAULT 1,
                          created_at DATETIME DEFAULT GETDATE()
);


-- =============================================
-- NHÓM THANH TOÁN
-- =============================================

-- 22. HINH_THUC_THANH_TOAN[cite: 2]
CREATE TABLE HINH_THUC_THANH_TOAN (
                                      id INT IDENTITY(1,1) PRIMARY KEY,
                                      ma_hinh_thuc VARCHAR(20) NOT NULL,
                                      ten_hinh_thuc NVARCHAR(100) NOT NULL,
                                      mo_ta NVARCHAR(255),
                                      trang_thai BIT DEFAULT 1
);

-- 23. CHI_TIET_THANH_TOAN[cite: 2]
CREATE TABLE CHI_TIET_THANH_TOAN (
                                     id INT IDENTITY(1,1) PRIMARY KEY,
                                     hoa_don_id INT FOREIGN KEY REFERENCES HOA_DON(id),
                                     hinh_thuc_thanh_toan_id INT FOREIGN KEY REFERENCES HINH_THUC_THANH_TOAN(id),
                                     so_tien DECIMAL(12,2),
                                     ngay_thanh_toan DATETIME DEFAULT GETDATE(),
                                     ma_giao_dich VARCHAR(100),
                                     trang_thai INT
);
GO

ALTER TABLE NHAN_VIEN
    ADD ngay_tao DATETIME2 NOT NULL
        DEFAULT SYSDATETIME();

ALTER TABLE KHACH_HANG
    ADD ngay_tao DATETIME2 NOT NULL
        DEFAULT SYSDATETIME();


alter table SAN_PHAM add gia_goc DECIMAL(12,2) default   null

alter table CHI_TIET_SAN_PHAM add gia_goc DECIMAL(12,2) default   null

alter table CHI_TIET_SAN_PHAM add gia_nhap DECIMAL(12,2) default   null



UPDATE SAN_PHAM SET gia_goc = ROUND(gia_ban / 0.85, -3) where id > 0;

UPDATE c
SET c.gia_nhap = ROUND(sp.gia_ban * 0.7, -3)
    FROM CHI_TIET_SAN_PHAM c
JOIN SAN_PHAM sp ON sp.id = c.san_pham_id
WHERE c.gia_nhap IS NULL;



CREATE UNIQUE INDEX UQ_CTSP ON CHI_TIET_SAN_PHAM (san_pham_id, mau_sac_id, kich_thuoc_id) WHERE trang_thai = 1;

