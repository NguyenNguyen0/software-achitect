package singleton;

public class Main {
    /**
     * Bài 1 – Singleton Pattern
     * 📌 Quản lý kết nối Database
     *     Mô tả bài toán
     *
     *     Trong hệ thống e-commerce mini:
     *
     *     Chỉ được phép tồn tại 1 kết nối Database duy nhất
     *
     *     Mọi service (User, Product, Order) đều dùng chung kết nối này
     *
     *     Yêu cầu
     *
     *     Tạo class DatabaseConnection
     *
     * Đảm bảo:
     *
     *     Không thể tạo nhiều instance từ bên ngoài
     *
     *     Mọi lần gọi đều trả về cùng 1 instance
     */

    public static void main(String[] args) {
        DatabaseConnection connection1 = DatabaseConnection.getInstance();
        DatabaseConnection connection2 = DatabaseConnection.getInstance();

        System.out.println("Connection1: " + connection1);
        System.out.println("Connection2: " + connection2);
    }
}
