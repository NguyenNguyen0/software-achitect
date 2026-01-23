package state;

public class    NewState implements State{
    @Override
    public void handle(Order order) {
        System.out.println("Đóng gói và giao đơn hàng");
        order.setState(new ProcessingState());
    }
}
