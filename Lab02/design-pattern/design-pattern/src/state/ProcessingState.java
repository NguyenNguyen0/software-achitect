package state;

public class ProcessingState implements State{
    @Override
    public void handle(Order order) {
        System.out.println("Đang xử lý đóng gói...");
        order.setInformation("Đóng gói và vận chuyển");
        order.setState(new DeliveredState());
    }
}
