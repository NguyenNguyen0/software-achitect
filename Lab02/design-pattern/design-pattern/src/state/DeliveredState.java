package state;

public class DeliveredState implements State{
    @Override
    public void handle(Order order) {
        System.out.println("Đơn đã giao!");
        order.setInformation("Cập nhật trạng thái đơn hàng là đã giao");
        order.setState(new CompletedState());
    }
}
