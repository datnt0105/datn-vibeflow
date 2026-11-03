
USE VibeFlowDB;
GO

-- =============================================
-- 1. DANH MỤC
-- =============================================
INSERT INTO DANH_MUC (ma_danh_muc, ten_danh_muc, mo_ta)
SELECT v.ma, v.ten, v.mo_ta
FROM (VALUES
    ('DM001', N'Giày thể thao', N'Giày thể thao đa năng'),
    ('DM002', N'Giày chạy bộ', N'Giày chuyên chạy bộ'),
    ('DM003', N'Giày bóng đá', N'Giày đá bóng sân cỏ'),
    ('DM004', N'Giày sneaker', N'Giày thời trang hằng ngày'),
    ('DM005', N'Giày tập gym', N'Giày dùng khi tập luyện')
) v(ma, ten, mo_ta)
WHERE NOT EXISTS (
    SELECT 1 FROM DANH_MUC d WHERE d.ma_danh_muc = v.ma
);
GO

-- =============================================
-- 2. THƯƠNG HIỆU
-- =============================================
INSERT INTO THUONG_HIEU (ma_thuong_hieu, ten_thuong_hieu, mo_ta)
SELECT v.ma, v.ten, v.mo_ta
FROM (VALUES
    ('TH001', N'Nike', N'Thương hiệu giày thể thao'),
    ('TH002', N'Adidas', N'Thương hiệu thể thao'),
    ('TH003', N'Puma', N'Thương hiệu thể thao'),
    ('TH004', N'Converse', N'Giày sneaker thời trang'),
    ('TH005', N'New Balance', N'Giày thể thao và chạy bộ'),
    ('TH006', N'Vans', N'Giày phong cách đường phố')
) v(ma, ten, mo_ta)
WHERE NOT EXISTS (
    SELECT 1 FROM THUONG_HIEU t WHERE t.ma_thuong_hieu = v.ma
);
GO

-- =============================================
-- 3. XUẤT XỨ
-- =============================================
INSERT INTO XUAT_XU (ma_xuat_xu, ten_xuat_xu, mo_ta)
SELECT v.ma, v.ten, v.mo_ta
FROM (VALUES
    ('XX001', N'Việt Nam', N'Sản xuất tại Việt Nam'),
    ('XX002', N'Indonesia', N'Sản xuất tại Indonesia'),
    ('XX003', N'Việt Nam/Indonesia', N'Xuất xứ tùy lô sản xuất'),
    ('XX004', N'Trung Quốc', N'Sản xuất tại Trung Quốc'),
    ('XX005', N'Ấn Độ', N'Sản xuất tại Ấn Độ')
) v(ma, ten, mo_ta)
WHERE NOT EXISTS (
    SELECT 1 FROM XUAT_XU x WHERE x.ma_xuat_xu = v.ma
);
GO

-- =============================================
-- 4. CHẤT LIỆU
-- =============================================
INSERT INTO CHAT_LIEU (ma_chat_lieu, ten_chat_lieu, mo_ta)
SELECT v.ma, v.ten, v.mo_ta
FROM (VALUES
    ('CL001', N'Vải lưới Mesh', N'Thông thoáng, nhẹ'),
    ('CL002', N'Da tổng hợp', N'Dễ vệ sinh, bền'),
    ('CL003', N'Da thật', N'Chất liệu da tự nhiên'),
    ('CL004', N'Vải Canvas', N'Vải dệt bền chắc'),
    ('CL005', N'Primeknit', N'Vải dệt co giãn'),
    ('CL006', N'Flyknit', N'Vải dệt nhẹ, ôm chân'),
    ('CL007', N'Vải dệt kim', N'Mềm mại, thoáng khí')
) v(ma, ten, mo_ta)
WHERE NOT EXISTS (
    SELECT 1 FROM CHAT_LIEU c WHERE c.ma_chat_lieu = v.ma
);
GO

-- =============================================
-- 5. MÀU SẮC
-- =============================================
INSERT INTO MAU_SAC (ma_mau, ten_mau, ma_hex)
SELECT v.ma, v.ten, v.hex
FROM (VALUES
    ('MS001', N'Trắng', '#FFFFFF'),
    ('MS002', N'Đen', '#000000'),
    ('MS003', N'Đỏ', '#FF0000'),
    ('MS004', N'Xanh dương', '#0000FF'),
    ('MS005', N'Xám', '#808080'),
    ('MS006', N'Xanh lá', '#008000'),
    ('MS007', N'Be', '#F5F5DC'),
    ('MS008', N'Hồng', '#FFC0CB'),
    ('MS009', N'Trắng đen', '#808080'),
    ('MS010', N'Nâu', '#8B4513')
) v(ma, ten, hex)
WHERE NOT EXISTS (
    SELECT 1 FROM MAU_SAC m WHERE m.ma_mau = v.ma
);
GO

-- =============================================
-- 6. KÍCH THƯỚC - SIZE EU
-- =============================================
INSERT INTO KICH_THUOC (ma_kich_thuoc, ten_kich_thuoc)
SELECT v.ma, v.ten
FROM (VALUES
    ('EU036', N'36'),
    ('EU037', N'37'),
    ('EU038', N'38'),
    ('EU039', N'39'),
    ('EU040', N'40'),
    ('EU041', N'41'),
    ('EU042', N'42'),
    ('EU043', N'43'),
    ('EU044', N'44'),
    ('EU045', N'45')
) v(ma, ten)
WHERE NOT EXISTS (
    SELECT 1 FROM KICH_THUOC k WHERE k.ma_kich_thuoc = v.ma
);
GO

-- =============================================
-- 7. SẢN PHẨM
-- =============================================
INSERT INTO SAN_PHAM (
    ma_san_pham,
    ten_san_pham,
    danh_muc_id,
    thuong_hieu_id,
    xuat_xu_id,
    mo_ta,
    gia_ban,
    trang_thai
)
SELECT
    p.ma,
    p.ten,
    dm.id,
    th.id,
    xx.id,
    p.mo_ta,
    p.gia,
    1
FROM (VALUES
    ('SP001', N'Nike Air Force 1', 'DM004', 'TH001', 'XX002',
     N'Giày sneaker phong cách cổ điển', 2590000.00),

    ('SP002', N'Nike Air Max Excee', 'DM001', 'TH001', 'XX002',
     N'Giày thể thao đệm êm, thiết kế hiện đại', 2890000.00),

    ('SP003', N'Adidas Ultraboost', 'DM002', 'TH002', 'XX003',
     N'Giày chạy bộ đệm êm, hỗ trợ vận động', 3990000.00),

    ('SP004', N'Adidas Superstar', 'DM004', 'TH002', 'XX004',
     N'Giày sneaker mũi vỏ sò đặc trưng', 2290000.00),

    ('SP005', N'Puma Suede Classic', 'DM004', 'TH003', 'XX004',
     N'Giày sneaker phong cách cổ điển', 1890000.00),

    ('SP006', N'Converse Chuck Taylor All Star', 'DM004', 'TH004', 'XX003',
     N'Giày vải cổ điển, dễ phối đồ', 1450000.00),

    ('SP007', N'New Balance 574', 'DM001', 'TH005', 'XX004',
     N'Giày thể thao phong cách retro', 2490000.00),

    ('SP008', N'Vans Old Skool', 'DM004', 'TH006', 'XX004',
     N'Giày vải phong cách đường phố', 1650000.00),

    ('SP009', N'Nike Revolution', 'DM002', 'TH001', 'XX001',
     N'Giày chạy bộ nhẹ, phù hợp tập luyện', 1790000.00),

    ('SP010', N'Adidas Predator', 'DM003', 'TH002', 'XX003',
     N'Giày bóng đá dành cho sân cỏ', 3190000.00),

    ('SP011', N'Nike Metcon', 'DM005', 'TH001', 'XX002',
     N'Giày tập luyện sức mạnh và gym', 3290000.00),

    ('SP012', N'Puma Flyer Runner', 'DM002', 'TH003', 'XX004',
     N'Giày chạy bộ nhẹ nhàng hằng ngày', 1290000.00)
) p(ma, ten, dm_ma, th_ma, xx_ma, mo_ta, gia)
INNER JOIN DANH_MUC dm
    ON dm.ma_danh_muc = p.dm_ma
INNER JOIN THUONG_HIEU th
    ON th.ma_thuong_hieu = p.th_ma
INNER JOIN XUAT_XU xx
    ON xx.ma_xuat_xu = p.xx_ma
WHERE NOT EXISTS (
    SELECT 1 FROM SAN_PHAM s
    WHERE s.ma_san_pham = p.ma
);
GO

-- =============================================
-- 8. KIỂM TRA DỮ LIỆU
-- =============================================
SELECT * FROM DANH_MUC;
SELECT * FROM THUONG_HIEU;
SELECT * FROM XUAT_XU;
SELECT * FROM CHAT_LIEU;
SELECT * FROM MAU_SAC;
SELECT * FROM KICH_THUOC;
SELECT * FROM SAN_PHAM;
GO



INSERT INTO CHAT_LIEU (ma_chat_lieu, ten_chat_lieu, mo_ta, trang_thai) VALUES
('CL001', N'Da thật',          N'Da bò thật, bền, form giữ dáng tốt, càng dùng càng đẹp', 1),
('CL002', N'Da tổng hợp',      N'Da PU/PVC nhân tạo, giá mềm, dễ vệ sinh, nhiều màu',     1),
('CL003', N'Vải lưới (Mesh)',  N'Thoáng khí, nhẹ, phù hợp chạy bộ và tập luyện',          1),
('CL004', N'Vải Canvas',       N'Vải bố dày, bền, phong cách casual và streetwear',       1),
('CL005', N'Flyknit',          N'Sợi dệt liền khối, ôm chân, nhẹ và co giãn tốt',         1),
('CL006', N'Primeknit',        N'Công nghệ dệt của Adidas, mềm, ôm chân, thoáng khí',     1),
('CL007', N'Da lộn (Suede)',   N'Bề mặt nhung mịn, phong cách retro, cần giữ gìn kỹ',     1),
('CL008', N'Da Nubuck',        N'Da mài mịn, bền hơn da lộn, chịu mài mòn tốt',           1),
('CL009', N'Vải dệt (Knit)',   N'Vải dệt co giãn, êm chân, nhẹ',                          1),
('CL010', N'Cao su',           N'Dùng cho đế ngoài, chống trượt và bám đường tốt',        1),
('CL011', N'EVA',              N'Xốp nhẹ, êm, giảm chấn, thường dùng làm đế giữa',        1),
('CL012', N'Phylon',           N'Xốp EVA ép nhiệt, nhẹ và đàn hồi tốt',                   1),
('CL013', N'TPU',              N'Nhựa dẻo, bền, chống nước, dùng làm khung và chi tiết',  1),
('CL014', N'Gore-Tex',         N'Chống nước, thoáng khí, phù hợp giày chạy trail',        1),
('CL015', N'Vải Polyester',    N'Nhẹ, nhanh khô, bền màu, dùng cho lớp lót và thân giày', 1);
GO


UPDATE sp
SET sp.chat_lieu_id = cl.id
    FROM SAN_PHAM sp
JOIN (VALUES
    ('SP001', 'CL001'),  -- Nike Air Force 1        -> Da thật
    ('SP002', 'CL002'),  -- Nike Air Max Excee      -> Da tổng hợp
    ('SP003', 'CL006'),  -- Adidas Ultraboost       -> Primeknit
    ('SP004', 'CL001'),  -- Adidas Superstar        -> Da thật
    ('SP005', 'CL007'),  -- Puma Suede Classic      -> Da lộn (Suede)
    ('SP006', 'CL004'),  -- Converse Chuck Taylor   -> Vải Canvas
    ('SP007', 'CL007'),  -- New Balance 574         -> Da lộn (Suede)
    ('SP008', 'CL004'),  -- Vans Old Skool          -> Vải Canvas
    ('SP009', 'CL003'),  -- Nike Revolution         -> Vải lưới (Mesh)
    ('SP010', 'CL002'),  -- Adidas Predator         -> Da tổng hợp
    ('SP011', 'CL003'),  -- Nike Metcon             -> Vải lưới (Mesh)
    ('SP012', 'CL003')   -- Puma Flyer Runner       -> Vải lưới (Mesh)
) AS m(ma_sp, ma_cl) ON sp.ma_san_pham = m.ma_sp
    JOIN CHAT_LIEU cl ON cl.ma_chat_lieu = m.ma_cl;
GO

-- Kiểm tra kết quả
SELECT sp.id, sp.ma_san_pham, sp.ten_san_pham, cl.ten_chat_lieu
FROM SAN_PHAM sp
         LEFT JOIN CHAT_LIEU cl ON cl.id = sp.chat_lieu_id
ORDER BY sp.id;