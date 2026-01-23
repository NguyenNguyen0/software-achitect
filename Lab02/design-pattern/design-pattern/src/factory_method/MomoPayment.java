package factory_method;

public class MomoPayment implements Payment {
    @Override
    public String pay(double amount) {
        return "Momo payment handle " + String.valueOf(amount) + "$\n";
    }
}
