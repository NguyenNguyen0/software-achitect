package factory_method;

public class PaymentFactory {
    public static Payment create(String type) {
        return switch (type) {
            case "Momo" -> new MomoPayment();
            case "CreditCard" -> new CreditCardPayment();
            case "COD" -> new CODPayment();
            default -> throw new IllegalStateException("Unexpected value: " + type);
        };
    }
}
