package factory_method;

public class Main {
    /**
     *📌 Tạo đối tượng Thanh toán (Payment)
     * Mô tả bài toán
     *
     * Hệ thống hỗ trợ nhiều hình thức thanh toán:
     *
     * COD, Credit Card, Momo
     *
     * Mỗi hình thức có cách xử lý khác nhau.
     *
     * Yêu cầu
     *
     * Tạo interface Payment
     *
     * method: pay(amount)
     *
     * Các class:
     *
     * CODPayment, CreditCardPayment, MomoPayment
     *
     * Tạo PaymentFactory
     *
     * Nhận vào paymentType
     *
     * Trả về đối tượng Payment phù hợp
     */
    public static void main(String[] args) {
        Payment payment = PaymentFactory.create("COD");
        System.out.println(payment.pay(210000));
    }
}
