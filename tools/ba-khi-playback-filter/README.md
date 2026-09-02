# Ba Khi Playback Filter (tùy chọn)

Đây là extension Chromium Manifest V3 thử nghiệm, dùng `declarativeNetRequest` để chặn một số host quảng cáo/analytics đã quan sát trong các player bên thứ ba, đồng thời **không chặn host VidLink hoặc các request media**.

## Cài thử

1. Mở `chrome://extensions` hoặc `edge://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục này.
5. Mở lại trang Ba Khí và kiểm tra player.

## Phạm vi và giới hạn

Extension này chỉ là bộ lọc thử nghiệm cho trình duyệt Chromium của người cài. Nó không được nhúng vào website và không tự bảo vệ khách truy cập chưa cài extension. Bộ lọc chỉ chặn các host đã biết (`mc.yandex.ru`, `googletagmanager.com`, `tagivi.com`, `llvpn.com`); provider có thể đổi domain hoặc gộp quảng cáo với hạ tầng stream, khi đó không thể đảm bảo chặn sạch mà không làm hỏng phát video.

Không dùng extension này để vượt DRM, paywall, đăng nhập, geo-block, anti-hotlinking hoặc giới hạn cấp phép. Chỉ sử dụng với nội dung và nguồn phát mà bạn có quyền sử dụng.

## Kết quả test

Đã test bằng Chromium headless với iframe `https://vidlink.pro/movie/603`: hình ảnh/video tải và phát sau khi bật rules. Đây là kiểm thử tương thích, không phải bảo đảm rằng mọi quảng cáo của provider đều bị loại bỏ.
