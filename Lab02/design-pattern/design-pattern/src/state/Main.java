package state;

public class Main {
    /**
     * 1. Tạo một hệ thống quản lý đơn hàng có các trạng thái như: Mới tạo, Đang xử lý, Đã giao, và Hủy.
     * Mỗi trạng thái sẽ có các hành vi khác nhau. Ví dụ:
     * 	Mới tạo: Kiểm tra thông tin đơn hàng.
     * 	Đang xử lý: Đóng gói và vận chuyển.
     * 	Đã giao: Cập nhật trạng thái đơn hàng là đã giao.
     * 	Hủy: Hủy đơn hàng và hoàn tiền.
     * 	Hãy dùng các Design Pattern: State, Strategy, Decorator viết bằng Java để xử lý mô phỏng trường hợp trên và đưa ra kết luận.
     */
    public static void main(String[] args) {
        Order order = new Order();
        System.out.println(order.getInformation());
        order.process();
        order.process();
        order.process();
    }
}
