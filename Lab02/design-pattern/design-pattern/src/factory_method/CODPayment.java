package factory_method;

public class CODPayment implements Payment{
    @Override
    public String pay(double amount) {
        return "COD payment handle " + String.valueOf(amount) + "$\n";
    }
}
