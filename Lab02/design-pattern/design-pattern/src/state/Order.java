package state;

public class Order {
    private State state;
    private String information;

    public Order () {
        this.state = new NewState();
        this.information = "Đơn hàng mới tạo!";
    }

    public void process() {
        this.state.handle(this);
    }

    @Override
    public String toString() {
        return "Order{" +
                "state=" + state +
                ", information='" + information + '\'' +
                '}';
    }

    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public String getInformation() {
        return information;
    }

    public void setInformation(String information) {
        this.information = information;
    }
}
