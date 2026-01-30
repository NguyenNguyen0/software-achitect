package org.example.observer;

public class Investor implements Observer {
    private String name;

    public Investor(String name) {
        this.name = name;
    }

    @Override
    public void update(String stockName, double price) {
        System.out.println(
                "Investor " + name +
                        " notified: " + stockName +
                        " price changed to " + price
        );
    }
}
