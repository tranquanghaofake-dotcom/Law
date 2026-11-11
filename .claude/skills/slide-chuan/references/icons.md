# Icon hay dùng

## Bộ icon có sẵn và giấy phép (theo danh mục react-icons 5.x, kiểm 11/2026)
| Tiền tố | Bộ | Giấy phép | Ghi nguồn? | Kiểu | Dùng khi |
|---|---|---|---|---|---|
| `Pi…Duotone` | Phosphor | MIT | Không | hai tông — **ưu tiên** | mọi chỗ (cards, flow, panelrows…) |
| `Lu…` | Lucide (~1.500) | ISC | Không | nét mảnh 2px | thiếu hình trong Phosphor; giao diện tối giản |
| `Tb…` | Tabler (~6.100) | MIT | Không | nét mảnh | kho lớn nhất: ngành nghề, y tế, tài chính, giao thông |
| `Fa…` | Font Awesome 6 Free | **CC BY 4.0** | **Có** | khối đặc | chỉ khi ba bộ trên không có; build in danh sách để ghi nguồn |
Không dùng: Simple Icons (logo thương hiệu — CC0 nhưng là nhãn hiệu của người khác), Game Icons (CC BY 3.0, phong cách game).
Engine vẽ MỌI icon trong vòng tròn theo một kiểu (nền tròn nhạt + icon màu nhấn), kể cả icon nét mảnh hay khối đặc — không lệch phong cách trong một slide.
Tìm tên: `node -e "console.log(Object.keys(require('react-icons/tb')).filter(k=>/bank|coin/i.test(k)).slice(0,20))"` (thay `tb` bằng `lu`, `pi`).

**Ưu tiên Phosphor Duotone** (`react-icons/pi`, MIT): hai tông màu, chi tiết hơn — engine vẽ trên nền tròn nhạt cùng màu. Tên fa6 được **tự đổi** sang bản Duotone (theo bảng, hoặc tự tìm `Pi<Tên>Duotone` cùng tên — FaGlobe → PiGlobeDuotone) để mọi icon trong slide cùng một kiểu; dấu ✓ ✗ ? › giữ nét fa6. Bảng đổi cùng nghĩa (FaHouse → PiHouseDuotone, FaBuildingColumns → PiBankDuotone, FaScaleBalanced → PiScalesDuotone...). Có thể ghi thẳng tên Pi:
- Pháp lý: PiScalesDuotone, PiGavelDuotone, PiBankDuotone, PiStampDuotone, PiSealCheckDuotone, PiCertificateDuotone, PiFileTextDuotone, PiBookOpenTextDuotone
- Người / tài sản / tiền: PiUserDuotone, PiUsersDuotone, PiHandshakeDuotone, PiHouseDuotone, PiMapPinDuotone, PiMapPinAreaDuotone, PiHandCoinsDuotone, PiMoneyDuotone, PiCoinsDuotone, PiPiggyBankDuotone
- Trạng thái / thời gian: PiWarningDuotone, PiSealWarningDuotone, PiCheckCircleDuotone, PiCalendarDuotone, PiCalendarXDuotone, PiClockDuotone, PiLightbulbDuotone
Tìm thêm: `node -e "console.log(Object.keys(require('react-icons/pi')).filter(k=>/Duotone$/.test(k)&&/house|bank/i.test(k)))"`

**Icon phải có nghĩa**: chọn icon nói đúng vai/đối tượng (ngân hàng → PiBankDuotone, không dùng ngôi sao "cho đẹp"). Cùng một đối tượng thì cùng một icon trong cả deck.

## react-icons/fa6 (vẫn dùng được)

Dùng cho `icon` của `cards.items[]`, `panelrows`, `closing.lessons[]` và `meta.chromeIcon`. Tên phân biệt hoa/thường; tên sai thì build dừng với lỗi nêu số slide và gợi ý tên gần giống. Mọi tên dưới đây đã kiểm có trong bản cài.
Lưu ý: bản cũ (fa5) như `FaBalanceScale` không có — dùng `FaScaleBalanced`.

- Pháp lý: FaScaleBalanced, FaScaleUnbalanced, FaGavel, FaBuildingColumns, FaLandmark, FaFileContract, FaFileSignature, FaFileLines, FaStamp, FaScroll, FaIdCard, FaBook, FaBookOpen
- Người / quan hệ: FaUser, FaUsers, FaUserTie, FaUserShield, FaPeopleArrows, FaHandshake
- Tài sản / tiền: FaHouse, FaHouseChimney, FaBuilding, FaKey, FaLock, FaShieldHalved, FaHandHoldingDollar, FaMoneyBill, FaCoins, FaCreditCard, FaFileInvoiceDollar, FaCar, FaBriefcase
- Trạng thái: FaCheck, FaXmark, FaQuestion, FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaCircleInfo, FaLightbulb
- Thời gian / dữ liệu: FaClock, FaCalendarDays, FaChartLine, FaChartPie, FaMagnifyingGlass, FaGlobe, FaEarthAsia
- Khác: FaPen, FaLink, FaCodeBranch, FaQuoteLeft, FaChevronRight, FaArrowRight

Tìm thêm: `node -e "console.log(Object.keys(require('react-icons/fa6')).filter(k=>/gavel|scale/i.test(k)))"`

## Bộ icon khác đã kiểm giấy phép (11/2026) — chưa có trong react-icons của skill
| Bộ | Giấy phép | Ghi chú thực hành |
|---|---|---|
| Iconoir | MIT — không bắt ghi nguồn | Nét mảnh, hợp theme `son` |
| Material Symbols (Google) | Apache 2.0 — không bắt ghi nguồn | Có trong react-icons (`Md…`) nếu cần |
| Remix Icon | **Đổi giấy phép từ 01/2026**: "Remix Icon License v1.0" (trước là Apache 2.0) — cấm dùng làm logo/nhận diện thương hiệu, cấm đóng gói thành bộ icon cạnh tranh | Dùng trong slide được; không dùng làm logo nhóm/CLB |
| OpenMoji | CC BY-SA 4.0 — **phải ghi nguồn và chia sẻ tương tự** | Emoji — skill không dùng ký tự trang trí, nên tránh |
