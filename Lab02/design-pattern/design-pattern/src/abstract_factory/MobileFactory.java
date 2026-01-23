package abstract_factory;

public class MobileFactory implements UIFactory{
    @Override
    public Button createButton() {
        return new MobileButton();
    }

    @Override
    public Dialog createDialog() {
        return new MobileDialog();
    }
}
