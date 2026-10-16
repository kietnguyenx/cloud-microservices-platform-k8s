#Sử dụng base image Nginx bản rút gọn (Alpine)
FROM nginx:alpine

#Xóa cấu hình mặc định sẵn có của nginx
RUN rm /etc/nginx/conf.d/default.conf

#Sao chép file cấu hình nginx.conf tự viết vào container
COPY nginx.conf /etc/nginx/conf.d/default.conf

#Sao chép toàn bộ mã nguồn giao diện (HTML, CSS, JS) vào thư mục web server
COPY . /usr/share/nginx/html/

#Lệnh khởi chạy Nginx ở chế độ tiền cảnh (foreground)
CMD ["nginx","-g","daemon off;"]
