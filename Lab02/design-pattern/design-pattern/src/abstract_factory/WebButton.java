package abstract_factory;

public class WebButton implements Button{
    @Override
    public String render() {
        return "Web button";
    }
}
