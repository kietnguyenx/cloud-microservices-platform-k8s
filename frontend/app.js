/**
 * MAISON' DÉCOR - Luxury Minimalist Furniture Showroom App Logic
 * Tone màu & Phong cách tối giản phong cách Bắc Âu tối giản đương đại
 * Dữ liệu sản phẩm được đồng bộ tự động từ Backend RESTful API & Database
 */

// Cấu hình URL kết nối Backend API (hỗ trợ cả Live Server, Docker và K8s)
const API_BASE = (window.location.port === "3000" || window.location.port === "5500" || window.location.protocol === "file:") 
    ? "http://localhost:8000" 
    : "";

// =============================================================================
// 1. STATE ỨNG DỤNG & DỮ LIỆU SẢN PHẨM NỘI THẤT CAO CẤP MẶC ĐỊNH
// =============================================================================
const DEFAULT_PRODUCTS = [
    {
        "id": 1,
        "name": "Sofa Modular Blanc Soft L-Shape",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 16800000,
        "originalPrice": 19500000,
        "material": "Vải Nỉ Bỉ nhập khẩu & Gỗ Sồi tự nhiên",
        "dimensions": "260 x 165 x 78 cm",
        "rating": 5.0,
        "reviewsCount": 38,
        "badge": "Best Seller",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        "description": "Mẫu sofa góc chữ L mang phong cách Scandinavian hiện đại với thiết kế module linh hoạt, nệm mút bọt biển đàn hồi cao cấp êm ái tuyệt đối, khung gỗ sồi Bắc Mỹ đạt chuẩn kháng ẩm."
    },
    {
        "id": 2,
        "name": "Ghế Thư Giãn Lounge Armchair Nappa",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 7900000,
        "originalPrice": 9200000,
        "material": "Da bò Nappa cao cấp & Chân thép mạ Titan",
        "dimensions": "85 x 82 x 90 cm",
        "rating": 4.9,
        "reviewsCount": 24,
        "badge": "Ưu Đãi -15%",
        "badgeType": "discount",
        "image": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
        "description": "Điểm nhấn sang trọng cho góc phòng khách hoặc phòng đọc sách. Độ ngả lưng khoa học nâng đỡ cột sống, bề mặt da mềm mịn thoáng khí."
    },
    {
        "id": 3,
        "name": "Bàn Trà Tròn Kép Đôi Nordic Minimalist",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 4500000,
        "originalPrice": 5200000,
        "material": "Mặt đá cẩm thạch trắng & Gỗ Tần Bì",
        "dimensions": "Bàn lớn D75cm, Bàn nhỏ D50cm",
        "rating": 4.8,
        "reviewsCount": 19,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
        "description": "Bộ đôi bàn trà lồng thông minh tiết kiệm diện tích. Mặt đá phiến chống trầy xước, chịu nhiệt độ cao kết hợp vân gỗ mộc tinh tế."
    },
    {
        "id": 4,
        "name": "Bàn Ăn Gỗ Sồi Tự Nhiên OAK Atelier",
        "category": "dining",
        "categoryId": 2,
        "categoryName": "Bàn Ăn & Bếp",
        "price": 13500000,
        "originalPrice": 15500000,
        "material": "Gỗ Sồi Trắng Bắc Mỹ nguyên khối (FSC)",
        "dimensions": "180 x 85 x 75 cm (6-8 người)",
        "rating": 5.0,
        "reviewsCount": 42,
        "badge": "Đặc Tuyển",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
        "description": "Chiếc bàn ăn trung tâm cho những bữa cơm sum vầy ấm cúng. Sơn phủ dầu lau thực vật an toàn thực phẩm, giữ trọn vẹn vân gỗ mộc tự nhiên."
    },
    {
        "id": 5,
        "name": "Set 4 Ghế Ăn Bọc Nệm Da Nordic Chair",
        "category": "dining",
        "categoryId": 2,
        "categoryName": "Bàn Ăn & Bếp",
        "price": 5800000,
        "originalPrice": 6800000,
        "material": "Khung gỗ Tần Bì & Đệm da PU chống nước",
        "dimensions": "48 x 52 x 82 cm",
        "rating": 4.9,
        "reviewsCount": 31,
        "badge": "Hot Deal",
        "badgeType": "discount",
        "image": "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế lưng cong ôm sát cơ thể, mang lại cảm giác thoải mái khi dùng bữa. Dễ dàng vệ sinh lau chùi hàng ngày."
    },
    {
        "id": 6,
        "name": "Giường Ngủ Nệm Bọc Nỉ Minimalist Zen",
        "category": "bedroom",
        "categoryId": 3,
        "categoryName": "Phòng Ngủ",
        "price": 15200000,
        "originalPrice": 17800000,
        "material": "Khung thép chịu lực, gỗ Sồi & Nỉ dệt thô",
        "dimensions": "180 x 200 cm (King Size)",
        "rating": 5.0,
        "reviewsCount": 29,
        "badge": "Yêu Thích",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "description": "Mang phong cách Zen Nhật Bản kết hợp Scandinavian. Đầu giường êm ái làm điểm tựa đọc sách, khung thang giát giường chắc chắn không phát tiếng cọt kẹt."
    },
    {
        "id": 7,
        "name": "Tủ Đầu Giường 2 Ngăn Kéo Japandi Oak",
        "category": "bedroom",
        "categoryId": 3,
        "categoryName": "Phòng Ngủ",
        "price": 2450000,
        "originalPrice": 2900000,
        "material": "Gỗ Sồi tự nhiên & Ray trượt giảm chấn",
        "dimensions": "45 x 40 x 50 cm",
        "rating": 4.8,
        "reviewsCount": 16,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế nhỏ gọn, đường bo góc mềm mại hạn chế va đập. Ngăn kéo đóng mở êm ái chống ồn cho không gian nghỉ ngơi yên tĩnh."
    },
    {
        "id": 8,
        "name": "Bàn Làm Việc Studio Desk Gỗ Tự Nhiên",
        "category": "workspace",
        "categoryId": 4,
        "categoryName": "Góc Làm Việc",
        "price": 6800000,
        "originalPrice": 7900000,
        "material": "Mặt gỗ Sồi tự nhiên & Chân thép sơn tĩnh điện",
        "dimensions": "140 x 70 x 75 cm",
        "rating": 4.9,
        "reviewsCount": 35,
        "badge": "Best Seller",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "description": "Bàn làm việc tối giản tích hợp khe luồn dây cáp thông minh. Rộng rãi đủ cho 2 màn hình lớn, bề mặt mịn màng truyền cảm hứng sáng tạo."
    },
    {
        "id": 9,
        "name": "Ghế Làm Việc Ergonomic Thư Giãn",
        "category": "workspace",
        "categoryId": 4,
        "categoryName": "Góc Làm Việc",
        "price": 4900000,
        "originalPrice": 5600000,
        "material": "Lưới thoáng khí Wintex & Piston Class 4",
        "dimensions": "Tiêu chuẩn điều chỉnh linh hoạt",
        "rating": 4.8,
        "reviewsCount": 52,
        "badge": "Hot",
        "badgeType": "discount",
        "image": "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=800&q=80",
        "description": "Hỗ trợ đỡ thắt lưng linh hoạt giúp giảm đau mỏi khi ngồi làm việc lâu. Tay vịn 3D đa hướng, chân xoay hợp kim nhôm chịu tải 150kg."
    },
    {
        "id": 10,
        "name": "Đèn Cây Đứng Phòng Khách Nordic Floor Lamp",
        "category": "decor",
        "categoryId": 5,
        "categoryName": "Đèn & Decor",
        "price": 1850000,
        "originalPrice": 2200000,
        "material": "Kim loại mạ đồng mờ & Chao đèn vải lanh",
        "dimensions": "Đường kính 35cm, Cao 155cm",
        "rating": 4.9,
        "reviewsCount": 22,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        "description": "Ánh sáng vàng ấm 3000K êm dịu tạo cảm giác thư thái cho không gian sống ban đêm. Công tắc bàn đạp chân tiện lợi."
    },
    {
        "id": 11,
        "name": "Thảm Trải Sàn Dệt Thủ Công Bắc Âu Moroc",
        "category": "decor",
        "categoryId": 5,
        "categoryName": "Đèn & Decor",
        "price": 3200000,
        "originalPrice": 3800000,
        "material": "Sợi len tổng hợp mật độ cao, êm ái",
        "dimensions": "160 x 230 cm",
        "rating": 4.7,
        "reviewsCount": 14,
        "badge": null,
        "badgeType": null,
        "image": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
        "description": "Họa tiết hình học trừu tượng tinh tế tôn lên vẻ đẹp của bộ sofa và sàn gỗ. Không rụng sợi, chống trơn trượt hiệu quả."
    },
    {
        "id": 12,
        "name": "Gương Đứng Toàn Thân Vòm Tròn Arch Mirror",
        "category": "decor",
        "categoryId": 5,
        "categoryName": "Đèn & Decor",
        "price": 2600000,
        "originalPrice": 3100000,
        "material": "Phôi gương Bỉ tráng bạc 8 lớp & Khung gỗ",
        "dimensions": "60 x 170 cm",
        "rating": 5.0,
        "reviewsCount": 40,
        "badge": "Best Seller",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        "description": "Gương soi sáng trong trẻo, chân thực không méo hình. Thiết kế mái vòm cong mềm mại mở rộng thị giác cho căn phòng."
    },
    {
        "id": 13,
        "name": "Kệ Tivi Gỗ Sồi Bắc Âu Minimalist Console",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 8500000,
        "originalPrice": 9900000,
        "material": "Gỗ Sồi Trắng tự nhiên & Phụ kiện ray Blum giảm chấn",
        "dimensions": "180 x 42 x 48 cm",
        "rating": 4.9,
        "reviewsCount": 27,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế thanh thoát với 2 cánh lùa nan gỗ thông thoáng tản nhiệt cho thiết bị âm thanh. Tinh tế đến từng góc vát 45 độ."
    },
    {
        "id": 14,
        "name": "Ghế Đôn Tròn Bọc Nỉ Boucle Cao Cấp",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 1850000,
        "originalPrice": 2300000,
        "material": "Vải lông cừu Boucle mềm mại & Đế gỗ tần bì",
        "dimensions": "Đường kính 40cm, Cao 45cm",
        "rating": 4.8,
        "reviewsCount": 33,
        "badge": "Hot",
        "badgeType": "discount",
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "description": "Chiếc đôn nhỏ xinh xắn vừa làm ghế phụ tiếp khách, vừa làm bàn trà hoặc góc decor sống ảo siêu ấm cúng."
    },
    {
        "id": 15,
        "name": "Bàn Ăn Tròn Gỗ Sồi Mở Rộng Extension Table",
        "category": "dining",
        "categoryId": 2,
        "categoryName": "Bàn Ăn & Bếp",
        "price": 14800000,
        "originalPrice": 17000000,
        "material": "Gỗ Sồi tự nhiên & Khung trượt hợp kim cao cấp",
        "dimensions": "D110cm (mở rộng 155cm) x Cao 75cm",
        "rating": 5.0,
        "reviewsCount": 18,
        "badge": "Thông Minh",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
        "description": "Bình thường là bàn tròn ấm cúng 4 người, khi có khách kéo dài thành bàn bầu dục 6-8 người cực kỳ tiện lợi và mượt mà."
    },
    {
        "id": 16,
        "name": "Tủ Quần Áo 3 Cánh Scandi Minimalist Wardrobe",
        "category": "bedroom",
        "categoryId": 3,
        "categoryName": "Phòng Ngủ",
        "price": 18200000,
        "originalPrice": 21000000,
        "material": "Gỗ Tần Bì phủ veneer sồi cao cấp & Bản lề hơi",
        "dimensions": "160 x 60 x 210 cm",
        "rating": 4.9,
        "reviewsCount": 21,
        "badge": "Đặc Tuyển",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
        "description": "Không gian lưu trữ khoa học với khoang treo áo dài, ngăn gấp đồ và ngăn kéo có khóa an toàn. Vân gỗ sáng màu mở rộng không gian phòng ngủ."
    },
    {
        "id": 17,
        "name": "Kệ Sách Đứng 5 Tầng Minimalist Bookshelf",
        "category": "workspace",
        "categoryId": 4,
        "categoryName": "Góc Làm Việc",
        "price": 5400000,
        "originalPrice": 6200000,
        "material": "Khung thép sơn tĩnh điện & Đợt gỗ Sồi tự nhiên",
        "dimensions": "80 x 32 x 185 cm",
        "rating": 4.8,
        "reviewsCount": 29,
        "badge": null,
        "badgeType": null,
        "image": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế hở 2 mặt thoáng đãng, vừa làm giá sách, vừa làm vách ngăn nhẹ phân chia không gian sống tinh tế."
    },
    {
        "id": 18,
        "name": "Đèn Thả Trần Thủy Tinh Khói Amber Pendant",
        "category": "decor",
        "categoryId": 5,
        "categoryName": "Đèn & Decor",
        "price": 2150000,
        "originalPrice": 2600000,
        "material": "Thủy tinh màu hổ phách thổi thủ công & Đui đồng thau",
        "dimensions": "Đường kính 28cm x Dây thả tùy chỉnh 120cm",
        "rating": 4.9,
        "reviewsCount": 36,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
        "description": "Thả trên bàn ăn hoặc đảo bếp, ánh sáng qua lớp thủy tinh khói vàng ấm đem lại bầu không khí lãng mạn như nhà hàng cao cấp."
    },
    {
        "id": 19,
        "name": "Bàn Làm Việc Nâng Hạ Chiều Cao Smart Standing Desk",
        "category": "workspace",
        "categoryId": 4,
        "categoryName": "Góc Làm Việc",
        "price": 9200000,
        "originalPrice": 10800000,
        "material": "Mặt gỗ Sồi tự nhiên & Động cơ Dual Motor nâng hạ êm ái",
        "dimensions": "150 x 75 x 65-125 cm (tùy chỉnh điện)",
        "rating": 5.0,
        "reviewsCount": 46,
        "badge": "Công Nghệ",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80",
        "description": "Bàn nâng hạ thông minh bảo vệ cột sống, tích hợp bộ nhớ 4 vị trí nhớ độ cao và cảm biến chống va chạm an toàn."
    },
    {
        "id": 20,
        "name": "Tủ Rượu & Kệ Ly Gỗ Sồi Scandi Bar Cabinet",
        "category": "dining",
        "categoryId": 2,
        "categoryName": "Bàn Ăn & Bếp",
        "price": 11500000,
        "originalPrice": 13200000,
        "material": "Gỗ Sồi tự nhiên, kính gợn sóng Fluted Glass & Đèn LED âm",
        "dimensions": "90 x 42 x 135 cm",
        "rating": 4.9,
        "reviewsCount": 23,
        "badge": "Mới",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80",
        "description": "Tủ rượu sang trọng với giá treo ly ngược, khay để rượu nghiêng chuẩn và cánh kính sọc mờ tạo hiệu ứng thị giác huyền ảo."
    },
    {
        "id": 21,
        "name": "Ghế Bập Bênh Thư Giãn Rocking Lounge Chair",
        "category": "living-room",
        "categoryId": 1,
        "categoryName": "Phòng Khách",
        "price": 6200000,
        "originalPrice": 7100000,
        "material": "Khung gỗ Uốn cong Thụy Điển & Nỉ lông cừu Boucle",
        "dimensions": "78 x 92 x 88 cm",
        "rating": 4.8,
        "reviewsCount": 34,
        "badge": "Yêu Thích",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
        "description": "Góc thư giãn lý tưởng để đọc sách, ru em bé hoặc nhâm nhi tách trà. Bập bênh êm ái với góc nghiêng an toàn tối đa."
    },
    {
        "id": 22,
        "name": "Bàn Trang Điểm Kèm Gương Tròn LED Scandi Vanity",
        "category": "bedroom",
        "categoryId": 3,
        "categoryName": "Phòng Ngủ",
        "price": 7600000,
        "originalPrice": 8900000,
        "material": "Gỗ Sồi Trắng & Gương cảm ứng 3 chế độ sáng",
        "dimensions": "100 x 45 x 128 cm",
        "rating": 4.9,
        "reviewsCount": 41,
        "badge": "Bán Chạy",
        "badgeType": "featured",
        "image": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
        "description": "Bộ bàn phấn thanh lịch với gương LED cảm ứng ánh sáng tự nhiên. Các ngăn chia mỹ phẩm nhung mềm bảo vệ đồ trang sức."
    },
    {
        "id": 23,
        "name": "Set 2 Ghế Bar Gỗ Sồi Tự Nhiên Nordic Barstool",
        "category": "dining",
        "categoryId": 2,
        "categoryName": "Bàn Ăn & Bếp",
        "price": 3900000,
        "originalPrice": 4600000,
        "material": "Gỗ Sồi Bắc Mỹ nguyên khối & Nệm da bò êm ái",
        "dimensions": "42 x 42 x 75 cm (chiều cao ngồi)",
        "rating": 4.7,
        "reviewsCount": 19,
        "badge": "Hot Deal",
        "badgeType": "discount",
        "image": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
        "description": "Dành riêng cho đảo bếp hoặc quầy bar gia đình. Chân ghế gỗ sồi vững chãi kết hợp chỗ để chân bọc đồng chống trầy."
    },
    {
        "id": 24,
        "name": "Kệ Giày Dép & Ghế Ngồi Thay Giày Entryway Bench",
        "category": "decor",
        "categoryId": 5,
        "categoryName": "Đèn & Decor",
        "price": 2850000,
        "originalPrice": 3400000,
        "material": "Gỗ Sồi tự nhiên & Đệm ngồi tháo rời giặt được",
        "dimensions": "90 x 35 x 48 cm",
        "rating": 4.9,
        "reviewsCount": 58,
        "badge": "Tiện Ích",
        "badgeType": "new",
        "image": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
        "description": "Món đồ không thể thiếu tại sảnh đón. Vừa là ghế êm ái ngồi xỏ giày, vừa chứa được 8-10 đôi giày dép gọn gàng ngăn nắp."
    }
];

// Khởi tạo mức tồn kho mặc định cho 24 sản phẩm
const STOCK_MAP = {
    1: 5, 2: 4, 3: 12, 4: 6, 5: 8, 6: 3, 7: 9, 8: 7, 9: 10, 10: 15,
    11: 8, 12: 6, 13: 4, 14: 11, 15: 5, 16: 3, 17: 8, 18: 14, 19: 6,
    20: 4, 21: 5, 22: 7, 23: 9, 24: 12
};
DEFAULT_PRODUCTS.forEach(p => {
    p.stock = (typeof p.stock === "number") ? p.stock : (STOCK_MAP[p.id] || 10);
});

// Danh sách mã Voucher khuyến mãi hợp lệ
const AVAILABLE_VOUCHERS = {
    "MAISON500": { code: "MAISON500", discount: 500000, type: "fixed", minOrder: 1000000, desc: "Giảm 500.000₫ cho đơn từ 1.000.000₫" },
    "WELCOME500": { code: "WELCOME500", discount: 500000, type: "fixed", minOrder: 1000000, desc: "Giảm 500.000₫ quà chào mừng bản tin" },
    "BLANC10": { code: "BLANC10", discount: 0.10, type: "percent", maxDiscount: 1500000, desc: "Giảm 10% (tối đa 1.500.000₫)" },
    "NOITHAT1M": { code: "NOITHAT1M", discount: 1000000, type: "fixed", minOrder: 10000000, desc: "Giảm 1.000.000₫ cho đơn từ 10.000.000₫" }
};

// Quản lý tài khoản đăng ký lưu trữ an toàn (hỗ trợ cả offline / fallback)
function getRegisteredAccounts() {
    let accounts = JSON.parse(localStorage.getItem("blanc_accounts") || "null");
    if (!accounts || !Array.isArray(accounts)) {
        accounts = [
            {
                username: "admin",
                email: "admin@blanc.vn",
                password: "admin123",
                full_name: "Quản Trị Viên (Admin)",
                role: "admin",
                phone: "0987 654 321",
                address: "Showroom Maison Decor"
            },
            {
                username: "admin_maison",
                email: "admin@maisondecor.vn",
                password: "admin123",
                full_name: "Quản Trị Viên Showroom",
                role: "admin",
                phone: "0987 654 321",
                address: "Showroom Maison Decor"
            }
        ];
        localStorage.setItem("blanc_accounts", JSON.stringify(accounts));
    }
    return accounts;
}

const AppState = {
    products: [...DEFAULT_PRODUCTS],
    isLoading: false,
    currentCategory: "all",
    searchQuery: "",
    priceFilter: "all",
    sortOrder: "featured",
    cart: JSON.parse(localStorage.getItem("blanc_cart") || "[]"),
    orders: JSON.parse(localStorage.getItem("blanc_orders") || "[]"),
    user: JSON.parse(localStorage.getItem("blanc_user") || "null"),
    appliedVoucher: JSON.parse(localStorage.getItem("blanc_voucher") || "null"),
    adminOrders: [],
    adminOrdersFilter: "all"
};

// Hàm định dạng tiền tệ VNĐ (ví dụ: 16.800.000₫)
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount).replace('₫', '₫');
}

// Tính toán số tiền được giảm giá theo Voucher
function calculateDiscount(subtotal) {
    if (!AppState.appliedVoucher || subtotal <= 0) return 0;
    const v = AppState.appliedVoucher;
    if (v.minOrder && subtotal < v.minOrder) return 0;
    if (v.type === "fixed") {
        return Math.min(subtotal, v.discount);
    } else if (v.type === "percent") {
        const disc = Math.round(subtotal * v.discount);
        return v.maxDiscount ? Math.min(disc, v.maxDiscount) : disc;
    }
    return 0;
}

// Áp dụng mã Voucher
function applyVoucherCode(codeStr, silent = false) {
    if (!codeStr || !codeStr.trim()) {
        if (!silent) showToast("Vui lòng nhập mã giảm giá!", false);
        return false;
    }
    const code = codeStr.trim().toUpperCase();
    const voucher = AVAILABLE_VOUCHERS[code];
    if (!voucher) {
        if (!silent) showToast(`Mã giảm giá "${code}" không tồn tại hoặc đã hết hạn!`, false);
        return false;
    }

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (voucher.minOrder && subtotal > 0 && subtotal < voucher.minOrder) {
        if (!silent) showToast(`Mã ${voucher.code} chỉ áp dụng cho đơn hàng từ ${formatVND(voucher.minOrder)} trở lên!`, false);
        return false;
    }

    AppState.appliedVoucher = voucher;
    localStorage.setItem("blanc_voucher", JSON.stringify(voucher));
    renderCart();
    updateCheckoutSummary();
    if (!silent) showToast(`🎉 Áp dụng thành công mã ${voucher.code}: ${voucher.desc}!`);
    return true;
}

// Hủy áp dụng mã Voucher
function removeVoucher() {
    AppState.appliedVoucher = null;
    localStorage.removeItem("blanc_voucher");
    const vInput = document.getElementById("cart-voucher-input");
    if (vInput) vInput.value = "";
    renderCart();
    updateCheckoutSummary();
    showToast("Đã hủy áp dụng mã voucher.");
}

// =============================================================================
// 3. RENDER DANH SÁCH SẢN PHẨM & BỘ LỌC
// =============================================================================
function renderProducts() {
    const grid = document.getElementById("products-grid");
    const countDisplay = document.getElementById("product-count-display");
    const emptyState = document.getElementById("empty-state");
    const activeTagsBox = document.getElementById("active-filter-tags");
    const tagCategory = document.getElementById("tag-category");
    const tagPrice = document.getElementById("tag-price");

    if (AppState.isLoading) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(140,109,88,0.2); border-top-color: #8c6d58; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;"></div>
                <p style="font-size: 0.95rem; font-weight: 500;">Đang đồng bộ dữ liệu từ Database...</p>
            </div>
        `;
        if (emptyState) emptyState.style.display = "none";
        return;
    }

    // Lọc theo Category
    let filtered = AppState.products.filter(item => {
        if (AppState.currentCategory !== "all" && item.category !== AppState.currentCategory) {
            return false;
        }

        // Lọc theo từ khóa tìm kiếm
        if (AppState.searchQuery.trim() !== "") {
            const q = AppState.searchQuery.toLowerCase().trim();
            const matchName = item.name.toLowerCase().includes(q);
            const matchCat = item.categoryName.toLowerCase().includes(q);
            const matchMaterial = item.material.toLowerCase().includes(q);
            if (!matchName && !matchCat && !matchMaterial) return false;
        }

        // Lọc theo mức giá
        if (AppState.priceFilter === "under-5m" && item.price >= 5000000) return false;
        if (AppState.priceFilter === "5m-15m" && (item.price < 5000000 || item.price > 15000000)) return false;
        if (AppState.priceFilter === "above-15m" && item.price <= 15000000) return false;

        return true;
    });

    // Sắp xếp
    if (AppState.sortOrder === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (AppState.sortOrder === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (AppState.sortOrder === "rating-desc") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else {
        // featured: giữ nguyên hoặc ưu tiên badge featured
        filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }

    // Hiển thị số lượng
    countDisplay.textContent = filtered.length;

    // Cập nhật tag lọc
    const hasFilter = AppState.currentCategory !== "all" || AppState.priceFilter !== "all" || AppState.searchQuery !== "";
    if (hasFilter) {
        activeTagsBox.style.display = "flex";
        const catMap = {
            "living-room": "Phòng Khách",
            "dining": "Bàn Ăn & Bếp",
            "bedroom": "Phòng Ngủ",
            "workspace": "Góc Làm Việc",
            "decor": "Đèn & Decor"
        };
        tagCategory.textContent = catMap[AppState.currentCategory] || "Tất cả phòng";
        const priceMap = {
            "under-5m": "< 5.000.000₫",
            "5m-15m": "5 - 15 triệu",
            "above-15m": "> 15.000.000₫"
        };
        tagPrice.textContent = priceMap[AppState.priceFilter] || "Tất cả mức giá";
    } else {
        activeTagsBox.style.display = "none";
    }

    if (filtered.length === 0) {
        grid.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    const isAdmin = AppState.user && AppState.user.role === "admin";
    const btnAdminAdd = document.getElementById("btn-admin-add-product");
    if (btnAdminAdd) {
        btnAdminAdd.style.display = isAdmin ? "inline-flex" : "none";
    }
    const btnAdminOrders = document.getElementById("btn-admin-manage-orders");
    if (btnAdminOrders) {
        btnAdminOrders.style.display = isAdmin ? "inline-flex" : "none";
    }

    grid.innerHTML = filtered.map(item => `
        <article class="product-card" data-id="${item.id}">
            <div class="product-thumb-wrap">
                ${item.badge ? `<span class="product-card-badge badge-${item.badgeType}">${item.badge}</span>` : ''}
                <img src="${item.image}" alt="${item.name}" class="product-thumb" loading="lazy">
                <div class="product-thumb-actions">
                    <button type="button" class="btn-quickview" onclick="openProductModal(${item.id})">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Xem Nhanh
                    </button>
                </div>
            </div>
            <div class="product-body">
                <span class="product-category-name">${item.categoryName}</span>
                <h3 class="product-name" onclick="openProductModal(${item.id})">${item.name}</h3>
                <p class="product-specs">${item.material} &bull; ${item.dimensions}</p>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(item.rating))}
                    <span>${item.rating} (${item.reviewsCount})</span>
                </div>
                <div class="product-stock-tag ${item.stock <= 0 ? 'stock-out' : (item.stock <= 3 ? 'stock-low' : 'stock-available')}">
                    ${item.stock <= 0 ? '✕ Tạm hết hàng' : (item.stock <= 3 ? `⚡ Chỉ còn ${item.stock} cái trong kho` : `✓ Còn ${item.stock} sản phẩm`)}
                </div>
                <div class="product-footer">
                    <div class="product-price-box">
                        <span class="price-current">${formatVND(item.price)}</span>
                        ${item.originalPrice ? `<span class="price-old">${formatVND(item.originalPrice)}</span>` : ''}
                    </div>
                    <button type="button" class="btn-add-cart" onclick="addToCart(${item.id})" ${item.stock <= 0 ? 'disabled' : ''}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        ${item.stock <= 0 ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ'}
                    </button>
                </div>
            </div>
            ${isAdmin ? `
                <div class="product-admin-bar">
                    <button type="button" class="btn-card-admin-edit" onclick="openAdminEditModal(${item.id})" title="Chỉnh sửa thông tin món hàng">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        Sửa
                    </button>
                    <button type="button" class="btn-card-admin-delete" onclick="handleAdminDeleteProduct(${item.id})" title="Xóa món hàng khỏi showroom">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Xóa
                    </button>
                </div>
            ` : ''}
        </article>
    `).join("");
}

// =============================================================================
// 4. QUẢN LÝ GIỎ HÀNG (CART STATE & SLIDE DRAWER)
// =============================================================================
function saveCart() {
    localStorage.setItem("blanc_cart", JSON.stringify(AppState.cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
}

function addToCart(productId, quantity = 1) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const availableStock = (typeof product.stock === "number") ? product.stock : 10;
    if (availableStock <= 0) {
        showToast(`Rất tiếc! Món "${product.name}" hiện đã tạm hết hàng trong kho.`, false);
        return;
    }

    const existingIndex = AppState.cart.findIndex(item => item.id === productId);
    const currentQtyInCart = existingIndex > -1 ? AppState.cart[existingIndex].quantity : 0;

    // Kiểm tra không cho đặt vượt quá số lượng tồn kho
    if (currentQtyInCart + quantity > availableStock) {
        showToast(`Rất tiếc! Kho chỉ còn ${availableStock} sản phẩm "${product.name}" (trong giỏ của bạn đã có ${currentQtyInCart} món).`, false);
        return;
    }

    if (existingIndex > -1) {
        AppState.cart[existingIndex].quantity += quantity;
    } else {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            material: product.material,
            dimensions: product.dimensions,
            stock: availableStock,
            quantity: quantity
        });
    }

    saveCart();
    renderCart();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartQty(productId, delta) {
    const item = AppState.cart.find(i => i.id === productId);
    if (!item) return;

    if (delta > 0) {
        const product = AppState.products.find(p => p.id === productId);
        const availableStock = product && (typeof product.stock === "number") ? product.stock : (item.stock || 10);
        if (item.quantity + delta > availableStock) {
            showToast(`Không thể thêm! Món này chỉ còn tối đa ${availableStock} sản phẩm trong kho.`, false);
            return;
        }
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
}

function renderCart() {
    const body = document.getElementById("cart-drawer-body");
    const countText = document.getElementById("cart-drawer-count");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const footer = document.getElementById("cart-drawer-footer");

    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    countText.textContent = `(${totalCount} sản phẩm)`;

    if (AppState.cart.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 12px;">🛍️</div>
                <h4 style="color: var(--text-primary); margin-bottom: 8px;">Giỏ hàng của bạn đang trống</h4>
                <p style="font-size: 0.88rem; margin-bottom: 20px;">Hãy dạo xem các bộ sưu tập nội thất tuyệt đẹp của MAISON' DÉCOR.</p>
                <button type="button" class="btn-primary" onclick="closeCart(); document.getElementById('catalog').scrollIntoView();">Khám Phá Sản Phẩm</button>
            </div>
        `;
        footer.style.display = "none";
        return;
    }

    footer.style.display = "block";
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = calculateDiscount(subtotal);
    const finalTotal = Math.max(0, subtotal - discount);

    subtotalEl.textContent = formatVND(subtotal);
    totalEl.textContent = formatVND(finalTotal);

    // Hiển thị dòng giảm giá nếu có voucher
    const discountRow = document.getElementById("cart-discount-row");
    const discountAmountEl = document.getElementById("cart-discount-amount");
    const voucherAppliedRow = document.getElementById("voucher-applied-row");
    const voucherTagText = document.getElementById("voucher-tag-text");

    if (discountRow && discountAmountEl) {
        if (discount > 0 && AppState.appliedVoucher) {
            discountRow.style.display = "flex";
            discountAmountEl.textContent = `-${formatVND(discount)}`;
        } else {
            discountRow.style.display = "none";
        }
    }

    if (voucherAppliedRow && voucherTagText) {
        if (AppState.appliedVoucher) {
            voucherAppliedRow.style.display = "flex";
            voucherTagText.textContent = `🏷️ Mã: ${AppState.appliedVoucher.code} (-${formatVND(discount)})`;
        } else {
            voucherAppliedRow.style.display = "none";
        }
    }

    body.innerHTML = AppState.cart.map(item => `
        <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-specs">${item.material}</span>
                </div>
                <div class="cart-item-bottom">
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                    <div>
                        <span class="cart-item-price">${formatVND(item.price * item.quantity)}</span>
                        <button type="button" class="btn-remove-item" onclick="removeFromCart(${item.id})">Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

function openCart() {
    renderCart();
    document.getElementById("cart-drawer-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    document.getElementById("cart-drawer-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 5. MODAL XEM CHI TIẾT SẢN PHẨM (QUICK VIEW)
// =============================================================================
function openProductModal(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const availableStock = (typeof product.stock === "number") ? product.stock : 10;
    const modalContent = document.getElementById("product-modal-content");
    modalContent.innerHTML = `
        <div class="modal-img-col">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-info-col">
            <span class="product-category-name">${product.categoryName}</span>
            <h3>${product.name}</h3>
            <div class="modal-price-wrap">
                <span class="current">${formatVND(product.price)}</span>
                ${product.originalPrice ? `<span class="price-old">${formatVND(product.originalPrice)}</span>` : ''}
            </div>
            <p class="modal-desc">${product.description}</p>
            <div class="modal-specs-table">
                <div class="spec-row">
                    <span>Chất liệu:</span>
                    <span>${product.material}</span>
                </div>
                <div class="spec-row">
                    <span>Kích thước:</span>
                    <span>${product.dimensions}</span>
                </div>
                <div class="spec-row">
                    <span>Chính sách bảo hành:</span>
                    <span>24 tháng chính hãng tại nhà</span>
                </div>
                <div class="spec-row">
                    <span>Tình trạng kho:</span>
                    <span style="color: ${availableStock > 0 ? '#2b7a4b' : '#c93b2b'}; font-weight: 600;">
                        ${availableStock > 0 ? `✓ Còn ${availableStock} sản phẩm trong kho` : '✕ Tạm hết hàng'}
                    </span>
                </div>
            </div>
            <div class="modal-actions-row">
                <button type="button" class="btn-primary btn-block" onclick="addToCart(${product.id}); closeProductModal();" ${availableStock <= 0 ? 'disabled' : ''}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    ${availableStock > 0 ? 'Thêm Vào Giỏ Hàng' : 'Tạm Hết Hàng'}
                </button>
            </div>
        </div>
    `;

    document.getElementById("product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    document.getElementById("product-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 6. CHECKOUT & ĐẶT HÀNG NỘI THẤT
// =============================================================================
function openCheckout() {
    if (AppState.cart.length === 0) {
        showToast("Giỏ hàng của bạn đang trống.");
        return;
    }

    closeCart();
    updateCheckoutSummary();

    // Tự động điền thông tin nếu user đã đăng nhập
    if (AppState.user) {
        document.getElementById("checkout-name").value = AppState.user.full_name || AppState.user.username;
        document.getElementById("checkout-phone").value = AppState.user.phone || "";
        document.getElementById("checkout-address").value = AppState.user.address || "";
    }

    document.getElementById("checkout-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function updateCheckoutSummary() {
    const countEl = document.getElementById("checkout-items-count");
    const subtotalEl = document.getElementById("checkout-subtotal-amount");
    const discountRow = document.getElementById("checkout-discount-row");
    const discountAmountEl = document.getElementById("checkout-discount-amount");
    const discountLabelEl = document.getElementById("checkout-discount-label");
    const totalEl = document.getElementById("checkout-total-amount");

    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = calculateDiscount(subtotal);
    const finalTotal = Math.max(0, subtotal - discount);

    if (countEl) countEl.textContent = `${totalCount} sản phẩm`;
    if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);

    if (discountRow && discountAmountEl) {
        if (discount > 0 && AppState.appliedVoucher) {
            discountRow.style.display = "flex";
            discountAmountEl.textContent = `-${formatVND(discount)}`;
            if (discountLabelEl) discountLabelEl.textContent = `Giảm giá (${AppState.appliedVoucher.code}):`;
        } else {
            discountRow.style.display = "none";
        }
    }

    if (totalEl) totalEl.textContent = formatVND(finalTotal);
}

function closeCheckout() {
    document.getElementById("checkout-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    // 1. Kiểm tra tồn kho trước khi đặt hàng
    for (const item of AppState.cart) {
        const prod = AppState.products.find(p => p.id === item.id);
        const maxStock = prod && typeof prod.stock === "number" ? prod.stock : 10;
        if (item.quantity > maxStock) {
            showToast(`Sản phẩm "${item.name}" chỉ còn ${maxStock} cái trong kho (bạn chọn ${item.quantity}). Vui lòng điều chỉnh lại giỏ hàng!`, false);
            return;
        }
    }

    const name = document.getElementById("checkout-name").value.trim();
    const phone = document.getElementById("checkout-phone").value.trim();
    const address = document.getElementById("checkout-address").value.trim();
    const notes = document.getElementById("checkout-notes").value.trim();
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = calculateDiscount(subtotal);
    const totalAmount = Math.max(0, subtotal - discount);

    let finalOrderCode = "BLC-" + Math.floor(1000 + Math.random() * 9000);
    let createdBackendOrder = null;

    // Ghi chú kèm voucher nếu có
    const voucherNote = AppState.appliedVoucher ? ` [Voucher ${AppState.appliedVoucher.code} -${formatVND(discount)}]` : "";
    const fullNotes = (notes + voucherNote).trim();

    // 2. Đồng bộ đơn hàng lên Backend Database
    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: AppState.user ? (AppState.user.user_id || AppState.user.id || null) : null,
                customer_name: name,
                customer_phone: phone,
                shipping_address: address,
                notes: fullNotes,
                payment_method: paymentMethod,
                items: AppState.cart.map(c => ({
                    product_id: c.id,
                    product_name: c.name,
                    product_image: c.image || "",
                    price: c.price,
                    quantity: c.quantity,
                    subtotal: c.price * c.quantity
                }))
            })
        });
        if (res.ok) {
            createdBackendOrder = await res.json();
            if (createdBackendOrder && createdBackendOrder.order_code) {
                finalOrderCode = createdBackendOrder.order_code;
            }
        }
    } catch (_) {}

    // 3. Trừ tồn kho trong AppState.products và re-render
    AppState.cart.forEach(item => {
        const prod = AppState.products.find(p => p.id === item.id);
        if (prod && typeof prod.stock === "number") {
            prod.stock = Math.max(0, prod.stock - item.quantity);
        }
    });
    renderProducts();

    // 4. Lưu vào danh sách đơn cá nhân (AppState.orders)
    const newOrder = {
        id: createdBackendOrder ? createdBackendOrder.id : Date.now(),
        code: finalOrderCode,
        order_code: finalOrderCode,
        createdAt: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        customerName: name,
        phone: phone,
        address: address,
        notes: fullNotes,
        paymentMethod: paymentMethod === "cod" ? "Thanh toán COD khi nhận" : "Chuyển khoản QR",
        subtotal: subtotal,
        discount: discount,
        voucher: AppState.appliedVoucher ? AppState.appliedVoucher.code : null,
        totalAmount: totalAmount,
        status: "Đang chuẩn bị hàng",
        statusClass: "status-shipping",
        items: [...AppState.cart]
    };

    AppState.orders.unshift(newOrder);
    localStorage.setItem("blanc_orders", JSON.stringify(AppState.orders));

    // Reset giỏ hàng và voucher
    AppState.cart = [];
    saveCart();
    AppState.appliedVoucher = null;
    localStorage.removeItem("blanc_voucher");

    closeCheckout();

    // Hiển thị modal thành công với mã đơn đồng bộ
    document.getElementById("success-order-code").textContent = finalOrderCode;
    document.getElementById("success-modal-overlay").classList.add("active");
}

// =============================================================================
// 7. LỊCH SỬ ĐƠN HÀNG (ORDERS HISTORY)
// =============================================================================
function openOrderHistory() {
    const listContainer = document.getElementById("orders-list-container");
    const btnSwitchToAdmin = document.getElementById("btn-switch-to-admin-orders");
    if (btnSwitchToAdmin) {
        btnSwitchToAdmin.style.display = (AppState.user && AppState.user.role === "admin") ? "inline-flex" : "none";
    }

    if (AppState.orders.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 8px;">📦</div>
                <h4>Bạn chưa có đơn đặt hàng nào</h4>
                <p style="font-size: 0.85rem;">Các đơn hàng nội thất sau khi đặt sẽ được lưu và hiển thị tại đây.</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = AppState.orders.map(order => `
            <div class="order-card-row">
                <div class="order-card-header">
                    <div>
                        <strong>Mã đơn: ${order.code || order.order_code}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${order.createdAt}</div>
                    </div>
                    <span class="status-badge ${order.statusClass || 'status-shipping'}">${order.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 6px 0;">
                    <div><strong>Giao đến:</strong> ${order.customerName} &bull; ${order.phone}</div>
                    <div><strong>Địa chỉ:</strong> ${order.address}</div>
                    <div><strong>Thanh toán:</strong> ${order.paymentMethod}</div>
                    ${order.voucher ? `<div style="color: #059669; font-weight: 500;"><strong>Mã Voucher:</strong> ${order.voucher} (-${formatVND(order.discount || 0)})</div>` : ''}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); background: var(--bg-surface); padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                    ${order.items.map(i => `• ${i.name || i.product_name} (SL: ${i.quantity})`).join("<br>")}
                </div>
                <div style="border-top: 1px dashed var(--border-color); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem;">${order.items.reduce((sum, i) => sum + (i.quantity || 1), 0)} món đồ nội thất</span>
                    <strong style="color: var(--accent); font-size: 1.05rem;">${formatVND(order.totalAmount)}</strong>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("orders-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeOrderHistory() {
    document.getElementById("orders-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 8. ĐĂNG NHẬP / ĐĂNG KÝ (AUTH)
// =============================================================================
function openAuthModal() {
    if (AppState.user) {
        if (confirm(`Chào bạn ${AppState.user.full_name || AppState.user.username}!\n\nBạn có muốn đăng xuất tài khoản?`)) {
            AppState.user = null;
            localStorage.removeItem("blanc_user");
            updateAuthDisplay();
            renderProducts();
            showToast("Đã đăng xuất tài khoản.");
        }
        return;
    }
    document.getElementById("auth-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAuthModal() {
    document.getElementById("auth-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

function updateAuthDisplay() {
    const label = document.getElementById("auth-label");
    const btnAdminOrders = document.getElementById("btn-admin-manage-orders");
    const ordersBtnText = document.getElementById("orders-btn-text");
    const isAdmin = AppState.user && AppState.user.role === "admin";

    // "Đơn mua" luôn giữ nguyên tên cho tất cả người dùng để cả khách và admin đều có thể xem lịch sử mua cá nhân
    if (ordersBtnText) ordersBtnText.textContent = "Đơn mua";

    if (AppState.user) {
        if (isAdmin) {
            label.textContent = "Admin";
            label.style.color = "#8c6d58";
            label.style.fontWeight = "700";
            if (btnAdminOrders) btnAdminOrders.style.display = "inline-flex";
            refreshAdminPendingBadge();
        } else {
            label.textContent = AppState.user.username;
            label.style.color = "";
            label.style.fontWeight = "";
            if (btnAdminOrders) btnAdminOrders.style.display = "none";
            const hBadge = document.getElementById("header-pending-badge");
            if (hBadge) hBadge.style.display = "none";
        }
    } else {
        label.textContent = "Tài khoản";
        label.style.color = "";
        label.style.fontWeight = "";
        if (btnAdminOrders) btnAdminOrders.style.display = "none";
        const hBadge = document.getElementById("header-pending-badge");
        if (hBadge) hBadge.style.display = "none";
    }
}

// =============================================================================
// 9. TOAST THÔNG BÁO TƯƠNG TÁC
// =============================================================================
function showToast(message, isAccent = true) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${isAccent ? 'toast-accent' : ''}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// =============================================================================
// 10. HERO SLIDER LOGIC (ẢNH CHẠY Y HỆT WEB BLANC.VN)
// =============================================================================
let currentHeroSlide = 0;
let heroSliderInterval = null;

function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".slider-dot");
    const prevBtn = document.getElementById("hero-slider-prev");
    const nextBtn = document.getElementById("hero-slider-next");
    const sliderSection = document.getElementById("hero");

    if (!slides.length) return;

    function goToSlide(index) {
        if (index < 0) {
            currentHeroSlide = slides.length - 1;
        } else if (index >= slides.length) {
            currentHeroSlide = 0;
        } else {
            currentHeroSlide = index;
        }

        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === currentHeroSlide);
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === currentHeroSlide);
        });
    }

    function startAutoSlide() {
        stopAutoSlide();
        heroSliderInterval = setInterval(() => {
            goToSlide(currentHeroSlide + 1);
        }, 4000);
    }

    function stopAutoSlide() {
        if (heroSliderInterval) {
            clearInterval(heroSliderInterval);
            heroSliderInterval = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            goToSlide(currentHeroSlide - 1);
            startAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            goToSlide(currentHeroSlide + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            goToSlide(idx);
            startAutoSlide();
        });
    });

    if (sliderSection) {
        sliderSection.addEventListener("mouseenter", stopAutoSlide);
        sliderSection.addEventListener("mouseleave", startAutoSlide);
    }

    startAutoSlide();
}

function filterByRoom(category) {
    const navItems = document.querySelectorAll(".nav-item");
    AppState.currentCategory = category;
    navItems.forEach(b => {
        b.classList.toggle("active", b.dataset.category === category);
    });
    renderProducts();
    const catalog = document.getElementById("catalog");
    if (catalog) {
        catalog.scrollIntoView({ behavior: "smooth" });
    }
}

// =============================================================================
// 11. GẮN SỰ KIỆN KHỞI TẠO (EVENT LISTENERS)
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo slider & render ban đầu
    initHeroSlider();
    updateCartBadge();
    updateAuthDisplay();
    renderProducts();

    // 2. Lọc danh mục phòng trên Navigation bar
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(btn => {
        btn.addEventListener("click", () => {
            navItems.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            AppState.currentCategory = btn.dataset.category;
            renderProducts();
            document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
        });
    });

    // 3. Khám phá theo thẻ Room Showcase
    const roomCards = document.querySelectorAll(".room-card");
    roomCards.forEach(card => {
        card.addEventListener("click", () => {
            const cat = card.dataset.category;
            AppState.currentCategory = cat;
            navItems.forEach(b => {
                b.classList.toggle("active", b.dataset.category === cat);
            });
            renderProducts();
            document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
        });
    });

    // 4. Tìm kiếm từ khóa
    const searchInput = document.getElementById("input-search");
    const clearSearchBtn = document.getElementById("btn-clear-search");

    searchInput.addEventListener("input", (e) => {
        AppState.searchQuery = e.target.value;
        clearSearchBtn.style.display = e.target.value ? "block" : "none";
        renderProducts();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        AppState.searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderProducts();
    });

    // 5. Lọc mức giá & Sắp xếp
    document.getElementById("filter-price").addEventListener("change", (e) => {
        AppState.priceFilter = e.target.value;
        renderProducts();
    });

    document.getElementById("filter-sort").addEventListener("change", (e) => {
        AppState.sortOrder = e.target.value;
        renderProducts();
    });

    // 6. Reset Filters
    const resetFn = () => {
        AppState.currentCategory = "all";
        AppState.priceFilter = "all";
        AppState.searchQuery = "";
        searchInput.value = "";
        document.getElementById("filter-price").value = "all";
        navItems.forEach(b => b.classList.toggle("active", b.dataset.category === "all"));
        renderProducts();
    };

    document.getElementById("btn-reset-filters").addEventListener("click", resetFn);
    document.getElementById("btn-clear-filters").addEventListener("click", resetFn);

    // 7. Cart Drawer Toggles
    document.getElementById("btn-open-cart").addEventListener("click", openCart);
    document.getElementById("btn-close-cart").addEventListener("click", closeCart);
    document.getElementById("cart-drawer-overlay").addEventListener("click", (e) => {
        if (e.target.id === "cart-drawer-overlay") closeCart();
    });

    // 8. Product Detail Modal
    document.getElementById("btn-close-product-modal").addEventListener("click", closeProductModal);
    document.getElementById("product-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "product-modal-overlay") closeProductModal();
    });

    // 9. Checkout Triggers
    document.getElementById("btn-checkout-from-cart").addEventListener("click", openCheckout);
    document.getElementById("btn-close-checkout").addEventListener("click", closeCheckout);
    document.getElementById("checkout-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "checkout-modal-overlay") closeCheckout();
    });
    document.getElementById("form-checkout").addEventListener("submit", handleCheckoutSubmit);

    // 10. Success Modal Triggers
    document.getElementById("btn-close-success").addEventListener("click", () => {
        document.getElementById("success-modal-overlay").classList.remove("active");
        document.body.style.overflow = "";
    });
    document.getElementById("btn-view-order-history").addEventListener("click", () => {
        document.getElementById("success-modal-overlay").classList.remove("active");
        openOrderHistory();
    });

    // 11. Order History / Admin Orders Modal
    const btnOrders = document.getElementById("btn-open-orders");
    if (btnOrders) {
        btnOrders.addEventListener("click", openOrderHistory);
    }

    const btnCloseOrders = document.getElementById("btn-close-orders");
    if (btnCloseOrders) btnCloseOrders.addEventListener("click", closeOrderHistory);

    const ordersOverlay = document.getElementById("orders-modal-overlay");
    if (ordersOverlay) {
        ordersOverlay.addEventListener("click", (e) => {
            if (e.target.id === "orders-modal-overlay") closeOrderHistory();
        });
    }

    // Nút chuyển đổi giữa Lịch sử đơn mua cá nhân và Quản lý đơn showroom
    const btnSwitchToMyOrders = document.getElementById("btn-switch-to-my-orders");
    if (btnSwitchToMyOrders) {
        btnSwitchToMyOrders.addEventListener("click", () => {
            closeAdminOrdersModal();
            openOrderHistory();
        });
    }

    const btnSwitchToAdminOrders = document.getElementById("btn-switch-to-admin-orders");
    if (btnSwitchToAdminOrders) {
        btnSwitchToAdminOrders.addEventListener("click", () => {
            closeOrderHistory();
            openAdminOrdersModal();
        });
    }

    // 11.1 Admin Orders Management Listeners
    const btnAdminOrders = document.getElementById("btn-admin-manage-orders");
    if (btnAdminOrders) btnAdminOrders.addEventListener("click", openAdminOrdersModal);

    const btnCloseAdminOrders = document.getElementById("btn-close-admin-orders");
    if (btnCloseAdminOrders) btnCloseAdminOrders.addEventListener("click", closeAdminOrdersModal);

    const adminOrdersOverlay = document.getElementById("admin-orders-modal-overlay");
    if (adminOrdersOverlay) {
        adminOrdersOverlay.addEventListener("click", (e) => {
            if (e.target.id === "admin-orders-modal-overlay") closeAdminOrdersModal();
        });
    }

    const btnRefreshOrders = document.getElementById("btn-refresh-admin-orders");
    if (btnRefreshOrders) {
        btnRefreshOrders.addEventListener("click", () => fetchAdminOrders(true));
    }

    const btnCleanupOrders = document.getElementById("btn-cleanup-test-orders");
    if (btnCleanupOrders) {
        btnCleanupOrders.addEventListener("click", async () => {
            if (!confirm("Bạn có chắc chắn muốn xóa nhanh toàn bộ các đơn hàng ảo do Locust test tải sinh ra không?")) return;
            try {
                btnCleanupOrders.disabled = true;
                btnCleanupOrders.innerHTML = `<span>Đang dọn dẹp...</span>`;
                const res = await fetch(`${API_BASE}/orders/cleanup-test`, { method: "DELETE" });
                const data = await res.json();
                showToast(data.message || "Đã dọn dẹp sạch đơn test!", true);
                await fetchAdminOrders(true);
            } catch (err) {
                showToast("Lỗi khi dọn dẹp đơn hàng: " + err.message, false);
            } finally {
                btnCleanupOrders.disabled = false;
                btnCleanupOrders.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    Xóa đơn test Locust
                `;
            }
        });
    }

    const filterTabs = document.querySelectorAll(".admin-filter-tab");
    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            AppState.adminOrdersFilter = tab.dataset.filter || "all";
            renderAdminOrders();
        });
    });

    // 11.2 Voucher Form & Newsletter Listeners
    const btnApplyVoucher = document.getElementById("btn-apply-voucher");
    if (btnApplyVoucher) {
        btnApplyVoucher.addEventListener("click", () => {
            const input = document.getElementById("cart-voucher-input");
            applyVoucherCode(input ? input.value : "");
        });
    }

    const inputVoucher = document.getElementById("cart-voucher-input");
    if (inputVoucher) {
        inputVoucher.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                applyVoucherCode(inputVoucher.value);
            }
        });
    }

    const btnRemoveVoucher = document.getElementById("btn-remove-voucher");
    if (btnRemoveVoucher) {
        btnRemoveVoucher.addEventListener("click", removeVoucher);
    }

    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletter-email");
            const email = emailInput ? emailInput.value.trim() : "";
            applyVoucherCode("MAISON500", true);
            showToast(`🎉 Cảm ơn ${email || 'bạn'}! Nhận ngay voucher giảm 500.000₫ (Mã: MAISON500 - Đã tự động áp dụng vào giỏ hàng)!`);
            if (emailInput) emailInput.value = "";
        });
    }

    // 12. Auth Modal
    document.getElementById("btn-open-auth").addEventListener("click", openAuthModal);
    document.getElementById("btn-close-auth").addEventListener("click", closeAuthModal);
    document.getElementById("auth-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "auth-modal-overlay") closeAuthModal();
    });

    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-auth-login");
    const formRegister = document.getElementById("form-auth-register");

    tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formLogin.style.display = "flex";
        formRegister.style.display = "none";
    });

    tabRegister.addEventListener("click", () => {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        formLogin.style.display = "none";
        formRegister.style.display = "flex";
    });

    // Xử lý Đăng Nhập tài khoản với xác thực chuẩn xác
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("login-email").value.trim();
        const passwordInput = document.getElementById("login-password").value;
        const emailLower = emailInput.toLowerCase();

        if (!emailInput || !passwordInput) {
            showToast("Vui lòng điền đầy đủ tài khoản và mật khẩu!", false);
            return;
        }

        const isAdmin = (emailLower === "admin@maisondecor.vn" || emailLower === "admin@blanc.vn" || emailLower === "admin" || emailLower === "admin_maison");

        // 1. Kiểm tra tài khoản Quản Trị Viên (Admin)
        if (isAdmin) {
            if (passwordInput !== "admin123") {
                showToast("❌ Mật khẩu tài khoản Quản Trị Viên không chính xác!", false);
                return;
            }

            AppState.user = {
                username: "admin",
                email: emailLower.includes("@") ? emailLower : "admin@maisondecor.vn",
                full_name: "Quản Trị Viên (Admin)",
                role: "admin",
                phone: "0987 654 321",
                address: "Showroom Maison Decor"
            };
            localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
            updateAuthDisplay();
            closeAuthModal();
            renderProducts();
            showToast("Đã đăng nhập quyền QUẢN TRỊ VIÊN (Admin)!");
            return;
        }

        // 2. Thử xác thực với Backend API
        let backendUser = null;
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput, password: passwordInput })
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.user) {
                    backendUser = data.user;
                    if (data.access_token) localStorage.setItem("blanc_token", data.access_token);
                }
            } else if (res.status === 400 || res.status === 401) {
                const errJson = await res.json().catch(() => ({}));
                showToast(`❌ ${errJson.detail || "Email hoặc mật khẩu không chính xác!"}`, false);
                return;
            }
        } catch (_) {}

        if (backendUser) {
            AppState.user = backendUser;
            localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
            updateAuthDisplay();
            closeAuthModal();
            renderProducts();
            showToast(`Đăng nhập thành công! Chào mừng ${AppState.user.full_name || AppState.user.username}`);
            return;
        }

        // 3. Fallback xác thực danh sách tài khoản đã đăng ký trong local storage
        const accounts = getRegisteredAccounts();
        const found = accounts.find(a => 
            (a.email && a.email.toLowerCase() === emailLower) || 
            (a.username && a.username.toLowerCase() === emailLower)
        );

        if (!found) {
            showToast("❌ Tài khoản không tồn tại! Vui lòng bấm 'Đăng Ký Mới'.", false);
            return;
        }

        if (found.password !== passwordInput) {
            showToast("❌ Mật khẩu không chính xác! Vui lòng kiểm tra lại.", false);
            return;
        }

        AppState.user = {
            username: found.username,
            email: found.email,
            full_name: found.full_name || found.username,
            role: found.role || "customer",
            phone: found.phone || "",
            address: found.address || ""
        };
        localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
        updateAuthDisplay();
        closeAuthModal();
        renderProducts();
        showToast(`Đăng nhập thành công! Chào mừng ${AppState.user.full_name || AppState.user.username}`);
    });

    // Xử lý Đăng Ký tài khoản mới và chống đăng ký trùng lặp
    formRegister.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("reg-username").value.trim();
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const emailLower = email.toLowerCase();
        const usernameLower = username.toLowerCase();

        if (username.length < 3) {
            showToast("Tên người dùng phải có ít nhất 3 ký tự!", false);
            return;
        }
        if (password.length < 6) {
            showToast("Mật khẩu phải có ít nhất 6 ký tự!", false);
            return;
        }

        // 1. Chống đăng ký tài khoản trùng tên Admin
        if (usernameLower === "admin" || emailLower === "admin@blanc.vn" || emailLower === "admin@maisondecor.vn") {
            showToast("❌ Tên đăng nhập hoặc email này đã được sử dụng!", false);
            return;
        }

        // 2. Chống đăng ký tài khoản đã tồn tại trong local database
        const accounts = getRegisteredAccounts();
        const existed = accounts.find(a => 
            (a.email && a.email.toLowerCase() === emailLower) || 
            (a.username && a.username.toLowerCase() === usernameLower)
        );

        if (existed) {
            showToast("❌ Email hoặc tên người dùng này đã được đăng ký! Vui lòng chuyển sang 'Đăng Nhập'.", false);
            return;
        }

        // 3. Đăng ký lên Backend API
        try {
            const res = await fetch(`${API_BASE}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    full_name: name
                })
            });
            if (!res.ok && res.status === 400) {
                const errData = await res.json().catch(() => ({}));
                showToast(`❌ ${errData.detail || "Tài khoản hoặc email này đã tồn tại!"}`, false);
                return;
            }
        } catch (_) {}

        // 4. Lưu tài khoản mới vào cơ sở dữ liệu tài khoản
        const newAccount = {
            username: username,
            email: email,
            password: password,
            full_name: name,
            role: "customer",
            phone: "",
            address: ""
        };
        accounts.push(newAccount);
        localStorage.setItem("blanc_accounts", JSON.stringify(accounts));

        // 5. Đăng nhập ngay cho người dùng
        AppState.user = {
            username: username,
            email: email,
            full_name: name,
            role: "customer",
            phone: "",
            address: ""
        };
        localStorage.setItem("blanc_user", JSON.stringify(AppState.user));

        updateAuthDisplay();
        closeAuthModal();
        renderProducts();
        showToast(`🎉 Đăng ký thành công! Chào mừng ${name || username}`);
    });

    // 13. Admin Management Triggers
    const btnAdminAdd = document.getElementById("btn-admin-add-product");
    if (btnAdminAdd) btnAdminAdd.addEventListener("click", openAdminAddModal);

    const btnCloseAdmin = document.getElementById("btn-close-admin-modal");
    if (btnCloseAdmin) btnCloseAdmin.addEventListener("click", closeAdminModal);

    const btnCancelAdmin = document.getElementById("btn-cancel-admin-modal");
    if (btnCancelAdmin) btnCancelAdmin.addEventListener("click", closeAdminModal);

    const adminOverlay = document.getElementById("admin-product-modal-overlay");
    if (adminOverlay) {
        adminOverlay.addEventListener("click", (e) => {
            if (e.target.id === "admin-product-modal-overlay") closeAdminModal();
        });
    }

    const formAdmin = document.getElementById("form-admin-product");
    if (formAdmin) formAdmin.addEventListener("submit", handleAdminProductSubmit);

    const inputAdminImg = document.getElementById("admin-prod-image");
    if (inputAdminImg) {
        inputAdminImg.addEventListener("input", () => {
            const val = inputAdminImg.value.trim();
            const box = document.getElementById("admin-img-preview-box");
            const img = document.getElementById("admin-img-preview");
            if (val) {
                img.src = val;
                box.style.display = "block";
            } else {
                box.style.display = "none";
            }
        });
    }

    // Tự động đồng bộ sản phẩm từ Backend Database nếu có
    loadProductsFromBackend();
});

// =============================================================================
// 14. ADMIN SẢN PHẨM (THÊM, SỬA, XÓA MÓN HÀNG)
// =============================================================================
async function loadProductsFromBackend() {
    let rawData = null;
    try {
        let res = await fetch(`${API_BASE}/products`);
        if (!res.ok && (API_BASE === "http://localhost:8000" || API_BASE === "")) {
            try {
                const fallbackRes = await fetch("http://localhost:30080/products");
                if (fallbackRes.ok) res = fallbackRes;
            } catch (e) {}
        }
        if (res.ok) {
            rawData = await res.json();
        }
    } catch (err) {
        if (API_BASE === "http://localhost:8000") {
            try {
                const fallbackRes = await fetch("http://localhost:30080/products");
                if (fallbackRes.ok) rawData = await fallbackRes.json();
            } catch (e) {}
        }
    }

    if (rawData && Array.isArray(rawData) && rawData.length > 0) {
        const catSlugMap = {
            1: { slug: "living-room", name: "Phòng Khách" },
            2: { slug: "dining", name: "Bàn Ăn & Bếp" },
            3: { slug: "bedroom", name: "Phòng Ngủ" },
            4: { slug: "workspace", name: "Góc Làm Việc" },
            5: { slug: "decor", name: "Đèn & Decor" }
        };
        AppState.products = rawData.map(p => {
            const cInfo = catSlugMap[p.category_id] || { slug: "living-room", name: "Phòng Khách" };
            return {
                id: p.id,
                name: p.name,
                category: cInfo.slug,
                categoryId: p.category_id,
                categoryName: cInfo.name,
                price: p.price,
                originalPrice: p.original_price,
                stock: (typeof p.stock === "number") ? p.stock : (STOCK_MAP[p.id] || 10),
                material: p.material || "Gỗ tự nhiên cao cấp",
                dimensions: p.dimensions || "Tiêu chuẩn",
                rating: (typeof p.rating === "number" && !isNaN(p.rating)) ? p.rating : 5.0,
                reviewsCount: p.reviews_count || 20,
                badge: p.badge || null,
                badgeType: p.badge_type || "featured",
                image: p.image_url,
                description: p.description || ""
            };
        });
    } else if (!AppState.products || AppState.products.length === 0) {
        AppState.products = [...DEFAULT_PRODUCTS];
    }

    AppState.isLoading = false;
    renderProducts();
}

function openAdminAddModal() {
    document.getElementById("admin-modal-title").textContent = "Thêm Món Đồ Nội Thất Mới";
    document.getElementById("admin-prod-id").value = "";
    document.getElementById("admin-prod-name").value = "";
    document.getElementById("admin-prod-category").value = "1";
    document.getElementById("admin-prod-price").value = "";
    document.getElementById("admin-prod-orig-price").value = "";
    document.getElementById("admin-prod-image").value = "";
    document.getElementById("admin-img-preview-box").style.display = "none";
    document.getElementById("admin-prod-material").value = "Gỗ Sồi Bắc Mỹ tự nhiên";
    document.getElementById("admin-prod-dimensions").value = "";
    document.getElementById("admin-prod-badge").value = "";
    document.getElementById("admin-prod-badge-type").value = "featured";
    document.getElementById("admin-prod-desc").value = "";

    document.getElementById("admin-product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function openAdminEditModal(productId) {
    const item = AppState.products.find(p => p.id === productId);
    if (!item) return;

    document.getElementById("admin-modal-title").textContent = `Chỉnh Sửa: ${item.name}`;
    document.getElementById("admin-prod-id").value = item.id;
    document.getElementById("admin-prod-name").value = item.name;
    
    const catIdMap = {
        "living-room": "1",
        "dining": "2",
        "bedroom": "3",
        "workspace": "4",
        "decor": "5"
    };
    document.getElementById("admin-prod-category").value = item.categoryId || catIdMap[item.category] || "1";
    document.getElementById("admin-prod-price").value = item.price;
    document.getElementById("admin-prod-orig-price").value = item.originalPrice || "";
    document.getElementById("admin-prod-image").value = item.image;
    
    const previewBox = document.getElementById("admin-img-preview-box");
    const previewImg = document.getElementById("admin-img-preview");
    if (item.image) {
        previewImg.src = item.image;
        previewBox.style.display = "block";
    } else {
        previewBox.style.display = "none";
    }

    document.getElementById("admin-prod-material").value = item.material || "";
    document.getElementById("admin-prod-dimensions").value = item.dimensions || "";
    document.getElementById("admin-prod-badge").value = item.badge || "";
    document.getElementById("admin-prod-badge-type").value = item.badgeType || "featured";
    document.getElementById("admin-prod-desc").value = item.description || "";

    document.getElementById("admin-product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAdminModal() {
    document.getElementById("admin-product-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

async function handleAdminProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("admin-prod-id").value;
    const name = document.getElementById("admin-prod-name").value.trim();
    const categoryId = parseInt(document.getElementById("admin-prod-category").value, 10);
    const price = parseFloat(document.getElementById("admin-prod-price").value);
    const origPriceVal = document.getElementById("admin-prod-orig-price").value;
    const originalPrice = origPriceVal ? parseFloat(origPriceVal) : null;
    const image = document.getElementById("admin-prod-image").value.trim();
    const material = document.getElementById("admin-prod-material").value.trim() || "Gỗ tự nhiên cao cấp";
    const dimensions = document.getElementById("admin-prod-dimensions").value.trim() || "Tiêu chuẩn";
    const badge = document.getElementById("admin-prod-badge").value.trim() || null;
    const badgeType = document.getElementById("admin-prod-badge-type").value;
    const description = document.getElementById("admin-prod-desc").value.trim();

    const catSlugMap = {
        1: { slug: "living-room", name: "Phòng Khách" },
        2: { slug: "dining", name: "Bàn Ăn & Bếp" },
        3: { slug: "bedroom", name: "Phòng Ngủ" },
        4: { slug: "workspace", name: "Góc Làm Việc" },
        5: { slug: "decor", name: "Đèn & Decor" }
    };
    const catInfo = catSlugMap[categoryId] || { slug: "living-room", name: "Phòng Khách" };

    const payload = {
        name: name,
        category_id: categoryId,
        price: price,
        original_price: originalPrice,
        image_url: image,
        material: material,
        dimensions: dimensions,
        badge: badge,
        badge_type: badgeType,
        description: description,
        stock: 10,
        rating: 5.0,
        reviews_count: 20,
        is_featured: badge === "Best Seller" || badge === "Đặc Tuyển"
    };

    if (id) {
        // Cập nhật sản phẩm
        const prodId = parseInt(id, 10);
        try {
            await fetch(`${API_BASE}/products/${prodId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Demo": "true"
                },
                body: JSON.stringify(payload)
            });
        } catch (_) {}

        const idx = AppState.products.findIndex(p => p.id === prodId);
        if (idx > -1) {
            AppState.products[idx] = {
                ...AppState.products[idx],
                name: name,
                category: catInfo.slug,
                categoryId: categoryId,
                categoryName: catInfo.name,
                price: price,
                originalPrice: originalPrice,
                image: image,
                material: material,
                dimensions: dimensions,
                badge: badge,
                badgeType: badgeType,
                description: description
            };
        }
        showToast(`Đã cập nhật sản phẩm "${name}" thành công!`);
    } else {
        // Thêm sản phẩm mới
        let newId = Date.now();
        try {
            const res = await fetch(`${API_BASE}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Demo": "true"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const created = await res.json();
                if (created && created.id) newId = created.id;
            }
        } catch (_) {}

        const newItem = {
            id: newId,
            name: name,
            category: catInfo.slug,
            categoryId: categoryId,
            categoryName: catInfo.name,
            price: price,
            originalPrice: originalPrice,
            image: image,
            material: material,
            dimensions: dimensions,
            rating: 5.0,
            reviewsCount: 1,
            badge: badge,
            badgeType: badgeType,
            description: description
        };
        AppState.products.unshift(newItem);
        showToast(`Đã thêm món "${name}" vào Showroom!`);
    }

    closeAdminModal();
    renderProducts();
}

async function handleAdminDeleteProduct(productId) {
    const item = AppState.products.find(p => p.id === productId);
    const itemName = item ? item.name : `ID #${productId}`;

    if (!confirm(`XÁC NHẬN TỪ ADMIN:\n\nBạn có chắc chắn muốn xóa sản phẩm:\n"${itemName}" khỏi danh sách Showroom?`)) {
        return;
    }

    try {
        await fetch(`${API_BASE}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "X-Admin-Demo": "true"
            }
        });
    } catch (_) {}

    AppState.products = AppState.products.filter(p => p.id !== productId);
    renderProducts();
    showToast(`Đã xóa món "${itemName}" khỏi Showroom.`);
}

// =============================================================================
// 15. ADMIN QUẢN LÝ ĐƠN HÀNG (DUYỆT ĐƠN, ĐIỀU PHỐI, CẬP NHẬT TRẠNG THÁI)
// =============================================================================
async function fetchAdminOrders(showNotice = false) {
    try {
        const res = await fetch(`${API_BASE}/orders?limit=100`);
        if (res.ok) {
            const data = await res.json();
            AppState.adminOrders = data || [];
        } else {
            // Fallback lấy từ local nếu backend không phản hồi
            AppState.adminOrders = [...AppState.orders];
        }
    } catch (_) {
        AppState.adminOrders = [...AppState.orders];
    }

    renderAdminOrders();
    refreshAdminPendingBadge();

    if (showNotice) {
        showToast("Đã đồng bộ danh sách đơn hàng mới nhất!");
    }
}

function refreshAdminPendingBadge() {
    if (!AppState.user || AppState.user.role !== "admin") return;

    // Đếm số đơn chờ duyệt
    const list = AppState.adminOrders.length > 0 ? AppState.adminOrders : AppState.orders;
    const pendingCount = list.filter(o => {
        const st = (o.status || "").toLowerCase();
        return st.includes("chuẩn bị") || st.includes("chờ") || st.includes("pending");
    }).length;

    const countPill = document.getElementById("admin-pending-count");
    if (countPill) {
        countPill.textContent = pendingCount;
        countPill.style.display = pendingCount > 0 ? "inline-block" : "none";
    }

    const headerBadge = document.getElementById("header-pending-badge");
    if (headerBadge) {
        headerBadge.textContent = pendingCount;
        headerBadge.style.display = pendingCount > 0 ? "inline-block" : "none";
    }
}

function openAdminOrdersModal() {
    if (!AppState.user || AppState.user.role !== "admin") {
        openAuthModal();
        return;
    }

    document.getElementById("admin-orders-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
    fetchAdminOrders();
}

function closeAdminOrdersModal() {
    document.getElementById("admin-orders-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

function renderAdminOrders() {
    const listContainer = document.getElementById("admin-orders-list-container");
    if (!listContainer) return;

    const orders = AppState.adminOrders.length > 0 ? AppState.adminOrders : AppState.orders;

    // 1. Thống kê
    const totalOrders = orders.length;
    let pendingCount = 0;
    let shippingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    orders.forEach(o => {
        const st = (o.status || "").toLowerCase();
        const amt = o.total_amount || o.totalAmount || 0;
        
        if (st.includes("hủy") || st.includes("cancel")) {
            cancelledCount++;
        } else if (st.includes("hoàn thành") || st.includes("completed") || st.includes("bàn giao") || st.includes("thành công")) {
            completedCount++;
            totalRevenue += amt; // Chỉ cộng doanh thu khi đơn hàng giao thành công / hoàn thành
        } else if (st.includes("chuẩn bị") || st.includes("chờ") || st.includes("pending")) {
            pendingCount++;
        } else {
            shippingCount++;
        }
    });

    const elTotal = document.getElementById("stat-total-orders");
    const elPending = document.getElementById("stat-pending-orders");
    const elShipping = document.getElementById("stat-shipping-orders");
    const elRevenue = document.getElementById("stat-total-revenue");

    if (elTotal) elTotal.textContent = totalOrders;
    if (elPending) elPending.textContent = pendingCount;
    if (elShipping) elShipping.textContent = shippingCount;
    if (elRevenue) elRevenue.textContent = formatVND(totalRevenue);

    // Cập nhật số lượng trên các tab lọc
    const tabAll = document.getElementById("count-tab-all");
    const tabPend = document.getElementById("count-tab-pending");
    const tabAppr = document.getElementById("count-tab-approved");
    const tabComp = document.getElementById("count-tab-completed");
    const tabCanc = document.getElementById("count-tab-cancelled");
    if (tabAll) tabAll.textContent = totalOrders;
    if (tabPend) tabPend.textContent = pendingCount;
    if (tabAppr) tabAppr.textContent = shippingCount;
    if (tabComp) tabComp.textContent = completedCount;
    if (tabCanc) tabCanc.textContent = cancelledCount;

    // 2. Lọc theo tab hiện tại
    const filter = AppState.adminOrdersFilter || "all";
    const filtered = orders.filter(o => {
        const st = (o.status || "").toLowerCase();
        if (filter === "pending") return st.includes("chuẩn bị") || st.includes("chờ") || st.includes("pending");
        if (filter === "approved") return st.includes("duyệt") || st.includes("giao") || st.includes("shipping");
        if (filter === "completed") return st.includes("hoàn thành") || st.includes("completed");
        if (filter === "cancelled") return st.includes("hủy") || st.includes("cancel");
        return true;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                <div style="font-size: 2.8rem; margin-bottom: 8px;">📋</div>
                <h4>Không có đơn hàng nào trong mục này</h4>
                <p style="font-size: 0.85rem;">Các đơn đặt hàng mới từ khách sẽ tự động hiển thị ở đây.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map(order => {
        const orderId = order.id || order.order_id || order.code;
        const code = order.order_code || order.code || `BLC-${orderId}`;
        const name = order.customer_name || order.customerName || "Khách hàng";
        const phone = order.customer_phone || order.phone || "Chưa có SĐT";
        const address = order.shipping_address || order.address || "Showroom";
        const notes = order.notes || "";
        const payment = order.payment_method || order.paymentMethod || "cod";
        const paymentLabel = (payment === "cod" || payment === "Thanh toán COD khi nhận") 
            ? "Thanh toán khi nhận hàng (COD)" 
            : "Chuyển khoản QR ngân hàng";
        const total = order.total_amount || order.totalAmount || 0;
        const status = order.status || "Đang chuẩn bị hàng";
        const items = order.items || [];

        // Xác định class màu trạng thái
        const stLower = status.toLowerCase();
        let badgeClass = "status-pending";
        if (stLower.includes("hủy") || stLower.includes("cancel")) {
            badgeClass = "status-cancelled";
        } else if (stLower.includes("hoàn thành") || stLower.includes("completed")) {
            badgeClass = "status-completed";
        } else if (stLower.includes("duyệt") || stLower.includes("giao") || stLower.includes("shipping")) {
            badgeClass = "status-approved";
        }

        const isPending = stLower.includes("chuẩn bị") || stLower.includes("chờ") || stLower.includes("pending");
        const isApprovedOrShipping = (stLower.includes("duyệt") || stLower.includes("giao")) && !stLower.includes("hoàn thành") && !stLower.includes("hủy");
        const isCompleted = stLower.includes("hoàn thành");
        const isCancelled = stLower.includes("hủy");

        const timeStr = order.created_at 
            ? new Date(order.created_at).toLocaleString('vi-VN') 
            : (order.createdAt || "Vừa xong");

        return `
            <div class="admin-order-card" data-order-id="${orderId}">
                <div class="admin-order-header">
                    <div>
                        <strong style="display: block; margin-bottom: 2px;">Mã Đơn: ${code}</strong>
                        <span class="order-time">⏰ Thời gian đặt: ${timeStr}</span>
                    </div>
                    <span class="status-badge ${badgeClass}">${status}</span>
                </div>

                <div class="admin-customer-info">
                    <div>
                        <div><strong>Khách hàng:</strong> ${name}</div>
                        <div><strong>Điện thoại:</strong> <a href="tel:${phone}" style="color: var(--accent); font-weight: 600;">${phone}</a></div>
                        <div><strong>Thanh toán:</strong> ${paymentLabel}</div>
                    </div>
                    <div>
                        <div><strong>Địa chỉ giao:</strong> ${address}</div>
                        ${notes ? `<div><strong>Ghi chú:</strong> <em style="color: var(--text-muted);">${notes}</em></div>` : ''}
                    </div>
                </div>

                <div class="admin-order-items-list">
                    <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 4px;">Chi tiết món đồ (${items.length} sản phẩm):</div>
                    ${items.map(it => `
                        <div class="admin-order-item-row">
                            <span>🛋️ ${it.product_name || it.name} &times; <strong>${it.quantity}</strong></span>
                            <span style="font-weight: 600;">${formatVND(it.subtotal || (it.price * it.quantity))}</span>
                        </div>
                    `).join("")}
                </div>

                <div class="admin-order-footer">
                    <div>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">Tổng thanh toán: </span>
                        <strong style="color: var(--accent); font-size: 1.25rem;">${formatVND(total)}</strong>
                    </div>

                    <div class="admin-order-actions">
                        ${isPending ? `
                            <button type="button" class="btn-order-approve" onclick="handleUpdateOrderStatus('${orderId}', 'Đã duyệt - Đang chuẩn bị giao', '${code}')" title="Xác nhận duyệt đơn và gửi tác vụ đến Worker service">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                Duyệt Đơn Hàng
                            </button>
                            <button type="button" class="btn-order-cancel" onclick="handleUpdateOrderStatus('${orderId}', 'Đã hủy đơn', '${code}')" title="Hủy đơn hàng">
                                ✕ Hủy đơn
                            </button>
                        ` : ''}

                        ${isApprovedOrShipping ? `
                            <button type="button" class="btn-order-ship" onclick="handleUpdateOrderStatus('${orderId}', 'Đang giao hàng tận nhà', '${code}')" title="Chuyển sang trạng thái đang giao">
                                🚚 Đang Giao Hàng
                            </button>
                            <button type="button" class="btn-order-complete" onclick="handleUpdateOrderStatus('${orderId}', 'Hoàn thành & Đã bàn giao', '${code}')" title="Xác nhận khách đã nhận đồ nội thất">
                                ✓ Hoàn Thành
                            </button>
                            <button type="button" class="btn-order-cancel" onclick="handleUpdateOrderStatus('${orderId}', 'Đã hủy đơn', '${code}')">
                                ✕ Hủy đơn
                            </button>
                        ` : ''}

                        ${isCompleted ? `
                            <span style="font-size: 0.85rem; color: #166534; font-weight: 600;">✓ Đơn hàng đã bàn giao thành công</span>
                        ` : ''}

                        ${isCancelled ? `
                            <span style="font-size: 0.85rem; color: #991b1b; font-weight: 600;">✕ Đơn hàng đã bị hủy</span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

async function handleUpdateOrderStatus(orderId, newStatus, orderCode = "") {
    const dispCode = orderCode || `#${orderId}`;
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Admin-Demo": "true"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            const updated = await res.json();
            // Cập nhật trong AppState.adminOrders
            const idx = AppState.adminOrders.findIndex(o => (o.id == orderId || o.order_code == orderId));
            if (idx > -1) {
                AppState.adminOrders[idx].status = updated.status;
            }
        }
    } catch (_) {}

    // Cập nhật trong mảng adminOrders và local orders
    AppState.adminOrders = AppState.adminOrders.map(o => {
        if (o.id == orderId || o.order_code == orderId || o.code == orderId) {
            return { ...o, status: newStatus };
        }
        return o;
    });

    AppState.orders = AppState.orders.map(o => {
        if (o.id == orderId || o.order_code == orderId || o.code == orderId) {
            return { ...o, status: newStatus };
        }
        return o;
    });
    localStorage.setItem("blanc_orders", JSON.stringify(AppState.orders));

    renderAdminOrders();
    refreshAdminPendingBadge();
    showToast(`Đã duyệt đơn ${dispCode}: "${newStatus}"! Worker đang xử lý ngầm qua Redis.`);
}

// Global exposure
window.openAdminAddModal = openAdminAddModal;
window.openAdminEditModal = openAdminEditModal;
window.handleAdminDeleteProduct = handleAdminDeleteProduct;
window.closeAdminModal = closeAdminModal;
window.openAdminOrdersModal = openAdminOrdersModal;
window.closeAdminOrdersModal = closeAdminOrdersModal;
window.handleUpdateOrderStatus = handleUpdateOrderStatus;
window.fetchAdminOrders = fetchAdminOrders;


