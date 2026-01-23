package state;

public interface State {
    void handle(Order order);
}
