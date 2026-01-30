package org.example.composite;

public class File implements FileSystemComponent {
    private String name;
    private long size;

    public File(String name, long size) {
        this.name = name;
        this.size = size;
    }

    @Override
    public void showInfo() {
        System.out.println("File: " + name + " | Size: " + size + "KB");
    }
}
