package state;

public class CompletedState implements State{
    @Override
    public void handle(Order order) {
        System.out.println("Đơn đã hoàn thành!");
    }
}
