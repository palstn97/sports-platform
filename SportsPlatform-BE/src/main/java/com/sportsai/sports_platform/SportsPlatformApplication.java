package com.sportsai.sports_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SportsPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(SportsPlatformApplication.class, args);
	}

}