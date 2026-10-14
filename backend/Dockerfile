FROM python:3.10-slim

#Thiết lập thư mục làm việc trong container
WORKDIR /app

#Ngăn Python tạo file .pyc và bật unbuffured log
ENV PYTHONDONTWRITEBYTECODE=1 
ENV PYTHONUNBUFFERED=1

#Sao chép file requirements và cài đặt thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#Sao chép toàn bộ mã nguồn vào thư mục /app
COPY . .

EXPOSE 8000

#Lệnh khởi chạy FastAPI với Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
