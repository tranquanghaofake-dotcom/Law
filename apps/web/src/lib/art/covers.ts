// Bìa riêng từng môn (kế hoạch đợt 5 §1): mỗi môn đối chiếu với một cuốn sách thật — văn bản luật in của NXB Chính trị
// quốc gia Sự thật hoặc giáo trình trường luật — và vẽ CÁCH ĐIỆU theo bố cục + bảng màu của bìa đó (không sao chép
// nguyên mẫu; không Quốc huy, không logo trường, không tên/logo nhà xuất bản). Tên in trên bìa là tên cuốn sách; tên môn
// vẫn hiển thị trong DOM dưới bìa. Năm chỉ in khi khảo sát ghi rõ và độ tin cậy cao.
// Khảo sát: ảnh + màu đo bằng PIL (03/11/2026); màu ảnh chụp đã chỉnh bằng mắt và chỉnh cho chữ tên ≥ 4,5:1 với thân.
import { coverParts, fitTitle } from '$lib/ui/bookCover';
import { coverStyle } from '$lib/ui/shelves';

/**
 * Khuôn bìa:
 * - `st-moi`: sách luật NXB Sự thật bản mới — khối trên đỏ, nhãn kem bo góc có hoa văn cuộn vàng, thân màu riêng.
 * - `st-cu`: sách luật NXB Sự thật bản cũ — khối trên vàng nhạt, ruy băng cam-đỏ mép gấp đè ranh giới, thân màu riêng.
 * - `hien-phap`: Hiến pháp — cả bìa đỏ rượu, không nhãn, chữ vàng kim.
 * - `giao-trinh-hlu`: giáo trình ĐH Luật Hà Nội — khối trên nhạt ghi tên trường, dải "GIÁO TRÌNH" (đoạn vàng + đoạn màu), thân màu.
 * - `giao-trinh-ulaw`: giáo trình ĐH Luật TP.HCM — cả bìa xanh than, tên trường ở đầu, khung màu chứa tên sách.
 */
export type CoverKind = 'st-moi' | 'st-cu' | 'hien-phap' | 'giao-trinh-hlu' | 'giao-trinh-ulaw';

export type CoverSpec = {
  kind: CoverKind;
  /** Chữ trên nhãn/ruy băng: "BỘ LUẬT" | "LUẬT" | "GIÁO TRÌNH" | "" (Hiến pháp). */
  label: string;
  /** Tên in trên bìa, đã ngắt dòng, in hoa. */
  title: string[];
  /** Dòng phụ dưới tên: "(HIỆN HÀNH)", "TẬP II"… (Hiến pháp: dòng nhỏ giữa hai dòng tên). */
  subtitle?: string;
  palette: {
    top: string; topTo?: string;
    /** Màu nhãn/ruy băng/dải; labelTo: màu giữa của ruy băng (khuôn st-cu). */
    label: string; labelTo?: string; labelText: string;
    body: string; bodyTo?: string;
    title: string;
    /** Chữ trên khối trên (tên trường ở giáo trình). */
    topText?: string;
  };
  /** Hoạ tiết nền thân: lưới chấm (giáo trình Dân sự II), vòng mờ (giáo trình Lịch sử). */
  pattern?: 'luoi-cham' | 'vong-mo';
  source: { book: string; publisher: string; year?: string; url: string; note?: string };
};

const ST = 'NXB Chính trị quốc gia Sự thật';
const ST_TOP = '#FBF5A0', ST_TOP_TO = '#F4EA72'; // khối trên vàng nhạt bản cũ
const RIB = '#D2452A', RIB_TO = '#F4B744', RIB_TEXT = '#22307F'; // ruy băng cam-đỏ hai đầu, giữa vàng cam; chữ xanh than
const NEW_TOP = '#D42B2B', CREAM = '#F7E7B5', SEAL_RED = '#C8102E'; // bản mới: khối trên đỏ, nhãn kem
const HLU_RED = '#E0302A';

export const COVERS: Record<string, CoverSpec> = {
  'ly-luan-nn-pl': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['LÍ LUẬN CHUNG', 'VỀ NHÀ NƯỚC', 'VÀ PHÁP LUẬT'],
    palette: { top: '#8EDBF7', topTo: '#6CCAF0', label: HLU_RED, labelText: '#FFFFFF', body: '#1B1A78', title: '#FFFFFF', topText: '#1B1A78' },
    source: { book: 'Giáo trình Lí luận chung về nhà nước và pháp luật', publisher: 'Trường ĐH Luật Hà Nội', url: 'https://luatminhkhue.vn/giao-trinh-li-luan-chung-ve-nha-nuoc-va-phap-luat-truong-dai-hoc-luat-ha-noi.aspx', note: 'ảnh nhỏ, màu ước lượng' },
  },
  'lich-su-nn-pl': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['LỊCH SỬ', 'NHÀ NƯỚC', 'VÀ PHÁP LUẬT', 'VIỆT NAM'], pattern: 'vong-mo',
    palette: { top: '#B7DDEE', topTo: '#9CCBE2', label: HLU_RED, labelText: '#FFFFFF', body: '#535C8E', bodyTo: '#474F80', title: '#FFFFFF', topText: '#2E3A6E' },
    source: { book: 'Giáo trình Lịch sử nhà nước và pháp luật Việt Nam', publisher: 'Trường ĐH Luật Hà Nội, NXB Công an nhân dân', url: 'https://luatminhkhue.vn/giao-trinh-lich-su-nha-nuoc-va-phap-luat-viet-nam-truong-dai-hoc-luat-ha-noi.aspx' },
  },
  'hien-phap': {
    kind: 'hien-phap', label: '', title: ['HIẾN PHÁP', 'VIỆT NAM'], subtitle: 'NƯỚC CỘNG HÒA XÃ HỘI CHỦ NGHĨA',
    palette: { top: '#95303A', label: '#F1E38C', labelText: '#8C2430', body: '#8A2430', title: '#F1E38C' },
    source: { book: 'Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam', publisher: ST, url: 'https://www.nxbctqg.org.vn/hien-phap-nuoc-cong-hoa-xa-hoi-chu-nghia-viet-nam-64.html' },
  },
  'hanh-chinh': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['LUẬT', 'HÀNH CHÍNH', 'VIỆT NAM'],
    palette: { top: '#A6DEF8', topTo: '#84CDF0', label: HLU_RED, labelText: '#FFFFFF', body: '#2D5597', bodyTo: '#24477F', title: '#FFFFFF', topText: '#1F3F7A' },
    source: { book: 'Giáo trình Luật Hành chính Việt Nam', publisher: 'Trường ĐH Luật Hà Nội, NXB Công an nhân dân', url: 'https://luatminhkhue.vn/giao-trinh-luat-hanh-chinh-viet-nam-truong-dai-hoc-luat-ha-noi.aspx' },
  },
  'xay-dung-vbpl': {
    kind: 'st-moi', label: 'LUẬT', title: ['BAN HÀNH', 'VĂN BẢN', 'QUY PHẠM', 'PHÁP LUẬT'],
    palette: { top: NEW_TOP, label: CREAM, labelText: SEAL_RED, body: '#5C2D93', title: '#FFFFFF' },
    source: { book: 'Luật Ban hành văn bản quy phạm pháp luật (sửa đổi, bổ sung năm 2025)', publisher: ST, year: '2025', url: 'https://nhanvan.vn/products/luat-ban-hanh-van-ban-quy-pham-phap-luat-sua-doi-bo-sung-nam-2025' },
  },
  'dan-su': {
    kind: 'st-moi', label: 'BỘ LUẬT', title: ['DÂN SỰ'], subtitle: '(HIỆN HÀNH)',
    palette: { top: NEW_TOP, label: CREAM, labelText: SEAL_RED, body: '#B23A16', bodyTo: '#B8461A', title: '#FFF27A' },
    source: { book: 'Bộ luật Dân sự (hiện hành)', publisher: ST, url: 'https://www.nxbctqg.org.vn/bo-luat-dan-su-hien-hanh--85.html', note: 'bản mới theo ảnh Hào gửi: khối trên đỏ, thân cam-đỏ; thân sẫm hơn bìa thật để chữ vàng đủ tương phản' },
  },
  'hon-nhan-gia-dinh': {
    kind: 'st-cu', label: 'LUẬT', title: ['HÔN NHÂN', 'VÀ GIA ĐÌNH'], subtitle: '(HIỆN HÀNH)',
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#8E1F4F', title: '#FFF27A' },
    source: { book: 'Luật Hôn nhân và gia đình (hiện hành)', publisher: ST, url: 'https://www.nxbctqg.org.vn/luat-hon-nhan-va-gia-dinh-hien-hanh--96.html', note: 'chưa đối chiếu màu với ảnh bìa thật; dùng khuôn sách luật hiện hành của NXB' },
  },
  'to-tung-hanh-chinh': {
    kind: 'st-cu', label: 'LUẬT', title: ['TỐ TỤNG', 'HÀNH CHÍNH'], subtitle: '(HIỆN HÀNH)',
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#2F5566', title: '#FBF16B' },
    source: { book: 'Luật Tố tụng hành chính (hiện hành)', publisher: ST, url: 'https://thuvienphapluat.vn/van-ban/Vi-pham-hanh-chinh/Van-ban-hop-nhat-13-VBHN-VPQH-2026-Luat-To-tung-hanh-chinh-696357.aspx', note: 'bìa dựng theo khuôn sách luật hiện hành của NXB; chưa đối chiếu ảnh bìa thật, url là nguồn chữ' },
  },
  'dan-su-2': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['LUẬT DÂN SỰ', 'VIỆT NAM'], subtitle: 'TẬP II', pattern: 'luoi-cham',
    palette: { top: '#DDF6E4', topTo: '#C2ECCF', label: '#0F7A37', labelText: '#FFE45C', body: '#0B7A2C', bodyTo: '#086A26', title: '#FFFFFF', topText: '#0B4F22' },
    source: { book: 'Giáo trình Luật Dân sự Việt Nam, tập II', publisher: 'Trường ĐH Luật Hà Nội, NXB Tư pháp', url: 'https://sachgiaotrinh.com/giao-trinh-luat-dan-su-viet-nam-tap-2-dai-hoc-luat-ha-noi-2/' },
  },
  'to-tung-dan-su': {
    kind: 'st-cu', label: 'BỘ LUẬT', title: ['TỐ TỤNG', 'DÂN SỰ'], subtitle: '(HIỆN HÀNH)',
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#6E6040', title: '#FBF16B' },
    source: { book: 'Bộ luật Tố tụng dân sự (hiện hành) (sửa đổi, bổ sung năm 2019, 2020, 2022, 2023)', publisher: ST, url: 'https://nxbctqg.org.vn/bo-luat-to-tung-dan-su-hien-hanh-sua-doi-bo-sung-nam-2019-2020-2022-2023-.html' },
  },
  'hinh-su': {
    kind: 'st-moi', label: 'BỘ LUẬT', title: ['HÌNH SỰ'], subtitle: '(HIỆN HÀNH)',
    palette: { top: NEW_TOP, label: CREAM, labelText: SEAL_RED, body: '#57575B', title: '#F6D35B' },
    source: { book: 'Bộ luật Hình sự (hiện hành)', publisher: ST, url: 'https://nxbctqg.org.vn/bo-luat-hinh-su-hien-hanh-bo-luat-nam-2015-sua-doi-bo-sung-nam-2017--22.html', note: 'bản mới theo ảnh Hào gửi: khối trên đỏ, thân xám, chữ vàng' },
  },
  'thuong-mai-1': {
    kind: 'st-cu', label: 'LUẬT', title: ['DOANH NGHIỆP', 'NĂM 2020'],
    palette: { top: '#FFFC92', topTo: '#F8F070', label: '#B01E18', labelTo: '#D8402A', labelText: '#FDE03F', body: '#1653AE', bodyTo: '#0B2E9E', title: '#FDE03F' },
    source: { book: 'Luật Doanh nghiệp năm 2020 (sửa đổi, bổ sung năm 2022)', publisher: ST, year: '2020', url: 'https://tiki.vn/luat-doanh-nghiep-hien-hanh-sua-doi-bo-sung-nam-2022-p277485165.html' },
  },
  'thuong-mai': {
    kind: 'st-cu', label: 'LUẬT', title: ['THƯƠNG MẠI'], subtitle: '(HIỆN HÀNH)',
    palette: { top: '#2DB2C6', topTo: '#1E9CB4', label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#8FD0EA', bodyTo: '#7CC6E4', title: '#8A1014' },
    source: { book: 'Luật Thương mại (hiện hành) (sửa đổi, bổ sung năm 2017, 2019)', publisher: ST, url: 'https://www.nxbctqg.org.vn/luat-thuong-mai-hien-hanh-sua-doi-bo-sung-nam-2017-2019--52.html', note: 'chữ tên đỏ sẫm hơn bìa thật để đủ tương phản trên nền xanh nhạt' },
  },
  'canh-tranh': {
    kind: 'st-cu', label: 'LUẬT', title: ['CẠNH TRANH'], subtitle: '(HIỆN HÀNH)',
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: '#E8892E', labelTo: '#F6C24A', labelText: RIB_TEXT, body: '#C42126', title: '#FFFFFF' },
    source: { book: 'Luật Cạnh tranh (hiện hành)', publisher: ST, url: 'https://www.nxbctqg.org.vn/luat-canh-tranh-hien-hanh--89.html' },
  },
  'dau-tu': {
    kind: 'st-cu', label: 'LUẬT', title: ['ĐẦU TƯ'],
    palette: { top: '#E3F0B4', topTo: '#D2E596', label: '#B01E18', labelTo: '#D8402A', labelText: '#F2D45C', body: '#5F4694', bodyTo: '#523C86', title: '#F2D45C' },
    source: { book: 'Luật Đầu tư năm 2020 (sửa đổi, bổ sung năm 2020, 2022, 2023, 2024)', publisher: ST, url: 'https://binhbanbook.com/san-pham/luat-dau-tu-nam-2020-sua-doi-bo-sung-nam-2020-2022-2023-2024-nxb-chinh-tri-quoc-gia-su-that/', note: 'ảnh chụp, màu chỉnh bằng mắt; không in năm vì độ tin cậy trung bình' },
  },
  'dat-dai': {
    kind: 'st-cu', label: 'LUẬT', title: ['ĐẤT ĐAI'],
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#A0520E', title: '#FBF271' },
    source: { book: 'Luật Đất đai', publisher: ST, url: 'https://www.nxbctqg.org.vn/luat-dat-dai-47.html' },
  },
  'chung-khoan': {
    kind: 'st-cu', label: 'LUẬT', title: ['CHỨNG KHOÁN'],
    palette: { top: '#F8F870', topTo: '#EEEE52', label: '#B5703A', labelTo: '#D99A55', labelText: '#1C2E66', body: '#1C3572', bodyTo: '#1A2D62', title: '#E8E65C' },
    source: { book: 'Luật Chứng khoán', publisher: ST, url: 'https://nxbctqg.org.vn/luat-chung-khoan.html' },
  },
  'tai-chinh': {
    kind: 'st-moi', label: 'LUẬT', title: ['NGÂN SÁCH', 'NHÀ NƯỚC'],
    palette: { top: NEW_TOP, label: CREAM, labelText: SEAL_RED, body: '#8C3A08', title: '#FBEE77' },
    source: { book: 'Luật Ngân sách nhà nước năm 2025', publisher: ST, year: '2025', url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mdm4mvkml0a41e', note: 'ảnh nhà sách Sách Luật Online (Shopee); không in năm vì độ tin cậy trung bình' },
  },
  'ngan-hang': {
    kind: 'st-cu', label: 'LUẬT', title: ['CÁC TỔ CHỨC', 'TÍN DỤNG'],
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: '#C45C31', labelTo: '#F0B04A', labelText: RIB_TEXT, body: '#9B1E24', bodyTo: '#86171D', title: '#F9F172' },
    source: { book: 'Luật Các tổ chức tín dụng năm 2024 (sửa đổi, bổ sung năm 2024, 2025)', publisher: ST, year: '2024', url: 'https://www.fahasa.com/luat-cac-to-chuc-tin-dung-534954.html' },
  },
  'tai-chinh-doanh-nghiep': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['PHÁP LUẬT', 'TÀI CHÍNH', 'DOANH NGHIỆP'],
    palette: { top: '#D8EFE9', topTo: '#BCE2D8', label: '#C8261E', labelText: '#FFFFFF', body: '#145F5B', bodyTo: '#0F504D', title: '#FFFFFF', topText: '#0F4A47' },
    source: { book: 'Đề cương chi tiết học phần Pháp luật tài chính doanh nghiệp (lưu hành nội bộ)', publisher: 'Trường ĐH Luật Hà Nội, Khoa Pháp luật Kinh tế', year: '2021', url: 'https://www.scribd.com/document/545218991/PL-Tai-chinh-doanh-nghiep-2TC', note: 'cách điệu, không có sách in tương ứng — vẽ theo khuôn giáo trình ĐH Luật Hà Nội với màu riêng' },
  },
  'lao-dong': {
    kind: 'st-cu', label: 'BỘ LUẬT', title: ['LAO ĐỘNG'],
    palette: { top: '#EAF7B2', topTo: '#DCEE90', label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#45422F', bodyTo: '#3A3828', title: '#C6DA5A' },
    source: { book: 'Bộ luật Lao động', publisher: ST, url: 'https://www.nxbctqg.org.vn/bo-luat-lao-dong.html', note: 'ảnh chụp/scan, màu thân chỉnh bằng mắt' },
  },
  'lao-dong-2': {
    kind: 'giao-trinh-hlu', label: 'GIÁO TRÌNH', title: ['LUẬT LAO ĐỘNG', 'VIỆT NAM'],
    palette: { top: '#FBF6C8', topTo: '#F3EAA6', label: '#C8261E', labelText: '#F6D35B', body: '#B4502F', bodyTo: '#A4462A', title: '#FFFFFF', topText: '#6E2A16' },
    source: { book: 'Giáo trình Luật Lao động Việt Nam', publisher: 'Trường ĐH Luật Hà Nội', url: 'https://hocluat.vn/download-ebook-giao-trinh-luat-lao-dong-viet-nam-dai-hoc-luat-ha-noi/', note: 'ảnh mockup nghiêng, màu chỉnh bằng mắt' },
  },
  'an-sinh-xa-hoi': {
    kind: 'st-cu', label: 'LUẬT', title: ['BẢO HIỂM', 'XÃ HỘI'], subtitle: 'NĂM 2024',
    palette: { top: '#FCF188', topTo: '#F4E464', label: RIB, labelTo: RIB_TO, labelText: RIB_TEXT, body: '#933917', title: '#FEEC8C' },
    source: { book: 'Luật Bảo hiểm xã hội năm 2024', publisher: ST, year: '2024', url: 'https://www.nxbctqg.org.vn/luat-bao-hiem-xa-hoi-nam-2024.html', note: 'không có sách "Luật An sinh xã hội"; dùng Luật Bảo hiểm xã hội — trụ cột của an sinh xã hội' },
  },
  'so-huu-tri-tue': {
    kind: 'st-cu', label: 'LUẬT', title: ['SỞ HỮU', 'TRÍ TUỆ'], subtitle: '(HIỆN HÀNH)',
    palette: { top: ST_TOP, topTo: ST_TOP_TO, label: '#D37649', labelTo: '#F2B44C', labelText: RIB_TEXT, body: '#8E2489', title: '#FDF07A' },
    source: { book: 'Luật Sở hữu trí tuệ (hiện hành) (sửa đổi, bổ sung năm 2009, 2019, 2022)', publisher: ST, url: 'https://www.nxbctqg.org.vn/luat-so-huu-tri-tue-hien-hanh-sua-doi-bo-sung-nam-2009-2019-2022-.html' },
  },
  'tai-san-tri-tue': {
    kind: 'giao-trinh-ulaw', label: 'GIÁO TRÌNH', title: ['LUẬT SỞ HỮU', 'TRÍ TUỆ'],
    palette: { top: '#17306F', label: '#2B5E4C', labelText: '#F7FDF8', body: '#0B2468', title: '#F7FDF8', topText: '#F7FDF8' },
    source: { book: 'Giáo trình Luật Sở hữu trí tuệ (Trường ĐH Luật TP. Hồ Chí Minh)', publisher: 'Trường ĐH Luật TP. Hồ Chí Minh, NXB Công an nhân dân', url: 'https://salt.tikicdn.com/cache/750x750/ts/product/14/7e/f0/6418c2d382d5078db02e29b3ee141360.jpg', note: 'chưa lấy được bìa giáo trình Quản trị tài sản trí tuệ (ĐH Luật Hà Nội); dùng giáo trình Luật SHTT của ĐH Luật TP.HCM' },
  },
};

/** Cỡ chữ tên theo khuôn (fitLines): bề ngang vùng chữ, chiều cao tối đa của khối tên. */
export const COVER_FIT: Record<CoverKind, { maxWidth: number; maxSize: number; minSize: number; charW: number; maxHeight: number }> = {
  'st-moi': { maxWidth: 102, maxSize: 17, minSize: 10, charW: 0.7, maxHeight: 52 },
  'st-cu': { maxWidth: 102, maxSize: 17, minSize: 10, charW: 0.7, maxHeight: 56 },
  'hien-phap': { maxWidth: 102, maxSize: 18, minSize: 10, charW: 0.7, maxHeight: 48 },
  'giao-trinh-hlu': { maxWidth: 102, maxSize: 16, minSize: 10, charW: 0.7, maxHeight: 58 },
  'giao-trinh-ulaw': { maxWidth: 86, maxSize: 15, minSize: 10, charW: 0.7, maxHeight: 34 },
};

/** Bìa của môn; môn chưa có trong bảng → khuôn "st-moi" với nhãn GIÁO TRÌNH, thân màu kệ, tên tự co chữ. */
export function coverFor(id: string | undefined, title: string, shelfColor: string): CoverSpec {
  const known = id ? COVERS[id] : undefined;
  if (known) return known;
  const { name, num } = coverParts(title);
  const fit = COVER_FIT['st-moi'];
  return {
    kind: 'st-moi', label: 'GIÁO TRÌNH',
    title: fitTitle(name, { maxWidth: fit.maxWidth, maxLines: 3, maxSize: fit.maxSize, minSize: fit.minSize, charW: fit.charW, maxHeight: fit.maxHeight }).lines,
    subtitle: num ? `(HỌC PHẦN ${num})` : undefined,
    palette: { top: NEW_TOP, label: CREAM, labelText: SEAL_RED, body: shelfColor, title: coverStyle(shelfColor).ink },
    source: { book: title, publisher: 'Luyện Luật', url: 'https://tranquanghaofake-dotcom.github.io/Law/', note: 'môn chưa đối chiếu sách — khuôn mặc định' },
  };
}
