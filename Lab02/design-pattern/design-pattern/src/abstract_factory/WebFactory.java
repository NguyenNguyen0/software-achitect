package abstract_factory;

public class WebFactory implements UIFactory {
    @Override
    public Button createButton() {
        return new WebButton();
    }

    @Override
    public Dialog createDialog() {
        return new WebDialog();
    }
}
