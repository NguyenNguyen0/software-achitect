package org.example.observer;

public class Main {
    public static void main(String[] args) {
        Stock apple = new Stock("AAPL");

        Investor john = new Investor("John");
        Investor anna = new Investor("Anna");

        apple.registerObserver(john);
        apple.registerObserver(anna);

        apple.setPrice(150.5);
        apple.setPrice(155.2);
    }
}
