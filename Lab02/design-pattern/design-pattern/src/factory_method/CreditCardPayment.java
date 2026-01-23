package factory_method;

public class CreditCardPayment implements Payment{
    @Override
    public String pay(double amount) {
        return "Credit card payment handle " + String.valueOf(amount) + "$\n";
    }
}
