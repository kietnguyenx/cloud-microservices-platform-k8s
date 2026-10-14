import os
import logging
from typing import List
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, UserModelDB, CategoryModelDB, ProductModelDB

logger = logging.getLogger("uvicorn.error")

# =============================================================================
# 1. CẤU HÌNH BIẾN MÔI TRƯỜNG (SETTINGS)
# =============================================================================
env_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
env_vars = {}
if os.path.exists(env_file_path):
    with open(env_file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                env_vars[key.strip()] = val.strip()


class Settings:
    POSTGRES_URL: str = os.getenv("POSTGRES_URL", os.getenv("DATABASE_URL", env_vars.get("POSTGRES_URL", "sqlite:///./furniture.db")))
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", env_vars.get("JWT_SECRET_KEY", "super-secret-jwt-key-for-furniture-api-development"))
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", env_vars.get("JWT_ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", env_vars.get("ACCESS_TOKEN_EXPIRE_MINUTES", "4320")))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", env_vars.get("CORS_ORIGINS", "*"))
    HOST: str = os.getenv("HOST", env_vars.get("HOST", "0.0.0.0"))
    PORT: int = int(os.getenv("PORT", env_vars.get("PORT", "8000")))

    @property
    def cors_origins(self) -> List[str]:
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()

# =============================================================================
# 2. KHỞI TẠO SQLALCHEMY ENGINE & SESSION
# =============================================================================
is_sqlite = settings.POSTGRES_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        settings.POSTGRES_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        settings.POSTGRES_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency cung cấp session database cho FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Tạo các bảng cơ sở dữ liệu nếu chưa tồn tại."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize database tables: {e}")


# =============================================================================
# 3. DỮ LIỆU BAN ĐẦU (SEED DATA ĐẦY ĐỦ 24 SẢN PHẨM NỘI THẤT)
# =============================================================================
CATEGORIES_DATA = [
    {"id": 1, "slug": "living-room", "name": "Phòng Khách", "description": "Không gian sinh hoạt chung tinh tế, ấm cúng"},
    {"id": 2, "slug": "dining", "name": "Bàn Ăn & Bếp", "description": "Bàn ghế ăn gỗ tự nhiên cho bữa cơm gia đình sum vầy"},
    {"id": 3, "slug": "bedroom", "name": "Phòng Ngủ", "description": "Giường và tủ đầu giường phong cách Zen tối giản"},
    {"id": 4, "slug": "workspace", "name": "Góc Làm Việc", "description": "Bàn ghế công thái học truyền cảm hứng sáng tạo"},
    {"id": 5, "slug": "decor", "name": "Đèn & Decor", "description": "Đèn thả, thảm dệt và gương decor nghệ thuật"}
]

DEMO_PRODUCTS_DATA = [
    {
        "id": 1,
        "name": "Sofa Modular Blanc Soft L-Shape",
        "slug": "sofa-modular-blanc-soft-l-shape",
        "category_id": 1,
        "price": 16800000,
        "original_price": 19500000,
        "material": "Vải Nỉ Bỉ nhập khẩu & Gỗ Sồi tự nhiên",
        "dimensions": "260 x 165 x 78 cm",
        "rating": 5.0,
        "reviews_count": 38,
        "badge": "Best Seller",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
        "description": "Mẫu sofa góc chữ L mang phong cách Scandinavian hiện đại với thiết kế module linh hoạt, nệm mút bọt biển đàn hồi cao cấp êm ái tuyệt đối, khung gỗ sồi Bắc Mỹ đạt chuẩn kháng ẩm."
    },
    {
        "id": 2,
        "name": "Ghế Thư Giãn Lounge Armchair Nappa",
        "slug": "ghe-thu-gian-lounge-armchair-nappa",
        "category_id": 1,
        "price": 7900000,
        "original_price": 9200000,
        "material": "Da bò Nappa cao cấp & Chân thép mạ Titan",
        "dimensions": "85 x 82 x 90 cm",
        "rating": 4.9,
        "reviews_count": 24,
        "badge": "Ưu Đãi -15%",
        "badge_type": "discount",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
        "description": "Điểm nhấn sang trọng cho góc phòng khách hoặc phòng đọc sách. Độ ngả lưng khoa học nâng đỡ cột sống, bề mặt da mềm mịn thoáng khí."
    },
    {
        "id": 3,
        "name": "Bàn Trà Tròn Kép Đôi Nordic Minimalist",
        "slug": "ban-tra-tron-kep-doi-nordic-minimalist",
        "category_id": 1,
        "price": 4500000,
        "original_price": 5200000,
        "material": "Mặt đá cẩm thạch trắng & Gỗ Tần Bì",
        "dimensions": "Bàn lớn D75cm, Bàn nhỏ D50cm",
        "rating": 4.8,
        "reviews_count": 19,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
        "description": "Bộ đôi bàn trà lồng thông minh tiết kiệm diện tích. Mặt đá phiến chống trầy xước, chịu nhiệt độ cao kết hợp vân gỗ mộc tinh tế."
    },
    {
        "id": 4,
        "name": "Bàn Ăn Gỗ Sồi Tự Nhiên OAK Atelier",
        "slug": "ban-an-go-soi-tu-nhien-oak-atelier",
        "category_id": 2,
        "price": 13500000,
        "original_price": 15500000,
        "material": "Gỗ Sồi Trắng Bắc Mỹ nguyên khối (FSC)",
        "dimensions": "180 x 85 x 75 cm (6-8 người)",
        "rating": 5.0,
        "reviews_count": 42,
        "badge": "Đặc Tuyển",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
        "description": "Chiếc bàn ăn trung tâm cho những bữa cơm sum vầy ấm cúng. Sơn phủ dầu lau thực vật an toàn thực phẩm, giữ trọn vẹn vân gỗ mộc tự nhiên."
    },
    {
        "id": 5,
        "name": "Set 4 Ghế Ăn Bọc Nệm Da Nordic Chair",
        "slug": "set-4-ghe-an-boc-nem-da-nordic-chair",
        "category_id": 2,
        "price": 5800000,
        "original_price": 6800000,
        "material": "Khung gỗ Tần Bì & Đệm da PU chống nước",
        "dimensions": "48 x 52 x 82 cm",
        "rating": 4.9,
        "reviews_count": 31,
        "badge": "Hot Deal",
        "badge_type": "discount",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế lưng cong ôm sát cơ thể, mang lại cảm giác thoải mái khi dùng bữa. Dễ dàng vệ sinh lau chùi hàng ngày."
    },
    {
        "id": 6,
        "name": "Giường Ngủ Nệm Bọc Nỉ Minimalist Zen",
        "slug": "giuong-ngu-nem-boc-ni-minimalist-zen",
        "category_id": 3,
        "price": 15200000,
        "original_price": 17800000,
        "material": "Khung thép chịu lực, gỗ Sồi & Nỉ dệt thô",
        "dimensions": "180 x 200 cm (King Size)",
        "rating": 5.0,
        "reviews_count": 29,
        "badge": "Yêu Thích",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
        "description": "Mang phong cách Zen Nhật Bản kết hợp Scandinavian. Đầu giường êm ái làm điểm tựa đọc sách, khung thang giát giường chắc chắn không phát tiếng cọt kẹt."
    },
    {
        "id": 7,
        "name": "Tủ Đầu Giường 2 Ngăn Kéo Japandi Oak",
        "slug": "tu-dau-giuong-2-ngan-keo-japandi-oak",
        "category_id": 3,
        "price": 2450000,
        "original_price": 2900000,
        "material": "Gỗ Sồi tự nhiên & Ray trượt giảm chấn",
        "dimensions": "45 x 40 x 50 cm",
        "rating": 4.8,
        "reviews_count": 16,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế nhỏ gọn, đường bo góc mềm mại hạn chế va đập. Ngăn kéo đóng mở êm ái chống ồn cho không gian nghỉ ngơi yên tĩnh."
    },
    {
        "id": 8,
        "name": "Bàn Làm Việc Studio Desk Gỗ Tự Nhiên",
        "slug": "ban-lam-viec-studio-desk-go-tu-nhien",
        "category_id": 4,
        "price": 6800000,
        "original_price": 7900000,
        "material": "Mặt gỗ Sồi tự nhiên & Chân thép sơn tĩnh điện",
        "dimensions": "140 x 70 x 75 cm",
        "rating": 4.9,
        "reviews_count": 35,
        "badge": "Best Seller",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80",
        "description": "Bàn làm việc tối giản tích hợp khe luồn dây cáp thông minh. Rộng rãi đủ cho 2 màn hình lớn, bề mặt mịn màng truyền cảm hứng sáng tạo."
    },
    {
        "id": 9,
        "name": "Ghế Làm Việc Ergonomic Thư Giãn",
        "slug": "ghe-lam-viec-ergonomic-thu-gian",
        "category_id": 4,
        "price": 4900000,
        "original_price": 5600000,
        "material": "Lưới thoáng khí Wintex & Piston Class 4",
        "dimensions": "Tiêu chuẩn điều chỉnh linh hoạt",
        "rating": 4.8,
        "reviews_count": 52,
        "badge": "Hot",
        "badge_type": "discount",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=800&q=80",
        "description": "Hỗ trợ đỡ thắt lưng linh hoạt giúp giảm đau mỏi khi ngồi làm việc lâu. Tay vịn 3D đa hướng, chân xoay hợp kim nhôm chịu tải 150kg."
    },
    {
        "id": 10,
        "name": "Đèn Cây Đứng Phòng Khách Nordic Floor Lamp",
        "slug": "den-cay-dung-phong-khach-nordic-floor-lamp",
        "category_id": 5,
        "price": 1850000,
        "original_price": 2200000,
        "material": "Kim loại mạ đồng mờ & Chao đèn vải lanh",
        "dimensions": "Đường kính 35cm, Cao 155cm",
        "rating": 4.9,
        "reviews_count": 22,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        "description": "Ánh sáng vàng ấm 3000K êm dịu tạo cảm giác thư thái cho không gian sống ban đêm. Công tắc bàn đạp chân tiện lợi."
    },
    {
        "id": 11,
        "name": "Thảm Trải Sàn Dệt Thủ Công Bắc Âu Moroc",
        "slug": "tham-trai-san-det-thu-cong-bac-au-moroc",
        "category_id": 5,
        "price": 3200000,
        "original_price": 3800000,
        "material": "Sợi len tổng hợp mật độ cao, êm ái",
        "dimensions": "160 x 230 cm",
        "rating": 4.7,
        "reviews_count": 14,
        "badge": None,
        "badge_type": None,
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80",
        "description": "Họa tiết hình học trừu tượng tinh tế tôn lên vẻ đẹp của bộ sofa và sàn gỗ. Không rụng sợi, chống trơn trượt hiệu quả."
    },
    {
        "id": 12,
        "name": "Gương Đứng Toàn Thân Vòm Tròn Arch Mirror",
        "slug": "guong-dung-toan-than-vom-tron-arch-mirror",
        "category_id": 5,
        "price": 2600000,
        "original_price": 3100000,
        "material": "Phôi gương Bỉ tráng bạc 8 lớp & Khung gỗ",
        "dimensions": "60 x 170 cm",
        "rating": 5.0,
        "reviews_count": 40,
        "badge": "Best Seller",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        "description": "Gương soi sáng trong trẻo, chân thực không méo hình. Thiết kế mái vòm cong mềm mại mở rộng thị giác cho căn phòng."
    },
    {
        "id": 13,
        "name": "Kệ Tivi Gỗ Sồi Bắc Âu Minimalist Console",
        "slug": "ke-tivi-go-soi-bac-au-minimalist-console",
        "category_id": 1,
        "price": 8500000,
        "original_price": 9900000,
        "material": "Gỗ Sồi Trắng tự nhiên & Phụ kiện ray Blum giảm chấn",
        "dimensions": "180 x 42 x 48 cm",
        "rating": 4.9,
        "reviews_count": 27,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế thanh thoát với 2 cánh lùa nan gỗ thông thoáng tản nhiệt cho thiết bị âm thanh. Tinh tế đến từng góc vát 45 độ."
    },
    {
        "id": 14,
        "name": "Ghế Đôn Tròn Bọc Nỉ Boucle Cao Cấp",
        "slug": "ghe-don-tron-boc-ni-boucle-cao-cap",
        "category_id": 1,
        "price": 1850000,
        "original_price": 2300000,
        "material": "Vải lông cừu Boucle mềm mại & Đế gỗ tần bì",
        "dimensions": "Đường kính 40cm, Cao 45cm",
        "rating": 4.8,
        "reviews_count": 33,
        "badge": "Hot",
        "badge_type": "discount",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        "description": "Chiếc đôn nhỏ xinh xắn vừa làm ghế phụ tiếp khách, vừa làm bàn trà hoặc góc decor sống ảo siêu ấm cúng."
    },
    {
        "id": 15,
        "name": "Bàn Ăn Tròn Gỗ Sồi Mở Rộng Extension Table",
        "slug": "ban-an-tron-go-soi-mo-rong-extension-table",
        "category_id": 2,
        "price": 14800000,
        "original_price": 17000000,
        "material": "Gỗ Sồi tự nhiên & Khung trượt hợp kim cao cấp",
        "dimensions": "D110cm (mở rộng 155cm) x Cao 75cm",
        "rating": 5.0,
        "reviews_count": 18,
        "badge": "Thông Minh",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
        "description": "Bình thường là bàn tròn ấm cúng 4 người, khi có khách kéo dài thành bàn bầu dục 6-8 người cực kỳ tiện lợi và mượt mà."
    },
    {
        "id": 16,
        "name": "Tủ Quần Áo 3 Cánh Scandi Minimalist Wardrobe",
        "slug": "tu-quan-ao-3-canh-scandi-minimalist-wardrobe",
        "category_id": 3,
        "price": 18200000,
        "original_price": 21000000,
        "material": "Gỗ Tần Bì phủ veneer sồi cao cấp & Bản lề hơi",
        "dimensions": "160 x 60 x 210 cm",
        "rating": 4.9,
        "reviews_count": 21,
        "badge": "Đặc Tuyển",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
        "description": "Không gian lưu trữ khoa học với khoang treo áo dài, ngăn gấp đồ và ngăn kéo có khóa an toàn. Vân gỗ sáng màu mở rộng không gian phòng ngủ."
    },
    {
        "id": 17,
        "name": "Kệ Sách Đứng 5 Tầng Minimalist Bookshelf",
        "slug": "ke-sach-dung-5-tang-minimalist-bookshelf",
        "category_id": 4,
        "price": 5400000,
        "original_price": 6200000,
        "material": "Khung thép sơn tĩnh điện & Đợt gỗ Sồi tự nhiên",
        "dimensions": "80 x 32 x 185 cm",
        "rating": 4.8,
        "reviews_count": 29,
        "badge": None,
        "badge_type": None,
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80",
        "description": "Thiết kế hở 2 mặt thoáng đãng, vừa làm giá sách, vừa làm vách ngăn nhẹ phân chia không gian sống tinh tế."
    },
    {
        "id": 18,
        "name": "Đèn Thả Trần Thủy Tinh Khói Amber Pendant",
        "slug": "den-tha-tran-thuy-tinh-khoi-amber-pendant",
        "category_id": 5,
        "price": 2150000,
        "original_price": 2600000,
        "material": "Thủy tinh màu hổ phách thổi thủ công & Đui đồng thau",
        "dimensions": "Đường kính 28cm x Dây thả tùy chỉnh 120cm",
        "rating": 4.9,
        "reviews_count": 36,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
        "description": "Thả trên bàn ăn hoặc đảo bếp, ánh sáng qua lớp thủy tinh khói vàng ấm đem lại bầu không khí lãng mạn như nhà hàng cao cấp."
    },
    {
        "id": 19,
        "name": "Bàn Làm Việc Nâng Hạ Chiều Cao Smart Standing Desk",
        "slug": "ban-lam-viec-nang-ha-chieu-cao-smart-standing-desk",
        "category_id": 4,
        "price": 9200000,
        "original_price": 10800000,
        "material": "Mặt gỗ Sồi tự nhiên & Động cơ Dual Motor nâng hạ êm ái",
        "dimensions": "150 x 75 x 65-125 cm (tùy chỉnh điện)",
        "rating": 5.0,
        "reviews_count": 46,
        "badge": "Công Nghệ",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80",
        "description": "Bàn nâng hạ thông minh bảo vệ cột sống, tích hợp bộ nhớ 4 vị trí nhớ độ cao và cảm biến chống va chạm an toàn."
    },
    {
        "id": 20,
        "name": "Tủ Rượu & Kệ Ly Gỗ Sồi Scandi Bar Cabinet",
        "slug": "tu-ruou-ke-ly-go-soi-scandi-bar-cabinet",
        "category_id": 2,
        "price": 11500000,
        "original_price": 13200000,
        "material": "Gỗ Sồi tự nhiên, kính gợn sóng Fluted Glass & Đèn LED âm",
        "dimensions": "90 x 42 x 135 cm",
        "rating": 4.9,
        "reviews_count": 23,
        "badge": "Mới",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=800&q=80",
        "description": "Tủ rượu sang trọng với giá treo ly ngược, khay để rượu nghiêng chuẩn và cánh kính sọc mờ tạo hiệu ứng thị giác huyền ảo."
    },
    {
        "id": 21,
        "name": "Ghế Bập Bênh Thư Giãn Rocking Lounge Chair",
        "slug": "ghe-bap-benh-thu-gian-rocking-lounge-chair",
        "category_id": 1,
        "price": 6200000,
        "original_price": 7100000,
        "material": "Khung gỗ Uốn cong Thụy Điển & Nỉ lông cừu Boucle",
        "dimensions": "78 x 92 x 88 cm",
        "rating": 4.8,
        "reviews_count": 34,
        "badge": "Yêu Thích",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
        "description": "Góc thư giãn lý tưởng để đọc sách, ru em bé hoặc nhâm nhi tách trà. Bập bênh êm ái với góc nghiêng an toàn tối đa."
    },
    {
        "id": 22,
        "name": "Bàn Trang Điểm Kèm Gương Tròn LED Scandi Vanity",
        "slug": "ban-trang-diem-kem-guong-tron-led-scandi-vanity",
        "category_id": 3,
        "price": 7600000,
        "original_price": 8900000,
        "material": "Gỗ Sồi Trắng & Gương cảm ứng 3 chế độ sáng",
        "dimensions": "100 x 45 x 128 cm",
        "rating": 4.9,
        "reviews_count": 41,
        "badge": "Bán Chạy",
        "badge_type": "featured",
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80",
        "description": "Bộ bàn phấn thanh lịch với gương LED cảm ứng ánh sáng tự nhiên. Các ngăn chia mỹ phẩm nhung mềm bảo vệ đồ trang sức."
    },
    {
        "id": 23,
        "name": "Set 2 Ghế Bar Gỗ Sồi Tự Nhiên Nordic Barstool",
        "slug": "set-2-ghe-bar-go-soi-tu-nhien-nordic-barstool",
        "category_id": 2,
        "price": 3900000,
        "original_price": 4600000,
        "material": "Gỗ Sồi Bắc Mỹ nguyên khối & Nệm da bò êm ái",
        "dimensions": "42 x 42 x 75 cm (chiều cao ngồi)",
        "rating": 4.7,
        "reviews_count": 19,
        "badge": "Hot Deal",
        "badge_type": "discount",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80",
        "description": "Dành riêng cho đảo bếp hoặc quầy bar gia đình. Chân ghế gỗ sồi vững chãi kết hợp chỗ để chân bọc đồng chống trầy."
    },
    {
        "id": 24,
        "name": "Kệ Giày Dép & Ghế Ngồi Thay Giày Entryway Bench",
        "slug": "ke-giay-dep-ghe-ngoi-thay-giay-entryway-bench",
        "category_id": 5,
        "price": 2850000,
        "original_price": 3400000,
        "material": "Gỗ Sồi tự nhiên & Đệm ngồi tháo rời giặt được",
        "dimensions": "90 x 35 x 48 cm",
        "rating": 4.9,
        "reviews_count": 58,
        "badge": "Tiện Ích",
        "badge_type": "new",
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
        "description": "Món đồ không thể thiếu tại sảnh đón. Vừa là ghế êm ái ngồi xỏ giày, vừa chứa được 8-10 đôi giày dép gọn gàng ngăn nắp."
    }
]


def seed_initial_data(db: Session):
    """Tự động nạp tài khoản admin và danh mục, toàn bộ 24 sản phẩm mẫu vào database."""
    from auth import auth_handler
    try:
        # 1. Admin mặc định
        admin_user = db.query(UserModelDB).filter(UserModelDB.email == "admin@blanc.vn").first()
        if not admin_user:
            admin_user = UserModelDB(
                username="admin",
                email="admin@blanc.vn",
                password_hash=auth_handler.get_password_hash("admin123"),
                full_name="Quản Trị Viên Blanc",
                phone="0987 654 321",
                address="Showroom Blanc Luxury",
                role="admin"
            )
            db.add(admin_user)
            db.commit()
            logger.info("Admin account seeded: admin@blanc.vn / admin123")

        # 2. Danh mục mẫu (5 không gian phòng)
        if db.query(CategoryModelDB).count() == 0:
            for cat in CATEGORIES_DATA:
                db.add(CategoryModelDB(**cat))
            db.commit()
            logger.info("Default categories seeded (5 categories).")

        # 3. Sản phẩm mẫu (Chỉ nạp khi cơ sở dữ liệu ban đầu hoàn toàn trống)
        if db.query(ProductModelDB).count() == 0:
            for prod in DEMO_PRODUCTS_DATA:
                db.add(ProductModelDB(**prod))
            db.commit()
            logger.info(f"Sample luxury furniture products seeded ({len(DEMO_PRODUCTS_DATA)} items).")

    except Exception as e:
        db.rollback()
        logger.warning(f"Error seeding initial data: {e}")
