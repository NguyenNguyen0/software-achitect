package abstract_factory;

public class WebDialog implements Dialog{
    @Override
    public String render() {
        return "Web dialog";
    }
}
