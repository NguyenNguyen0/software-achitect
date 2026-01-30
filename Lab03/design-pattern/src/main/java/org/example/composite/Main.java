package org.example.composite;

public class Main {
    public static void main(String[] args) {
        File file1 = new File("readme.txt", 10);
        File file2 = new File("data.csv", 120);

        Folder root = new Folder("Root");
        Folder documents = new Folder("Documents");

        documents.add(file1);
        root.add(documents);
        root.add(file2);

        root.showInfo();
    }
}
