package abstract_factory;

import java.util.Scanner;

public class Main {
    /**
     * Mô tả bài toán
     *
     * Hệ thống e-commerce có:
     *
     * Web App, Mobile App
     *
     * Mỗi nền tảng có bộ UI riêng:
     *
     * Button, Dialog
     *
     * Yêu cầu
     *
     * Tạo interface:
     *
     * Button, Dialog
     *
     * Tạo Abstract Factory:
     *
     * UIFactory
     *
     * createButton(), createDialog()
     *
     * Các factory cụ thể:
     *
     * WebUIFactory, MobileUIFactory
     *
     * Các implementation:
     *
     * WebButton, MobileButton, WebDialog, MobileDialog
     */
    public static void main(String[] args) {
        UIFactory factory;
        Scanner scanner = new Scanner(System.in);

        System.out.println("Platform: ");
        String platform = scanner.nextLine();
        if ("web".equals(platform)) {
            factory = new WebFactory();
        } else if ("mobile".equals((platform))) {
            factory = new MobileFactory();
        } else {
            throw new RuntimeException("Not support platform");
        }

        Button button = factory.createButton();
        Dialog dialog = factory.createDialog();

        System.out.println(button.render());
        System.out.println(dialog.render());
    }
}
