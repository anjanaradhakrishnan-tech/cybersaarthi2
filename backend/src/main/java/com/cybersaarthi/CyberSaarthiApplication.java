package com.cybersaarthi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@CrossOrigin(origins = "*")
public class CyberSaarthiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CyberSaarthiApplication.class, args);
        System.out.println("==================================================");
        System.out.println(" CyberSaarthi Backend Server Started Successfully!");
        System.out.println(" Access REST API at: http://localhost:8080/api");
        System.out.println(" H2 Console at:      http://localhost:8080/h2-console");
        System.out.println("==================================================");
    }
}
